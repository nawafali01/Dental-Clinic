export const PERMISSIONS = {
  MANAGE_MULTI_TENANT: 'manage_multi_tenant', // Multi-tenant clinic management
  VIEW_AI_GOVERNANCE: 'view_ai_governance',   // AI Ops, latency, kill switch
  VIEW_GLOBAL_AUDIT: 'view_global_audit',     // Global Audit Trail
  SWITCH_ORGANIZATION: 'switch_organization', // Org Switcher in Header
};

export const ROLE_PERMISSIONS = {
  super_admin: [
    PERMISSIONS.MANAGE_MULTI_TENANT,
    PERMISSIONS.VIEW_AI_GOVERNANCE,
    PERMISSIONS.VIEW_GLOBAL_AUDIT,
    PERMISSIONS.SWITCH_ORGANIZATION,
  ],
  org_admin: [
    // org_admin has access to standard clinic metrics, leads, users, revenue within their assigned org
  ],
};

export const hasRolePermission = (roleId, permission) => {
  if (!roleId || !ROLE_PERMISSIONS[roleId]) return false;
  return ROLE_PERMISSIONS[roleId].includes(permission);
};
