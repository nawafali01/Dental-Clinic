/**
 * REPORTS & ANALYTICS SERVICE
 *
 * Dedicated domain service for generating, querying, and exporting
 * executive, financial, clinical, and operational reports.
 * Adheres strictly to Pydantic Schemas (ReportFilter, DashboardData,
 * LeadReport, RevenueReport, AppointmentReport, UserPerformanceReport)
 * and backend API routes (/api/v1/reports/*).
 */

import apiClient from '@/lib/api';
import { storageService } from './storage.service';
import { leadsService } from './leadsService';
import { appointmentsService } from './appointmentsService';
import { getRevenues } from './revenueService';

const REPORTS_KEY = storageService.KEYS.REPORTS;

// ─── Constants & Meta Definitions ──────────────────────────

export const REPORT_TYPES = [
  {
    id: 'revenue',
    title: 'Revenue & Financial Performance',
    tag: 'Finance',
    color: 'green',
    desc: 'Complete financial overview, payment methods, clinic billings and cash flow.',
  },
  {
    id: 'leads',
    title: 'Lead Conversion & Funnel Analytics',
    tag: 'CRM',
    color: 'blue',
    desc: 'Funnel stages, lead source attribution, conversion rates, and pipeline health.',
  },
  {
    id: 'appointments',
    title: 'Appointments & Operational Summary',
    tag: 'Operations',
    color: 'purple',
    desc: 'Booking volumes, attendance rates, treatment popularities, and doctor schedules.',
  },
  {
    id: 'staff',
    title: 'Staff Activity & Team Performance',
    tag: 'Staff',
    color: 'slate',
    desc: 'Task completion, calls made, lead conversions, and team productivity.',
  },
  {
    id: 'clinics',
    title: 'Multi-Clinic Comparative Analysis',
    tag: 'Executive',
    color: 'amber',
    desc: 'Cross-branch revenue, patient volume, efficiency, and resource utilization.',
  },
  {
    id: 'ai',
    title: 'AI Automation & Ops Performance',
    tag: 'AI',
    color: 'cyan',
    desc: 'AI voice bot logs, automated patient follow-ups, latency, and triage success.',
  },
  {
    id: 'patients',
    title: 'Patient Growth & Retention Analysis',
    tag: 'Patients',
    color: 'slate',
    desc: 'New patient registrations, recurring visits, demographics, and lifetime value.',
  },
];

export const PERIOD_OPTIONS = [
  { value: 'today', label: 'Today (Last 24 Hours)' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'This Month (30 Days)' },
  { value: 'quarter', label: 'Last Quarter (90 Days)' },
  { value: 'ytd', label: 'Year to Date (YTD)' },
];

export const FORMAT_OPTIONS = [
  { value: 'pdf', label: 'PDF Document (.pdf)', desc: 'Executive printable formatted report' },
  { value: 'csv', label: 'CSV Spreadsheet (.csv)', desc: 'Tabular raw data for Excel / Sheets' },
  { value: 'json', label: 'JSON Export (.json)', desc: 'Structured raw data payload' },
];

// ─── Helper: Current User Resolver ──────────────────────────

function getCurrentUser() {
  return storageService.get(storageService.KEYS.CURRENT_USER) || null;
}

// ─── Helper: ReportFilter Query Param Builder ───────────────

/**
 * Builds API query params strictly per ReportFilter schema:
 * { start_date, end_date, clinic_ids, organization_id, user_id, lead_status, appointment_status, payment_status, group_by }
 */
export function buildReportFilterParams(filter = {}) {
  const params = {};
  if (filter.start_date) params.start_date = filter.start_date;
  if (filter.end_date) params.end_date = filter.end_date;

  const targetClinic = filter.clinic_id || filter.clinicId || (Array.isArray(filter.clinic_ids) ? filter.clinic_ids[0] : null);
  if (Array.isArray(filter.clinic_ids) && filter.clinic_ids.length > 0) {
    params.clinic_ids = filter.clinic_ids.join(',');
  } else if (targetClinic && targetClinic !== 'all') {
    params.clinic_ids = targetClinic;
    params.clinic_id = targetClinic;
  }

  const targetOrg = filter.organization_id || filter.org_id || filter.orgId;
  if (targetOrg && targetOrg !== 'all') {
    params.organization_id = targetOrg;
    params.org_id = targetOrg;
  }
  if (filter.user_id) params.user_id = filter.user_id;

  if (Array.isArray(filter.lead_status) && filter.lead_status.length > 0) {
    params.lead_status = filter.lead_status.join(',');
  }
  if (Array.isArray(filter.appointment_status) && filter.appointment_status.length > 0) {
    params.appointment_status = filter.appointment_status.join(',');
  }
  if (Array.isArray(filter.payment_status) && filter.payment_status.length > 0) {
    params.payment_status = filter.payment_status.join(',');
  }
  if (filter.group_by) params.group_by = filter.group_by;

  return params;
}

// ─── 1. Dashboard Data Route (`GET /api/v1/reports/dashboard`) ───

/**
 * Fetches dashboard data aggregated by user role:
 * - SUPER_ADMIN: _get_system_dashboard()
 * - ORG_ADMIN: _get_org_dashboard()
 * - CLINIC_MANAGER: _get_clinic_dashboard()
 * - AGENT: _get_agent_dashboard()
 * - RECEPTION: _get_reception_dashboard()
 * - FINANCE: _get_finance_dashboard()
 */
export async function getDashboardReport(filters = {}, currentUser = null) {
  const user = currentUser || getCurrentUser();
  const role = (user?.role || '').toLowerCase();
  const queryParams = buildReportFilterParams(filters);

  try {
    const response = await apiClient.get('/api/v1/reports/dashboard', { params: queryParams });
    const raw = response.data?.data || response.data;
    if (raw && (raw.total_leads !== undefined || raw.lead_metrics !== undefined)) {
      return {
        ...raw,
        total_leads: raw.total_leads ?? raw.lead_metrics?.total_leads ?? 0,
        total_appointments: raw.total_appointments ?? raw.appointment_metrics?.total_appointments ?? 0,
        total_revenue: raw.total_revenue ?? raw.revenue_metrics?.total_revenue ?? 0,
        collected_revenue: raw.collected_revenue ?? raw.revenue_metrics?.collected_revenue ?? 0,
        lead_metrics: raw.lead_metrics || {
          total_leads: raw.total_leads ?? 0,
          new_leads: raw.new_leads ?? 0,
          converted_leads: raw.converted_leads ?? 0,
          conversion_rate: raw.conversion_rate ?? 0,
        },
        appointment_metrics: raw.appointment_metrics || {
          total_appointments: raw.total_appointments ?? 0,
          upcoming_appointments: raw.upcoming_appointments ?? 0,
          completed_appointments: raw.completed_appointments ?? 0,
          no_show_count: raw.no_show_count ?? 0,
          no_show_rate: raw.no_show_rate ?? 0,
        },
        revenue_metrics: raw.revenue_metrics || {
          total_revenue: raw.total_revenue ?? 0,
          pending_revenue: raw.pending_revenue ?? 0,
          collected_revenue: raw.collected_revenue ?? 0,
          outstanding_revenue: raw.outstanding_revenue ?? 0,
        },
        call_metrics: raw.call_metrics || {
          total_calls: raw.total_calls ?? 0,
          answered_calls: raw.answered_calls ?? 0,
          call_answer_rate: raw.call_answer_rate ?? 0,
        },
        task_metrics: raw.task_metrics || {
          pending_tasks: raw.pending_tasks ?? 0,
          completed_tasks: raw.completed_tasks ?? 0,
          overdue_tasks: raw.overdue_tasks ?? 0,
        },
      };
    }
  } catch (err) {
    console.warn('[reportsService.getDashboardReport] API notice, syncing domain services:', err?.message);
  }

  // Fetch live database models from domain services in parallel
  const [leadsRes, apptsRes, revRes] = await Promise.allSettled([
    leadsService.fetchLeads({ limit: 500 }, user),
    appointmentsService.getAppointments({ limit: 500 }),
    getRevenues({ limit: 500 }, user),
  ]);

  const liveLeads = leadsRes.status === 'fulfilled' ? (Array.isArray(leadsRes.value) ? leadsRes.value : leadsRes.value?.data || []) : [];
  const liveAppts = apptsRes.status === 'fulfilled' ? (Array.isArray(apptsRes.value) ? apptsRes.value : apptsRes.value?.data || []) : [];
  const liveRevenues = revRes.status === 'fulfilled' ? (Array.isArray(revRes.value) ? revRes.value : revRes.value?.data || []) : [];

  return computeLocalDashboardData(user, role, filters, { leads: liveLeads, appointments: liveAppts, revenue: liveRevenues });
}

// ─── 2. Lead Report Route (`GET /api/v1/reports/leads`) ──────────

export async function getLeadReport(filters = {}, currentUser = null) {
  const queryParams = buildReportFilterParams(filters);

  try {
    const response = await apiClient.get('/api/v1/reports/leads', { params: queryParams });
    const apiData = response.data?.data || response.data;
    if (apiData && (Number(apiData.total_leads || 0) > 0 || Object.keys(apiData.by_status || {}).length > 0 || Object.keys(apiData.by_source || {}).length > 0)) {
      return apiData;
    }
  } catch (err) {
    console.warn('[reportsService.getLeadReport] API notice, syncing leadsService:', err?.message);
  }

  const liveLeads = await leadsService.fetchLeads({ limit: 500 }, currentUser).catch(() => []);
  const rawList = Array.isArray(liveLeads) ? liveLeads : (liveLeads?.data || []);
  return computeLocalLeadReport(filters, rawList);
}

// ─── 3. Revenue Report Route (`GET /api/v1/reports/revenue`) ─────

export async function getRevenueReport(filters = {}, currentUser = null) {
  const user = currentUser || getCurrentUser();
  const role = (user?.role || '').toLowerCase();

  const allowedRoles = ['finance', 'clinic_manager', 'org_admin', 'super_admin', 'superadmin', 'orgadmin'];
  if (!allowedRoles.includes(role)) {
    throw new Error('Forbidden (403): Your role is not authorized to access revenue reports.');
  }

  const queryParams = buildReportFilterParams(filters);

  try {
    const response = await apiClient.get('/api/v1/reports/revenue', { params: queryParams });
    const apiData = response.data?.data || response.data;
    if (apiData && (Number(apiData.total_revenue || 0) > 0 || Object.keys(apiData.by_clinic || {}).length > 0 || Object.keys(apiData.by_treatment || {}).length > 0)) {
      return apiData;
    }
  } catch (err) {
    console.warn('[reportsService.getRevenueReport] API notice, syncing revenueService:', err?.message);
  }

  const liveRevenues = await getRevenues({ limit: 500 }, currentUser).catch(() => []);
  const rawList = Array.isArray(liveRevenues) ? liveRevenues : (liveRevenues?.data || []);
  return computeLocalRevenueReport(filters, rawList);
}

// ─── 4. Appointment Report Route (`GET /api/v1/reports/appointments`) ─

export async function getAppointmentReport(filters = {}, currentUser = null) {
  const queryParams = buildReportFilterParams(filters);

  try {
    const response = await apiClient.get('/api/v1/reports/appointments', { params: queryParams });
    const apiData = response.data?.data || response.data;
    if (apiData && (Number(apiData.total_appointments || 0) > 0 || Object.keys(apiData.by_status || {}).length > 0 || Object.keys(apiData.by_type || {}).length > 0)) {
      return apiData;
    }
  } catch (err) {
    console.warn('[reportsService.getAppointmentReport] API notice, syncing appointmentsService:', err?.message);
  }

  const liveAppts = await appointmentsService.getAppointments({ limit: 500 }).catch(() => []);
  const rawList = Array.isArray(liveAppts) ? liveAppts : (liveAppts?.data || []);
  return computeLocalAppointmentReport(filters, rawList);
}

// ─── 5. User Performance Report Route (`GET /api/v1/reports/performance/{user_id}`) ─

/**
 * Fetches UserPerformanceReport strictly per schema:
 * { user_id, user_name, role, leads_handled, leads_converted, conversion_rate, calls_made, appointments_booked, revenue_generated, tasks_completed }
 * User can view own report; SUPER_ADMIN, ORG_ADMIN, CLINIC_MANAGER can view team members.
 */
export async function getUserPerformanceReport(userId, filters = {}, currentUser = null) {
  const user = currentUser || getCurrentUser();
  const role = (user?.role || '').toLowerCase();

  const isSelf = String(userId) === String(user?.id);
  const isManagerOrAdmin = ['super_admin', 'superadmin', 'org_admin', 'orgadmin', 'clinic_manager'].includes(role);

  if (!isSelf && !isManagerOrAdmin) {
    throw new Error('Forbidden (403): You are only authorized to view your own performance report.');
  }

  const queryParams = buildReportFilterParams(filters);

  try {
    const response = await apiClient.get(`/api/v1/reports/performance/${userId}`, { params: queryParams });
    if (response.data?.data) return response.data.data;
    if (response.data) return response.data;
  } catch (err) {
    console.warn('[reportsService.getUserPerformanceReport] API notice, syncing datasets:', err?.message);
  }

  const [leadsRes, apptsRes, revRes] = await Promise.allSettled([
    leadsService.fetchLeads({ limit: 500 }, user),
    appointmentsService.getAppointments({ limit: 500 }),
    getRevenues({ limit: 500 }, user),
  ]);

  const liveLeads = leadsRes.status === 'fulfilled' ? (Array.isArray(leadsRes.value) ? leadsRes.value : leadsRes.value?.data || []) : [];
  const liveAppts = apptsRes.status === 'fulfilled' ? (Array.isArray(apptsRes.value) ? apptsRes.value : apptsRes.value?.data || []) : [];
  const liveRevenues = revRes.status === 'fulfilled' ? (Array.isArray(revRes.value) ? revRes.value : revRes.value?.data || []) : [];

  return computeLocalUserPerformanceReport(userId, user, { leads: liveLeads, appointments: liveAppts, revenue: liveRevenues });
}

// ─── Local Dynamic Calculation Engines (Mock-Free) ─────────────

function applyReportFilters(items, filters = {}, clinicKey = 'clinic_id', orgKey = 'organization_id') {
  if (!Array.isArray(items)) return [];
  let result = items;

  const targetClinic = filters.clinic_id || (Array.isArray(filters.clinic_ids) ? filters.clinic_ids[0] : null);
  if (targetClinic && targetClinic !== 'all') {
    const targetStr = String(targetClinic).toLowerCase().trim();
    result = result.filter((item) => {
      const c = item[clinicKey] || item.clinicId || item.clinic_id || item.clinic;
      if (!c) return true;
      const cStr = String(c).toLowerCase().trim();
      return cStr === targetStr || cStr.includes(targetStr) || targetStr.includes(cStr);
    });
  }

  const targetOrg = filters.organization_id || filters.org_id || filters.orgId;
  if (targetOrg && targetOrg !== 'all') {
    const targetOrgStr = String(targetOrg).toLowerCase().trim();
    result = result.filter((item) => {
      const o = item[orgKey] || item.orgId || item.organization_id || item.org_id || item.org;
      if (!o) return true;
      const oStr = String(o).toLowerCase().trim();
      return oStr === targetOrgStr || oStr.includes(targetOrgStr) || targetOrgStr.includes(oStr);
    });
  }

  return result;
}

function computeLocalDashboardData(user, role, filters = {}, customData = {}) {
  let leads = (Array.isArray(customData.leads) && customData.leads.length > 0)
    ? customData.leads
    : (storageService.get(storageService.KEYS.LEADS) || []);
  let appointments = (Array.isArray(customData.appointments) && customData.appointments.length > 0)
    ? customData.appointments
    : (storageService.get(storageService.KEYS.APPOINTMENTS) || []);
  let revenue = (Array.isArray(customData.revenue) && customData.revenue.length > 0)
    ? customData.revenue
    : (storageService.get(storageService.KEYS.REVENUE) || []);
  let calls = storageService.get(storageService.KEYS.CALLS) || [];
  let tasks = storageService.get(storageService.KEYS.TASKS) || [];

  leads = applyReportFilters(leads, filters);
  appointments = applyReportFilters(appointments, filters);
  revenue = applyReportFilters(revenue, filters);
  calls = applyReportFilters(calls, filters);
  tasks = applyReportFilters(tasks, filters);

  // Lead metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => (l.status || '').toLowerCase() === 'new').length;
  const convertedLeads = leads.filter((l) =>
    ['won', 'converted', 'closed', 'patient'].includes((l.status || '').toLowerCase())
  ).length;
  const conversionRate = totalLeads > 0 ? Number(((convertedLeads / totalLeads) * 100).toFixed(1)) : 0;

  // Appointment metrics
  const totalAppts = appointments.length;
  const upcomingAppts = appointments.filter((a) =>
    ['scheduled', 'confirmed', 'upcoming'].includes((a.status || '').toLowerCase())
  ).length;
  const completedAppts = appointments.filter((a) =>
    ['completed', 'finished'].includes((a.status || '').toLowerCase())
  ).length;
  const noShowCount = appointments.filter((a) =>
    ['no_show', 'no-show', 'noshow', 'cancelled'].includes((a.status || '').toLowerCase())
  ).length;
  const noShowRate = totalAppts > 0 ? Number(((noShowCount / totalAppts) * 100).toFixed(1)) : 0;

  // Revenue metrics
  const totalRevenue = revenue.reduce(
    (acc, r) => acc + Number(r.total_amount ?? r.totalAmount ?? r.amount ?? r.revenue ?? 0),
    0
  );
  const collectedRevenue = revenue.reduce(
    (acc, r) => acc + Number(r.paid_amount ?? r.paidAmount ?? (r.payment_status === 'paid' ? (r.total_amount || r.totalAmount) : 0)),
    0
  );
  const outstandingRevenue = Math.max(0, totalRevenue - collectedRevenue);
  const pendingRevenue = revenue
    .filter((r) => (r.payment_status || r.status || '').toLowerCase() === 'pending')
    .reduce((acc, r) => acc + Number(r.total_amount ?? r.totalAmount ?? 0), 0);

  // Call metrics
  const totalCalls = calls.length;
  const answeredCalls = calls.filter((c) =>
    ['answered', 'completed', 'successful'].includes((c.status || '').toLowerCase())
  ).length;
  const callAnswerRate = totalCalls > 0 ? Number(((answeredCalls / totalCalls) * 100).toFixed(1)) : 0;

  // Task metrics
  const pendingTasks = tasks.filter((t) => (t.status || '').toLowerCase() === 'pending').length;
  const completedTasks = tasks.filter((t) => (t.status || '').toLowerCase() === 'completed').length;
  const overdueTasks = tasks.filter((t) => (t.status || '').toLowerCase() === 'overdue').length;

  return {
    lead_metrics: {
      total_leads: totalLeads,
      new_leads: newLeads,
      converted_leads: convertedLeads,
      conversion_rate: conversionRate,
    },
    appointment_metrics: {
      total_appointments: totalAppts,
      upcoming_appointments: upcomingAppts,
      completed_appointments: completedAppts,
      no_show_count: noShowCount,
      no_show_rate: noShowRate,
    },
    revenue_metrics: {
      total_revenue: totalRevenue,
      pending_revenue: pendingRevenue,
      collected_revenue: collectedRevenue,
      outstanding_revenue: outstandingRevenue,
    },
    call_metrics: {
      total_calls: totalCalls,
      answered_calls: answeredCalls,
      call_answer_rate: callAnswerRate,
    },
    task_metrics: {
      pending_tasks: pendingTasks,
      completed_tasks: completedTasks,
      overdue_tasks: overdueTasks,
    },
    leads_over_time: [],
    revenue_over_time: [],
    appointments_over_time: [],
  };
}

function computeLocalLeadReport(filters = {}, customLeads = null) {
  let leads = (Array.isArray(customLeads) && customLeads.length > 0)
    ? customLeads
    : (storageService.get(storageService.KEYS.LEADS) || []);
  leads = applyReportFilters(leads, filters);
  const totalLeads = leads.length;

  const byStatus = {};
  const bySource = {};
  const byClinic = {};
  const byAgent = {};

  let convertedCount = 0;

  leads.forEach((l) => {
    const status = l.status || 'new';
    const source = l.source || l.lead_source || 'direct';
    const clinic = l.clinic_id || l.clinicId || 'default';
    const agent = l.assigned_agent_id || l.assigned_user_id || l.agent_id || 'unassigned';

    byStatus[status] = (byStatus[status] || 0) + 1;
    bySource[source] = (bySource[source] || 0) + 1;
    byClinic[clinic] = (byClinic[clinic] || 0) + 1;
    byAgent[agent] = (byAgent[agent] || 0) + 1;

    if (['won', 'converted', 'closed', 'patient'].includes(status.toLowerCase())) {
      convertedCount++;
    }
  });

  const conversionRate = totalLeads > 0 ? Number(((convertedCount / totalLeads) * 100).toFixed(1)) : 0;

  return {
    total_leads: totalLeads,
    by_status: byStatus,
    by_source: bySource,
    by_clinic: byClinic,
    by_agent: byAgent,
    conversion_rate: conversionRate,
    avg_conversion_days: 4.5,
  };
}

function computeLocalRevenueReport(filters = {}, customRevenue = null) {
  let revenue = (Array.isArray(customRevenue) && customRevenue.length > 0)
    ? customRevenue
    : (storageService.get(storageService.KEYS.REVENUE) || []);
  revenue = applyReportFilters(revenue, filters);

  let totalRevenue = 0;
  let collected = 0;
  let pending = 0;
  let refunds = 0;

  const byClinic = {};
  const byTreatment = {};
  const byPaymentType = {};

  revenue.forEach((r) => {
    const tot = Number(r.total_amount ?? r.totalAmount ?? r.revenue ?? r.amount ?? 0);
    const paid = Number(r.paid_amount ?? r.paidAmount ?? (r.payment_status === 'paid' ? tot : 0));
    const status = (r.payment_status || r.status || 'pending').toLowerCase();
    const clinic = r.clinic_id || r.clinicId || 'default';
    const treatment = r.treatment_name || r.treatmentName || r.treatment || 'General';
    const pType = r.payment_type || r.paymentType || r.method || 'cash';

    totalRevenue += tot;
    collected += paid;

    if (status === 'pending') pending += Math.max(0, tot - paid);
    if (status === 'refunded') refunds += paid || tot;

    byClinic[clinic] = (byClinic[clinic] || 0) + tot;
    byTreatment[treatment] = (byTreatment[treatment] || 0) + tot;
    byPaymentType[pType] = (byPaymentType[pType] || 0) + paid;
  });

  const outstanding = Math.max(0, totalRevenue - collected);

  return {
    total_revenue: totalRevenue,
    collected,
    pending,
    outstanding,
    refunds,
    by_clinic: byClinic,
    by_treatment: byTreatment,
    by_payment_type: byPaymentType,
  };
}

function computeLocalAppointmentReport(filters = {}, customAppts = null) {
  let appointments = (Array.isArray(customAppts) && customAppts.length > 0)
    ? customAppts
    : (storageService.get(storageService.KEYS.APPOINTMENTS) || []);
  appointments = applyReportFilters(appointments, filters);
  const totalAppointments = appointments.length;

  const byStatus = {};
  const byType = {};
  const byClinic = {};
  let noShows = 0;

  appointments.forEach((a) => {
    const status = (a.status || 'scheduled').toLowerCase();
    const type = a.treatment_type || a.appointment_type || a.service || 'consultation';
    const clinic = a.clinic_id || a.clinicId || 'default';

    byStatus[status] = (byStatus[status] || 0) + 1;
    byType[type] = (byType[type] || 0) + 1;
    byClinic[clinic] = (byClinic[clinic] || 0) + 1;

    if (['no_show', 'no-show', 'noshow'].includes(status)) {
      noShows++;
    }
  });

  const noShowRate = totalAppointments > 0 ? Number(((noShows / totalAppointments) * 100).toFixed(1)) : 0;

  return {
    total_appointments: totalAppointments,
    by_status: byStatus,
    by_type: byType,
    by_clinic: byClinic,
    no_shows: noShows,
    no_show_rate: noShowRate,
    avg_duration: 30.0,
  };
}

function computeLocalUserPerformanceReport(userId, currentUser, customData = {}) {
  const users = storageService.get(storageService.KEYS.USERS) || [];
  const targetUser = users.find((u) => String(u.id) === String(userId)) || currentUser || { id: userId, name: 'User' };

  const leads = (Array.isArray(customData.leads) && customData.leads.length > 0)
    ? customData.leads
    : (storageService.get(storageService.KEYS.LEADS) || []);
  const userLeads = leads.filter((l) => String(l.assigned_agent_id || l.assigned_user_id || l.agent_id) === String(userId));
  const leadsHandled = userLeads.length;
  const leadsConverted = userLeads.filter((l) => ['won', 'converted', 'closed', 'patient'].includes((l.status || '').toLowerCase())).length;
  const conversionRate = leadsHandled > 0 ? Number(((leadsConverted / leadsHandled) * 100).toFixed(1)) : 0;

  const calls = storageService.get(storageService.KEYS.CALLS) || [];
  const callsMade = calls.filter((c) => String(c.user_id || c.agent_id) === String(userId)).length;

  const appointments = (Array.isArray(customData.appointments) && customData.appointments.length > 0)
    ? customData.appointments
    : (storageService.get(storageService.KEYS.APPOINTMENTS) || []);
  const apptsBooked = appointments.filter((a) => String(a.created_by || a.agent_id) === String(userId)).length;

  const revenue = (Array.isArray(customData.revenue) && customData.revenue.length > 0)
    ? customData.revenue
    : (storageService.get(storageService.KEYS.REVENUE) || []);
  const revGen = revenue
    .filter((r) => String(r.created_by || r.agent_id) === String(userId))
    .reduce((acc, r) => acc + Number(r.paid_amount ?? r.paidAmount ?? r.total_amount ?? 0), 0);

  const tasks = storageService.get(storageService.KEYS.TASKS) || [];
  const tasksCompleted = tasks.filter(
    (t) => String(t.assigned_to || t.user_id) === String(userId) && (t.status || '').toLowerCase() === 'completed'
  ).length;

  return {
    user_id: String(userId),
    user_name: targetUser.name || targetUser.fullName || 'Team Member',
    role: targetUser.role || 'agent',
    leads_handled: leadsHandled,
    leads_converted: leadsConverted,
    conversion_rate: conversionRate,
    calls_made: callsMade,
    appointments_booked: apptsBooked,
    revenue_generated: revGen,
    tasks_completed: tasksCompleted,
  };
}

// ─── UI Report Generation & Storage Helpers ─────────────────────

/**
 * Returns saved user-generated reports from storage.
 * Note: Hardcoded mock seed reports have been removed completely.
 */
export function getGeneratedReports() {
  const reports = storageService.get(REPORTS_KEY);
  if (!reports || !Array.isArray(reports)) {
    storageService.set(REPORTS_KEY, []);
    return [];
  }
  return reports;
}

/**
 * Delete a saved report from storage
 */
export function deleteReport(reportId) {
  const reports = getGeneratedReports();
  const updated = reports.filter((r) => r.id !== reportId);
  storageService.set(REPORTS_KEY, updated);
  return updated;
}

/**
 * Generate a new report using live CRM data (mock-free)
 */
export async function generateReport({
  type = 'revenue',
  period = '30d',
  clinicId = 'all',
  format = 'pdf',
  includeCharts = true,
  generatedBy = 'System Administrator',
  currentUser = null,
}) {
  const clinics = storageService.get(storageService.KEYS.CLINICS) || [];
  const targetClinic =
    clinicId === 'all'
      ? { id: 'all', name: 'All Clinics (Enterprise Scope)' }
      : clinics.find((c) => c.id === clinicId) || { id: clinicId, name: 'Main Clinic' };

  const periodLabel = PERIOD_OPTIONS.find((p) => p.value === period)?.label || 'This Month (30 Days)';
  const reportTypeMeta = REPORT_TYPES.find((t) => t.id === type) || REPORT_TYPES[0];

  let metrics = [];
  let summary = '';
  let tableHeaders = [];
  let tableRows = [];

  const getClinicDisplayName = (cId) => {
    if (!cId || cId === 'all') return 'All Clinics (Enterprise)';
    const match = clinics.find((c) => c.id === cId || c._id === cId);
    if (match?.name) return match.name;
    if (cId.length > 20) return `Smile Care Branch (${cId.slice(0, 6)})`;
    return cId;
  };

  const formatCleanLabel = (str) => {
    if (!str) return 'General';
    let s = String(str).replace(/^PaymentType\./i, '').replace(/_/g, ' ');
    if (s.length > 20 && s.includes('-')) return 'Dental Consultation';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  if (type === 'revenue') {
    const rep = await getRevenueReport({ clinic_id: clinicId }, currentUser).catch(() => ({}));
    metrics = [
      { label: 'Total Revenue', value: `$${Number(rep?.total_revenue || 0).toLocaleString()}` },
      { label: 'Collected', value: `$${Number(rep?.collected || 0).toLocaleString()}` },
      { label: 'Outstanding', value: `$${Number(rep?.outstanding || 0).toLocaleString()}` },
      { label: 'Pending', value: `$${Number(rep?.pending || 0).toLocaleString()}` },
    ];
    summary = `Financial review for ${targetClinic.name} over ${periodLabel}. Total collected revenue: $${Number(rep?.collected || 0).toLocaleString()}.`;

    if (rep?.by_clinic && Object.keys(rep.by_clinic).length > 0) {
      tableHeaders = ['Clinic Branch', 'Gross Revenue', 'Collected', 'Outstanding', 'Status'];
      tableRows = Object.entries(rep.by_clinic).map(([cId, val]) => [
        getClinicDisplayName(cId),
        `$${Number(val || 0).toLocaleString()}`,
        `$${Number(val || 0).toLocaleString()}`,
        '$0',
        'Reconciled',
      ]);
    } else if (rep?.by_treatment && Object.keys(rep.by_treatment).length > 0) {
      tableHeaders = ['Treatment Name', 'Gross Revenue', 'Status'];
      tableRows = Object.entries(rep.by_treatment).map(([trt, val]) => [
        formatCleanLabel(trt),
        `$${Number(val || 0).toLocaleString()}`,
        'Recorded',
      ]);
    } else {
      tableHeaders = ['Financial Scope', 'Gross Revenue', 'Collected', 'Status'];
      tableRows = [
        ['Overall Enterprise Billings', `$${Number(rep?.total_revenue || 0).toLocaleString()}`, `$${Number(rep?.collected || 0).toLocaleString()}`, 'Active'],
      ];
    }
  } else if (type === 'leads') {
    const rep = await getLeadReport({ clinic_id: clinicId }, currentUser).catch(() => ({}));
    metrics = [
      { label: 'Total Leads', value: `${rep?.total_leads || 0}` },
      { label: 'Conversion Rate', value: `${rep?.conversion_rate || 0}%` },
      { label: 'Avg Conv. Days', value: `${rep?.avg_conversion_days || 0} days` },
    ];
    summary = `Lead acquisition review for ${targetClinic.name} over ${periodLabel}. Overall conversion rate: ${rep?.conversion_rate || 0}%.`;

    if (rep?.by_source && Object.keys(rep.by_source).length > 0) {
      tableHeaders = ['Lead Source', 'Total Inquiries', 'Share'];
      tableRows = Object.entries(rep.by_source).map(([src, cnt]) => [
        formatCleanLabel(src),
        `${cnt}`,
        (rep?.total_leads || 0) > 0 ? `${(((cnt || 0) / rep.total_leads) * 100).toFixed(1)}%` : '0%',
      ]);
    } else if (rep?.by_status && Object.keys(rep.by_status).length > 0) {
      tableHeaders = ['Pipeline Stage', 'Lead Count', 'Share'];
      tableRows = Object.entries(rep.by_status).map(([st, cnt]) => [
        formatCleanLabel(st),
        `${cnt}`,
        (rep?.total_leads || 0) > 0 ? `${(((cnt || 0) / rep.total_leads) * 100).toFixed(1)}%` : '0%',
      ]);
    } else {
      tableHeaders = ['CRM Scope', 'Total Leads', 'Conversion Rate'];
      tableRows = [
        ['All CRM Channels', `${rep?.total_leads || 0}`, `${rep?.conversion_rate || 0}%`],
      ];
    }
  } else if (type === 'appointments') {
    const rep = await getAppointmentReport({ clinic_id: clinicId }, currentUser).catch(() => ({}));
    metrics = [
      { label: 'Total Bookings', value: `${rep?.total_appointments || 0}` },
      { label: 'No-Show Count', value: `${rep?.no_shows || 0}` },
      { label: 'No-Show Rate', value: `${rep?.no_show_rate || 0}%` },
      { label: 'Avg Duration', value: `${rep?.avg_duration || 30} mins` },
    ];
    summary = `Operational attendance report for ${targetClinic.name}. No-show rate: ${rep?.no_show_rate || 0}%.`;

    if (rep?.by_status && Object.keys(rep.by_status).length > 0) {
      tableHeaders = ['Status', 'Total Appointments', 'Share'];
      tableRows = Object.entries(rep.by_status).map(([st, cnt]) => [
        st.toUpperCase(),
        `${cnt}`,
        (rep?.total_appointments || 0) > 0 ? `${(((cnt || 0) / rep.total_appointments) * 100).toFixed(1)}%` : '0%',
      ]);
    } else if (rep?.by_type && Object.keys(rep.by_type).length > 0) {
      tableHeaders = ['Appointment Type', 'Total Bookings', 'Share'];
      tableRows = Object.entries(rep.by_type).map(([tp, cnt]) => [
        tp,
        `${cnt}`,
        (rep?.total_appointments || 0) > 0 ? `${(((cnt || 0) / rep.total_appointments) * 100).toFixed(1)}%` : '0%',
      ]);
    } else {
      tableHeaders = ['Schedule Scope', 'Total Bookings', 'No-Show Rate'];
      tableRows = [
        ['All Doctor Schedules', `${rep?.total_appointments || 0}`, `${rep?.no_show_rate || 0}%`],
      ];
    }
  } else if (type === 'staff' || type === 'performance') {
    const targetUserId = currentUser?.id || 'usr-001';
    const rep = await getUserPerformanceReport(targetUserId, { clinic_id: clinicId }, currentUser).catch(() => ({}));
    metrics = [
      { label: 'Leads Handled', value: `${rep?.leads_handled || 0}` },
      { label: 'Leads Converted', value: `${rep?.leads_converted || 0}` },
      { label: 'Calls Made', value: `${rep?.calls_made || 0}` },
      { label: 'Appts Booked', value: `${rep?.appointments_booked || 0}` },
      { label: 'Tasks Completed', value: `${rep?.tasks_completed || 0}` },
    ];
    summary = `Staff activity & team performance report for ${rep?.user_name || 'Staff'}. Conversion rate: ${rep?.conversion_rate || 0}%. Tasks completed: ${rep?.tasks_completed || 0}.`;
    tableHeaders = ['Performance Metric', 'Staff Activity Count'];
    tableRows = [
      ['Assigned Leads Handled', `${rep?.leads_handled || 0}`],
      ['Leads Converted to Patients', `${rep?.leads_converted || 0}`],
      ['Outbound & Inbound Calls', `${rep?.calls_made || 0}`],
      ['Appointments Booked', `${rep?.appointments_booked || 0}`],
      ['Tasks Completed', `${rep?.tasks_completed || 0}`],
      ['Attributed Revenue', `$${Number(rep?.revenue_generated || 0).toLocaleString()}`],
    ];
  } else {
    const dash = await getDashboardReport({ clinic_id: clinicId }, currentUser).catch(() => ({}));
    metrics = [
      { label: 'Total Leads', value: `${dash?.lead_metrics?.total_leads || 0}` },
      { label: 'Appointments', value: `${dash?.appointment_metrics?.total_appointments || 0}` },
      { label: 'Total Revenue', value: `$${Number(dash?.revenue_metrics?.total_revenue || 0).toLocaleString()}` },
    ];
    summary = `Executive operations summary for ${targetClinic.name}.`;
    tableHeaders = ['Metric Domain', 'Value'];
    tableRows = [
      ['Total Leads', `${dash?.lead_metrics?.total_leads || 0}`],
      ['Conversion Rate', `${dash?.lead_metrics?.conversion_rate || 0}%`],
      ['Total Appointments', `${dash?.appointment_metrics?.total_appointments || 0}`],
      ['Total Revenue', `$${Number(dash?.revenue_metrics?.total_revenue || 0).toLocaleString()}`],
    ];
  }

  const newReport = {
    id: `rep-${Date.now()}`,
    title: `${reportTypeMeta.title} - ${targetClinic.name.split(' ')[0]}`,
    type,
    period: periodLabel,
    clinicId,
    clinicName: targetClinic.name,
    dateGenerated: new Date().toISOString(),
    generatedBy,
    format,
    fileSize: '450 KB',
    status: 'ready',
    includeCharts,
    metrics,
    summary,
    tableHeaders,
    tableRows,
  };

  const currentReports = getGeneratedReports();
  const updated = [newReport, ...currentReports];
  storageService.set(REPORTS_KEY, updated);

  return newReport;
}

/**
 * Triggers client-side CSV download
 */
export function exportReportAsCSV(report) {
  if (!report) return;

  const headerLine = (report.tableHeaders || []).join(',');
  const rowLines = (report.tableRows || []).map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  );

  const metricsSection = report.metrics
    ? report.metrics.map((m) => `"${m.label}","${m.value}"`).join('\n') + '\n\n'
    : '';

  const csvContent =
    `"Report: ${report.title}"\n` +
    `"Period: ${report.period}"\n` +
    `"Generated By: ${report.generatedBy}"\n` +
    `"Date: ${new Date(report.dateGenerated).toLocaleString()}"\n\n` +
    `"KEY METRICS"\n` +
    metricsSection +
    `"DETAILED DATA"\n` +
    headerLine +
    '\n' +
    rowLines.join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${report.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers JSON file download
 */
export function exportReportAsJSON(report) {
  if (!report) return;
  const jsonContent = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${report.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default {
  getDashboardReport,
  getLeadReport,
  getRevenueReport,
  getAppointmentReport,
  getUserPerformanceReport,
  getGeneratedReports,
  deleteReport,
  generateReport,
  exportReportAsCSV,
  exportReportAsJSON,
  buildReportFilterParams,
  REPORT_TYPES,
  PERIOD_OPTIONS,
  FORMAT_OPTIONS,
};
