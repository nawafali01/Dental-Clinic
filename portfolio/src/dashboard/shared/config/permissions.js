// ─────────────────────────────────────────────────────────────
// Permissions Definition — All dashboard permissions in one place
// ─────────────────────────────────────────────────────────────
export const PERMISSIONS = {
  // ── Platform Governance (Super Admin only) ──────────────────
  MANAGE_MULTI_TENANT:    'manage_multi_tenant',
  VIEW_AI_GOVERNANCE:     'view_ai_governance',
  VIEW_GLOBAL_AUDIT:      'view_global_audit',
  SWITCH_ORGANIZATION:    'switch_organization',
  MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',

  // ── User Management ─────────────────────────────────────────
  INVITE_USER:   'invite_user',
  DISABLE_USER:  'disable_user',
  MANAGE_ROLES:  'manage_roles',
  VIEW_USERS:    'view_users',

  // ── Clinics & Organizations ──────────────────────────────────
  VIEW_CLINICS:  'view_clinics',
  MANAGE_CLINICS:'manage_clinics',
  MANAGE_ORGS:   'manage_orgs',

  // ── CRM & Operations ────────────────────────────────────────
  VIEW_LEADS:          'view_leads',
  MANAGE_LEADS:        'manage_leads',
  VIEW_APPOINTMENTS:   'view_appointments',
  MANAGE_APPOINTMENTS: 'manage_appointments',
  VIEW_PATIENTS:       'view_patients',
  VIEW_CALLS:          'view_calls',
  VIEW_TASKS:          'view_tasks',

  // ── Financial ────────────────────────────────────────────────
  VIEW_REVENUE:  'view_revenue',
  VIEW_PAYMENTS: 'view_payments',
  MANAGE_BILLING:'manage_billing',
  VIEW_REPORTS:  'view_reports',

  // ── Configuration (SA + OA) ──────────────────────────────────
  MANAGE_TREATMENTS:    'manage_treatments',
  MANAGE_LEAD_SOURCES:  'manage_lead_sources',
  MANAGE_LEAD_STATUSES: 'manage_lead_statuses',

  // ── AI & Automation ──────────────────────────────────────────
  VIEW_AI_COPILOT:       'view_ai_copilot',
  MANAGE_AI_RUNS:        'manage_ai_runs',
  MANAGE_AI_AUTOMATIONS: 'manage_ai_automations',

  // ── Content & Integrations ────────────────────────────────────
  MANAGE_WEBSITE_CONTENT: 'manage_website_content',
  MANAGE_LEAD_FORMS:      'manage_lead_forms',
  MANAGE_INTEGRATIONS:    'manage_integrations',

  // ── Notifications ─────────────────────────────────────────────
  VIEW_NOTIFICATIONS: 'view_notifications',

  // ── Global ────────────────────────────────────────────────────
  READ_ONLY: 'read_only',
};

// ─────────────────────────────────────────────────────────────
// Role Permission Mappings
// ─────────────────────────────────────────────────────────────
const ALL = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS = {
  super_admin: ALL,

  org_admin: [
    PERMISSIONS.INVITE_USER,
    PERMISSIONS.DISABLE_USER,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_CLINICS,
    PERMISSIONS.MANAGE_CLINICS,
    PERMISSIONS.MANAGE_ORGS,
    PERMISSIONS.VIEW_LEADS,
    PERMISSIONS.MANAGE_LEADS,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.VIEW_CALLS,
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.VIEW_REVENUE,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.MANAGE_BILLING,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_TREATMENTS,
    PERMISSIONS.MANAGE_LEAD_SOURCES,
    PERMISSIONS.MANAGE_LEAD_STATUSES,
    PERMISSIONS.VIEW_AI_COPILOT,
    PERMISSIONS.MANAGE_AI_RUNS,
    PERMISSIONS.MANAGE_AI_AUTOMATIONS,
    PERMISSIONS.MANAGE_WEBSITE_CONTENT,
    PERMISSIONS.MANAGE_LEAD_FORMS,
    PERMISSIONS.MANAGE_INTEGRATIONS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.SWITCH_ORGANIZATION,
  ],

  clinic_manager: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_CLINICS,
    PERMISSIONS.VIEW_LEADS,
    PERMISSIONS.MANAGE_LEADS,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.VIEW_CALLS,
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.VIEW_REVENUE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_AI_COPILOT,
    PERMISSIONS.VIEW_NOTIFICATIONS,
  ],

  agent: [
    PERMISSIONS.VIEW_LEADS,
    PERMISSIONS.MANAGE_LEADS,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.VIEW_CALLS,
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
  ],

  // ── Receptionist — front-desk operations only ────────────────
  receptionist: [
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
  ],

  // ── Finance — financial data, read-only on appointments ──────
  finance: [
    PERMISSIONS.VIEW_APPOINTMENTS, // read-only (no MANAGE_APPOINTMENTS)
    PERMISSIONS.VIEW_REVENUE,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.MANAGE_BILLING,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
  ],

  // ── Auditor — read-only across the board ─────────────────────
  auditor: [
    PERMISSIONS.READ_ONLY,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_CLINICS,
    PERMISSIONS.VIEW_LEADS,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.VIEW_CALLS,
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.VIEW_REVENUE,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.VIEW_GLOBAL_AUDIT,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
  ],
};

export const hasRolePermission = (roleId, permission) => {
  if (!roleId) return false;
  // Super Admin override — always grant all
  if (roleId === 'super_admin') return true;
  const perms = ROLE_PERMISSIONS[roleId] || [];
  return perms.includes(permission);
};

// ─────────────────────────────────────────────────────────────
// Resource-Based Permissions Matrix
// Used by <CanView permission="resource"> for dashboard widgets.
//
// Access levels:
//   all              – full CRUD across the platform
//   own              – own record / own organisation
//   manage           – full CRUD within scope
//   own_clinic       – read/write within assigned clinic
//   own_clinic_manage– manage within assigned clinic
//   view             – read-only access
//   all_org          – full access within own organisation
//   org_scope        – read within organisation scope
//   org              – configure own organisation
//   assigned_only    – only records assigned to the user
//   assigned_manage  – manage records assigned to the user
//   own_view         – view own records only
//   clinic_team      – manage clinic team members
//   manage_org       – manage users within own organisation
//   clinic           – clinic-level reports
//   personal         – personal reports only
//   limited          – limited settings access
//   self             – own profile only
//   none             – no access
// ─────────────────────────────────────────────────────────────
export const RESOURCE_ACCESS = {
  ALL:                'all',
  OWN:                'own',
  MANAGE:             'manage',
  OWN_CLINIC:         'own_clinic',
  OWN_CLINIC_MANAGE:  'own_clinic_manage',
  VIEW:               'view',
  ALL_ORG:            'all_org',
  ORG_SCOPE:          'org_scope',
  ORG:                'org',
  ASSIGNED_ONLY:      'assigned_only',
  ASSIGNED_MANAGE:    'assigned_manage',
  OWN_VIEW:           'own_view',
  CLINIC_TEAM:        'clinic_team',
  MANAGE_ORG:         'manage_org',
  CLINIC:             'clinic',
  PERSONAL:           'personal',
  LIMITED:            'limited',
  SELF:               'self',
  NONE:               'none',
};

/**
 * RESOURCE_PERMISSIONS
 * Maps every resource name to the access level each role has.
 * This is the single source of truth consumed by <CanView>.
 * Keys match the `permission` prop passed to <CanView>.
 */
export const RESOURCE_PERMISSIONS = {
  organizations: {
    super_admin:    RESOURCE_ACCESS.ALL,
    org_admin:      RESOURCE_ACCESS.OWN,
    clinic_manager: RESOURCE_ACCESS.VIEW,
    agent:          RESOURCE_ACCESS.NONE,
    receptionist:   RESOURCE_ACCESS.NONE,
    finance:        RESOURCE_ACCESS.VIEW,
    auditor:        RESOURCE_ACCESS.VIEW,
  },
  clinics: {
    super_admin:    RESOURCE_ACCESS.ALL,
    org_admin:      RESOURCE_ACCESS.MANAGE,
    clinic_manager: RESOURCE_ACCESS.OWN_CLINIC,
    agent:          RESOURCE_ACCESS.VIEW,
    receptionist:   RESOURCE_ACCESS.VIEW,
    finance:        RESOURCE_ACCESS.VIEW,
    auditor:        RESOURCE_ACCESS.VIEW,
  },
  leads: {
    super_admin:    RESOURCE_ACCESS.ALL,
    org_admin:      RESOURCE_ACCESS.ALL_ORG,
    clinic_manager: RESOURCE_ACCESS.OWN_CLINIC,
    agent:          RESOURCE_ACCESS.ASSIGNED_ONLY,
    receptionist:   RESOURCE_ACCESS.NONE,
    finance:        RESOURCE_ACCESS.NONE,
    auditor:        RESOURCE_ACCESS.VIEW,
  },
  appointments: {
    super_admin:    RESOURCE_ACCESS.ALL,
    org_admin:      RESOURCE_ACCESS.ALL_ORG,
    clinic_manager: RESOURCE_ACCESS.OWN_CLINIC_MANAGE,
    agent:          RESOURCE_ACCESS.ASSIGNED_MANAGE,
    receptionist:   RESOURCE_ACCESS.MANAGE,
    finance:        RESOURCE_ACCESS.VIEW,   // read-only for finance
    auditor:        RESOURCE_ACCESS.VIEW,
  },
  revenue: {
    super_admin:    RESOURCE_ACCESS.ALL,
    org_admin:      RESOURCE_ACCESS.ALL_ORG,
    clinic_manager: RESOURCE_ACCESS.OWN_CLINIC_MANAGE,
    agent:          RESOURCE_ACCESS.OWN_VIEW,
    receptionist:   RESOURCE_ACCESS.NONE,
    finance:        RESOURCE_ACCESS.ALL_ORG,
    auditor:        RESOURCE_ACCESS.VIEW,
  },
  payments: {
    super_admin:    RESOURCE_ACCESS.ALL,
    org_admin:      RESOURCE_ACCESS.ALL_ORG,
    clinic_manager: RESOURCE_ACCESS.OWN_CLINIC,
    agent:          RESOURCE_ACCESS.NONE,
    receptionist:   RESOURCE_ACCESS.NONE,
    finance:        RESOURCE_ACCESS.ALL_ORG,
    auditor:        RESOURCE_ACCESS.VIEW,
  },
  users: {
    super_admin:    RESOURCE_ACCESS.ALL,
    org_admin:      RESOURCE_ACCESS.MANAGE_ORG,
    clinic_manager: RESOURCE_ACCESS.CLINIC_TEAM,
    agent:          RESOURCE_ACCESS.SELF,
    receptionist:   RESOURCE_ACCESS.NONE,
    finance:        RESOURCE_ACCESS.NONE,
    auditor:        RESOURCE_ACCESS.VIEW,
  },
  reports: {
    super_admin:    RESOURCE_ACCESS.ALL,
    org_admin:      RESOURCE_ACCESS.ALL_ORG,
    clinic_manager: RESOURCE_ACCESS.CLINIC,
    agent:          RESOURCE_ACCESS.PERSONAL,
    receptionist:   RESOURCE_ACCESS.NONE,
    finance:        RESOURCE_ACCESS.ALL_ORG,
    auditor:        RESOURCE_ACCESS.VIEW,
  },
  audit_logs: {
    super_admin:    RESOURCE_ACCESS.ALL,
    org_admin:      RESOURCE_ACCESS.ORG_SCOPE,
    clinic_manager: RESOURCE_ACCESS.NONE,
    agent:          RESOURCE_ACCESS.NONE,
    receptionist:   RESOURCE_ACCESS.NONE,
    finance:        RESOURCE_ACCESS.NONE,
    auditor:        RESOURCE_ACCESS.ALL,
  },
  settings: {
    super_admin:    RESOURCE_ACCESS.ALL,
    org_admin:      RESOURCE_ACCESS.ORG,
    clinic_manager: RESOURCE_ACCESS.LIMITED,
    agent:          RESOURCE_ACCESS.NONE,
    receptionist:   RESOURCE_ACCESS.NONE,
    finance:        RESOURCE_ACCESS.NONE,
    auditor:        RESOURCE_ACCESS.NONE,
  },
};

/**
 * hasResourcePermission
 * Returns true if the role has any non-'none' access to the resource.
 */
export const hasResourcePermission = (roleId, resource) => {
  if (!roleId || !resource) return false;
  if (roleId === 'super_admin') return true;

  const resourceMap = RESOURCE_PERMISSIONS[resource];
  if (!resourceMap) return false;

  const level = resourceMap[roleId];
  return Boolean(level) && level !== RESOURCE_ACCESS.NONE;
};

/**
 * getResourceAccess
 * Returns the precise access level string for a role/resource pair.
 */
export const getResourceAccess = (roleId, resource) => {
  if (!roleId || !resource) return RESOURCE_ACCESS.NONE;
  if (roleId === 'super_admin') return RESOURCE_ACCESS.ALL;

  const resourceMap = RESOURCE_PERMISSIONS[resource];
  if (!resourceMap) return RESOURCE_ACCESS.NONE;

  return resourceMap[roleId] || RESOURCE_ACCESS.NONE;
};

// ─────────────────────────────────────────────────────────────
// ACTION-LEVEL PERMISSIONS
//
// Defines which roles can perform each CRUD / workflow action on
// each resource. This is the source of truth for:
//   • usePermission() hook  (canCreate, canEdit, canDelete, …)
//   • PermissionGuard component
//
// Adding a new role: add its id to the arrays for each action.
// Adding a new resource: add a new key with the full action map.
//
// Note: super_admin is granted everything via the canDoAction()
// short-circuit below — it does not need to appear in these arrays.
// ─────────────────────────────────────────────────────────────
export const ACTION_PERMISSIONS = {
  leads: {
    view:    ['org_admin', 'clinic_manager', 'agent', 'auditor'],
    create:  ['org_admin', 'clinic_manager', 'agent'],
    edit:    ['org_admin', 'clinic_manager', 'agent'],
    delete:  ['org_admin', 'clinic_manager'],
    approve: ['org_admin', 'clinic_manager'],
    assign:  ['org_admin', 'clinic_manager'],
    export:  ['org_admin', 'clinic_manager'],
    import:  ['org_admin'],
  },
  appointments: {
    view:    ['org_admin', 'clinic_manager', 'agent', 'receptionist', 'finance', 'auditor'],
    create:  ['org_admin', 'clinic_manager', 'agent', 'receptionist'],
    edit:    ['org_admin', 'clinic_manager', 'agent', 'receptionist'],
    delete:  ['org_admin', 'clinic_manager'],
    approve: ['org_admin', 'clinic_manager'],
    assign:  ['org_admin', 'clinic_manager'],
    export:  ['org_admin', 'clinic_manager', 'finance'],
    import:  ['org_admin'],
  },
  patients: {
    view:    ['org_admin', 'clinic_manager', 'agent', 'receptionist', 'auditor'],
    create:  ['org_admin', 'clinic_manager', 'agent', 'receptionist'],
    edit:    ['org_admin', 'clinic_manager', 'agent', 'receptionist'],
    delete:  ['org_admin', 'clinic_manager'],
    export:  ['org_admin', 'clinic_manager'],
    import:  ['org_admin'],
  },
  revenue: {
    view:    ['org_admin', 'clinic_manager', 'finance', 'auditor'],
    export:  ['org_admin', 'clinic_manager', 'finance'],
  },
  payments: {
    view:    ['org_admin', 'clinic_manager', 'finance', 'auditor'],
    create:  ['org_admin', 'clinic_manager', 'finance'],
    edit:    ['org_admin', 'clinic_manager'],
    delete:  ['org_admin'],
    export:  ['org_admin', 'clinic_manager', 'finance'],
  },
  reports: {
    view:    ['org_admin', 'clinic_manager', 'finance', 'auditor'],
    export:  ['org_admin', 'clinic_manager', 'finance'],
  },
  users: {
    view:    ['org_admin', 'clinic_manager', 'auditor'],
    create:  ['org_admin'],
    edit:    ['org_admin', 'clinic_manager'],
    delete:  ['org_admin'],
    assign:  ['org_admin', 'clinic_manager'],
  },
  calls: {
    view:    ['org_admin', 'clinic_manager', 'agent', 'auditor'],
    create:  ['org_admin', 'clinic_manager', 'agent'],
    edit:    ['org_admin', 'clinic_manager', 'agent'],
    delete:  ['org_admin', 'clinic_manager'],
  },
  tasks: {
    view:    ['org_admin', 'clinic_manager', 'agent', 'auditor'],
    create:  ['org_admin', 'clinic_manager', 'agent'],
    edit:    ['org_admin', 'clinic_manager', 'agent'],
    delete:  ['org_admin', 'clinic_manager', 'agent'],
    assign:  ['org_admin', 'clinic_manager'],
  },
  clinics: {
    view:    ['org_admin', 'clinic_manager', 'receptionist', 'finance', 'auditor'],
    create:  ['org_admin'],
    edit:    ['org_admin'],
    delete:  [],
  },
  patient_checkin: {
    view:     ['org_admin', 'clinic_manager', 'receptionist'],
    checkin:  ['org_admin', 'clinic_manager', 'receptionist'],
    checkout: ['org_admin', 'clinic_manager', 'receptionist'],
  },
  settings: {
    view:  ['org_admin', 'clinic_manager'],
    edit:  ['org_admin'],
  },
  ai_automations: {
    view:   ['org_admin', 'clinic_manager'],
    create: ['org_admin'],
    edit:   ['org_admin'],
    delete: ['org_admin'],
  },
};

/**
 * canDoAction
 *
 * The canonical way to check if a role can perform an action on a resource.
 * Used internally by usePermission() and PermissionGuard.
 *
 * @param {string} roleId   - e.g. 'receptionist'
 * @param {string} resource - e.g. 'appointments'
 * @param {string} action   - e.g. 'create'
 * @returns {boolean}
 */
export const canDoAction = (roleId, resource, action) => {
  if (!roleId || !resource || !action) return false;
  // Super Admin always has full access
  if (roleId === 'super_admin') return true;

  const resourceActions = ACTION_PERMISSIONS[resource];
  if (!resourceActions) return false;

  const allowedRoles = resourceActions[action] || [];
  return allowedRoles.includes(roleId);
};

// ─────────────────────────────────────────────────────────────
// Multi-Clinic Access
// Only roles in this list can use the ClinicSwitcher and change
// the active branch scope. All others are locked to their assigned clinic.
// ─────────────────────────────────────────────────────────────
export const MULTI_CLINIC_ROLES = ['super_admin', 'org_admin'];

// ─────────────────────────────────────────────────────────────
// DATA SCOPING (Row-Level Access Control)
// Defines the data visibility scope per resource for each role.
// Used by scopeData() utility to filter mock datasets before rendering.
// ─────────────────────────────────────────────────────────────
export const SCOPE_TYPES = {
  GLOBAL:       'global',       // All records across all orgs & clinics (super_admin)
  ORGANIZATION: 'organization', // Records matching currentUser.organizationId (org_admin)
  CLINIC:       'clinic',       // Records matching active selectedClinicId or currentUser.clinicId (clinic_manager, receptionist, finance)
  ASSIGNEE:     'assignee',     // Records assigned to currentUser.id (agent)
  APPROVED:     'approved',     // Records approved / not draft for auditing (auditor)
  NONE:         'none',         // No access
};

export const RESOURCE_SCOPES = {
  leads: {
    super_admin:    SCOPE_TYPES.GLOBAL,
    org_admin:      SCOPE_TYPES.ORGANIZATION,
    clinic_manager: SCOPE_TYPES.CLINIC,
    agent:          SCOPE_TYPES.ASSIGNEE,
    receptionist:   SCOPE_TYPES.NONE,
    finance:        SCOPE_TYPES.NONE,
    auditor:        SCOPE_TYPES.APPROVED,
  },
  appointments: {
    super_admin:    SCOPE_TYPES.GLOBAL,
    org_admin:      SCOPE_TYPES.ORGANIZATION,
    clinic_manager: SCOPE_TYPES.CLINIC,
    agent:          SCOPE_TYPES.ASSIGNEE,
    receptionist:   SCOPE_TYPES.CLINIC,
    finance:        SCOPE_TYPES.CLINIC,
    auditor:        SCOPE_TYPES.APPROVED,
  },
  patients: {
    super_admin:    SCOPE_TYPES.GLOBAL,
    org_admin:      SCOPE_TYPES.ORGANIZATION,
    clinic_manager: SCOPE_TYPES.CLINIC,
    agent:          SCOPE_TYPES.CLINIC,
    receptionist:   SCOPE_TYPES.CLINIC,
    finance:        SCOPE_TYPES.NONE,
    auditor:        SCOPE_TYPES.APPROVED,
  },
  calls: {
    super_admin:    SCOPE_TYPES.GLOBAL,
    org_admin:      SCOPE_TYPES.ORGANIZATION,
    clinic_manager: SCOPE_TYPES.CLINIC,
    agent:          SCOPE_TYPES.ASSIGNEE,
    receptionist:   SCOPE_TYPES.NONE,
    finance:        SCOPE_TYPES.NONE,
    auditor:        SCOPE_TYPES.APPROVED,
  },
  tasks: {
    super_admin:    SCOPE_TYPES.GLOBAL,
    org_admin:      SCOPE_TYPES.ORGANIZATION,
    clinic_manager: SCOPE_TYPES.CLINIC,
    agent:          SCOPE_TYPES.ASSIGNEE,
    receptionist:   SCOPE_TYPES.NONE,
    finance:        SCOPE_TYPES.NONE,
    auditor:        SCOPE_TYPES.APPROVED,
  },
  revenue: {
    super_admin:    SCOPE_TYPES.GLOBAL,
    org_admin:      SCOPE_TYPES.ORGANIZATION,
    clinic_manager: SCOPE_TYPES.CLINIC,
    agent:          SCOPE_TYPES.NONE,
    receptionist:   SCOPE_TYPES.NONE,
    finance:        SCOPE_TYPES.ORGANIZATION,
    auditor:        SCOPE_TYPES.APPROVED,
  },
  payments: {
    super_admin:    SCOPE_TYPES.GLOBAL,
    org_admin:      SCOPE_TYPES.ORGANIZATION,
    clinic_manager: SCOPE_TYPES.CLINIC,
    agent:          SCOPE_TYPES.NONE,
    receptionist:   SCOPE_TYPES.NONE,
    finance:        SCOPE_TYPES.ORGANIZATION,
    auditor:        SCOPE_TYPES.APPROVED,
  },
  reports: {
    super_admin:    SCOPE_TYPES.GLOBAL,
    org_admin:      SCOPE_TYPES.ORGANIZATION,
    clinic_manager: SCOPE_TYPES.CLINIC,
    agent:          SCOPE_TYPES.ASSIGNEE,
    receptionist:   SCOPE_TYPES.NONE,
    finance:        SCOPE_TYPES.ORGANIZATION,
    auditor:        SCOPE_TYPES.APPROVED,
  },
  users: {
    super_admin:    SCOPE_TYPES.GLOBAL,
    org_admin:      SCOPE_TYPES.ORGANIZATION,
    clinic_manager: SCOPE_TYPES.CLINIC,
    agent:          SCOPE_TYPES.NONE,
    receptionist:   SCOPE_TYPES.NONE,
    finance:        SCOPE_TYPES.NONE,
    auditor:        SCOPE_TYPES.APPROVED,
  },
  clinics: {
    super_admin:    SCOPE_TYPES.GLOBAL,
    org_admin:      SCOPE_TYPES.ORGANIZATION,
    clinic_manager: SCOPE_TYPES.CLINIC,
    agent:          SCOPE_TYPES.CLINIC,
    receptionist:   SCOPE_TYPES.CLINIC,
    finance:        SCOPE_TYPES.CLINIC,
    auditor:        SCOPE_TYPES.APPROVED,
  },
};

/**
 * getResourceScope
 * Returns the scope type string for a role/resource pair.
 */
export const getResourceScope = (roleId, resource) => {
  if (!roleId || !resource) return SCOPE_TYPES.NONE;
  if (roleId === 'super_admin') return SCOPE_TYPES.GLOBAL;
  const resMap = RESOURCE_SCOPES[resource];
  if (!resMap) return SCOPE_TYPES.NONE;
  return resMap[roleId] || SCOPE_TYPES.NONE;
};

