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

  receptionist: [
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
  ],

  finance: [
    PERMISSIONS.VIEW_REVENUE,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.MANAGE_BILLING,
    PERMISSIONS.VIEW_REPORTS,
  ],

  auditor: [
    PERMISSIONS.READ_ONLY,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_REVENUE,
    PERMISSIONS.VIEW_GLOBAL_AUDIT,
    PERMISSIONS.VIEW_REPORTS,
  ],
};

export const hasRolePermission = (roleId, permission) => {
  if (!roleId) return false;
  // Super Admin override — always grant all
  if (roleId === 'super_admin') return true;
  const perms = ROLE_PERMISSIONS[roleId] || [];
  return perms.includes(permission);
};
