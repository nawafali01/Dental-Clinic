import apiClient from '../lib/api';
import { storageService } from './storage.service';
import { CLINICS } from '@/constants/clinics';
import { usersService } from './usersService';
import { assertCanMutate } from '@/dashboard/shared/config/permissions';
import { createSuccess, createError } from '../utils/response.util';

/**
 * CLINICS SERVICE
 * Handles GET /api/v1/clinics/ and POST /api/v1/clinics/
 * Payload schema:
 * {
 *   "name": "",
 *   "description": "",
 *   "contact_email": "",
 *   "contact_phone": "",
 *   "address": "",
 *   "timezone": "UTC",
 *   "working_hours": {
 *     "additionalProperty": "anything"
 *   },
 *   "organization_id": ""
 * }
 */

function normalizeClinic(c) {
  if (!c) return null;
  const workingHours = c.working_hours || {};
  const operatingHoursStr =
    typeof c.working_hours === 'string'
      ? c.working_hours
      : workingHours.additionalProperty || '08:00 AM - 08:00 PM';

  return {
    id: c.id || c._id || `clinic-${Date.now()}`,
    name: c.name || '',
    description: c.description || '',
    contact_email: c.contact_email || c.email || '',
    contact_phone: c.contact_phone || c.phone || '',
    email: c.contact_email || c.email || '',
    phone: c.contact_phone || c.phone || '',
    address: c.address || '',
    timezone: c.timezone || 'UTC',
    working_hours: c.working_hours || { additionalProperty: 'anything' },
    operatingHours: operatingHoursStr,
    organization_id: c.organization_id || c.orgId || '',
    orgId: c.organization_id || c.orgId || '',
    status: c.is_active !== undefined ? (c.is_active ? 'active' : 'inactive') : (c.status || 'active'),
    is_active: c.is_active !== undefined ? Boolean(c.is_active) : (c.status !== 'inactive'),
    city: c.city || 'Riyadh',
    chairsCount: c.chairsCount || 4,
    createdAt: c.created_at || c.createdAt || new Date().toISOString(),
    updatedAt: c.updated_at || c.updatedAt || new Date().toISOString(),
  };
}

export const clinicsService = {
  _enrichWithManager(clinic) {
    if (!clinic) return null;
    try {
      const users = usersService.getUsers();
      let managerUser = null;
      if (clinic.managerId) {
        managerUser = users.find((u) => u.id === clinic.managerId);
      }
      if (!managerUser) {
        managerUser = users.find(
          (u) =>
            u.role === 'clinic_manager' &&
            (u.clinicId === clinic.id || (Array.isArray(u.clinicIds) && u.clinicIds.includes(clinic.id)))
        );
      }
      return {
        ...clinic,
        managerId: managerUser ? managerUser.id : (clinic.managerId || null),
        manager: managerUser ? (managerUser.name || managerUser.fullName) : (clinic.manager || 'Unassigned'),
      };
    } catch {
      return clinic;
    }
  },

  /**
   * GET /api/v1/clinics/
   */
  async fetchClinics(orgId = null) {
    try {
      const params = orgId && orgId !== 'all' ? { organization_id: orgId } : {};
      const res = await apiClient.get('/api/v1/clinics/', { params });
      if (Array.isArray(res.data)) {
        const normalized = res.data.map(normalizeClinic);
        storageService.set(storageService.KEYS.CLINICS, normalized);
        return createSuccess(normalized.map((c) => this._enrichWithManager(c)));
      }
      return createSuccess(this.getClinics());
    } catch (err) {
      console.warn('[clinicsService.fetchClinics] API fallback to local:', err.message);
      return createSuccess(this.getClinics());
    }
  },

  getClinics() {
    const primaryClinics = CLINICS.filter((c) => !c.isAlias);
    let storedClinics = storageService.get(storageService.KEYS.CLINICS) || [];

    const storedMap = new Map((storedClinics || []).map((c) => [c.id, c]));
    const isOutOfSync =
      !storedClinics ||
      storedClinics.length < primaryClinics.length ||
      primaryClinics.some((pc) => !storedMap.has(pc.id) || !storedMap.get(pc.id)?.orgId);

    if (isOutOfSync) {
      const unifiedClinics = primaryClinics.map((pc, idx) => {
        const existing = storedMap.get(pc.id);
        return normalizeClinic({
          id: pc.id,
          orgId: pc.orgId,
          organization_id: pc.orgId,
          name: pc.name,
          city: pc.city || 'Riyadh',
          address: existing?.address || `${pc.city || 'Central'} Medical District, Suite ${100 + idx * 10}`,
          phone: existing?.phone || `+1 (555) 020-00${String(idx + 1).padStart(2, '0')}`,
          email: existing?.email || `contact@${pc.id}.com`,
          status: existing?.status || pc.status || 'active',
          operatingHours: existing?.operatingHours || '08:00 AM - 08:00 PM',
          chairsCount: existing?.chairsCount || (idx % 2 === 0 ? 5 : 4),
          createdAt: existing?.createdAt || '2026-01-15T00:00:00.000Z',
          updatedAt: existing?.updatedAt || '2026-01-15T00:00:00.000Z',
        });
      });

      const userAdded = (storedClinics || [])
        .filter((sc) => !primaryClinics.some((pc) => pc.id === sc.id))
        .map(normalizeClinic);

      const finalClinics = [...unifiedClinics, ...userAdded];
      storageService.set(storageService.KEYS.CLINICS, finalClinics);
      return finalClinics.map((c) => this._enrichWithManager(c));
    }

    return (storedClinics || []).map((c) => this._enrichWithManager(normalizeClinic(c)));
  },

  /**
   * GET /api/v1/clinics/{clinic_id}
   */
  async fetchClinicById(id) {
    try {
      const response = await apiClient.get(`/api/v1/clinics/${id}`);
      const clinic = normalizeClinic(response.data);

      // Cache / update in local storage list
      const currentList = this.getClinics();
      const exists = currentList.some((c) => c.id === clinic.id);
      const updatedList = exists
        ? currentList.map((c) => (c.id === clinic.id ? clinic : c))
        : [clinic, ...currentList];
      storageService.set(storageService.KEYS.CLINICS, updatedList);

      return createSuccess(this._enrichWithManager(clinic));
    } catch (err) {
      console.warn(`[clinicsService.fetchClinicById] API call failed for id ${id}:`, err.message);
      const local = this.getClinicById(id);
      if (local) return createSuccess(local);
      return createError('Clinic not found', err);
    }
  },

  getClinicById(id) {
    const clinics = this.getClinics();
    const found = clinics.find((c) => c.id === id || c._id === id) || null;
    return this._enrichWithManager(found);
  },

  getClinicsByOrg(orgId) {
    const clinics = this.getClinics();
    if (!orgId || orgId === 'all') return clinics;
    return clinics.filter((c) => c.orgId === orgId || c.organization_id === orgId);
  },

  /**
   * POST /api/v1/clinics/
   */
  async createClinic(clinicData, caller = null) {
    const payload = {
      name: (clinicData.name || '').trim(),
      description: (clinicData.description || '').trim(),
      contact_email: (clinicData.contact_email || clinicData.email || '').trim(),
      contact_phone: (clinicData.contact_phone || clinicData.phone || '').trim(),
      address: (clinicData.address || '').trim(),
      timezone: clinicData.timezone || 'UTC',
      working_hours: clinicData.working_hours || {
        additionalProperty: 'anything',
      },
      organization_id: (clinicData.organization_id || clinicData.orgId || '').trim(),
    };

    try {
      const response = await apiClient.post('/api/v1/clinics/', payload);
      const created = normalizeClinic(response.data);

      const currentList = this.getClinics();
      const updatedList = [created, ...currentList.filter((c) => c.id !== created.id)];
      storageService.set(storageService.KEYS.CLINICS, updatedList);

      return createSuccess(this._enrichWithManager(created), 'Clinic created successfully.');
    } catch (apiErr) {
      console.warn('[clinicsService.createClinic] API call failed, saving to local fallback:', apiErr.message);
      const fallbackClinic = normalizeClinic({
        ...payload,
        id: `clinic-${Date.now().toString(36)}`,
        created_at: new Date().toISOString(),
        is_active: true,
      });

      const currentList = this.getClinics();
      const updatedList = [fallbackClinic, ...currentList];
      storageService.set(storageService.KEYS.CLINICS, updatedList);

      return createSuccess(this._enrichWithManager(fallbackClinic), 'Clinic created successfully (offline mode).');
    }
  },

  /**
   * Synchronous / local addClinic wrapper
   */
  addClinic(clinicData, caller = null) {
    let callerRole = typeof caller === 'string' ? caller : caller?.role;
    if (!callerRole) {
      try {
        const stored =
          localStorage.getItem('dental_auth_user') ||
          localStorage.getItem('auth_user') ||
          localStorage.getItem('current_user') ||
          localStorage.getItem('dental_current_user');
        if (stored) callerRole = JSON.parse(stored)?.role;
      } catch {}
    }

    assertCanMutate('clinics', 'create', callerRole || caller);
    const clinics = this.getClinics();
    const slugId =
      'clinic-' +
      clinicData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const newClinic = normalizeClinic({
      id: slugId || `clinic-${Date.now()}`,
      name: clinicData.name.trim(),
      description: clinicData.description || '',
      contact_email: clinicData.contact_email || clinicData.email || '',
      contact_phone: clinicData.contact_phone || clinicData.phone || '',
      address: clinicData.address || '',
      timezone: clinicData.timezone || 'UTC',
      working_hours: clinicData.working_hours || { additionalProperty: 'anything' },
      organization_id: clinicData.organization_id || clinicData.orgId || 'org-001',
      orgId: clinicData.organization_id || clinicData.orgId || 'org-001',
      status: 'active',
      is_active: true,
      city: clinicData.city || 'Riyadh',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const updated = [...clinics, newClinic];
    storageService.set(storageService.KEYS.CLINICS, updated);
    return this._enrichWithManager(newClinic);
  },

  async updateClinic(id, updates) {
    const payload = {
      name: (updates.name || '').trim(),
      description: updates.description !== undefined && updates.description !== null ? updates.description : '',
      contact_email: (updates.contact_email || updates.email || '').trim(),
      contact_phone: updates.contact_phone !== undefined && updates.contact_phone !== null ? updates.contact_phone : '',
      address: updates.address !== undefined && updates.address !== null ? updates.address : '',
      timezone: updates.timezone || 'UTC',
      working_hours: updates.working_hours || {
        additionalProperty: 'anything',
      },
      is_active: updates.is_active !== undefined ? Boolean(updates.is_active) : true,
    };

    try {
      const response = await apiClient.put(`/api/v1/clinics/${id}`, payload);
      const updated = normalizeClinic(response.data);

      const clinics = this.getClinics();
      const index = clinics.findIndex((c) => c.id === id);
      if (index !== -1) {
        clinics[index] = updated;
        storageService.set(storageService.KEYS.CLINICS, clinics);
      }

      return createSuccess(this._enrichWithManager(updated), 'Clinic updated successfully.');
    } catch (err) {
      console.warn('[clinicsService.updateClinic] API call failed, updating local fallback:', err.message);
      const clinics = this.getClinics();
      const index = clinics.findIndex((c) => c.id === id);
      if (index === -1) return createError('Clinic not found', err);

      const updatedClinic = normalizeClinic({
        ...clinics[index],
        ...updates,
        ...payload,
        updatedAt: new Date().toISOString(),
      });

      clinics[index] = updatedClinic;
      storageService.set(storageService.KEYS.CLINICS, clinics);
      return createSuccess(this._enrichWithManager(updatedClinic), 'Clinic updated locally.');
    }
  },

  deleteClinic(id) {
    assertCanMutate('clinics', 'delete');
    const clinics = this.getClinics();
    const updated = clinics.filter((c) => c.id !== id);
    storageService.set(storageService.KEYS.CLINICS, updated);
    return updated;
  },

  toggleClinicStatus(id) {
    assertCanMutate('clinics', 'edit');
    const clinic = this.getClinicById(id);
    if (!clinic) throw new Error('Clinic not found');
    const newStatus = clinic.status === 'active' ? 'inactive' : 'active';
    return this.updateClinic(id, { status: newStatus, is_active: newStatus === 'active' });
  },
};

export const getClinics = () => clinicsService.getClinics();
export const getClinicById = (id) => clinicsService.getClinicById(id);
export const fetchClinicById = (id) => clinicsService.fetchClinicById(id);
export const getClinicsByOrg = (orgId) => clinicsService.getClinicsByOrg(orgId);
export const addClinic = (data) => clinicsService.addClinic(data);
export const createClinic = (data) => clinicsService.createClinic(data);
export const fetchClinics = (orgId) => clinicsService.fetchClinics(orgId);
export const updateClinic = (id, updates) => clinicsService.updateClinic(id, updates);
export const deleteClinic = (id) => clinicsService.deleteClinic(id);
export const toggleClinicStatus = (id) => clinicsService.toggleClinicStatus(id);
