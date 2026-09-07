import { storageService } from './storage.service';
import { ROLES } from '@/constants/permissions';
import { SEED_USERS } from '@/dashboard/super-admin/mock-data/usersData';

export { SEED_USERS };

/**
 * USERS SERVICE
 * Handles comprehensive multi-tenant user operations backed by localStorage.
 */
class UsersService {
  /**
   * Internal helper to normalize and ensure persistent seed data
   */
  _ensureSeedUsers() {
    let existing = storageService.get(storageService.KEYS.USERS);
    if (!existing || existing.length === 0) {
      storageService.set(storageService.KEYS.USERS, SEED_USERS);
      return SEED_USERS;
    }

    // Check if SEED_USERS have been merged (ensure all roles & orgs exist)
    const existingEmails = new Set(existing.map((u) => u.email));
    let hasAdditions = false;
    for (const seed of SEED_USERS) {
      if (!existingEmails.has(seed.email)) {
        existing.push(seed);
        hasAdditions = true;
      }
    }

    // Normalize name and status
    existing = existing.map((u) => ({
      ...u,
      name: u.name || u.fullName || 'User',
      fullName: u.fullName || u.name || 'User',
      status: u.status === 'disabled' ? 'inactive' : (u.status || 'active'),
    }));

    if (hasAdditions) {
      storageService.set(storageService.KEYS.USERS, existing);
    }

    return existing;
  }

  /**
   * Retrieves all users (global across all organizations)
   */
  getUsers() {
    return this._ensureSeedUsers();
  }

  /**
   * Retrieves users scoped to a specific organization
   */
  getUsersByOrganization(organizationId) {
    if (!organizationId || organizationId === 'all') {
      return this.getUsers();
    }
    const all = this.getUsers();
    return all.filter((u) => u.organizationId === organizationId);
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
        (Array.isArray(u.clinicIds) && u.clinicIds.includes(clinicId))
    );
  }

  /**
   * Retrieves a specific user by id
   */
  getUserById(id) {
    const all = this.getUsers();
    return all.find((u) => u.id === id) || null;
  }

  /**
   * Creates / Invites a new user
   */
  createUser(userData) {
    const all = this.getUsers();

    if (all.some((u) => u.email?.toLowerCase() === userData.email?.toLowerCase())) {
      throw new Error('A user with this email address already exists.');
    }

    const newUser = {
      id: crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`,
      name: (userData.name || userData.fullName || '').trim(),
      fullName: (userData.name || userData.fullName || '').trim(),
      email: userData.email.trim().toLowerCase(),
      role: userData.role || ROLES.AGENT,
      organizationId: userData.role === ROLES.SUPER_ADMIN ? null : (userData.organizationId || null),
      clinicId: userData.clinicId || null,
      clinicIds: userData.clinicId ? [userData.clinicId] : (userData.clinicIds || []),
      status: userData.status || 'active',
      invitedAt: userData.status === 'invited' ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null,
    };

    const updated = [newUser, ...all];
    storageService.set(storageService.KEYS.USERS, updated);
    return newUser;
  }

  /**
   * Updates an existing user (role, assignment, profile, status)
   */
  updateUser(id, updates) {
    const all = this.getUsers();
    const index = all.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }

    const current = all[index];
    const name = updates.name !== undefined ? updates.name : (updates.fullName !== undefined ? updates.fullName : current.name);
    const fullName = updates.fullName !== undefined ? updates.fullName : name;

    const clinicId = updates.clinicId !== undefined ? updates.clinicId : current.clinicId;
    let clinicIds = updates.clinicIds !== undefined ? updates.clinicIds : current.clinicIds;
    if (clinicId && (!clinicIds || !clinicIds.includes(clinicId))) {
      clinicIds = [clinicId];
    }

    const updatedUser = {
      ...current,
      ...updates,
      name,
      fullName,
      clinicId,
      clinicIds,
      updatedAt: new Date().toISOString(),
    };

    all[index] = updatedUser;
    storageService.set(storageService.KEYS.USERS, all);

    // If current logged-in user, keep session updated
    const session = storageService.get(storageService.KEYS.CURRENT_USER);
    if (session && session.id === id) {
      storageService.set(storageService.KEYS.CURRENT_USER, {
        ...session,
        ...updatedUser,
      });
    }

    return updatedUser;
  }

  /**
   * Deactivates a user (sets status to 'inactive')
   */
  deactivateUser(id) {
    return this.updateUser(id, { status: 'inactive' });
  }

  /**
   * Activates a user (sets status to 'active')
   */
  activateUser(id) {
    return this.updateUser(id, { status: 'active' });
  }

  /**
   * Deletes a user completely
   */
  deleteUser(id) {
    const all = this.getUsers();
    const filtered = all.filter((u) => u.id !== id);
    storageService.set(storageService.KEYS.USERS, filtered);
    return true;
  }
}

export const usersService = new UsersService();

export const getUsers = (...args) => usersService.getUsers(...args);
export const getUsersByOrganization = (...args) => usersService.getUsersByOrganization(...args);
export const getUsersByClinic = (...args) => usersService.getUsersByClinic(...args);
export const getUserById = (...args) => usersService.getUserById(...args);
export const createUser = (...args) => usersService.createUser(...args);
export const updateUser = (...args) => usersService.updateUser(...args);
export const deactivateUser = (...args) => usersService.deactivateUser(...args);
export const activateUser = (...args) => usersService.activateUser(...args);
export const deleteUser = (...args) => usersService.deleteUser(...args);
