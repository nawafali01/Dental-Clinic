/**
 * LEADS SERVICE
 *
 * Handles API integration with:
 * - GET  /api/v1/leads/
 * - POST /api/v1/leads/
 *
 * Payload schema for POST:
 * {
 *   "first_name": "",
 *   "last_name": "",
 *   "email": "",
 *   "phone": "",
 *   "source": "other",
 *   "status": "new",
 *   "notes": "",
 *   "treatment_interest": "",
 *   "expected_revenue": 1,
 *   "assigned_to": "",
 *   "priority": "medium",
 *   "clinic_id": "",
 *   "organization_id": ""
 * }
 */

import apiClient from '../lib/api';
import { storageService, isLegacyMockLead } from './storage.service';
import { scopeData } from '../utils/scopeData';
import { assertCanMutate } from '@/dashboard/shared/config/permissions';
import { createSuccess, createError } from '../utils/response.util';
import { LEAD_SOURCES, LEAD_STATUSES, LEAD_PRIORITIES } from '@/schemas/lead.schema';

export { LEAD_SOURCES, LEAD_STATUSES, LEAD_PRIORITIES };

const LEADS_KEY = storageService.KEYS.LEADS;

const STATUS_ORDER = ['new', 'contacted', 'qualified', 'proposal', 'converted', 'lost'];
const normalise = (str = '') => str.toLowerCase().trim();

/**
 * Normalizes lead record between backend API format and frontend UI models
 */
export function normalizeLead(raw) {
  if (!raw || isLegacyMockLead(raw)) return null;

  const id = raw.id || raw._id || `lead-${Date.now().toString(36)}`;
  const firstName = (raw.first_name || '').trim();
  const lastName = (raw.last_name || '').trim();

  let computedPatientName = [firstName, lastName].filter(Boolean).join(' ');
  if (!computedPatientName) {
    computedPatientName = raw.patientName || raw.name || 'Anonymous Patient';
  }

  const [extractedFirst, ...rest] = computedPatientName.split(/\s+/);
  const finalFirstName = firstName || extractedFirst || '';
  const finalLastName = lastName || rest.join(' ') || '';

  const clinicId = raw.clinic_id || raw.clinicId || '';
  const orgId = raw.organization_id || raw.orgId || '';
  const assignedTo = raw.assigned_to || raw.assignedAgentId || raw.assigned_user_id || '';
  const treatment = raw.treatment_interest || raw.treatment || 'General Dentistry';

  return {
    id,
    _id: id,
    first_name: finalFirstName,
    last_name: finalLastName,
    patientName: computedPatientName,
    name: computedPatientName,
    email: raw.email || '',
    phone: raw.phone || raw.phoneNumber || '',
    source: (raw.source || 'other').toLowerCase(),
    status: (raw.status || 'new').toLowerCase(),
    notes: raw.notes || '',
    treatment_interest: treatment,
    treatment: treatment,
    expected_revenue: Number(raw.expected_revenue ?? raw.expectedRevenue ?? 1),
    expectedRevenue: Number(raw.expected_revenue ?? raw.expectedRevenue ?? 1),
    assigned_to: assignedTo,
    assignedAgentId: assignedTo,
    assignedAgentName: raw.assignedAgentName || raw.assigned_agent_name || '',
    priority: (raw.priority || 'medium').toLowerCase(),
    clinic_id: clinicId,
    clinicId: clinicId,
    organization_id: orgId,
    orgId: orgId,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString(),
    lastActivity: raw.last_activity || raw.lastActivity || 'Lead Created',
    lastActivityDate: raw.last_activity_date || raw.lastActivityDate || raw.createdAt || new Date().toISOString(),
  };
}

function getCurrentUser() {
  try {
    const raw =
      localStorage.getItem('dental_crm_current_user') ||
      localStorage.getItem('dental_current_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Public Leads Service Object
 */
export const leadsService = {
  /**
   * GET /api/v1/leads/
   * Fetches real leads directly from backend API with optional filtering.
   * Real backend data is cached locally; mock leads are strictly prohibited.
   */
  async fetchLeads(params = {}) {
    try {
      const queryParams = { page: params.page || 1, limit: params.limit || 100 };
      if (params.clinic_id && params.clinic_id !== 'all' && !params.clinic_id.startsWith('clinic-')) {
        queryParams.clinic_id = params.clinic_id;
      }
      if (params.organization_id && params.organization_id !== 'all' && params.organization_id !== 'org-001') {
        queryParams.organization_id = params.organization_id;
      }
      if (params.status && params.status !== 'all') {
        queryParams.status = params.status;
      }

      let rawData = [];

      // If a specific organization_id is requested, fetch directly for that org
      if (queryParams.organization_id) {
        const response = await apiClient.get('/api/v1/leads/', { params: queryParams });
        if (Array.isArray(response.data)) {
          rawData = response.data;
        } else if (Array.isArray(response.data?.data)) {
          rawData = response.data.data;
        } else if (Array.isArray(response.data?.items)) {
          rawData = response.data.items;
        }
      } else {
        // Multi-org or global fetch:
        // When organization_id is omitted, FastAPI scopes the query by current_user.organization_id.
        // For Super Admin (or global multi-tenant views), this excludes leads from other organizations
        // (such as Aga Khan Health Services). We fetch all organizations and query them in parallel.
        const user = getCurrentUser();
        const isSuperAdmin = !user || !user.role || user.role === 'super_admin';

        if (isSuperAdmin) {
          try {
            const orgsRes = await apiClient.get('/api/v1/organizations/');
            let orgs = [];
            if (Array.isArray(orgsRes.data)) {
              orgs = orgsRes.data;
            } else if (Array.isArray(orgsRes.data?.data)) {
              orgs = orgsRes.data.data;
            } else if (Array.isArray(orgsRes.data?.items)) {
              orgs = orgsRes.data.items;
            }

            const validOrgs = orgs.filter((o) => o?.id && !String(o.id).startsWith('org-00'));
            if (validOrgs.length > 0) {
              const orgLeadsArrays = await Promise.all(
                validOrgs.map(async (org) => {
                  try {
                    const orgParams = { ...queryParams, organization_id: org.id };
                    const resp = await apiClient.get('/api/v1/leads/', { params: orgParams });
                    if (Array.isArray(resp.data)) return resp.data;
                    if (Array.isArray(resp.data?.data)) return resp.data.data;
                    if (Array.isArray(resp.data?.items)) return resp.data.items;
                    return [];
                  } catch (e) {
                    console.warn(`[leadsService] Failed to fetch leads for org ${org.id}:`, e.message);
                    return [];
                  }
                })
              );
              rawData = orgLeadsArrays.flat();
            } else {
              const response = await apiClient.get('/api/v1/leads/', { params: queryParams });
              if (Array.isArray(response.data)) {
                rawData = response.data;
              } else if (Array.isArray(response.data?.data)) {
                rawData = response.data.data;
              } else if (Array.isArray(response.data?.items)) {
                rawData = response.data.items;
              }
            }
          } catch (orgErr) {
            console.warn('[leadsService] Multi-org fetch failed, falling back to direct request:', orgErr.message);
            const response = await apiClient.get('/api/v1/leads/', { params: queryParams });
            if (Array.isArray(response.data)) {
              rawData = response.data;
            } else if (Array.isArray(response.data?.data)) {
              rawData = response.data.data;
            } else if (Array.isArray(response.data?.items)) {
              rawData = response.data.items;
            }
          }
        } else {
          // Regular scoped user (org_admin, clinic_manager, etc.)
          const response = await apiClient.get('/api/v1/leads/', { params: queryParams });
          if (Array.isArray(response.data)) {
            rawData = response.data;
          } else if (Array.isArray(response.data?.data)) {
            rawData = response.data.data;
          } else if (Array.isArray(response.data?.items)) {
            rawData = response.data.items;
          }
        }
      }

      // Deduplicate leads by id
      const seen = new Set();
      const uniqueRaw = [];
      for (const item of rawData) {
        if (item?.id) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            uniqueRaw.push(item);
          }
        } else if (item) {
          uniqueRaw.push(item);
        }
      }

      const normalized = uniqueRaw.map(normalizeLead).filter(Boolean);
      storageService.set(LEADS_KEY, normalized);
      return createSuccess(normalized, 'Leads fetched successfully from backend.');
    } catch (err) {
      console.warn('[leadsService.fetchLeads] API error, falling back to cache:', err.message);
      const cached = (storageService.get(LEADS_KEY) || []).map(normalizeLead).filter(Boolean);
      return createSuccess(cached, 'Leads loaded from cache.');
    }
  },

  /**
   * POST /api/v1/leads/
   * Creates a new lead with the exact backend schema.
   */
  async createLead(leadData, currentUser = null) {
    assertCanMutate('leads', 'create', currentUser);

    let firstName = (leadData.first_name || '').trim();
    let lastName = (leadData.last_name || '').trim();
    if (!firstName && leadData.patientName) {
      const parts = leadData.patientName.trim().split(/\s+/);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }
    if (!firstName && leadData.name) {
      const parts = leadData.name.trim().split(/\s+/);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }

    const apiPayload = {
      first_name: firstName,
      last_name: lastName,
      email: (leadData.email || '').trim() || null,
      phone: (leadData.phone || '').trim(),
      source: (leadData.source || 'other').toLowerCase(),
      status: (leadData.status || 'new').toLowerCase(),
      notes: (leadData.notes || '').trim() || null,
      treatment_interest: (leadData.treatment_interest || leadData.treatment || '').trim() || null,
      expected_revenue: Number(leadData.expected_revenue ?? leadData.expectedRevenue ?? 1),
      assigned_to: leadData.assigned_to || leadData.assignedAgentId || null,
      priority: (leadData.priority || 'medium').toLowerCase(),
      clinic_id: leadData.clinic_id || leadData.clinicId || null,
      organization_id: leadData.organization_id || leadData.orgId || null,
    };

    try {
      const response = await apiClient.post('/api/v1/leads/', apiPayload);
      const created = normalizeLead(response.data || apiPayload);
      const existing = (storageService.get(LEADS_KEY) || []).map(normalizeLead);
      storageService.set(LEADS_KEY, [created, ...existing.filter((l) => l.id !== created.id)]);
      return createSuccess(created, 'Lead created successfully.');
    } catch (apiErr) {
      console.warn('[leadsService.createLead] API post failed, falling back to local storage:', apiErr.message);
      const fallback = normalizeLead({
        ...apiPayload,
        id: `lead-${Date.now().toString(36)}`,
        assignedAgentName: leadData.assignedAgentName || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_activity: 'Lead Created',
        last_activity_date: new Date().toISOString(),
      });
      const existing = (storageService.get(LEADS_KEY) || []).map(normalizeLead);
      storageService.set(LEADS_KEY, [fallback, ...existing]);
      return createSuccess(fallback, 'Lead created successfully (offline mode).');
    }
  },

  /**
   * Fast synchronous accessor for cached leads
   */
  getLeadsSync() {
    const raw = storageService.get(LEADS_KEY) || [];
    return raw.map(normalizeLead).filter(Boolean);
  },

  /**
   * GET /api/v1/leads/{lead_id}
   * Fetches single lead from API with local cache fallback
   */
  async fetchLeadById(leadId) {
    if (!leadId) return createError('Lead ID is required.');
    try {
      const response = await apiClient.get(`/api/v1/leads/${leadId}`);
      if (response.data) {
        const normalized = normalizeLead(response.data);
        const existing = (storageService.get(LEADS_KEY) || []).map(normalizeLead);
        const updatedList = existing.some((l) => String(l.id) === String(leadId))
          ? existing.map((l) => (String(l.id) === String(leadId) ? normalized : l))
          : [normalized, ...existing];
        storageService.set(LEADS_KEY, updatedList);
        return createSuccess(normalized, 'Lead fetched successfully.');
      }
      return createSuccess(this.getLeadById(leadId));
    } catch (err) {
      console.warn(`[leadsService.fetchLeadById] API error for ${leadId}, fallback to local cache:`, err.message);
      const local = this.getLeadById(leadId);
      if (local) {
        return createSuccess(local, 'Lead loaded from local cache.');
      }
      return createError('Lead not found.', err);
    }
  },

  /**
   * PUT /api/v1/leads/{lead_id}
   * Updates lead with exact payload schema:
   * {
   *   "first_name": "",
   *   "last_name": "",
   *   "email": "",
   *   "phone": "",
   *   "source": "website",
   *   "status": "new",
   *   "notes": "",
   *   "treatment_interest": "",
   *   "expected_revenue": 1,
   *   "assigned_to": "",
   *   "priority": "",
   *   "clinic_id": ""
   * }
   */
  async updateLead(leadId, leadData, currentUser = null) {
    assertCanMutate('leads', 'edit', currentUser);

    let firstName = (leadData.first_name || '').trim();
    let lastName = (leadData.last_name || '').trim();
    if (!firstName && leadData.patientName) {
      const parts = leadData.patientName.trim().split(/\s+/);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }
    if (!firstName && leadData.name) {
      const parts = leadData.name.trim().split(/\s+/);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }

    const apiPayload = {
      first_name: firstName || undefined,
      last_name: lastName || undefined,
      email: (leadData.email || '').trim() || null,
      phone: (leadData.phone || leadData.phoneNumber || '').trim() || undefined,
      source: leadData.source ? String(leadData.source).toLowerCase() : undefined,
      status: leadData.status ? String(leadData.status).toLowerCase() : undefined,
      notes: (leadData.notes || '').trim() || null,
      treatment_interest: (leadData.treatment_interest || leadData.treatment || '').trim() || null,
      expected_revenue: Number(leadData.expected_revenue ?? leadData.expectedRevenue ?? 1),
      assigned_to: leadData.assigned_to || leadData.assignedAgentId || null,
      priority: leadData.priority ? String(leadData.priority).toLowerCase() : undefined,
      clinic_id: leadData.clinic_id || leadData.clinicId || null,
    };

    try {
      const response = await apiClient.put(`/api/v1/leads/${leadId}`, apiPayload);
      const updated = normalizeLead(response.data || { ...apiPayload, id: leadId });
      const existing = (storageService.get(LEADS_KEY) || []).map(normalizeLead);
      const updatedList = existing.map((l) => (String(l.id) === String(leadId) ? { ...l, ...updated } : l));
      storageService.set(LEADS_KEY, updatedList);
      return createSuccess(updated, 'Lead updated successfully.');
    } catch (apiErr) {
      console.warn('[leadsService.updateLead] API put failed, saving to local fallback:', apiErr.message);
      const existing = (storageService.get(LEADS_KEY) || []).map(normalizeLead);
      const current = existing.find((l) => String(l.id) === String(leadId)) || {};
      const fallback = normalizeLead({
        ...current,
        ...apiPayload,
        id: leadId,
        patientName: [apiPayload.first_name, apiPayload.last_name].filter(Boolean).join(' ') || current.patientName || 'Anonymous Lead',
        updated_at: new Date().toISOString(),
      });
      const updatedList = existing.map((l) => (String(l.id) === String(leadId) ? fallback : l));
      storageService.set(LEADS_KEY, updatedList);
      return createSuccess(fallback, 'Lead updated successfully (offline mode).');
    }
  },

  /**
   * Returns a lead by ID
   */
  getLeadById(id) {
    const leads = this.getLeadsSync();
    return leads.find((l) => String(l.id) === String(id)) || null;
  },

  /**
   * Updates lead status
   */
  updateLeadStatus(leadId, newStatus, currentUser = null) {
    assertCanMutate('leads', 'edit', currentUser);
    const leads = this.getLeadsSync();
    const current = leads.find((l) => String(l.id) === String(leadId));
    const updated = leads.map((l) =>
      String(l.id) === String(leadId)
        ? { ...l, status: newStatus, updatedAt: new Date().toISOString() }
        : l
    );
    storageService.set(LEADS_KEY, updated);

    // Background sync via PUT /api/v1/leads/{lead_id}
    if (current) {
      this.updateLead(leadId, { ...current, status: newStatus }, currentUser).catch((e) =>
        console.warn('[leadsService.updateLeadStatus] Background API sync failed:', e.message)
      );
    }
    return updated.find((l) => String(l.id) === String(leadId));
  },

  /**
   * POST /api/v1/leads/{lead_id}/assign?user_id={user_id}
   * Assigns a lead to a user/agent.
   */
  async assignLead(leadId, userId) {
    if (!leadId) return createError('Lead ID is required.');
    if (!userId) return createError('User ID is required.');
    try {
      const response = await apiClient.post(
        `/api/v1/leads/${leadId}/assign`,
        { user_id: userId },
        { params: { user_id: userId } }
      );
      const existing = (storageService.get(LEADS_KEY) || []).map(normalizeLead);
      const updatedList = existing.map((l) =>
        String(l.id) === String(leadId)
          ? { ...l, assigned_to: userId, assignedAgentId: userId }
          : l
      );
      storageService.set(LEADS_KEY, updatedList);
      return createSuccess(response.data?.data || response.data, response.data?.message || 'Lead assigned successfully.');
    } catch (err) {
      console.error(`[leadsService.assignLead] API call failed for lead ${leadId}:`, err);
      const message = err.response?.data?.error?.message || err.response?.data?.detail || err.message || 'Failed to assign lead.';
      return createError(message, err);
    }
  },

  /**
   * Deletes a lead
   */
  deleteLead(leadId) {
    assertCanMutate('leads', 'delete');
    const leads = this.getLeadsSync();
    const filtered = leads.filter((l) => l.id !== leadId);
    storageService.set(LEADS_KEY, filtered);
    return true;
  },
};

// ─── Backward Compatible Export Functions ───────────────────

/**
 * Returns leads assigned to a specific agent with pagination, filter, search, sort
 */
export function getAssignedLeads(agentId, options = {}) {
  const {
    page = 1,
    pageSize = 8,
    search = '',
    status = '',
    priority = '',
    sortKey = 'lastActivityDate',
    sortDir = 'desc',
  } = options;

  const allLeads = leadsService.getLeadsSync();
  let leads = allLeads.filter(
    (l) => l.assigned_to === agentId || l.assignedAgentId === agentId
  );

  if (search) {
    const q = normalise(search);
    leads = leads.filter(
      (l) =>
        normalise(l.patientName).includes(q) ||
        normalise(l.first_name).includes(q) ||
        normalise(l.last_name).includes(q) ||
        normalise(l.treatment).includes(q) ||
        normalise(l.treatment_interest).includes(q) ||
        normalise(l.email).includes(q)
    );
  }

  if (status) {
    leads = leads.filter((l) => l.status === status);
  }

  if (priority) {
    leads = leads.filter((l) => l.priority === priority);
  }

  leads = leads.sort((a, b) => {
    let aVal = a[sortKey] ?? '';
    let bVal = b[sortKey] ?? '';

    if (sortKey === 'status') {
      aVal = STATUS_ORDER.indexOf(a.status);
      bVal = STATUS_ORDER.indexOf(b.status);
    }

    if (typeof aVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const total = leads.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const data = leads.slice((safePage - 1) * pageSize, safePage * pageSize);

  return { data, total, page: safePage, totalPages };
}

/**
 * Returns a single lead by ID
 */
export function getLeadById(id) {
  return leadsService.getLeadById(id);
}

/**
 * Returns all unpaginated leads assigned to a specific agent
 */
export function getAllAssignedLeads(agentId) {
  if (!agentId) return [];
  const allLeads = leadsService.getLeadsSync();
  return allLeads.filter(
    (l) =>
      l.assigned_to === agentId ||
      l.assignedAgentId === agentId ||
      l.assigned_user_id === agentId ||
      l.responsible_agent === agentId
  );
}

/**
 * Returns aggregated KPI numbers for the agent dashboard
 */
export function getLeadKPIs(agentId) {
  const leads = getAllAssignedLeads(agentId);
  const totalLeads = leads.length;
  const convertedLeads = leads.filter((l) => l.status === 'converted' || l.status === 'won').length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  return {
    assignedLeads: totalLeads,
    newLeads: leads.filter((l) => l.status === 'new').length,
    contactedLeads: leads.filter((l) => l.status === 'contacted').length,
    qualifiedLeads: leads.filter((l) => l.status === 'qualified').length,
    convertedLeads,
    lostLeads: leads.filter((l) => l.status === 'lost').length,
    conversionRate,
  };
}

/**
 * Updates a lead's status
 */
export function updateLeadStatus(leadId, newStatus) {
  return leadsService.updateLeadStatus(leadId, newStatus);
}

/**
 * Sanitizes lead object for receptionist basic contact view only
 */
export function sanitizeLeadForReceptionist(lead) {
  if (!lead) return null;
  return {
    id: lead.id,
    patientName: lead.patientName || lead.name || 'Anonymous Patient',
    first_name: lead.first_name || '',
    last_name: lead.last_name || '',
    phone: lead.phone || lead.phoneNumber || '(555) 123-4567',
    email: lead.email || 'N/A',
    status: lead.status || 'new',
    clinicId: lead.clinicId || lead.clinic_id || 'Downtown Dental',
    clinic_id: lead.clinic_id || lead.clinicId || 'Downtown Dental',
    createdAt: lead.createdAt || new Date().toISOString(),
    preferredBranch: lead.preferredBranch || lead.clinicId || lead.clinic_id || 'Main Clinic',
    isBasicView: true,
  };
}

/**
 * Returns a lead by ID after validating user scope and role access level
 */
export function getLeadByIdScoped(id, currentUser, selectedClinicId) {
  const allLeads = leadsService.getLeadsSync();
  const scopedLeads = scopeData({ resource: 'leads', data: allLeads, currentUser, selectedClinicId });
  const lead = scopedLeads.find((l) => String(l.id) === String(id));

  if (!lead) return null;

  if (currentUser?.role === 'receptionist') {
    return sanitizeLeadForReceptionist(lead);
  }

  return lead;
}

/**
 * Creates a new lead (asynchronous API call with fallback)
 */
export async function createLead(leadData, currentUser = null) {
  const res = await leadsService.createLead(leadData, currentUser);
  return res.data || res;
}

/**
 * Synchronous lead creator for legacy calls
 */
export function createLeadSync(leadData, currentUser = null) {
  assertCanMutate('leads', 'create', currentUser);
  let firstName = (leadData.first_name || '').trim();
  let lastName = (leadData.last_name || '').trim();
  if (!firstName && leadData.patientName) {
    const parts = leadData.patientName.trim().split(/\s+/);
    firstName = parts[0] || '';
    lastName = parts.slice(1).join(' ') || '';
  }

  const fallback = normalizeLead({
    ...leadData,
    id: `lead-${Date.now().toString(36)}`,
    first_name: firstName,
    last_name: lastName,
    patientName: [firstName, lastName].filter(Boolean).join(' ') || leadData.patientName || 'Anonymous Patient',
    expected_revenue: Number(leadData.expected_revenue ?? leadData.expectedRevenue ?? 1),
    treatment_interest: leadData.treatment_interest || leadData.treatment || 'General Dentistry',
    clinic_id: leadData.clinic_id || leadData.clinicId || 'clinic-downtown',
    organization_id: leadData.organization_id || leadData.orgId || '',
    assigned_to: leadData.assigned_to || leadData.assignedAgentId || currentUser?.id || '',
    createdAt: new Date().toISOString(),
  });

  const existing = (storageService.get(LEADS_KEY) || []).map(normalizeLead);
  storageService.set(LEADS_KEY, [fallback, ...existing]);
  return fallback;
}

/**
 * Fetches single lead from API (GET /api/v1/leads/{lead_id})
 */
export async function fetchLeadById(leadId) {
  const res = await leadsService.fetchLeadById(leadId);
  return res.data || res;
}

/**
 * Updates an existing lead via PUT /api/v1/leads/{lead_id}
 */
export async function updateLead(leadId, leadData, currentUser = null) {
  const res = await leadsService.updateLead(leadId, leadData, currentUser);
  return res.data || res;
}

/**
 * Deletes a lead by ID
 */
export function deleteLead(leadId) {
  return leadsService.deleteLead(leadId);
}

/**
 * Assigns a lead via POST /api/v1/leads/{lead_id}/assign?user_id={user_id}
 */
export async function assignLead(leadId, userId) {
  const res = await leadsService.assignLead(leadId, userId);
  return res.data || res;
}

export default leadsService;
