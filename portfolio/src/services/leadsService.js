/**
 * LEADS SERVICE
 *
 * All lead-related business logic is isolated here.
 * Components must NEVER access localStorage or storage.service directly.
 * Swap the storage calls with API calls (e.g. axios.get('/api/leads')) when the backend is ready.
 */

import { storageService } from './storage.service';
import { scopeData } from '../utils/scopeData';

const LEADS_KEY = storageService.KEYS.LEADS;

// ─── Helpers ─────────────────────────────────────────────────

const STATUS_ORDER = ['new', 'contacted', 'qualified', 'proposal', 'converted', 'lost'];

const normalise = (str = '') => str.toLowerCase().trim();

// ─── Public API ──────────────────────────────────────────────

/**
 * Returns leads assigned to a specific agent with support for
 * search, filtering, sorting, and pagination.
 *
 * @param {string} agentId
 * @param {object} options
 * @param {number} options.page      1-based page number
 * @param {number} options.pageSize  rows per page
 * @param {string} options.search    full-text search across name / treatment
 * @param {string} options.status    filter by status ('' = all)
 * @param {string} options.priority  filter by priority ('' = all)
 * @param {string} options.sortKey   field to sort by
 * @param {'asc'|'desc'} options.sortDir sort direction
 * @returns {{ data: Lead[], total: number, page: number, totalPages: number }}
 */
export function getAssignedLeads(agentId, options = {}) {
  const {
    page      = 1,
    pageSize  = 8,
    search    = '',
    status    = '',
    priority  = '',
    sortKey   = 'lastActivityDate',
    sortDir   = 'desc',
  } = options;

  const allLeads = storageService.get(LEADS_KEY) || [];
  let leads = allLeads.filter((l) => l.assignedAgentId === agentId);

  // Search
  if (search) {
    const q = normalise(search);
    leads = leads.filter(
      (l) =>
        normalise(l.patientName).includes(q) ||
        normalise(l.treatment).includes(q)   ||
        normalise(l.email).includes(q)
    );
  }

  // Status filter
  if (status) {
    leads = leads.filter((l) => l.status === status);
  }

  // Priority filter
  if (priority) {
    leads = leads.filter((l) => l.priority === priority);
  }

  // Sorting
  leads = leads.sort((a, b) => {
    let aVal = a[sortKey] ?? '';
    let bVal = b[sortKey] ?? '';

    if (sortKey === 'status') {
      aVal = STATUS_ORDER.indexOf(a.status);
      bVal = STATUS_ORDER.indexOf(b.status);
    }

    if (typeof aVal === 'string') {
      return sortDir === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const total      = leads.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage   = Math.min(page, totalPages);
  const data       = leads.slice((safePage - 1) * pageSize, safePage * pageSize);

  return { data, total, page: safePage, totalPages };
}

/**
 * Returns a single lead by ID.
 */
export function getLeadById(id) {
  const leads = storageService.get(LEADS_KEY) || [];
  return leads.find((l) => l.id === id) || null;
}

/**
 * Returns aggregated KPI numbers for the agent dashboard.
 *
 * @param {string} agentId
 * @returns {{ assignedLeads, newLeads, qualifiedLeads, convertedLeads, lostLeads }}
 */
export function getLeadKPIs(agentId) {
  const leads = (storageService.get(LEADS_KEY) || []).filter(
    (l) => l.assignedAgentId === agentId
  );

  return {
    assignedLeads:  leads.length,
    newLeads:       leads.filter((l) => l.status === 'new').length,
    qualifiedLeads: leads.filter((l) => l.status === 'qualified').length,
    convertedLeads: leads.filter((l) => l.status === 'converted').length,
    lostLeads:      leads.filter((l) => l.status === 'lost').length,
  };
}

/**
 * Updates a lead's status.
 */
export function updateLeadStatus(leadId, newStatus) {
  const leads = storageService.get(LEADS_KEY) || [];
  const updated = leads.map((l) =>
    l.id === leadId ? { ...l, status: newStatus, updatedAt: new Date().toISOString() } : l
  );
  storageService.set(LEADS_KEY, updated);
  return updated.find((l) => l.id === leadId);
}



/**
 * Sanitizes lead object for receptionist basic contact view only.
 */
export function sanitizeLeadForReceptionist(lead) {
  if (!lead) return null;
  return {
    id: lead.id,
    patientName: lead.patientName || lead.name || 'Anonymous Patient',
    phone: lead.phone || lead.phoneNumber || '(555) 123-4567',
    email: lead.email || 'N/A',
    clinicId: lead.clinicId || lead.clinic || 'Downtown Dental',
    createdAt: lead.createdAt || lead.date || new Date().toISOString(),
    preferredBranch: lead.preferredBranch || lead.clinicId || 'Main Clinic',
    isBasicView: true,
  };
}

/**
 * Returns a lead by ID after validating user scope and role access level.
 */
export function getLeadByIdScoped(id, currentUser, selectedClinicId) {
  const allLeads = storageService.get(LEADS_KEY) || [];
  const scopedLeads = scopeData({ resource: 'leads', data: allLeads, currentUser, selectedClinicId });
  const lead = scopedLeads.find((l) => String(l.id) === String(id));

  if (!lead) return null;

  if (currentUser?.role === 'receptionist') {
    return sanitizeLeadForReceptionist(lead);
  }

  return lead;
}

export const LEAD_STATUSES   = ['new', 'contacted', 'qualified', 'proposal', 'converted', 'lost'];
export const LEAD_PRIORITIES = ['high', 'medium', 'low'];

