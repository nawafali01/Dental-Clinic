import { ROLES } from './permissions';

/**
 * USER MANAGEMENT CONSTANTS & UI CONFIGURATIONS
 */

export const ROLE_OPTIONS = [
  { value: ROLES.SUPER_ADMIN, label: 'Super Admin (Global Scope)' },
  { value: ROLES.ORG_ADMIN, label: 'Organization Admin (Multi-Clinic)' },
  { value: ROLES.CLINIC_MANAGER, label: 'Clinic Manager' },
  { value: ROLES.AGENT, label: 'AI Operations Agent' },
  { value: ROLES.RECEPTIONIST, label: 'Front Desk / Receptionist' },
  { value: ROLES.FINANCE, label: 'Finance Controller' },
  { value: ROLES.AUDITOR, label: 'External Auditor' },
];

export const ROLE_BADGE_CONFIG = {
  [ROLES.SUPER_ADMIN]: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  [ROLES.ORG_ADMIN]: { label: 'Org Admin', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  [ROLES.CLINIC_MANAGER]: { label: 'Clinic Manager', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  [ROLES.AGENT]: { label: 'AI Agent', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  [ROLES.RECEPTIONIST]: { label: 'Receptionist', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  [ROLES.FINANCE]: { label: 'Finance', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  [ROLES.AUDITOR]: { label: 'Auditor', color: 'bg-slate-100 text-slate-800 border-slate-200' },
};

export const USER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active (Access Granted)' },
  { value: 'inactive', label: 'Inactive / Suspended (Access Revoked)' },
  { value: 'invited', label: 'Invited / Pending Acceptance' },
];

export const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'invited', label: 'Invited / Pending' },
];

export const ROLE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Roles (7 Roles)' },
  { value: ROLES.SUPER_ADMIN, label: 'Super Admin' },
  { value: ROLES.ORG_ADMIN, label: 'Org Admin' },
  { value: ROLES.CLINIC_MANAGER, label: 'Clinic Manager' },
  { value: ROLES.AGENT, label: 'AI Agent' },
  { value: ROLES.RECEPTIONIST, label: 'Receptionist' },
  { value: ROLES.FINANCE, label: 'Finance' },
  { value: ROLES.AUDITOR, label: 'Auditor' },
];

export const DEFAULT_USER_FORM_STATE = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: ROLES.AGENT,
  organizationId: '',
  assignedClinics: [],  // array — maps to backend "assigned_clinics"
  status: 'active',
};
