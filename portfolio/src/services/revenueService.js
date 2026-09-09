/**
 * REVENUE SERVICE
 *
 * All revenue-related business logic is isolated here.
 * Components must NEVER access localStorage directly.
 * Swap storage calls with API calls when the backend is ready.
 */

import { storageService } from './storage.service';
import { getLeadKPIs }    from './leadsService';
import { CLINICS, getClinicById } from '@/constants/clinics';
import { assertCanMutate } from '@/dashboard/shared/config/permissions';

const REVENUE_KEY = storageService.KEYS.REVENUE;

// ─── Scoped Revenue Records Retrieval ────────────────────────

/**
 * Returns all revenue records tied directly or indirectly (via leads/appointments)
 * to the specified agent. Strictly enforces assignee scoping.
 *
 * @param {string} agentId
 * @returns {Array} Scoped revenue records
 */
export function getAgentRevenueRecords(agentId) {
  if (!agentId) return [];

  const allRevenue = storageService.get(REVENUE_KEY) || [];
  const allLeads   = storageService.get(storageService.KEYS.LEADS) || [];
  const allAppts   = storageService.get(storageService.KEYS.APPOINTMENTS) || [];

  const agentLeadNames = new Set(
    allLeads
      .filter((l) => l.assignedAgentId === agentId || l.assigned_user_id === agentId || l.responsible_agent === agentId)
      .map((l) => (l.patientName || l.name || '').toLowerCase().trim())
      .filter(Boolean)
  );

  const agentLeadIds = new Set(
    allLeads
      .filter((l) => l.assignedAgentId === agentId || l.assigned_user_id === agentId || l.responsible_agent === agentId)
      .map((l) => l.id)
  );

  const agentApptIds = new Set(
    allAppts
      .filter((a) => a.assignedAgentId === agentId || a.assignedUserId === agentId || a.assigned_user_id === agentId)
      .map((a) => a.id)
  );

  return allRevenue.filter((r) => {
    if (!r) return false;

    // Direct agent ID on revenue record
    if (
      r.assigned_user_id === agentId ||
      r.responsible_agent === agentId ||
      r.agentId === agentId ||
      r.assignedAgentId === agentId
    ) {
      return true;
    }

    // Linked by lead ID or appointment ID
    if (r.leadId && agentLeadIds.has(r.leadId)) return true;
    if (r.appointmentId && agentApptIds.has(r.appointmentId)) return true;

    // Linked by patient name from assigned leads
    if (r.patientName && agentLeadNames.has(r.patientName.toLowerCase().trim())) {
      return true;
    }

    return false;
  });
}

// ─── Revenue Recognition Helper (Canonical Single Source of Truth) ─

/**
 * Validates whether a revenue/payment record is recognized.
 *
 * Per Spec Section 12: A revenue record is recognized when payment has occurred.
 * This includes:
 *  - Fully paid settlements ('paid', 'completed')
 *  - Deposits collected ('deposit received', 'deposit', 'partially paid')
 *
 * Non-recognized statuses:
 *  - 'estimated', 'pending', 'quoted', 'proposal' (not yet collected)
 *  - 'refunded', 'cancelled' (not recognized / voided)
 *
 * @param {Object} record - Revenue or transaction record
 * @returns {boolean}
 */
export function isRevenueRecognized(record) {
  if (!record) return false;
  const status = (record.status || '').toLowerCase().trim();

  // If no status is specified, legacy records with a positive value are counted
  if (!status) {
    return Boolean(Number(record.revenue) || Number(record.amount) || Number(record.paidAmount));
  }

  return (
    status === 'paid' ||
    status === 'completed' ||
    status === 'deposit received' ||
    status === 'deposit' ||
    status === 'partially paid'
  );
}

/**
 * Returns the exact recognized dollar amount for a record.
 * Handles `paidAmount`, `depositAmount`, `revenue`, or `amount`.
 *
 * @param {Object} record
 * @returns {number}
 */
export function getRecognizedAmount(record) {
  if (!record || !isRevenueRecognized(record)) return 0;
  const status = (record.status || '').toLowerCase().trim();
  if (status === 'deposit received' || status === 'deposit') {
    return Number(record.depositAmount || record.deposit || record.revenue || record.amount || 0);
  }
  if (status === 'partially paid') {
    return Number(record.paidAmount || record.depositAmount || record.revenue || record.amount || 0);
  }
  return Number(record.paidAmount || record.revenue || record.amount || 0);
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Returns a complete revenue stats object for the agent dashboard.
 *
 * @param {string} agentId
 * @returns {AgentRevenueStats}
 */
export function getAgentRevenueStats(agentId) {
  const records = getAgentRevenueRecords(agentId);

  const currentMonthKey = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const currentMonthRecords = records.filter(
    (r) => (r.month === currentMonthKey || (r.date && r.date.startsWith(currentMonthKey))) &&
           isRevenueRecognized(r)
  );

  // Previous month
  const prevDate = new Date();
  prevDate.setMonth(prevDate.getMonth() - 1);
  const prevMonthKey = prevDate.toISOString().slice(0, 7);
  const prevMonthRecords = records.filter(
    (r) => (r.month === prevMonthKey || (r.date && r.date.startsWith(prevMonthKey))) &&
           isRevenueRecognized(r)
  );

  // Sum recognized revenue using the shared canonical helper
  const monthlyRevenue = currentMonthRecords.reduce(
    (acc, r) => acc + getRecognizedAmount(r),
    0
  );

  const prevRevenue = prevMonthRecords.reduce(
    (acc, r) => acc + getRecognizedAmount(r),
    0
  );

  const revenueGrowth = prevRevenue > 0
    ? Math.round(((monthlyRevenue - prevRevenue) / prevRevenue) * 1000) / 10
    : null;

  // Lead KPIs (for accurate conversion rate calculation)
  const leadKPIs = getLeadKPIs(agentId);
  const totalConversions = leadKPIs.convertedLeads;
  const totalLeads = leadKPIs.assignedLeads;

  // Real calculation: (converted/won leads assigned to this agent) / (total eligible leads assigned to this agent)
  const conversionRate = totalLeads > 0
    ? Math.round((totalConversions / totalLeads) * 100)
    : 0;

  // Rolling monthly summary sorted oldest → newest
  const monthlyMap = {};
  records.filter(isRevenueRecognized).forEach((r) => {
    const m = r.month || (r.date ? r.date.slice(0, 7) : '2026-09');
    if (!monthlyMap[m]) {
      monthlyMap[m] = { month: m, revenue: 0, count: 0 };
    }
    monthlyMap[m].revenue += getRecognizedAmount(r);
    monthlyMap[m].count += 1;
  });

  const monthlySummary = Object.values(monthlyMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((r) => ({
      month: r.month,
      revenue: r.revenue,
      conversions: r.count,
      conversionRate,
    }));

  return {
    monthlyRevenue,
    prevRevenue,
    revenueGrowth,
    conversionRate,
    totalConversions,
    totalLeads,
    monthlySummary,
  };
}

/**
 * Generates timeline data for personal revenue over time chart (Recharts).
 *
 * @param {string} agentId
 * @param {string} rangeKey - 'Today' | 'Last 7 Days' | 'Last 30 Days' | 'Last 90 Days' | 'This Month'
 * @returns {Array} Chart data points [{ date, timeLabel, revenue, cumulativeRevenue }]
 */
export function getAgentRevenueTrend(agentId, rangeKey = 'Last 30 Days') {
  const records = getAgentRevenueRecords(agentId).filter(isRevenueRecognized);

  const now = new Date();
  let dayCount = 30;

  if (rangeKey === 'Today') {
    dayCount = 1;
  } else if (rangeKey === 'Last 7 Days') {
    dayCount = 7;
  } else if (rangeKey === 'Last 90 Days') {
    dayCount = 90;
  } else if (rangeKey === 'This Month') {
    dayCount = Math.max(1, now.getDate());
  }

  // Generate date slots
  const days = [];
  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(d.toISOString().slice(0, 10)); // 'YYYY-MM-DD'
  }

  // Aggregate daily
  const dailyMap = {};
  days.forEach((dayStr) => {
    dailyMap[dayStr] = 0;
  });

  records.forEach((r) => {
    if (!r.date) return;
    const dStr = r.date.slice(0, 10);
    if (dailyMap[dStr] !== undefined) {
      dailyMap[dStr] += getRecognizedAmount(r);
    }
  });

  let runningTotal = 0;
  return days.map((dayStr) => {
    const d = new Date(dayStr);
    const rev = dailyMap[dayStr] || 0;
    runningTotal += rev;

    const timeLabel = dayCount <= 7
      ? d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      date: dayStr,
      timeLabel,
      revenue: rev,
      cumulativeRevenue: runningTotal,
    };
  });
}

// ─── Organization & Finance Domain Helpers ───────────────────

/**
 * Returns organization-wide financial stats for the Finance Dashboard.
 * Strictly uses the exact same isRevenueRecognized() rule as Agent role.
 *
 * @param {string} orgId - Organization ID (e.g. 'org-001')
 * @param {string} period - 'month' | 'quarter' | 'year' | 'all'
 * @returns {Object} { totalRevenue, totalOutstanding, depositsCollected, refundsIssued, refundCount, recordCount }
 */
export function getOrgRevenueStats(orgId = 'org-001', period = 'month') {
  const allRevenue = storageService.get(REVENUE_KEY) || [];
  const orgRecords = allRevenue.filter((r) => !orgId || r.orgId === orgId || !r.orgId);

  const now = new Date();
  const currentMonthKey = now.toISOString().slice(0, 7); // "YYYY-MM"

  const filteredRecords = orgRecords.filter((r) => {
    if (period === 'month') {
      return r.month === currentMonthKey || (r.date && r.date.startsWith(currentMonthKey));
    }
    return true; // 'all'
  });

  // 1. Total Recognized Revenue
  const totalRevenue = filteredRecords
    .filter(isRevenueRecognized)
    .reduce((acc, r) => acc + getRecognizedAmount(r), 0);

  // 2. Total Outstanding Balance
  const totalOutstanding = filteredRecords.reduce((acc, r) => {
    const status = (r.status || '').toLowerCase();
    if (status === 'paid' || status === 'completed' || status === 'refunded' || status === 'cancelled') {
      return acc;
    }
    const estimated = Number(r.estimatedValue || r.estimated || r.totalAmount || r.revenue || 0);
    const collected = getRecognizedAmount(r);
    return acc + Math.max(0, estimated - collected);
  }, 0);

  // 3. Deposits Collected
  const depositsCollected = filteredRecords
    .filter((r) => {
      const s = (r.status || '').toLowerCase();
      return s === 'deposit received' || s === 'deposit' || (r.notes && r.notes.toLowerCase().includes('deposit'));
    })
    .reduce((acc, r) => acc + getRecognizedAmount(r), 0);

  // 4. Refunds Issued
  const refundedRecords = filteredRecords.filter((r) => (r.status || '').toLowerCase() === 'refunded');
  const refundsIssued = refundedRecords.reduce((acc, r) => acc + (Number(r.revenue) || Number(r.amount) || 0), 0);
  const refundCount = refundedRecords.length;

  return {
    totalRevenue,
    totalOutstanding,
    depositsCollected,
    refundsIssued,
    refundCount,
    recordCount: filteredRecords.length,
    recognizedRecordsCount: filteredRecords.filter(isRevenueRecognized).length,
  };
}

/**
 * Normalizes specific granular procedure titles into standard clinical dental categories.
 * Prevents cluttered charts with dozens of slices by categorizing treatments into 5 core service lines.
 *
 * @param {string} rawName
 * @returns {string}
 */
export function normalizeTreatmentCategory(rawName = '') {
  if (!rawName) return 'General Dentistry';
  const str = String(rawName).toLowerCase().trim();

  if (
    str.includes('align') ||
    str.includes('ortho') ||
    str.includes('brace') ||
    str.includes('invisalign')
  ) {
    return 'Orthodontics & Aligners';
  }

  if (
    str.includes('implant') ||
    str.includes('abutment') ||
    str.includes('surgical') ||
    str.includes('surgery') ||
    str.includes('extraction')
  ) {
    return 'Implants & Surgery';
  }

  if (
    str.includes('veneer') ||
    str.includes('whiten') ||
    str.includes('bleach') ||
    str.includes('cosmetic') ||
    str.includes('smile design')
  ) {
    return 'Cosmetics & Aesthetics';
  }

  if (
    str.includes('crown') ||
    str.includes('bridge') ||
    str.includes('zirconia') ||
    str.includes('ceramic') ||
    str.includes('denture') ||
    str.includes('prostho') ||
    str.includes('onlay') ||
    str.includes('inlay')
  ) {
    return 'Prosthetics & Crowns';
  }

  if (
    str.includes('endo') ||
    str.includes('root canal') ||
    str.includes('pulp') ||
    str.includes('molar endo') ||
    str.includes('filling') ||
    str.includes('restor')
  ) {
    return 'Endodontics & Restorative';
  }

  if (
    str.includes('pediatric') ||
    str.includes('child') ||
    str.includes('fluoride')
  ) {
    return 'Pediatric Care';
  }

  return 'General & Preventive';
}

/**
 * Returns revenue breakdown aggregated by clinic branch for the Finance Dashboard.
 * Strictly scopes records to branches belonging to the organization.
 *
 * @param {string} orgId
 * @returns {Array} [{ clinicId, name, fullName, city, revenue, transactionsCount }]
 */
export function getClinicRevenueBreakdown(orgId = 'org-001') {
  const allRevenue = storageService.get(REVENUE_KEY) || [];
  const orgRecords = allRevenue.filter((r) => {
    if (!isRevenueRecognized(r)) return false;
    if (r.orgId) return r.orgId === orgId;
    const clinic = CLINICS.find((c) => c.id === r.clinicId);
    return !clinic || clinic.orgId === orgId;
  });

  const map = {};
  orgRecords.forEach((r) => {
    const cid = r.clinicId || 'clinic-downtown';
    const canonicalCid = (cid === 'clinic-001') ? 'clinic-downtown' : (cid === 'clinic-002') ? 'clinic-west' : cid;
    if (!map[canonicalCid]) {
      const clinicObj = getClinicById(canonicalCid);
      const shortName = clinicObj?.name
        ? clinicObj.name.replace('Dental Excellence', 'Dental').replace('Pediatric & Family', 'Pediatric').replace('Dental Studio', 'Dental').replace('Oral Care', 'Oral')
        : canonicalCid;
      map[canonicalCid] = {
        clinicId: canonicalCid,
        name: shortName,
        fullName: clinicObj?.name || canonicalCid,
        city: clinicObj?.city || 'Riyadh',
        revenue: 0,
        transactionsCount: 0,
      };
    }
    map[canonicalCid].revenue += getRecognizedAmount(r);
    map[canonicalCid].transactionsCount += 1;
  });

  const list = Object.values(map);
  list.sort((a, b) => b.revenue - a.revenue);
  return list;
}

/**
 * Returns revenue breakdown aggregated by standard clinical treatment categories.
 *
 * @param {string} orgId
 * @returns {Array} [{ treatment, category, revenue, count }]
 */
export function getTreatmentRevenueBreakdown(orgId = 'org-001') {
  const allRevenue = storageService.get(REVENUE_KEY) || [];
  const orgRecords = allRevenue.filter((r) => {
    if (!isRevenueRecognized(r)) return false;
    if (r.orgId) return r.orgId === orgId;
    const clinic = CLINICS.find((c) => c.id === r.clinicId);
    return !clinic || clinic.orgId === orgId;
  });

  const map = {};
  orgRecords.forEach((r) => {
    const raw = r.treatmentCategory || r.category || r.treatment || r.notes || 'General & Preventive';
    const cat = normalizeTreatmentCategory(raw);
    if (!map[cat]) {
      map[cat] = { treatment: cat, category: cat, revenue: 0, count: 0 };
    }
    map[cat].revenue += getRecognizedAmount(r);
    map[cat].count += 1;
  });

  const list = Object.values(map);
  list.sort((a, b) => b.revenue - a.revenue);
  return list;
}

/**
  * Records a payment transaction with RBAC write-protection.
  */
export function recordPayment(paymentData, currentUser = null) {
  assertCanMutate('revenue', 'create', currentUser);
  const allRevenue = storageService.get(REVENUE_KEY) || [];
  const newRecord = {
    id: `rev-${Date.now()}`,
    patientName: paymentData.patientName || 'Anonymous Patient',
    amount: Number(paymentData.amount) || 0,
    status: paymentData.status || 'Paid',
    method: paymentData.method || 'Credit Card',
    date: paymentData.date || new Date().toISOString(),
    clinicId: paymentData.clinicId || 'clinic-downtown',
    orgId: paymentData.orgId || 'org-001',
    createdAt: new Date().toISOString(),
  };
  storageService.set(REVENUE_KEY, [newRecord, ...allRevenue]);
  return newRecord;
}

/**
 * Issues a refund for a transaction with RBAC write-protection.
 */
export function refundPayment(recordId, currentUser = null) {
  assertCanMutate('revenue', 'edit', currentUser);
  const allRevenue = storageService.get(REVENUE_KEY) || [];
  const updated = allRevenue.map((r) =>
    r.id === recordId ? { ...r, status: 'Refunded', refundedAt: new Date().toISOString() } : r
  );
  storageService.set(REVENUE_KEY, updated);
  return updated.find((r) => r.id === recordId);
}



