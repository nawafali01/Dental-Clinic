/**
 * REVENUE SERVICE
 *
 * Central service for revenue tracking, billing, payment processing,
 * and financial analytics. Strictly implements backend RBAC policies,
 * Pydantic data schemas, and API integration with /api/v1/revenue/*.
 */

import apiClient from '@/lib/api';
import { storageService } from './storage.service';
import { getLeadKPIs } from './leadsService';
import { CLINICS, getClinicById, isSameClinic } from '@/constants/clinics';

const REVENUE_KEY = storageService.KEYS.REVENUE;

// ─── Enums & Constants ──────────────────────────────────────

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  DEPOSIT_RECEIVED: 'deposit_received',
  PARTIAL: 'partial',
  PAID: 'paid',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
};

export const PAYMENT_TYPE = {
  CASH: 'cash',
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BANK_TRANSFER: 'bank_transfer',
  INSURANCE: 'insurance',
  FINANCING: 'financing',
  OTHER: 'other',
};

// ─── RBAC & Authorization Placeholders ───────────────────────

/**
 * Placeholder for checking if a FINANCE user is authorized for a specific clinic.
 */
export function isFinanceAuthorizedForClinic(currentUser, clinicId) {
  if (!currentUser) return true;
  const role = (currentUser.role || '').toLowerCase();
  if (role !== 'finance') return true;

  // PLACEHOLDER: Verify currentUser has authorization for clinicId
  const authorized = currentUser.authorized_clinics || currentUser.authorizedClinics || currentUser.assigned_clinics || currentUser.assignedClinics;
  if (Array.isArray(authorized) && authorized.length > 0) {
    return authorized.some((c) => isSameClinic(c, clinicId));
  }
  return true; // Placeholder default permit
}

/**
 * Placeholder for checking if an AGENT is authorized to view revenue linked to their lead.
 */
export function isAgentAuthorizedForLead(currentUser, leadId) {
  if (!currentUser) return true;
  const role = (currentUser.role || '').toLowerCase();
  if (role !== 'agent') return true;

  // PLACEHOLDER: Check if revenue record is linked to an assigned lead of current_user
  const assignedLeads = currentUser.assigned_leads || currentUser.assignedLeads;
  if (Array.isArray(assignedLeads) && assignedLeads.length > 0) {
    return assignedLeads.includes(leadId);
  }
  return true; // Placeholder default permit
}

/**
 * Comprehensive RBAC Permission Evaluator
 */
export function checkRevenueAccess(revenue, currentUser, action = 'view') {
  if (!currentUser) return true;
  const role = (currentUser.role || '').toLowerCase();

  // 1. Create / Update Action
  if (action === 'create' || action === 'update') {
    const isAllowedRole =
      role === 'super_admin' ||
      role === 'superadmin' ||
      role === 'org_admin' ||
      role === 'orgadmin' ||
      role === 'clinic_manager' ||
      role === 'finance';

    if (!isAllowedRole) return false;
    if (role === 'finance' && revenue?.clinic_id) {
      return isFinanceAuthorizedForClinic(currentUser, revenue.clinic_id);
    }
    return true;
  }

  // 2. Process Payment / Process Refund Actions (STRICTLY FINANCE)
  if (action === 'process_payment' || action === 'process_refund') {
    return role === 'finance' || role === 'super_admin' || role === 'superadmin';
  }

  // 3. View Action
  if (action === 'view') {
    if (role === 'super_admin' || role === 'superadmin') return true;

    if (role === 'org_admin' || role === 'orgadmin') {
      const userOrg = currentUser.org_id || currentUser.organizationId;
      const revOrg = revenue?.org_id || revenue?.organizationId;
      if (!userOrg || !revOrg) return true;
      return revOrg === userOrg;
    }

    if (role === 'clinic_manager') {
      const assigned = currentUser.assigned_clinics || currentUser.assignedClinics || [currentUser.clinic_id || currentUser.clinicId];
      if (!revenue) return true;
      return assigned.some((c) => isSameClinic(c, revenue.clinic_id || revenue.clinicId));
    }

    if (role === 'finance') {
      if (!revenue) return true;
      return isFinanceAuthorizedForClinic(currentUser, revenue.clinic_id || revenue.clinicId);
    }

    if (role === 'agent') {
      if (!revenue) return true;
      return isAgentAuthorizedForLead(currentUser, revenue.lead_id || revenue.leadId);
    }

    // Any other role: Forbidden (403)
    return false;
  }

  return true;
}

// ─── Canonical Normalizer (Pydantic Schema & Frontend Harmony) ──

/**
 * Normalizes backend database revenue models into standard frontend objects.
 * Guarantees both camelCase and snake_case fields exist for seamless UI display.
 *
 * @param {Object} r - Raw DB or local storage object
 * @returns {Object} Normalized revenue record
 */
export function normalizeRevenueRecord(r) {
  if (!r) return null;

  const id = r.id || r._id || `rev-${Date.now()}`;
  const totalAmount = Number(r.total_amount ?? r.totalAmount ?? r.revenue ?? r.amount ?? 0);
  const depositAmount = Number(r.deposit_amount ?? r.depositAmount ?? 0);
  const paymentStatus = String(r.payment_status || r.paymentStatus || r.status || 'pending')
    .toLowerCase()
    .trim()
    .replace(/ /g, '_');

  // payment_type is Optional in schema — keep null/empty if not set
  const rawPaymentType = r.payment_type || r.paymentType || r.method || null;
  const paymentType = rawPaymentType
    ? String(rawPaymentType).toLowerCase().trim().replace(/ /g, '_')
    : null;

  const treatmentName = r.treatment_name || r.treatmentName || r.treatment || r.title || 'Dental Consultation';
  const clinicId = r.clinic_id || r.clinicId || 'clinic-downtown';
  const leadId = r.lead_id || r.leadId || '';
  const appointmentId = r.appointment_id || r.appointmentId || '';
  const invoiceNumber = r.invoice_number || r.invoiceNumber || r.id || '';

  // Extract or resolve patient name
  let patientName = r.patientName || r.patient_name || r.patient || '';
  if (!patientName && leadId) {
    const cachedLeads = storageService.get(storageService.KEYS.LEADS) || [];
    const matchedLead = cachedLeads.find((l) => l.id === leadId);
    if (matchedLead) {
      patientName = matchedLead.patientName || matchedLead.name || matchedLead.first_name || '';
    }
  }
  if (!patientName) patientName = 'Patient Record';

  const payments = Array.isArray(r.payments)
    ? r.payments.map((p) => ({
        id: p.id || `pay-${Date.now()}`,
        revenue_id: p.revenue_id || p.revenueId || id,
        amount: Number(p.amount || 0),
        payment_type: (p.payment_type || p.paymentType || 'cash').toLowerCase(),
        payment_date: p.payment_date || p.paymentDate || p.created_at || new Date().toISOString(),
        reference_number: p.reference_number || p.referenceNumber || null,
        notes: p.notes || null,
        created_by: p.created_by || p.createdBy || null,
        created_at: p.created_at || p.createdAt || new Date().toISOString(),
      }))
    : [];

  const paymentsSum = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const rawPaidAmount = r.paid_amount ?? r.paidAmount;

  let paidAmount = 0;
  if (rawPaidAmount !== undefined && rawPaidAmount !== null && Number(rawPaidAmount) > 0) {
    paidAmount = Number(rawPaidAmount);
  } else if (paymentsSum > 0) {
    paidAmount = paymentsSum;
  } else if (paymentStatus === 'paid') {
    paidAmount = totalAmount;
  } else if (paymentStatus === 'deposit_received' || paymentStatus === 'partial') {
    paidAmount = depositAmount > 0 ? depositAmount : totalAmount;
  } else {
    paidAmount = Number(rawPaidAmount || 0);
  }

  const outstandingAmount = Number(
    r.outstanding_amount ?? r.outstandingAmount ?? Math.max(0, totalAmount - paidAmount)
  );

  const createdAt = r.created_at || r.createdAt || r.date || new Date().toISOString();
  const month = r.month || createdAt.slice(0, 7);
  const isRecognized = paymentStatus === 'paid' || paymentStatus === 'completed' || paymentStatus === 'deposit_received' || paymentStatus === 'partial';
  const conversions = r.conversions ?? (isRecognized ? 1 : 0);
  const conversionRate = r.conversionRate ?? (conversions > 0 ? 100 : 0);

  return {
    ...r,
    id,
    month,
    conversions,
    conversionRate,
    lead_id: leadId,
    leadId,
    clinic_id: clinicId,
    clinicId,
    appointment_id: appointmentId,
    appointmentId,
    treatment_name: treatmentName,
    treatmentName,
    treatment: treatmentName,
    treatment_type: r.treatment_type || r.treatmentType || 'oral treatment',
    treatmentType: r.treatment_type || r.treatmentType || 'oral treatment',
    total_amount: totalAmount,
    totalAmount,
    revenue: totalAmount,
    amount: totalAmount,
    paid_amount: paidAmount,
    paidAmount,
    deposit_amount: depositAmount,
    depositAmount,
    outstanding_amount: outstandingAmount,
    outstandingAmount,
    currency: r.currency || 'USD',
    payment_status: paymentStatus,
    paymentStatus,
    status: paymentStatus,
    payment_type: paymentType,
    paymentType,
    method: paymentType,
    notes: r.notes || '',
    invoice_number: invoiceNumber,
    invoiceNumber,
    patientName,
    patient_name: patientName,
    payments,
    created_at: createdAt,
    createdAt,
    updated_at: r.updated_at || r.updatedAt || new Date().toISOString(),
    created_by: r.created_by || r.createdBy || r.assigned_user_id || null,
    converted_by: r.converted_by || r.convertedBy || null,
  };
}

// ─── Revenue Recognition Helper (Canonical Single Source of Truth) ─

/**
 * Validates whether a revenue/payment record is recognized.
 */
export function isRevenueRecognized(record) {
  if (!record) return false;
  const status = String(record.payment_status || record.paymentStatus || record.status || '')
    .toLowerCase()
    .trim()
    .replace(' ', '_');

  if (!status) {
    return Boolean(
      Number(record.total_amount) ||
      Number(record.paid_amount) ||
      Number(record.revenue) ||
      Number(record.amount)
    );
  }

  return (
    status === 'paid' ||
    status === 'completed' ||
    status === 'deposit_received' ||
    status === 'deposit' ||
    status === 'partially_paid' ||
    status === 'partial'
  );
}

/**
 * Returns the exact recognized dollar amount for a record.
 */
export function getRecognizedAmount(record) {
  if (!record || !isRevenueRecognized(record)) return 0;
  const norm = normalizeRevenueRecord(record);
  if (norm.payment_status === 'deposit_received' || norm.payment_status === 'deposit') {
    return norm.deposit_amount || norm.paid_amount || norm.total_amount || 0;
  }
  if (norm.payment_status === 'partially_paid' || norm.payment_status === 'partial') {
    return norm.paid_amount || norm.deposit_amount || norm.total_amount || 0;
  }
  return norm.paid_amount || norm.total_amount || 0;
}

// ─── Live API Calls (FastAPI /api/v1/revenue/*) ───────────────

/**
 * 1. Fetch Revenue Records (GET /api/v1/revenue/)
 * Allowed roles: SUPER_ADMIN, ORG_ADMIN, CLINIC_MANAGER, FINANCE, AGENT (lead scope).
 */
export async function getRevenues(params = {}, currentUser = null) {
  if (currentUser && !checkRevenueAccess(null, currentUser, 'view')) {
    throw new Error('Forbidden (403): Your role is not authorized to view revenue records.');
  }

  try {
    const res = await apiClient.get('/api/v1/revenue/', { params });
    const rawList = res.data?.data || (Array.isArray(res.data) ? res.data : []);
    const normalized = rawList.map(normalizeRevenueRecord);

    const filtered = currentUser
      ? normalized.filter((r) => checkRevenueAccess(r, currentUser, 'view'))
      : normalized;

    if (filtered.length > 0) {
      storageService.set(REVENUE_KEY, filtered);
    }
    return filtered;
  } catch (err) {
    console.warn('[revenueService] Live fetch notice, returning cached dataset:', err?.message);
    const cached = getRevenueSync();
    return currentUser ? cached.filter((r) => checkRevenueAccess(r, currentUser, 'view')) : cached;
  }
}

/**
 * Returns cached revenue records from storage.
 */
export function getRevenueSync() {
  const cached = storageService.get(REVENUE_KEY) || [];
  return cached.map(normalizeRevenueRecord);
}

/**
 * 2. Fetch Single Revenue Record (GET /api/v1/revenue/{revenue_id})
 * RBAC Scoping:
 * - SUPER_ADMIN: all
 * - ORG_ADMIN: org scope
 * - CLINIC_MANAGER: revenue.clinic_id in assigned_clinics
 * - FINANCE: authorized clinics
 * - AGENT: check if revenue is linked to their lead
 * - Any other role: Forbidden (403)
 */
export async function getRevenueById(revenueId, currentUser = null) {
  if (!revenueId) return null;

  if (currentUser && !checkRevenueAccess(null, currentUser, 'view')) {
    throw new Error('Forbidden (403): Your role is not authorized to view revenue records.');
  }

  let record = null;
  try {
    const res = await apiClient.get(`/api/v1/revenue/${revenueId}`);
    record = normalizeRevenueRecord(res.data?.data || res.data);
  } catch (err) {
    console.warn('[revenueService] getRevenueById API error, falling back to cache:', err?.message);
    const cached = getRevenueSync();
    record = cached.find((r) => r.id === revenueId) || null;
  }

  if (record && currentUser) {
    if (!checkRevenueAccess(record, currentUser, 'view')) {
      throw new Error('Forbidden (403): You are not authorized to view this specific revenue record.');
    }
  }

  return record;
}

/**
 * 3. Create Revenue Record (POST /api/v1/revenue/)
 * Allowed roles: SUPER_ADMIN, ORG_ADMIN, CLINIC_MANAGER, FINANCE.
 * Note: FINANCE role includes a placeholder for clinic authorization checking.
 * Validation: treatment_name length 2-200, total_amount > 0.
 */
export async function createRevenue(payload, currentUser = null) {
  const role = (currentUser?.role || '').toLowerCase();
  if (currentUser && !checkRevenueAccess(payload, currentUser, 'create')) {
    throw new Error('Forbidden (403): Your role does not have permission to create revenue records.');
  }

  // Placeholder for FINANCE role clinic authorization check
  if (role === 'finance') {
    const isAuthorized = isFinanceAuthorizedForClinic(currentUser, payload.clinic_id || payload.clinicId);
    if (!isAuthorized) {
      throw new Error('Forbidden (403): Finance role is not authorized for this clinic branch.');
    }
  }

  const treatmentName = (
    payload.treatment_name ||
    payload.treatmentName ||
    payload.treatment ||
    'Dental Consultation'
  ).trim();

  if (treatmentName.length < 2 || treatmentName.length > 200) {
    throw new Error('Validation Error: treatment_name length must be between 2 and 200 characters.');
  }

  const totalAmount = Number(payload.total_amount ?? payload.totalAmount ?? payload.amount ?? 0);
  if (totalAmount <= 0) {
    throw new Error('Validation Error: total_amount must be strictly greater than 0.');
  }

  // Build body strictly per RevenueCreate Pydantic schema
  // Only include optional fields if they have real values
  const rawPaymentType = payload.payment_type || payload.paymentType || payload.method || null;
  const rawPaymentStatus = (payload.payment_status || payload.status || 'pending').toLowerCase().replace(/ /g, '_');

  const apiBody = {
    lead_id:        payload.lead_id || payload.leadId,
    clinic_id:      payload.clinic_id || payload.clinicId,
    treatment_name: treatmentName,
    total_amount:   totalAmount,
    currency:       payload.currency || 'USD',
    payment_status: rawPaymentStatus,
    ...(rawPaymentType     ? { payment_type:    rawPaymentType.toLowerCase().replace(/ /g, '_') } : {}),
    ...(payload.treatment_type || payload.treatmentType ? { treatment_type: payload.treatment_type || payload.treatmentType } : {}),
    ...(payload.deposit_amount != null || payload.depositAmount != null ? { deposit_amount: Number(payload.deposit_amount ?? payload.depositAmount) } : {}),
    ...(payload.notes       ? { notes:           payload.notes } : {}),
    ...(payload.invoice_number || payload.invoiceNumber ? { invoice_number: payload.invoice_number || payload.invoiceNumber } : {}),
    ...(payload.appointment_id || payload.appointmentId ? { appointment_id: payload.appointment_id || payload.appointmentId } : {}),
  };

  try {
    const res = await apiClient.post('/api/v1/revenue/', apiBody);
    let created = normalizeRevenueRecord(res.data?.data || res.data);

    // If payment status indicates funds received, but backend paid_amount is 0 (no payment transaction created in backend DB),
    // automatically issue a processPayment POST call to populate the backend payments table.
    if (
      (rawPaymentStatus === 'paid' || rawPaymentStatus === 'deposit_received' || rawPaymentStatus === 'partial') &&
      (!res.data?.data?.payments || res.data?.data?.payments.length === 0)
    ) {
      const payAmt = Number(payload.deposit_amount ?? payload.depositAmount ?? totalAmount);
      if (payAmt > 0 && created?.id) {
        try {
          const payRes = await processPayment(
            created.id,
            {
              amount: payAmt,
              payment_type: rawPaymentType || 'credit_card',
              notes: payload.notes || 'Initial payment recorded on creation',
            },
            currentUser
          );
          if (payRes) created = payRes;
        } catch (payErr) {
          console.warn('[revenueService] processPayment auto-call notice:', payErr?.message);
        }
      }
    }

    const cached = getRevenueSync();
    storageService.set(REVENUE_KEY, [created, ...cached.filter((c) => c.id !== created.id)]);
    return created;
  } catch (err) {
    console.warn('[revenueService] API create failed, saving to local cache:', err?.message);
    const fallback = normalizeRevenueRecord({
      ...apiBody,
      id: `rev-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    const cached = getRevenueSync();
    storageService.set(REVENUE_KEY, [fallback, ...cached]);
    return fallback;
  }
}

/**
 * 4. Update Revenue Record (PUT /api/v1/revenue/{revenue_id})
 * Allowed roles: SUPER_ADMIN, ORG_ADMIN, CLINIC_MANAGER, FINANCE.
 */
export async function updateRevenue(revenueId, payload, currentUser = null) {
  if (currentUser && !checkRevenueAccess(payload, currentUser, 'update')) {
    throw new Error('Forbidden (403): Your role does not have permission to update revenue records.');
  }

  const apiBody = {};
  if (payload.treatment_name || payload.treatmentName) {
    const tName = (payload.treatment_name || payload.treatmentName).trim();
    if (tName.length < 2 || tName.length > 200) {
      throw new Error('Validation Error: treatment_name length must be between 2 and 200 characters.');
    }
    apiBody.treatment_name = tName;
  }

  if (payload.total_amount !== undefined || payload.totalAmount !== undefined) {
    const val = Number(payload.total_amount ?? payload.totalAmount);
    if (val <= 0) {
      throw new Error('Validation Error: total_amount must be strictly greater than 0.');
    }
    apiBody.total_amount = val;
  }

  if (payload.treatment_type || payload.treatmentType) apiBody.treatment_type = payload.treatment_type || payload.treatmentType;
  if (payload.currency) apiBody.currency = payload.currency;
  if (payload.payment_status || payload.status) apiBody.payment_status = (payload.payment_status || payload.status).toLowerCase().replace(/ /g, '_');
  if (payload.payment_type || payload.paymentType || payload.method) apiBody.payment_type = (payload.payment_type || payload.paymentType || payload.method).toLowerCase().replace(/ /g, '_');
  if (payload.deposit_amount !== undefined || payload.depositAmount !== undefined) apiBody.deposit_amount = Number(payload.deposit_amount ?? payload.depositAmount);
  if (payload.paid_amount !== undefined || payload.paidAmount !== undefined) apiBody.paid_amount = Number(payload.paid_amount ?? payload.paidAmount);
  if (payload.outstanding_amount !== undefined || payload.outstandingAmount !== undefined) apiBody.outstanding_amount = Number(payload.outstanding_amount ?? payload.outstandingAmount);
  if (payload.notes !== undefined) apiBody.notes = payload.notes;
  if (payload.invoice_number !== undefined || payload.invoiceNumber !== undefined) apiBody.invoice_number = payload.invoice_number || payload.invoiceNumber;
  if (payload.appointment_id !== undefined || payload.appointmentId !== undefined) apiBody.appointment_id = payload.appointment_id || payload.appointmentId;

  try {
    const res = await apiClient.put(`/api/v1/revenue/${revenueId}`, apiBody);
    const updated = normalizeRevenueRecord(res.data?.data || res.data);
    const cached = getRevenueSync();
    const newCache = cached.map((r) => (r.id === revenueId ? updated : r));
    storageService.set(REVENUE_KEY, newCache);
    return updated;
  } catch (err) {
    console.warn('[revenueService] updateRevenue API error, updating local cache:', err?.message);
    const cached = getRevenueSync();
    const updatedList = cached.map((r) => (r.id === revenueId ? normalizeRevenueRecord({ ...r, ...payload }) : r));
    storageService.set(REVENUE_KEY, updatedList);
    return updatedList.find((r) => r.id === revenueId);
  }
}

/**
 * 5. Process Payment (POST /api/v1/revenue/{revenue_id}/payment)
 * Strict restriction: ONLY the FINANCE role can process payments. Other roles are forbidden.
 */
export async function processPayment(revenueId, paymentData, currentUser = null) {
  if (currentUser && !checkRevenueAccess(null, currentUser, 'process_payment')) {
    throw new Error('Forbidden (403): ONLY the FINANCE role is authorized to process payments.');
  }

  const amount = Number(paymentData.amount || paymentData.paidAmount || 0);
  if (amount <= 0) {
    throw new Error('Validation Error: Payment amount must be strictly greater than 0.');
  }

  const apiBody = {
    amount,
    payment_type: (paymentData.payment_type || paymentData.paymentType || paymentData.method || 'cash').toLowerCase().replace(' ', '_'),
    reference_number: paymentData.reference_number || paymentData.referenceNumber || null,
    notes: paymentData.notes || null,
  };

  try {
    const res = await apiClient.post(`/api/v1/revenue/${revenueId}/payment`, apiBody);
    const updated = normalizeRevenueRecord(res.data?.data || res.data);
    const cached = getRevenueSync();
    const newCache = cached.map((r) => (r.id === revenueId ? updated : r));
    storageService.set(REVENUE_KEY, newCache);
    return updated;
  } catch (err) {
    console.warn('[revenueService] processPayment API call error:', err?.message);
    throw err;
  }
}

/**
 * 6. Process Refund (POST /api/v1/revenue/{revenue_id}/refund)
 * Strict restriction: ONLY the FINANCE role can process refunds.
 * Additional validation: Refund amount cannot exceed total paid_amount.
 */
export async function processRefund(revenueId, refundData, currentUser = null) {
  if (currentUser && !checkRevenueAccess(null, currentUser, 'process_refund')) {
    throw new Error('Forbidden (403): ONLY the FINANCE role is authorized to process refunds.');
  }

  const refundAmount = Number(refundData.amount || refundData.refundAmount || 0);
  if (refundAmount <= 0) {
    throw new Error('Validation Error: Refund amount must be strictly greater than 0.');
  }

  // Retrieve record to validate paid_amount limit
  const cached = getRevenueSync();
  const targetRecord = cached.find((r) => r.id === revenueId);
  if (targetRecord) {
    const currentPaid = Number(targetRecord.paid_amount || targetRecord.paidAmount || targetRecord.total_amount || 0);
    if (refundAmount > currentPaid) {
      throw new Error(`Validation Error: Refund amount ($${refundAmount}) cannot exceed total paid amount ($${currentPaid}).`);
    }
  }

  try {
    const res = await apiClient.post(
      `/api/v1/revenue/${revenueId}/refund`,
      { amount: refundAmount, reason: refundData.reason || refundData.notes || '' }
    );
    const updated = normalizeRevenueRecord(res.data?.data || res.data);
    const newCache = cached.map((r) => (r.id === revenueId ? updated : r));
    storageService.set(REVENUE_KEY, newCache);
    return updated;
  } catch (err) {
    console.warn('[revenueService] processRefund API call error:', err?.message);
    throw err;
  }
}

/**
 * 7. Get Clinic Revenue & Totals (GET /api/v1/revenue/totals/{clinic_id})
 * Allowed roles: SUPER_ADMIN, ORG_ADMIN, CLINIC_MANAGER, FINANCE.
 */
export async function getRevenueTotals(clinicId, currentUser = null) {
  if (!clinicId) return null;
  if (currentUser && !checkRevenueAccess(null, currentUser, 'view')) {
    throw new Error('Forbidden (403): Your role is not authorized to view revenue totals.');
  }

  try {
    const res = await apiClient.get(`/api/v1/revenue/totals/${clinicId}`);
    return res.data?.data || res.data;
  } catch (err) {
    console.warn('[revenueService] getRevenueTotals API error:', err?.message);
    return null;
  }
}

/**
 * 8. Get Outstanding Payments (GET /api/v1/revenue/outstanding)
 * Allowed roles: SUPER_ADMIN, ORG_ADMIN, CLINIC_MANAGER, FINANCE.
 */
export async function getOutstandingPayments(params = {}, currentUser = null) {
  if (currentUser && !checkRevenueAccess(null, currentUser, 'view')) {
    throw new Error('Forbidden (403): Your role is not authorized to view outstanding payments.');
  }

  try {
    const res = await apiClient.get('/api/v1/revenue/outstanding', { params });
    const rawList = res.data?.data || (Array.isArray(res.data) ? res.data : []);
    const normalized = rawList.map(normalizeRevenueRecord);
    return currentUser ? normalized.filter((r) => checkRevenueAccess(r, currentUser, 'view')) : normalized;
  } catch (err) {
    console.warn('[revenueService] getOutstandingPayments API error:', err?.message);
    const cached = getRevenueSync();
    const pending = cached.filter((r) => r.outstanding_amount > 0 || r.payment_status === 'pending');
    return currentUser ? pending.filter((r) => checkRevenueAccess(r, currentUser, 'view')) : pending;
  }
}

// ─── Scoped Revenue Records & Analytics Helpers ─────────────

/**
 * Returns all revenue records for an agent.
 */
export function getAgentRevenueRecords(agentId) {
  if (!agentId) return [];
  const allRevenue = getRevenueSync();
  const allLeads = storageService.get(storageService.KEYS.LEADS) || [];
  const allAppts = storageService.get(storageService.KEYS.APPOINTMENTS) || [];

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

    if (
      r.assigned_user_id === agentId ||
      r.responsible_agent === agentId ||
      r.agentId === agentId ||
      r.assignedAgentId === agentId ||
      r.created_by === agentId
    ) {
      return true;
    }

    if (r.lead_id && agentLeadIds.has(r.lead_id)) return true;
    if (r.leadId && agentLeadIds.has(r.leadId)) return true;
    if (r.appointment_id && agentApptIds.has(r.appointment_id)) return true;
    if (r.appointmentId && agentApptIds.has(r.appointmentId)) return true;

    if (r.patientName && agentLeadNames.has(r.patientName.toLowerCase().trim())) {
      return true;
    }

    return false;
  });
}

/**
 * Agent Dashboard Stats Helper
 */
export function getAgentRevenueStats(agentId) {
  const records = getAgentRevenueRecords(agentId);

  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const currentMonthRecords = records.filter(
    (r) =>
      (r.month === currentMonthKey || (r.created_at && r.created_at.startsWith(currentMonthKey))) &&
      isRevenueRecognized(r)
  );

  const prevDate = new Date();
  prevDate.setMonth(prevDate.getMonth() - 1);
  const prevMonthKey = prevDate.toISOString().slice(0, 7);
  const prevMonthRecords = records.filter(
    (r) =>
      (r.month === prevMonthKey || (r.created_at && r.created_at.startsWith(prevMonthKey))) &&
      isRevenueRecognized(r)
  );

  const monthlyRevenue = currentMonthRecords.reduce((acc, r) => acc + getRecognizedAmount(r), 0);
  const prevRevenue = prevMonthRecords.reduce((acc, r) => acc + getRecognizedAmount(r), 0);
  const revenueGrowth =
    prevRevenue > 0 ? Math.round(((monthlyRevenue - prevRevenue) / prevRevenue) * 1000) / 10 : null;

  const leadKPIs = getLeadKPIs(agentId);
  const totalConversions = leadKPIs.convertedLeads;
  const totalLeads = leadKPIs.assignedLeads;
  const conversionRate = totalLeads > 0 ? Math.round((totalConversions / totalLeads) * 100) : 0;

  const monthlyMap = {};
  records.filter(isRevenueRecognized).forEach((r) => {
    const m = r.month || (r.created_at ? r.created_at.slice(0, 7) : currentMonthKey);
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
 * Agent Revenue Trend Helper
 */
export function getAgentRevenueTrend(agentId, rangeKey = 'Last 30 Days') {
  const records = getAgentRevenueRecords(agentId).filter(isRevenueRecognized);
  const now = new Date();
  let dayCount = 30;

  if (rangeKey === 'Today') dayCount = 1;
  else if (rangeKey === 'Last 7 Days') dayCount = 7;
  else if (rangeKey === 'Last 90 Days') dayCount = 90;
  else if (rangeKey === 'This Month') dayCount = Math.max(1, now.getDate());

  const days = [];
  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  const dailyMap = {};
  days.forEach((dayStr) => {
    dailyMap[dayStr] = 0;
  });

  records.forEach((r) => {
    const dateVal = r.created_at || r.date;
    if (!dateVal) return;
    const dStr = dateVal.slice(0, 10);
    if (dailyMap[dStr] !== undefined) {
      dailyMap[dStr] += getRecognizedAmount(r);
    }
  });

  let runningTotal = 0;
  return days.map((dayStr) => {
    const d = new Date(dayStr);
    const rev = dailyMap[dayStr] || 0;
    runningTotal += rev;

    const timeLabel =
      dayCount <= 7
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

/**
 * Org-wide Revenue Analytics Helper
 */
export function getOrgRevenueStats(orgId = 'org-001', period = 'month') {
  const allRevenue = getRevenueSync();
  const orgRecords = allRevenue.filter((r) => !orgId || r.orgId === orgId || !r.orgId);

  const now = new Date();
  const currentMonthKey = now.toISOString().slice(0, 7);

  const filteredRecords = orgRecords.filter((r) => {
    if (period === 'month') {
      const dateVal = r.created_at || r.date || r.month;
      return dateVal && dateVal.startsWith(currentMonthKey);
    }
    return true;
  });

  const totalRevenue = filteredRecords
    .filter(isRevenueRecognized)
    .reduce((acc, r) => acc + getRecognizedAmount(r), 0);

  const totalOutstanding = filteredRecords.reduce((acc, r) => {
    const status = (r.payment_status || r.status || '').toLowerCase();
    if (status === 'paid' || status === 'completed' || status === 'refunded' || status === 'cancelled') {
      return acc;
    }
    return acc + Math.max(0, (r.total_amount || 0) - (r.paid_amount || 0));
  }, 0);

  const depositsCollected = filteredRecords
    .filter((r) => {
      const s = (r.payment_status || r.status || '').toLowerCase();
      return s === 'deposit_received' || s === 'deposit' || (r.notes && r.notes.toLowerCase().includes('deposit'));
    })
    .reduce((acc, r) => acc + getRecognizedAmount(r), 0);

  const refundedRecords = filteredRecords.filter((r) => (r.payment_status || r.status || '').toLowerCase() === 'refunded');
  const refundsIssued = refundedRecords.reduce((acc, r) => acc + (r.paid_amount || r.total_amount || 0), 0);

  return {
    totalRevenue,
    totalOutstanding,
    depositsCollected,
    refundsIssued,
    refundCount: refundedRecords.length,
    recordCount: filteredRecords.length,
    recognizedRecordsCount: filteredRecords.filter(isRevenueRecognized).length,
  };
}

/**
 * Treatment Category Normalizer
 */
export function normalizeTreatmentCategory(rawName = '') {
  if (!rawName) return 'General Dentistry';
  const str = String(rawName).toLowerCase().trim();

  if (str.includes('align') || str.includes('ortho') || str.includes('brace') || str.includes('invisalign')) {
    return 'Orthodontics & Aligners';
  }
  if (str.includes('implant') || str.includes('abutment') || str.includes('surgical') || str.includes('surgery') || str.includes('extraction')) {
    return 'Implants & Surgery';
  }
  if (str.includes('veneer') || str.includes('whiten') || str.includes('bleach') || str.includes('cosmetic') || str.includes('smile design')) {
    return 'Cosmetics & Aesthetics';
  }
  if (str.includes('crown') || str.includes('bridge') || str.includes('zirconia') || str.includes('ceramic') || str.includes('denture') || str.includes('prostho') || str.includes('onlay') || str.includes('inlay')) {
    return 'Prosthetics & Crowns';
  }
  if (str.includes('endo') || str.includes('root canal') || str.includes('pulp') || str.includes('molar endo') || str.includes('filling') || str.includes('restor')) {
    return 'Endodontics & Restorative';
  }
  if (str.includes('pediatric') || str.includes('child') || str.includes('fluoride')) {
    return 'Pediatric Care';
  }
  return 'General & Preventive';
}

/**
 * Clinic Revenue Breakdown Helper
 */
export function getClinicRevenueBreakdown(orgId = 'org-001') {
  const allRevenue = getRevenueSync();
  const orgRecords = allRevenue.filter((r) => {
    if (!isRevenueRecognized(r)) return false;
    if (r.orgId) return r.orgId === orgId;
    const clinic = CLINICS.find((c) => isSameClinic(c.id, r.clinic_id || r.clinicId));
    return !clinic || clinic.orgId === orgId;
  });

  const map = {};
  orgRecords.forEach((r) => {
    const cid = r.clinic_id || r.clinicId || 'clinic-downtown';
    const canonicalCid = cid === 'clinic-001' ? 'clinic-downtown' : cid === 'clinic-002' ? 'clinic-west' : cid;
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
 * Treatment Revenue Breakdown Helper
 */
export function getTreatmentRevenueBreakdown(orgId = 'org-001') {
  const allRevenue = getRevenueSync();
  const orgRecords = allRevenue.filter((r) => {
    if (!isRevenueRecognized(r)) return false;
    if (r.orgId) return r.orgId === orgId;
    const clinic = CLINICS.find((c) => isSameClinic(c.id, r.clinic_id || r.clinicId));
    return !clinic || clinic.orgId === orgId;
  });

  const map = {};
  orgRecords.forEach((r) => {
    const raw = r.treatment_name || r.treatmentCategory || r.category || r.treatment || r.notes || 'General & Preventive';
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
 * Backwards Compatible payment recorder
 */
export async function recordPayment(paymentData, currentUser = null) {
  return createRevenue(
    {
      patientName: paymentData.patientName,
      total_amount: Number(paymentData.amount) || 0,
      deposit_amount: Number(paymentData.amount) || 0,
      payment_status: paymentData.status || 'paid',
      payment_type: paymentData.method || 'credit_card',
      clinic_id: paymentData.clinicId || 'clinic-downtown',
      notes: paymentData.notes || 'Patient payment recorded',
    },
    currentUser
  );
}

/**
 * Backwards Compatible payment refunder
 */
export async function refundPayment(recordId, currentUser = null) {
  return processRefund(recordId, { amount: 100, reason: 'Payment refund' }, currentUser);
}

export default {
  getRevenues,
  getRevenueSync,
  getRevenueById,
  createRevenue,
  updateRevenue,
  processPayment,
  processRefund,
  getRevenueTotals,
  getOutstandingPayments,
  getAgentRevenueRecords,
  getAgentRevenueStats,
  getAgentRevenueTrend,
  getOrgRevenueStats,
  getClinicRevenueBreakdown,
  getTreatmentRevenueBreakdown,
  isRevenueRecognized,
  getRecognizedAmount,
  recordPayment,
  refundPayment,
  isFinanceAuthorizedForClinic,
  isAgentAuthorizedForLead,
  checkRevenueAccess,
  PAYMENT_STATUS,
  PAYMENT_TYPE,
};

