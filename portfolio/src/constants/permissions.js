/**
 * RBAC Permissions Definition
 * Role-Based Access Control logic that guards both UI elements and Service actions.
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORG_ADMIN: 'org_admin',
  CLINIC_MANAGER: 'clinic_manager',
  AGENT: 'agent',
  RECEPTIONIST: 'receptionist',
  FINANCE: 'finance',
  AUDITOR: 'auditor'
};

export const PERMISSIONS = {
  // User Management
  INVITE_USER: 'invite_user',
  DISABLE_USER: 'disable_user',
  MANAGE_ROLES: 'manage_roles',
  VIEW_USERS: 'view_users',
  MANAGE_USERS: 'manage_users',
  
  // Clinics & Orgs
  MANAGE_CLINICS: 'manage_clinics',
  MANAGE_ORGS: 'manage_orgs',
  
  // Financial
  VIEW_REVENUE: 'view_revenue',
  MANAGE_BILLING: 'manage_billing',
  
  // Operational
  MANAGE_APPOINTMENTS: 'manage_appointments',
  MANAGE_LEADS: 'manage_leads',
  VIEW_REPORTS: 'view_reports',
  VIEW_CLINICS: 'view_clinics',
  VIEW_LEADS: 'view_leads',
  VIEW_APPOINTMENTS: 'view_appointments',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  VIEW_GLOBAL_AUDIT: 'view_global_audit',
  
  // Global
  READ_ONLY: 'read_only'
};

const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // Super Admin gets everything
  
  [ROLES.ORG_ADMIN]: [
    PERMISSIONS.INVITE_USER,
    PERMISSIONS.DISABLE_USER,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_CLINICS,
    PERMISSIONS.VIEW_REVENUE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.MANAGE_LEADS,
    PERMISSIONS.VIEW_GLOBAL_AUDIT
  ],
  
  [ROLES.CLINIC_MANAGER]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.INVITE_USER,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_REVENUE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.MANAGE_LEADS,
    PERMISSIONS.VIEW_GLOBAL_AUDIT
  ],
  
  [ROLES.AGENT]: [
    PERMISSIONS.MANAGE_LEADS,
    PERMISSIONS.VIEW_REPORTS
  ],
  
  [ROLES.RECEPTIONIST]: [
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_USERS
  ],
  
  [ROLES.FINANCE]: [
    PERMISSIONS.VIEW_REVENUE,
    PERMISSIONS.MANAGE_BILLING,
    PERMISSIONS.VIEW_REPORTS
  ],
  
  [ROLES.AUDITOR]: [
    PERMISSIONS.READ_ONLY,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_CLINICS,
    PERMISSIONS.VIEW_LEADS,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.VIEW_REVENUE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_GLOBAL_AUDIT
  ]
};

export const READ_ONLY_ROLES = [ROLES.AUDITOR];
export const isReadOnlyRole = (role) => role === ROLES.AUDITOR || role === 'auditor';

/**
 * Validates if a given role has a specific permission.
 * 
 * @param {string} role - The role of the user (e.g., 'super_admin')
 * @param {string} permission - The permission to check (e.g., 'invite_user')
 * @returns {boolean}
 */
export const hasPermission = (role, permission) => {
  if (!role || !permission) return false;
  
  // Super Admin override (defense in depth)
  if (role === ROLES.SUPER_ADMIN) return true;
  
  const permissionsForRole = ROLE_PERMISSIONS[role] || [];
  return permissionsForRole.includes(permission);
};
