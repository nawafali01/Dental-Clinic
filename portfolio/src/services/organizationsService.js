import apiClient from '../lib/api';
import { storageService } from './storage.service';
import { createSuccess, createError } from '../utils/response.util';

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

function normalizeOrg(raw) {
  if (!raw) return null;
  const branding = raw.branding || {};
  const brandColor =
    raw.brandColor ||
    raw.brandingColor ||
    branding.additionalProperty ||
    branding.brandColor ||
    '#0F766E';

  return {
    id: raw.id || `org-${Date.now().toString(36)}`,
    name: raw.name || 'Unnamed Organization',
    description: raw.description || '',
    contact_email: raw.contact_email || raw.contactEmail || '',
    contact_phone: raw.contact_phone || raw.contactPhone || '',
    address: raw.address || '',
    branding: branding,
    brandColor: brandColor,
    brandingColor: brandColor,
    logoUrl: raw.logoUrl || branding.logoUrl || null,
    status:
      raw.is_active !== undefined
        ? raw.is_active
          ? 'active'
          : 'inactive'
        : raw.status || 'active',
    timezone: raw.timezone || 'Asia/Karachi',
    currency: raw.currency || 'USD',
    clinics: raw.clinics || [],
    users: raw.users || [],
    clinic_count: raw.clinic_count ?? (raw.clinics ? raw.clinics.length : 0),
    user_count: raw.user_count ?? (raw.users ? raw.users.length : 0),
    createdAt:
      raw.created_at || raw.createdAt || new Date().toISOString().split('T')[0],
    updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString(),
  };
}

export const INITIAL_ORGANIZATIONS = [];

class OrganizationsService {
  getStorageKey() {
    return storageService.KEYS.ORGS || 'dental_crm_orgs';
  }

  /**
   * Fetch organizations with RBAC enforcement:
   * - Super Admin: views all organizations
   * - Org Admin: views only their assigned organization
   */
  async getOrganizations() {
    try {
      const user = getCurrentUser();
      const role = user?.role;

      try {
        const response = await apiClient.get('/api/v1/organizations/');
        let list = [];
        if (Array.isArray(response.data)) {
          list = response.data.map(normalizeOrg);
        } else if (response.data && typeof response.data === 'object') {
          list = [normalizeOrg(response.data)];
        }

        // RBAC Scoping: Org Admin only sees their own org
        if (role === 'org_admin') {
          if (user?.organizationId) {
            const orgMatch = list.filter((o) => o.id === user.organizationId);
            if (orgMatch.length > 0) list = orgMatch;
          }
        }

        if (list.length > 0) {
          storageService.set(this.getStorageKey(), list);
        }
        return createSuccess(list, 'Organizations retrieved successfully.');
      } catch (apiErr) {
        console.warn('[Organizations] API unreachable, using storage fallback:', apiErr.message);
        const LEGACY_MOCKS = ['org-001', 'org-002', 'org-003', 'org-004', 'org-005', 'org-006'];
        let orgs = (storageService.get(this.getStorageKey()) || []).filter(
          (o) => !LEGACY_MOCKS.includes(o.id)
        );

        // Filter for Org Admin
        if (role === 'org_admin') {
          orgs = orgs.filter((o) => o.id === user?.organizationId);
        }

        return createSuccess(orgs.map(normalizeOrg), 'Organizations retrieved successfully.');
      }
    } catch (error) {
      return createError('Failed to fetch organizations.', error);
    }
  }

  /**
   * Alias for getOrganizations
   */
  async fetchOrganizations() {
    return this.getOrganizations();
  }

  /**
   * Synchronous accessor for fast initial renders
   */
  getOrganizationsSync() {
    try {
      const user = getCurrentUser();
      const role = user?.role;
      const LEGACY_MOCKS = ['org-001', 'org-002', 'org-003', 'org-004', 'org-005', 'org-006'];
      let orgs = (storageService.get(this.getStorageKey()) || []).filter(
        (o) => !LEGACY_MOCKS.includes(o.id)
      );

      if (role === 'org_admin') {
        const filtered = orgs.filter((o) => o.id === user?.organizationId);
        return filtered.map(normalizeOrg);
      }

      return orgs.map(normalizeOrg);
    } catch (error) {
      console.error('Error fetching orgs sync:', error);
      return [];
    }
  }

  /**
   * Create a new organization:
   * Endpoint: POST /api/v1/organizations/
   * Payload:
   * {
   *   "name": "",
   *   "description": "",
   *   "contact_email": "",
   *   "contact_phone": "",
   *   "address": "",
   *   "branding": {
   *     "additionalProperty": "anything"
   *   }
   * }
   *
   * RBAC: ONLY Super Admin can create organizations.
   */
  async createOrganization(orgData) {
    try {
      const user = getCurrentUser();
      const role = user?.role;

      // ── RBAC Check ─────────────────────────────────────────────
      if (role && role !== 'super_admin') {
        return createError('Access Denied: Only Super Admin is authorized to create organizations.');
      }

      // Canonical payload matching backend specifications
      const payload = {
        name: (orgData.name || '').trim(),
        description: (orgData.description || '').trim(),
        contact_email: (orgData.contact_email || orgData.contactEmail || '').trim(),
        contact_phone: (orgData.contact_phone || orgData.contactPhone || '').trim(),
        address: (orgData.address || '').trim(),
        branding: orgData.branding || {
          additionalProperty: orgData.brandColor || orgData.brandingColor || 'anything',
        },
      };

      try {
        const response = await apiClient.post('/api/v1/organizations/', payload);
        const created = normalizeOrg(response.data);

        // Update local storage
        const currentList = this.getOrganizationsSync();
        const updatedList = [created, ...currentList.filter((o) => o.id !== created.id)];
        storageService.set(this.getStorageKey(), updatedList);

        return createSuccess(created, 'Organization created successfully.');
      } catch (apiErr) {
        if (apiErr.response?.status === 403) {
          return createError('Forbidden: Only Super Admin is authorized to create organizations.');
        }

        console.warn('[Organizations] API call failed, saving to local fallback:', apiErr.message);
        const fallbackOrg = normalizeOrg({
          ...orgData,
          id: `org-${Date.now().toString(36)}`,
          created_at: new Date().toISOString(),
          is_active: true,
        });

        const currentList = this.getOrganizationsSync();
        const updatedList = [fallbackOrg, ...currentList];
        storageService.set(this.getStorageKey(), updatedList);

        return createSuccess(fallbackOrg, 'Organization created successfully (offline mode).');
      }
    } catch (error) {
      return createError('Failed to create organization.', error);
    }
  }

  /**
   * Update an existing organization:
   * Endpoint: PUT /api/v1/organizations/{org_id}
   * Payload:
   * {
   *   "name": "",
   *   "description": "",
   *   "contact_email": "",
   *   "contact_phone": "",
   *   "address": "",
   *   "branding": {
   *     "additionalProperty": "anything"
   *   },
   *   "is_active": true
   * }
   */
  async updateOrganization(id, updates) {
    try {
      const user = getCurrentUser();
      const role = user?.role;

      // Scoping: Org Admin can only update their own organization
      if (role === 'org_admin' && user?.organizationId && user.organizationId !== id) {
        return createError('Access Denied: You are only authorized to update your own organization.');
      }

      const orgs = this.getOrganizationsSync();
      const existingOrg = orgs.find((o) => o.id === id);

      const payload = {
        name: (updates.name !== undefined ? updates.name : existingOrg?.name || '').trim(),
        description: (updates.description !== undefined ? updates.description : existingOrg?.description || '').trim(),
        contact_email: (updates.contact_email !== undefined ? updates.contact_email : updates.contactEmail || existingOrg?.contact_email || '').trim(),
        contact_phone: (updates.contact_phone !== undefined ? updates.contact_phone : updates.contactPhone || existingOrg?.contact_phone || '').trim(),
        address: (updates.address !== undefined ? updates.address : existingOrg?.address || '').trim(),
        branding: updates.branding || {
          additionalProperty:
            existingOrg?.branding?.additionalProperty || 'anything',
        },
        is_active:
          updates.is_active !== undefined
            ? Boolean(updates.is_active)
            : updates.status !== undefined
            ? updates.status === 'active'
            : existingOrg?.is_active !== undefined
            ? existingOrg.is_active
            : true,
      };

      try {
        const response = await apiClient.put(`/api/v1/organizations/${id}`, payload);
        const updated = normalizeOrg(response.data);

        // Sync with local storage
        const orgs = this.getOrganizationsSync();
        const index = orgs.findIndex((o) => o.id === id);
        if (index !== -1) {
          orgs[index] = { ...orgs[index], ...updated };
          storageService.set(this.getStorageKey(), orgs);
        }

        return createSuccess(updated, 'Organization updated successfully.');
      } catch (apiErr) {
        if (apiErr.response?.status === 403) {
          return createError('Access Denied: You do not have permission to update this organization.');
        }

        console.warn(`[Organizations] PUT /api/v1/organizations/${id} failed, updating local fallback:`, apiErr.message);
        const orgs = this.getOrganizationsSync();
        const index = orgs.findIndex((o) => o.id === id);

        if (index === -1) {
          return createError('Organization not found.');
        }

        const brandColor =
          updates.brandColor ||
          updates.brandingColor ||
          orgs[index].brandColor ||
          orgs[index].brandingColor;

        const updatedOrg = {
          ...orgs[index],
          ...updates,
          brandColor,
          brandingColor: brandColor,
          status: payload.is_active ? 'active' : 'inactive',
          updatedAt: new Date().toISOString(),
        };

        const updatedOrgs = [...orgs];
        updatedOrgs[index] = updatedOrg;
        storageService.set(this.getStorageKey(), updatedOrgs);

        return createSuccess(updatedOrg, 'Organization updated successfully (offline mode).');
      }
    } catch (error) {
      return createError('Failed to update organization.', error);
    }
  }

  /**
   * Delete an organization by ID (Super Admin only)
   */
  async deleteOrganization(id) {
    try {
      const user = getCurrentUser();
      if (user?.role && user.role !== 'super_admin') {
        return createError('Access Denied: Only Super Admin can delete organizations.');
      }

      const orgs = this.getOrganizationsSync();
      const filtered = orgs.filter((o) => o.id !== id);
      storageService.set(this.getStorageKey(), filtered);
      return createSuccess({ id }, 'Organization deleted successfully.');
    } catch (error) {
      return createError('Failed to delete organization.', error);
    }
  }

  /**
   * GET /api/v1/organizations/{org_id}
   * Fetches organization by ID from real backend API, with fallback to local cache.
   */
  async getOrganizationById(id) {
    if (!id) return createError('Organization ID is required.');
    const user = getCurrentUser();
    const role = user?.role;

    // RBAC: Org Admin is restricted to their own organization
    if (role === 'org_admin' && user?.organizationId && user.organizationId !== id) {
      return createError('Access Denied: You are only authorized to view your own organization.');
    }

    try {
      const response = await apiClient.get(`/api/v1/organizations/${id}`);
      if (response.data) {
        const normalized = normalizeOrg(response.data);
        return createSuccess(normalized, 'Organization retrieved successfully.');
      }
    } catch (apiErr) {
      if (apiErr.response?.status === 403) {
        return createError('Access Denied: You do not have permission to view this organization.');
      }
      if (apiErr.response?.status === 404) {
        return createError('Organization not found.');
      }
      console.warn(`[Organizations] GET /api/v1/organizations/${id} failed, checking local cache:`, apiErr.message);
    }

    const cached = this.getOrganizationByIdSync(id);
    if (cached) {
      return createSuccess(cached, 'Organization retrieved from local cache.');
    }
    return createError('Organization not found.');
  }

  /**
   * Synchronous accessor for fast initial render or inline lookups
   */
  getOrganizationByIdSync(id) {
    if (!id) return null;
    const orgs = this.getOrganizationsSync();
    return orgs.find((o) => o.id === id) || null;
  }
}

export const organizationsService = new OrganizationsService();
