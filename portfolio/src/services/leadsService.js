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
import { getAgentDisplayName } from './usersService';
import { isSameClinic } from '@/constants/clinics';

export { LEAD_SOURCES, LEAD_STATUSES, LEAD_PRIORITIES };

const LEADS_KEY = storageService.KEYS.LEADS;

const STATUS_ORDER = ['new', 'contacted', 'qualified', 'proposal', 'converted', 'lost'];
const normalise = (str = '') => str.toLowerCase().trim();

/**
 * Normalizes lead record between backend API format and frontend UI models
 */
export function normalizeLead(raw) {
  if (!raw) return null;
  const id = raw._id || raw.id;
  if (!id) return null;

  const firstName = (raw.first_name || raw.firstName || '').trim();
  const lastName = (raw.last_name || raw.lastName || '').trim();

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

  let resolvedAgentName = raw.assignedAgentName || raw.assigned_agent_name || '';
  if (!resolvedAgentName || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedAgentName)) {
    if (assignedTo) {
      const nameFromId = getAgentDisplayName(assignedTo);
      if (nameFromId && nameFromId !== 'Assigned Staff' && nameFromId !== 'Unassigned') {
        resolvedAgentName = nameFromId;
      }
    }
  }

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
    paid_amount: Number(raw.paid_amount ?? raw.paidAmount ?? 0),
    paidAmount: Number(raw.paid_amount ?? raw.paidAmount ?? 0),
    payment_status: (raw.payment_status || raw.paymentStatus || 'pending').toLowerCase(),
    paymentStatus: (raw.payment_status || raw.paymentStatus || 'pending').toLowerCase(),
    receipt_status: (raw.receipt_status || raw.receiptStatus || 'unissued').toLowerCase(),
    receiptStatus: (raw.receipt_status || raw.receiptStatus || 'unissued').toLowerCase(),
    invoice_number: raw.invoice_number || raw.invoiceNumber || (id ? `INV-${String(id).slice(-4).toUpperCase()}` : 'INV-0001'),
    invoiceNumber: raw.invoice_number || raw.invoiceNumber || (id ? `INV-${String(id).slice(-4).toUpperCase()}` : 'INV-0001'),
    invoice_status: (raw.invoice_status || raw.invoiceStatus || 'draft').toLowerCase(),
    invoiceStatus: (raw.invoice_status || raw.invoiceStatus || 'draft').toLowerCase(),
    billing_notes: raw.billing_notes || raw.billingNotes || '',
    billingNotes: raw.billing_notes || raw.billingNotes || '',
    assigned_to: assignedTo,
    assignedAgentId: assignedTo,
    assignedAgentName: resolvedAgentName,
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

function checkLeadClinicAccess(lead, user) {
  if (!user || !lead) return true;
  const role = (user.role || '').toLowerCase();
  if (role !== 'clinic_manager' && role !== 'receptionist') return true;

  const userAssignedClinics = [
    ...(Array.isArray(user.assigned_clinics) ? user.assigned_clinics : []),
    ...(Array.isArray(user.assignedClinics) ? user.assignedClinics : []),
    ...(Array.isArray(user.clinicIds) ? user.clinicIds : []),
    ...(user.clinicId ? [user.clinicId] : []),
    ...(user.clinic_id ? [user.clinic_id] : []),
  ].filter(Boolean);

  if (userAssignedClinics.length === 0) return true;

  const leadClinic = lead.clinic_id || lead.clinicId;
  if (!leadClinic) return true;

  return userAssignedClinics.some(
    (cId) => leadClinic === cId || isSameClinic(leadClinic, cId)
  );
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
  async fetchLeads(params = {}, currentUser = null) {
    try {
      const user = currentUser || getCurrentUser();
      const role = (user?.role || '').toLowerCase();
      const isSuperAdmin = role === 'super_admin';

      const userAssignedClinics = [
        ...(Array.isArray(user?.assigned_clinics) ? user.assigned_clinics : []),
        ...(Array.isArray(user?.assignedClinics) ? user.assignedClinics : []),
        ...(Array.isArray(user?.clinicIds) ? user.clinicIds : []),
        ...(user?.clinicId ? [user.clinicId] : []),
        ...(user?.clinic_id ? [user.clinic_id] : []),
      ].filter(Boolean);

      const queryParams = { page: params.page || 1, limit: params.limit || 100 };
      if (params.clinic_id && params.clinic_id !== 'all' && !params.clinic_id.startsWith('clinic-')) {
        queryParams.clinic_id = params.clinic_id;
      } else if ((role === 'clinic_manager' || role === 'receptionist') && userAssignedClinics[0]) {
        queryParams.clinic_id = userAssignedClinics[0];
      }

      if (params.organization_id && params.organization_id !== 'all' && params.organization_id !== 'org-001') {
        queryParams.organization_id = params.organization_id;
      } else if (!isSuperAdmin && (user?.organization_id || user?.organizationId)) {
        queryParams.organization_id = user.organization_id || user.organizationId;
      }

      if (params.status && params.status !== 'all') {
        queryParams.status = params.status;
      }

      let rawData = [];

      // If a specific organization_id or clinic_id is requested (or user is scoped), fetch directly
      if (queryParams.organization_id || queryParams.clinic_id || !isSuperAdmin) {
        const response = await apiClient.get('/api/v1/leads/', { params: queryParams });
        if (Array.isArray(response.data)) {
          rawData = response.data;
        } else if (Array.isArray(response.data?.data)) {
          rawData = response.data.data;
        } else if (Array.isArray(response.data?.items)) {
          rawData = response.data.items;
        }
      } else {
        // Multi-org global fetch for super_admin
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
          }
        } catch (orgErr) {
          console.warn('[leadsService] Multi-org fetch failed, falling back to direct request:', orgErr.message);
        }

        // Direct fetch fallback or supplemental fetch
        try {
          const response = await apiClient.get('/api/v1/leads/', { params: queryParams });
          let direct = [];
          if (Array.isArray(response.data)) direct = response.data;
          else if (Array.isArray(response.data?.data)) direct = response.data.data;
          else if (Array.isArray(response.data?.items)) direct = response.data.items;
          rawData = [...rawData, ...direct];
        } catch (directErr) {
          console.warn('[leadsService] Direct leads fetch notice:', directErr.message);
        }
      }

      // Deduplicate leads by id
      const seen = new Set();
      const uniqueRaw = [];
      for (const item of rawData) {
        const id = item?.id || item?._id;
        if (id) {
          if (!seen.has(id)) {
            seen.add(id);
            uniqueRaw.push(item);
          }
        } else if (item) {
          uniqueRaw.push(item);
        }
      }

      // Preserve any newly created leads in storage that haven't synced yet
      const stored = (storageService.get(LEADS_KEY) || []).map(normalizeLead).filter(Boolean);
      for (const item of stored) {
        const id = item?.id || item?._id;
        if (id && !seen.has(id)) {
          seen.add(id);
          uniqueRaw.push(item);
        }
      }

      let finalRaw = uniqueRaw;
      if (role === 'clinic_manager' || role === 'receptionist') {
        if (userAssignedClinics.length > 0) {
          finalRaw = uniqueRaw.filter((lead) => {
            const lClinic = lead.clinic_id || lead.clinicId;
            return userAssignedClinics.some((cId) => lClinic === cId || isSameClinic(lClinic, cId));
          });
        }
      } else if (role === 'agent') {
        finalRaw = uniqueRaw.filter((lead) => {
          const assigned = lead.assigned_to || lead.assignedAgentId || lead.assigned_user_id || lead.assignedTo;
          return assigned && user?.id && String(assigned) === String(user.id);
        });
      }

      const normalized = finalRaw.map(normalizeLead).filter(Boolean);
      storageService.set(LEADS_KEY, normalized);
      return createSuccess(normalized, 'Leads fetched successfully from backend.');
    } catch (err) {
      console.warn('[leadsService.fetchLeads] API error, falling back to cache:', err.message);
      let cached = (storageService.get(LEADS_KEY) || []).map(normalizeLead).filter(Boolean);
      const user = currentUser || getCurrentUser();
      const role = (user?.role || '').toLowerCase();
      if (role === 'clinic_manager' || role === 'receptionist') {
        const userAssignedClinics = [
          ...(Array.isArray(user?.assigned_clinics) ? user.assigned_clinics : []),
          ...(Array.isArray(user?.assignedClinics) ? user.assignedClinics : []),
          ...(Array.isArray(user?.clinicIds) ? user.clinicIds : []),
          ...(user?.clinicId ? [user.clinicId] : []),
          ...(user?.clinic_id ? [user.clinic_id] : []),
        ].filter(Boolean);
        if (userAssignedClinics.length > 0) {
          cached = cached.filter((lead) => {
            const lClinic = lead.clinic_id || lead.clinicId;
            return userAssignedClinics.some((cId) => lClinic === cId || isSameClinic(lClinic, cId));
          });
        }
      } else if (role === 'agent') {
        cached = cached.filter((lead) => {
          const assigned = lead.assigned_to || lead.assignedAgentId || lead.assigned_user_id || lead.assignedTo;
          return assigned && user?.id && String(assigned) === String(user.id);
        });
      }
      return createSuccess(cached, 'Leads loaded from cache.');
    }
  },

  /**
   * Synchronous accessor for local cached leads
   */
  getLeadsSync(currentUser = null) {
    try {
      const cached = storageService.get(storageService.KEYS.LEADS) || [];
      return (Array.isArray(cached) ? cached : []).map((l) => normalizeLead(l));
    } catch {
      return [];
    }
  },

  /**
   * Alias for getLeadsSync
   */
  getLeads(currentUser = null) {
    return this.getLeadsSync(currentUser);
  },

  /**
   * POST /api/v1/leads/
   * Creates a new lead with the exact backend schema.
   */
  async createLead(leadData, currentUser = null) {
    assertCanMutate('leads', 'create', currentUser);

    const user = currentUser || getCurrentUser();
    const role = (user?.role || '').toLowerCase();
    if (role === 'clinic_manager' || role === 'receptionist') {
      const userAssignedClinics = [
        ...(Array.isArray(user?.assigned_clinics) ? user.assigned_clinics : []),
        ...(Array.isArray(user?.assignedClinics) ? user.assignedClinics : []),
        ...(Array.isArray(user?.clinicIds) ? user.clinicIds : []),
        ...(user?.clinicId ? [user.clinicId] : []),
        ...(user?.clinic_id ? [user.clinic_id] : []),
      ].filter(Boolean);

      const targetClinic = leadData.clinic_id || leadData.clinicId;
      if (userAssignedClinics.length > 0 && targetClinic) {
        const matches = userAssignedClinics.some(
          (cId) => targetClinic === cId || isSameClinic(targetClinic, cId)
        );
        if (!matches) {
          throw new Error('Access Denied: You can only create leads for your assigned clinic(s).');
        }
      } else if (userAssignedClinics.length > 0 && !targetClinic) {
        leadData.clinic_id = userAssignedClinics[0];
      }
    } else if (role === 'agent') {
      const userAssignedClinics = [
        ...(Array.isArray(user?.assigned_clinics) ? user.assigned_clinics : []),
        ...(Array.isArray(user?.assignedClinics) ? user.assignedClinics : []),
        ...(Array.isArray(user?.clinicIds) ? user.clinicIds : []),
        ...(user?.clinicId ? [user.clinicId] : []),
        ...(user?.clinic_id ? [user.clinic_id] : []),
      ].filter(Boolean);

      const targetClinic = leadData.clinic_id || leadData.clinicId;
      if (userAssignedClinics.length > 0 && targetClinic) {
        const matches = userAssignedClinics.some(
          (cId) => targetClinic === cId || isSameClinic(targetClinic, cId)
        );
        if (!matches) {
          throw new Error('Access Denied: Agents can only create leads for their assigned clinic(s).');
        }
      } else if (userAssignedClinics.length > 0 && !targetClinic) {
        leadData.clinic_id = userAssignedClinics[0];
      }

      // Auto-assigned to self
      leadData.assigned_to = user?.id;
      leadData.assignedAgentName = user?.fullName || user?.name || user?.email || 'Agent';
    }

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
      assigned_to: role === 'agent' ? (user?.id || null) : (leadData.assigned_to || leadData.assignedAgentId || null),
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
  /**
   * PUT /api/v1/leads/{lead_id}
   * Full update of a lead matching LeadUpdate schema
   */
  async updateLead(leadId, leadData, currentUser = null) {
    assertCanMutate('leads', 'edit', currentUser);

    const user = currentUser || getCurrentUser();
    const role = (user?.role || '').toLowerCase();
    const existingLead = this.getLeadById(leadId);
    if (existingLead && !checkLeadClinicAccess(existingLead, user)) {
      throw new Error('Access Denied: You can only update leads for your assigned clinic(s).');
    }

    if (role === 'finance') {
      throw new Error('Access Denied: Finance role cannot edit general customer information. Use billing updates.');
    }

    if (role === 'agent') {
      const assigned = existingLead?.assigned_to || existingLead?.assignedAgentId || existingLead?.assigned_user_id || existingLead?.assignedTo;
      if (assigned && user?.id && String(assigned) !== String(user.id)) {
        throw new Error('Access Denied: Agents can only update leads assigned to them.');
      }
      if (String(leadData.status || '').toLowerCase() === 'won') {
        throw new Error('Access Denied: Agents are not authorized to mark lead status as WON.');
      }
    }

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

    const cleanEmail = (leadData.email || '').trim();
    const cleanPhone = (leadData.phone || leadData.phoneNumber || '').trim();
    const cleanAssignedTo = (leadData.assigned_to || leadData.assignedAgentId || '').trim();
    const cleanClinicId = (leadData.clinic_id || leadData.clinicId || '').trim();

    const apiPayload = {
      first_name: firstName || '',
      last_name: lastName || '',
      email: cleanEmail ? cleanEmail : null,
      phone: cleanPhone ? cleanPhone : null,
      source: (leadData.source || 'website').toLowerCase(),
      status: (leadData.status || 'new').toLowerCase(),
      notes: leadData.notes || '',
      treatment_interest: leadData.treatment_interest || leadData.treatment || '',
      expected_revenue: Number(leadData.expected_revenue ?? leadData.expectedRevenue ?? 1),
      assigned_to: cleanAssignedTo ? cleanAssignedTo : null,
      priority: (leadData.priority || 'medium').toLowerCase(),
      clinic_id: cleanClinicId ? cleanClinicId : null,
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
   * PATCH /api/v1/leads/{lead_id}
   * Partial update of a lead matching LeadUpdate schema
   */
  async patchLead(leadId, patchData, currentUser = null) {
    assertCanMutate('leads', 'edit', currentUser);

    const user = currentUser || getCurrentUser();
    const role = (user?.role || '').toLowerCase();
    const existingLead = this.getLeadById(leadId);
    if (existingLead && !checkLeadClinicAccess(existingLead, user)) {
      throw new Error('Access Denied: You can only update leads for your assigned clinic(s).');
    }

    if (role === 'finance') {
      const generalFields = ['first_name', 'last_name', 'email', 'phone', 'source', 'status', 'notes', 'treatment_interest', 'assigned_to', 'clinic_id', 'priority'];
      const attemptedGeneral = Object.keys(patchData).filter((k) => generalFields.includes(k));
      if (attemptedGeneral.length > 0) {
        throw new Error('Access Denied: Finance role cannot edit general customer information. Use billing updates.');
      }
    }

    if (role === 'agent') {
      const assigned = existingLead?.assigned_to || existingLead?.assignedAgentId || existingLead?.assigned_user_id || existingLead?.assignedTo;
      if (assigned && user?.id && String(assigned) !== String(user.id)) {
        throw new Error('Access Denied: Agents can only update leads assigned to them.');
      }
      if (String(patchData.status || '').toLowerCase() === 'won') {
        throw new Error('Access Denied: Agents are not authorized to mark lead status as WON.');
      }
    }

    const apiPayload = {};
    if (patchData.first_name !== undefined) apiPayload.first_name = (patchData.first_name || '').trim();
    if (patchData.last_name !== undefined) apiPayload.last_name = (patchData.last_name || '').trim();
    if (patchData.email !== undefined) {
      const email = (patchData.email || '').trim();
      apiPayload.email = email ? email : null;
    }
    if (patchData.phone !== undefined) {
      const phone = (patchData.phone || '').trim();
      apiPayload.phone = phone ? phone : null;
    }
    if (patchData.source !== undefined) apiPayload.source = (patchData.source || 'website').toLowerCase();
    if (patchData.status !== undefined) apiPayload.status = (patchData.status || 'new').toLowerCase();
    if (patchData.notes !== undefined) apiPayload.notes = patchData.notes || '';
    if (patchData.treatment_interest !== undefined) apiPayload.treatment_interest = patchData.treatment_interest || '';
    if (patchData.expected_revenue !== undefined) apiPayload.expected_revenue = Number(patchData.expected_revenue) || 1;
    if (patchData.assigned_to !== undefined) {
      const assigned = (patchData.assigned_to || '').trim();
      apiPayload.assigned_to = assigned ? assigned : null;
    }
    if (patchData.priority !== undefined) apiPayload.priority = (patchData.priority || 'medium').toLowerCase();
    if (patchData.clinic_id !== undefined) {
      const clinic = (patchData.clinic_id || '').trim();
      apiPayload.clinic_id = clinic ? clinic : null;
    }
    if (patchData.paid_amount !== undefined) apiPayload.paid_amount = Number(patchData.paid_amount) || 0;
    if (patchData.paidAmount !== undefined) apiPayload.paid_amount = Number(patchData.paidAmount) || 0;
    if (patchData.payment_status !== undefined) apiPayload.payment_status = patchData.payment_status;
    if (patchData.paymentStatus !== undefined) apiPayload.payment_status = patchData.paymentStatus;
    if (patchData.receipt_status !== undefined) apiPayload.receipt_status = patchData.receipt_status;
    if (patchData.receiptStatus !== undefined) apiPayload.receipt_status = patchData.receiptStatus;
    if (patchData.invoice_number !== undefined) apiPayload.invoice_number = patchData.invoice_number;
    if (patchData.invoiceNumber !== undefined) apiPayload.invoice_number = patchData.invoiceNumber;
    if (patchData.invoice_status !== undefined) apiPayload.invoice_status = patchData.invoice_status;
    if (patchData.invoiceStatus !== undefined) apiPayload.invoice_status = patchData.invoiceStatus;
    if (patchData.billing_notes !== undefined) apiPayload.billing_notes = patchData.billing_notes;
    if (patchData.billingNotes !== undefined) apiPayload.billing_notes = patchData.billingNotes;

    try {
      const response = await apiClient.patch(`/api/v1/leads/${leadId}`, apiPayload);
      const updated = normalizeLead(response.data || { ...apiPayload, ...patchData, id: leadId });
      const existing = (storageService.get(LEADS_KEY) || []).map(normalizeLead);
      const updatedList = existing.map((l) => (String(l.id) === String(leadId) ? { ...l, ...updated } : l));
      storageService.set(LEADS_KEY, updatedList);
      return createSuccess(updated, 'Lead updated successfully via PATCH.');
    } catch (apiErr) {
      console.warn('[leadsService.patchLead] API patch failed, saving to local fallback:', apiErr.message);
      const existing = (storageService.get(LEADS_KEY) || []).map(normalizeLead);
      const current = existing.find((l) => String(l.id) === String(leadId)) || {};
      const fallback = normalizeLead({
        ...current,
        ...apiPayload,
        ...patchData,
        id: leadId,
        updated_at: new Date().toISOString(),
      });
      const updatedList = existing.map((l) => (String(l.id) === String(leadId) ? fallback : l));
      storageService.set(LEADS_KEY, updatedList);
      return createSuccess(fallback, 'Lead updated successfully (offline mode).');
    }
  },

  /**
   * Updates billing, invoice, and payment receipt status on a lead
   * Authorized for: finance, org_admin, super_admin
   */
  async updateLeadBilling(leadId, billingData, currentUser = null) {
    const user = currentUser || getCurrentUser();
    const role = (user?.role || '').toLowerCase();
    if (!['finance', 'org_admin', 'super_admin'].includes(role)) {
      throw new Error('Access Denied: Only Finance and Administrators can update lead billing details.');
    }

    const existingLead = this.getLeadById(leadId);
    if (!existingLead) {
      throw new Error(`Lead #${leadId} not found.`);
    }

    const paidAmount = billingData.paid_amount !== undefined ? Number(billingData.paid_amount) : Number(billingData.paidAmount ?? existingLead.paid_amount ?? 0);
    const paymentStatus = (billingData.payment_status || billingData.paymentStatus || existingLead.payment_status || 'pending').toLowerCase();
    const receiptStatus = (billingData.receipt_status || billingData.receiptStatus || existingLead.receipt_status || 'unissued').toLowerCase();
    const invoiceNumber = (billingData.invoice_number || billingData.invoiceNumber || existingLead.invoice_number || `INV-${String(leadId).slice(-4).toUpperCase()}`).trim();
    const invoiceStatus = (billingData.invoice_status || billingData.invoiceStatus || existingLead.invoice_status || 'draft').toLowerCase();
    const billingNotes = billingData.billing_notes !== undefined ? billingData.billing_notes : (billingData.billingNotes !== undefined ? billingData.billingNotes : (existingLead.billing_notes || ''));

    const updatedFields = {
      paid_amount: paidAmount,
      paidAmount: paidAmount,
      payment_status: paymentStatus,
      paymentStatus: paymentStatus,
      receipt_status: receiptStatus,
      receiptStatus: receiptStatus,
      invoice_number: invoiceNumber,
      invoiceNumber: invoiceNumber,
      invoice_status: invoiceStatus,
      invoiceStatus: invoiceStatus,
      billing_notes: billingNotes,
      billingNotes: billingNotes,
      updated_at: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      last_activity: `Billing updated by ${user?.fullName || user?.name || role}: ${paymentStatus.toUpperCase()} (${invoiceNumber})`,
      lastActivity: `Billing updated by ${user?.fullName || user?.name || role}: ${paymentStatus.toUpperCase()} (${invoiceNumber})`,
      lastActivityDate: new Date().toISOString(),
    };

    const updatedLead = {
      ...existingLead,
      ...updatedFields,
    };

    // Update leads cache
    const existing = (storageService.get(LEADS_KEY) || []).map(normalizeLead);
    const updatedList = existing.map((l) => (String(l.id) === String(leadId) ? updatedLead : l));
    storageService.set(LEADS_KEY, updatedList);

    // Sync to revenue storage
    try {
      const allRevenue = storageService.get(storageService.KEYS.REVENUE) || [];
      const revIndex = allRevenue.findIndex((r) => String(r.leadId) === String(leadId) || (r.patientName && r.patientName.toLowerCase() === (updatedLead.patientName || '').toLowerCase()));

      const revRecord = {
        id: revIndex >= 0 ? allRevenue[revIndex].id : `rev-${Date.now().toString(36)}`,
        leadId: leadId,
        patientName: updatedLead.patientName,
        treatment: updatedLead.treatment_interest || updatedLead.treatment || 'Dental Treatment',
        clinicId: updatedLead.clinic_id || updatedLead.clinicId || 'clinic-downtown',
        amount: Number(updatedLead.expected_revenue ?? updatedLead.expectedRevenue ?? 1),
        revenue: paidAmount > 0 ? paidAmount : Number(updatedLead.expected_revenue ?? 1),
        paidAmount: paidAmount,
        status: paymentStatus === 'paid' ? 'paid' : paymentStatus === 'partially_paid' || paymentStatus === 'partial' ? 'deposit received' : 'pending',
        receiptStatus: receiptStatus,
        invoiceNumber: invoiceNumber,
        invoiceStatus: invoiceStatus,
        method: revIndex >= 0 ? (allRevenue[revIndex].method || 'Credit Card') : 'Credit Card',
        date: revIndex >= 0 ? (allRevenue[revIndex].date || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString(),
      };

      if (revIndex >= 0) {
        allRevenue[revIndex] = { ...allRevenue[revIndex], ...revRecord };
      } else {
        allRevenue.unshift(revRecord);
      }
      storageService.set(storageService.KEYS.REVENUE, allRevenue);
    } catch (e) {
      console.warn('[leadsService.updateLeadBilling] Error syncing to revenue storage:', e);
    }

    // Attempt background API patch
    try {
      await apiClient.patch(`/api/v1/leads/${leadId}`, {
        paid_amount: paidAmount,
        payment_status: paymentStatus,
        receipt_status: receiptStatus,
        invoice_number: invoiceNumber,
        invoice_status: invoiceStatus,
      });
    } catch (apiErr) {
      console.warn('[leadsService.updateLeadBilling] Background API patch note:', apiErr.message);
    }

    return createSuccess(updatedLead, 'Lead billing and invoice details updated successfully.');
  },

  /**
   * Returns a lead by ID
   */
  getLeadById(id) {
    const leads = this.getLeadsSync();
    return leads.find((l) => String(l.id) === String(id)) || null;
  },

  /**
   * Updates lead status via PATCH /api/v1/leads/{lead_id}
   */
  updateLeadStatus(leadId, newStatus, currentUser = null) {
    assertCanMutate('leads', 'edit', currentUser);
    const user = currentUser || getCurrentUser();
    const role = (user?.role || '').toLowerCase();
    const leads = this.getLeadsSync();
    const current = leads.find((l) => String(l.id) === String(leadId));

    if (role === 'finance') {
      throw new Error('Access Denied: Finance role cannot change lead status. Status is managed by clinical and front-desk staff.');
    }

    if (role === 'agent') {
      const assigned = current?.assigned_to || current?.assignedAgentId || current?.assigned_user_id || current?.assignedTo;
      if (assigned && user?.id && String(assigned) !== String(user.id)) {
        throw new Error('Access Denied: Agents can only update leads assigned to them.');
      }
      if (String(newStatus || '').toLowerCase() === 'won') {
        throw new Error('Access Denied: Agents are not authorized to mark lead status as WON.');
      }
    }
    const updated = leads.map((l) =>
      String(l.id) === String(leadId)
        ? { ...l, status: newStatus, updatedAt: new Date().toISOString() }
        : l
    );
    storageService.set(LEADS_KEY, updated);

    // Background sync via PATCH /api/v1/leads/{lead_id}
    this.patchLead(leadId, { status: newStatus }, currentUser).catch((e) =>
      console.warn('[leadsService.updateLeadStatus] Background API sync failed:', e.message)
    );
    return updated.find((l) => String(l.id) === String(leadId));
  },

  /**
   * POST /api/v1/leads/{lead_id}/assign?user_id={user_id}
   * Assigns a lead to a user/agent.
   */
  async assignLead(leadId, userId, currentUser = null) {
    if (!leadId) return createError('Lead ID is required.');
    if (!userId) return createError('User ID is required.');
    const user = currentUser || getCurrentUser();
    const role = (user?.role || '').toLowerCase();
    if (role === 'agent' || role === 'finance' || role === 'auditor') {
      return createError('Access Denied: You do not have permission to assign leads.');
    }
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
   * DELETE /api/v1/leads/{lead_id}
   * Deletes a lead by ID from the backend database and only removes from local storage on success.
   */
  async deleteLead(leadId, currentUser = null) {
    assertCanMutate('leads', 'delete', currentUser);

    const user = currentUser || getCurrentUser();
    const existingLead = this.getLeadById(leadId);
    if (existingLead && !checkLeadClinicAccess(existingLead, user)) {
      throw new Error('Access Denied: You can only delete leads for your assigned clinic(s).');
    }
    try {
      const response = await apiClient.delete(`/api/v1/leads/${leadId}`);
      // Remove from local storage ONLY after backend responds with success (200 / 204)
      const leads = this.getLeadsSync();
      const filtered = leads.filter((l) => String(l.id) !== String(leadId));
      storageService.set(LEADS_KEY, filtered);
      return createSuccess(true, response?.data?.message || 'Lead deleted successfully from database.');
    } catch (apiErr) {
      console.error(`[leadsService.deleteLead] Backend DELETE /api/v1/leads/${leadId} failed:`, apiErr);
      const message =
        apiErr.response?.data?.error?.message ||
        apiErr.response?.data?.detail ||
        apiErr.response?.data?.message ||
        apiErr.message ||
        'Failed to delete lead from database.';
      throw new Error(`Database delete failed: ${message}`);
    }
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
  const role = (currentUser?.role || '').toLowerCase();

  // Finance role: Direct lead ID viewing is accessible
  if (role === 'finance') {
    return allLeads.find((l) => String(l.id) === String(id)) || null;
  }

  const scopedLeads = scopeData({ resource: 'leads', data: allLeads, currentUser, selectedClinicId });
  const lead = scopedLeads.find((l) => String(l.id) === String(id));

  if (!lead) return null;

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
 * Partially updates an existing lead via PATCH /api/v1/leads/{lead_id}
 */
export async function patchLead(leadId, patchData, currentUser = null) {
  const res = await leadsService.patchLead(leadId, patchData, currentUser);
  return res.data || res;
}

/**
 * Updates billing and invoice details on a lead via leadsService.updateLeadBilling
 */
export async function updateLeadBilling(leadId, billingData, currentUser = null) {
  const res = await leadsService.updateLeadBilling(leadId, billingData, currentUser);
  return res.data || res;
}

/**
 * Deletes a lead by ID via DELETE /api/v1/leads/{lead_id}
 */
export async function deleteLead(leadId, currentUser = null) {
  const res = await leadsService.deleteLead(leadId, currentUser);
  return res.data || res;
}

/**
 * Assigns a lead via POST /api/v1/leads/{lead_id}/assign?user_id={user_id}
 */
export async function assignLead(leadId, userId) {
  const res = await leadsService.assignLead(leadId, userId);
  return res.data || res;
}

export default leadsService;
