/**
 * Platform role constants matching backend User model enum values.
 */
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  CLINIC_MANAGER: "clinic_manager",
  RECEPTION: "reception",
  FINANCE: "finance",
  AGENT: "agent",
};

/**
 * Text labels associated with individual workstation permissions.
 */
export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ADMIN]: "Administrator",
  [ROLES.CLINIC_MANAGER]: "Clinic Manager",
  [ROLES.RECEPTION]: "Receptionist",
  [ROLES.FINANCE]: "Finance Officer",
  [ROLES.AGENT]: "Support Agent",
};

/**
 * Staff-level roles selectable in the Staff Login portal.
 */
export const STAFF_ROLES = [
  { value: ROLES.CLINIC_MANAGER, label: "Clinic Manager" },
  { value: ROLES.RECEPTION, label: "Reception" },
  { value: ROLES.FINANCE, label: "Finance" },
  { value: ROLES.AGENT, label: "Agent" },
];
