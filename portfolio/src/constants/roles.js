export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ORG_ADMIN: "org_admin",
  CLINIC_MANAGER: "clinic_manager",
  AGENT: "agent",
  RECEPTIONIST: "receptionist",
  FINANCE: "finance",
  AUDITOR: "auditor",
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ORG_ADMIN]: "Org Admin",
  [ROLES.CLINIC_MANAGER]: "Clinic Manager",
  [ROLES.AGENT]: "Agent",
  [ROLES.RECEPTIONIST]: "Receptionist",
  [ROLES.FINANCE]: "Finance",
  [ROLES.AUDITOR]: "Auditor",
};

export const ROLE_REDIRECTS = {
  [ROLES.SUPER_ADMIN]: "/admin/dashboard",
  [ROLES.ORG_ADMIN]: "/admin/dashboard",
  [ROLES.CLINIC_MANAGER]: "/manager/dashboard",
  [ROLES.AGENT]: "/agent/dashboard",
  [ROLES.RECEPTIONIST]: "/receptionist/dashboard",
  [ROLES.FINANCE]: "/finance/dashboard",
  [ROLES.AUDITOR]: "/admin/dashboard",
};

export const STATUS = {
  ACTIVE: "active",
  INVITED: "invited",
  DISABLED: "disabled",
};
