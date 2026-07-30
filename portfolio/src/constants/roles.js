export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ORG_ADMIN: "org_admin",
  CLINIC_MANAGER: "clinic_manager",
  AGENT: "agent",
  RECEPTIONIST: "receptionist",
  FINANCE: "finance",
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ORG_ADMIN]: "Org Admin",
  [ROLES.CLINIC_MANAGER]: "Clinic Manager",
  [ROLES.AGENT]: "Agent",
  [ROLES.RECEPTIONIST]: "Receptionist",
  [ROLES.FINANCE]: "Finance",
};

// Map post-login/onboarding redirects based on role
export const ROLE_REDIRECTS = {
  [ROLES.SUPER_ADMIN]: "/admin/dashboard",
  [ROLES.ORG_ADMIN]: "/admin/dashboard", // or /org/dashboard based on your existing structure
  [ROLES.CLINIC_MANAGER]: "/manager/dashboard",
  [ROLES.AGENT]: "/admin/dashboard",
  [ROLES.RECEPTIONIST]: "/appointments", // Stub route
  [ROLES.FINANCE]: "/revenue", // Stub route
};

export const STATUS = {
  ACTIVE: "active",
  INVITED: "invited",
  DISABLED: "disabled",
};
