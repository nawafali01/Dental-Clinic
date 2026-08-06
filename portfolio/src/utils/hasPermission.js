import { hasResourcePermission, hasRolePermission, getResourceAccess } from '../dashboard/shared/config/permissions';
import { storageService } from '../services/storage.service';

const KNOWN_ROLES = ['super_admin', 'org_admin', 'clinic_manager', 'agent', 'receptionist', 'finance', 'auditor'];

/**
 * Gets current logged-in user's role from storage session.
 */
export const getCurrentRole = () => {
  const user = storageService.get(storageService.KEYS.CURRENT_USER);
  return user?.role || null;
};

/**
 * Centralized Permission Helper
 * NO ROLE PARAMETER REQUIRED!
 *
 * Usage:
 *   hasPermission('leads')                 // Single parameter: auto-fetches logged in user role
 *   hasPermission('leads', 'org_admin')   // Optional role override
 *
 * @param {string} permissionOrRole - Permission/Resource string OR Role string
 * @param {string} [optionalRoleOrPermission] - Optional role override
 * @returns {boolean}
 */
export const hasPermission = (permissionOrRole, optionalRoleOrPermission) => {
  if (!permissionOrRole) return false;

  let role = null;
  let permission = null;

  if (optionalRoleOrPermission) {
    if (KNOWN_ROLES.includes(permissionOrRole)) {
      role = permissionOrRole;
      permission = optionalRoleOrPermission;
    } else {
      permission = permissionOrRole;
      role = optionalRoleOrPermission;
    }
  } else {
    // Single parameter: role param omitted
    permission = permissionOrRole;
    role = getCurrentRole();
  }

  if (!role || !permission) return false;
  if (role === 'super_admin') return true;

  // Check resource-based matrix first
  const resourceAllowed = hasResourcePermission(role, permission);
  if (resourceAllowed) return true;

  // Check action-based permissions
  return hasRolePermission(role, permission);
};

/**
 * Helper to get access level string for a resource.
 * NO ROLE PARAMETER REQUIRED!
 *
 * Usage:
 *   getUserResourceAccess('leads')               // Single parameter: uses logged in user role
 *   getUserResourceAccess('leads', 'org_admin') // Optional role override
 */
export const getUserResourceAccess = (resource, role) => {
  const targetRole = role || getCurrentRole();
  return getResourceAccess(targetRole, resource);
};

export default hasPermission;
