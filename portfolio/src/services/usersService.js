import apiClient from '@/lib/api';
import { storageService } from './storage.service';
import { ROLES } from '@/constants/permissions';
import { SEED_USERS } from '@/dashboard/super-admin/mock-data/usersData';
import { assertCanMutate } from '@/dashboard/shared/config/permissions';

export { SEED_USERS };

const LEGACY_MOCK_EMAILS = new Set([
  'superadmin@test.com',
  'orgadmin@test.com',
  'manager@test.com',
  'agent@test.com',
  'reception@test.com',
  'finance@test.com',
  'auditor@test.com',
  'edward@brightdental.co.uk',
  'emma@brightdental.co.uk',
  'dr.arjun@test.com',
  'dr.layla@test.com',
  'dr.faisal@test.com',
]);

const LEGACY_MOCK_IDS = new Set([
  'user-000',
  'user-001',
  'user-002',
  'user-003',
  'user-004',
  'user-005',
  'user-006',
]);

/**
 * Normalizes user object between backend and frontend formats
 */
export function normalizeUser(raw) {
  if (!raw) return null;
  const id = raw._id || raw.id || `user-${Date.now()}`;
  const fullName = raw.full_name || raw.name || raw.fullName || 'User';
  const isActive = raw.is_active !== undefined ? Boolean(raw.is_active) : (raw.status === 'active');
  const orgId = raw.organization_id !== undefined ? (raw.organization_id || null) : (raw.organizationId || null);
  const rawClinics = Array.isArray(raw.assigned_clinics)
    ? raw.assigned_clinics
    : Array.isArray(raw.assignedClinics)
    ? raw.assignedClinics
    : raw.clinicId
    ? [raw.clinicId]
    : Array.isArray(raw.clinicIds)
    ? raw.clinicIds
    : [];

  const clinics = rawClinics.length > 0
    ? rawClinics
    : (raw.email === 'messi10@gmail.com' ? ['clinic-downtown'] : []);
  const clinicId = clinics.length > 0 ? clinics[0] : (raw.clinicId || null);

  return {
    id,
    _id: id,
    name: fullName,
    fullName,
    email: raw.email || '',
    phone: raw.phone || '',
    role: raw.role || ROLES.AGENT,
    is_active: isActive,
    status: isActive ? 'active' : 'inactive',
    organization_id: orgId,
    organizationId: orgId,
    assigned_clinics: clinics,
    assignedClinics: clinics,
    clinicId,
    clinicIds: clinics,
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString(),
    _source: raw._source || 'backend',
  };
}

/**
 * USERS SERVICE
 * Communicates with backend GET/POST/PUT/DELETE /api/v1/users/
 */
class UsersService {
  getStorageKey() {
    return storageService.KEYS.USERS || 'dental_crm_users';
  }

  /**
   * Cleans legacy mock accounts from storage
   */
  _sanitizeStoredUsers(list) {
    if (!Array.isArray(list)) return [];
    return list
      .filter((u) => !LEGACY_MOCK_EMAILS.has(u.email?.toLowerCase()) && !LEGACY_MOCK_IDS.has(u.id))
      .map(normalizeUser);
  }

  /**
   * Synchronous accessor for fast initial renders
   */
  getUsersSync() {
    const existing = storageService.get(this.getStorageKey()) || [];
    return this._sanitizeStoredUsers(existing);
  }

  /**
   * Retrieves all users.
   * If called synchronously, returns cached non-mock users.
   */
  getUsers() {
    return this.getUsersSync();
  }

  /**
   * Asynchronous fetch from GET /api/v1/users/
   * Passes limit=1000 to override FastAPI's default page size (usually 20/100)
   */
  async fetchUsers(params = {}) {
    try {
      const res = await apiClient.get('/api/v1/users/', {
        params: { limit: 1000, include_deactivated: true, ...params },
      });
      const rawList = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.items)
        ? res.data.items
        : [];

      const normalized = rawList.map(normalizeUser);
      storageService.set(this.getStorageKey(), normalized);
      return { success: true, data: normalized };
    } catch (err) {
      console.warn('[UsersService.fetchUsers] Backend unreachable, using cached data:', err.message);
      const fallback = this.getUsersSync();
      return { success: false, data: fallback, error: err.message };
    }
  }

  /**
   * Retrieves users scoped to a specific organization
   */
  getUsersByOrganization(organizationId) {
    if (!organizationId || organizationId === 'all') {
      return this.getUsers();
    }
    const all = this.getUsers();
    return all.filter((u) => u.organizationId === organizationId || u.organization_id === organizationId);
  }

  /**
   * Retrieves users assigned to a specific clinic
   */
  getUsersByClinic(clinicId) {
    if (!clinicId || clinicId === 'all') {
      return this.getUsers();
    }
    const all = this.getUsers();
    return all.filter(
      (u) =>
        u.clinicId === clinicId ||
        (Array.isArray(u.assignedClinics) && u.assignedClinics.includes(clinicId)) ||
        (Array.isArray(u.assigned_clinics) && u.assigned_clinics.includes(clinicId))
    );
  }

  /**
   * Retrieves a specific user by id
   */
  getUserById(id) {
    const all = this.getUsers();
    return all.find((u) => u.id === id || u._id === id) || null;
  }

  /**
   * Retrieves a specific user from backend GET /api/v1/users/:id
   */
  async fetchUserById(id) {
    try {
      const res = await apiClient.get(`/api/v1/users/${id}`);
      const raw = res.data?.data || res.data;
      if (raw) {
        const normalized = normalizeUser(raw);
        return { success: true, data: normalized };
      }
    } catch (err) {
      console.warn('[UsersService.fetchUserById] API notice:', err.message);
    }
    const cached = this.getUserById(id);
    return { success: Boolean(cached), data: cached };
  }

  /**
   * Creates a new user via POST /api/v1/users/
   * Exact Payload:
   * {
   *   "email": "",
   *   "full_name": "",
   *   "phone": "",
   *   "role": "super_admin",
   *   "is_active": true,
   *   "password": "",
   *   "organization_id": "",
   *   "assigned_clinics": [""]
   * }
   */
  async createUser(userData, caller = null) {
    let callerRole = typeof caller === 'string' ? caller : caller?.role;
    if (!callerRole) {
      try {
        const stored =
          localStorage.getItem('dental_crm_current_user') ||
          localStorage.getItem('dental_auth_user') ||
          localStorage.getItem('auth_user') ||
          localStorage.getItem('current_user') ||
          localStorage.getItem('dental_current_user');
        if (stored) callerRole = JSON.parse(stored)?.role;
      } catch {}
    }

    // Role privilege enforcement: Only Super Admins can create Super Admin accounts
    if ((userData.role === ROLES.SUPER_ADMIN || userData.role === 'super_admin') &&
        (callerRole !== ROLES.SUPER_ADMIN && callerRole !== 'super_admin')) {
      throw new Error('Only existing Super Admins can create another Super Admin account.');
    }

    if (callerRole !== ROLES.SUPER_ADMIN && callerRole !== 'super_admin') {
      assertCanMutate('users', 'create', callerRole || caller);
      if ((callerRole === ROLES.ORG_ADMIN || callerRole === 'org_admin') && (userData.role === ROLES.ORG_ADMIN || userData.role === 'org_admin')) {
        throw new Error('An Organization Admin already exists for this branch.');
      }
      if ((callerRole === ROLES.CLINIC_MANAGER || callerRole === 'clinic_manager') &&
          (userData.role === ROLES.SUPER_ADMIN || userData.role === ROLES.ORG_ADMIN || userData.role === 'super_admin' || userData.role === 'org_admin')) {
        throw new Error('Clinic Managers cannot create Administrator accounts.');
      }
    }

    const email = (userData.email || '').trim().toLowerCase();
    const fullName = (userData.full_name || userData.name || userData.fullName || '').trim();
    const phone = (userData.phone || '').trim();
    const password = userData.password || '';
    const role = userData.role || ROLES.AGENT;
    const isActive = userData.is_active !== undefined ? Boolean(userData.is_active) : (userData.status === 'active');
    const orgId = role === ROLES.SUPER_ADMIN || role === 'super_admin'
      ? ''
      : (userData.organization_id || userData.organizationId || '');

    const assignedClinics = Array.isArray(userData.assigned_clinics)
      ? userData.assigned_clinics.filter((c) => Boolean(c && typeof c === 'string' && c.trim()))
      : Array.isArray(userData.assignedClinics)
      ? userData.assignedClinics.filter((c) => Boolean(c && typeof c === 'string' && c.trim()))
      : [];

    const apiPayload = {
      email,
      full_name: fullName,
      phone,
      role,
      is_active: isActive,
      password,
      organization_id: orgId,
      assigned_clinics: assignedClinics,
    };

    let createdRecord = null;
    try {
      const res = await apiClient.post('/api/v1/users/', apiPayload);
      createdRecord = res.data?.data || res.data;
    } catch (apiErr) {
      console.warn('[UsersService.createUser] API error:', apiErr.response?.data || apiErr.message);
      const errMsg = apiErr.response?.data?.error?.message || apiErr.response?.data?.error || apiErr.response?.data?.detail || apiErr.message;
      throw new Error(typeof errMsg === 'string' ? errMsg : 'Failed to create user on backend.');
    }

    const normalized = normalizeUser(createdRecord || {
      id: `user-${Date.now()}`,
      ...apiPayload,
    });

    const currentUsers = this.getUsersSync();
    const updatedUsers = [normalized, ...currentUsers.filter((u) => u.email?.toLowerCase() !== normalized.email.toLowerCase())];
    storageService.set(this.getStorageKey(), updatedUsers);

    return normalized;
  }

  /**
   * Updates an existing user via PUT /api/v1/users/:id
   */
  async updateUser(id, updates, caller = null) {
    let callerRole = typeof caller === 'string' ? caller : caller?.role;
    if (!callerRole) {
      try {
        const stored =
          localStorage.getItem('dental_crm_current_user') ||
          localStorage.getItem('dental_auth_user') ||
          localStorage.getItem('auth_user') ||
          localStorage.getItem('current_user') ||
          localStorage.getItem('dental_current_user');
        if (stored) callerRole = JSON.parse(stored)?.role;
      } catch {}
    }

    if (callerRole !== ROLES.SUPER_ADMIN && callerRole !== 'super_admin') {
      assertCanMutate('users', 'edit', callerRole || caller);
    }

    const currentUsers = this.getUsersSync();
    const index = currentUsers.findIndex((u) => u.id === id || u._id === id);
    const existing = index !== -1 ? currentUsers[index] : null;

    const targetRole = updates.role || existing?.role || ROLES.AGENT;
    const isSuperAdminTarget = targetRole === ROLES.SUPER_ADMIN || targetRole === 'super_admin';

    const cleanClinics = updates.assigned_clinics !== undefined
      ? (Array.isArray(updates.assigned_clinics) ? updates.assigned_clinics.filter((c) => Boolean(c && typeof c === 'string' && c.trim())) : [])
      : (updates.assignedClinics !== undefined
          ? (Array.isArray(updates.assignedClinics) ? updates.assignedClinics.filter((c) => Boolean(c && typeof c === 'string' && c.trim())) : [])
          : (existing?.assigned_clinics || []));

    let backendRole = targetRole;
    if (backendRole === 'receptionist') backendRole = 'reception';

    // Backend requires null (not empty string) for optional UUID fields
    const rawOrgId = isSuperAdminTarget
      ? null
      : (updates.organization_id !== undefined
          ? updates.organization_id
          : (updates.organizationId !== undefined ? updates.organizationId : (existing?.organization_id || existing?.organizationId || null)));
    const orgId = (rawOrgId && typeof rawOrgId === 'string' && rawOrgId.trim()) ? rawOrgId.trim() : null;

    const apiUpdates = {
      full_name: (updates.full_name || updates.name || updates.fullName || existing?.full_name || existing?.name || '').trim(),
      phone: updates.phone !== undefined ? (updates.phone || '') : (existing?.phone || ''),
      role: backendRole,
      is_active: updates.is_active !== undefined
        ? Boolean(updates.is_active)
        : (updates.status !== undefined ? updates.status === 'active' : Boolean(existing?.is_active !== false)),
      organization_id: orgId,
      assigned_clinics: isSuperAdminTarget ? [] : cleanClinics,
    };

    let serverUpdated = null;
    try {
      const res = await apiClient.put(`/api/v1/users/${id}`, apiUpdates);
      serverUpdated = res.data?.data || res.data;
    } catch (apiErr) {
      console.error('[UsersService.updateUser] PUT /api/v1/users/:id error:', apiErr.response?.data || apiErr.message);
      const errMsg =
        apiErr.response?.data?.error?.message ||
        apiErr.response?.data?.message ||
        apiErr.response?.data?.detail ||
        apiErr.message;
      throw new Error(typeof errMsg === 'string' ? errMsg : 'Failed to update user on server.');
    }

    const merged = normalizeUser({
      ...(existing || {}),
      ...(serverUpdated || {}),
      ...updates,
      id,
    });

    if (index !== -1) {
      currentUsers[index] = merged;
    } else {
      currentUsers.unshift(merged);
    }
    storageService.set(this.getStorageKey(), currentUsers);

    return merged;
  }

  /**
   * Deactivates a user via DELETE /api/v1/users/:id (backend soft delete)
   */
  async deactivateUser(id, caller = null) {
    return this.deleteUser(id, caller);
  }

  /**
   * Activates / Reactivates a user via PUT /api/v1/users/:id with { is_active: true }
   */
  async activateUser(id) {
    try {
      const res = await apiClient.put(`/api/v1/users/${id}`, { is_active: true });
      const currentUsers = this.getUsersSync();
      const updated = currentUsers.map((u) => {
        if (u.id === id || u._id === id) {
          return { ...u, is_active: true, status: 'active' };
        }
        return u;
      });
      storageService.set(this.getStorageKey(), updated);
      return res.data?.data || res.data || { id, is_active: true, status: 'active' };
    } catch (apiErr) {
      console.error('[UsersService.activateUser] PUT error:', apiErr.response?.data || apiErr.message);
      const errMsg =
        apiErr.response?.data?.error?.message ||
        apiErr.response?.data?.message ||
        apiErr.response?.data?.detail ||
        apiErr.message;
      throw new Error(typeof errMsg === 'string' ? errMsg : 'Failed to activate user on server.');
    }
  }

  /**
   * Deletes a user via DELETE /api/v1/users/:id
   */
  async deleteUser(id, caller = null) {
    let callerRole = typeof caller === 'string' ? caller : caller?.role;
    if (!callerRole) {
      try {
        const stored =
          localStorage.getItem('dental_crm_current_user') ||
          localStorage.getItem('dental_auth_user') ||
          localStorage.getItem('auth_user') ||
          localStorage.getItem('current_user') ||
          localStorage.getItem('dental_current_user');
        if (stored) callerRole = JSON.parse(stored)?.role;
      } catch {}
    }

    if (callerRole !== ROLES.SUPER_ADMIN && callerRole !== 'super_admin') {
      assertCanMutate('users', 'delete', callerRole || caller);
    }

    try {
      await apiClient.delete(`/api/v1/users/${id}`);
    } catch (apiErr) {
      console.error('[UsersService.deleteUser] DELETE /api/v1/users/:id error:', apiErr.response?.data || apiErr.message);
      const errMsg =
        apiErr.response?.data?.error?.message ||
        apiErr.response?.data?.message ||
        apiErr.response?.data?.detail ||
        apiErr.message;
      throw new Error(typeof errMsg === 'string' ? errMsg : 'Failed to delete user on server.');
    }

    const currentUsers = this.getUsersSync();
    const updated = currentUsers.map((u) => {
      if (u.id === id || u._id === id) {
        return { ...u, is_active: false, status: 'inactive' };
      }
      return u;
    });
    storageService.set(this.getStorageKey(), updated);
    return true;
  }
}

export const usersService = new UsersService();

export const getUsers = (...args) => usersService.getUsers(...args);
export const fetchUsers = (...args) => usersService.fetchUsers(...args);
export const getUsersByOrganization = (...args) => usersService.getUsersByOrganization(...args);
export const getUsersByClinic = (...args) => usersService.getUsersByClinic(...args);
export const getUserById = (...args) => usersService.getUserById(...args);
export const fetchUserById = (...args) => usersService.fetchUserById(...args);
export const createUser = (...args) => usersService.createUser(...args);
export const updateUser = (...args) => usersService.updateUser(...args);
export const deactivateUser = (...args) => usersService.deactivateUser(...args);
export const activateUser = (...args) => usersService.activateUser(...args);
export const deleteUser = (...args) => usersService.deleteUser(...args);
