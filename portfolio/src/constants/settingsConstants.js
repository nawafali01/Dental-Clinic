/**
 * Settings & Operations Workspace Constants
 */

export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (US & Canada) - America/New_York (UTC-5)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada) - America/Chicago (UTC-6)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada) - America/Denver (UTC-7)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada) - America/Los_Angeles (UTC-8)' },
  { value: 'Europe/London', label: 'London, Edinburgh - Europe/London (UTC+0)' },
  { value: 'Europe/Paris', label: 'Paris, Berlin, Rome - Europe/Paris (UTC+1)' },
  { value: 'Asia/Dubai', label: 'Dubai, Abu Dhabi - Asia/Dubai (UTC+4)' },
  { value: 'Asia/Riyadh', label: 'Riyadh - Asia/Riyadh (UTC+3)' },
  { value: 'Asia/Karachi', label: 'Karachi, Islamabad - Asia/Karachi (UTC+5)' },
  { value: 'Asia/Singapore', label: 'Singapore - Asia/Singapore (UTC+8)' },
  { value: 'Australia/Sydney', label: 'Sydney, Melbourne - Australia/Sydney (UTC+10)' },
  { value: 'UTC', label: 'Universal Coordinated Time (UTC)' },
];

export const CURRENCIES = [
  { code: 'USD ($)', symbol: '$', label: 'US Dollar (USD - $)' },
  { code: 'EUR (€)', symbol: '€', label: 'Euro (EUR - €)' },
  { code: 'GBP (£)', symbol: '£', label: 'British Pound (GBP - £)' },
  { code: 'AED (د.إ)', symbol: 'AED', label: 'UAE Dirham (AED - د.إ)' },
  { code: 'CAD ($)', symbol: 'CA$', label: 'Canadian Dollar (CAD - $)' },
  { code: 'AUD ($)', symbol: 'AU$', label: 'Australian Dollar (AUD - $)' },
  { code: 'SAR (﷼)', symbol: 'SAR', label: 'Saudi Riyal (SAR - ﷼)' },
];

export const PRESET_COLORS = [
  { hex: '#1F8A70', name: 'Clinical Teal (Default)' },
  { hex: '#0284C7', name: 'Dental Ocean Blue' },
  { hex: '#4F46E5', name: 'Royal Health Indigo' },
  { hex: '#059669', name: 'Modern Mint Emerald' },
  { hex: '#334155', name: 'Charcoal Minimal' },
  { hex: '#E11D48', name: 'Rose Coral' },
];

export const BADGE_COLOR_OPTIONS = [
  { label: 'Blue', value: 'blue', bg: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'Amber', value: 'amber', bg: 'bg-amber-100 text-amber-700 border-amber-200' },
  { label: 'Purple', value: 'purple', bg: 'bg-purple-100 text-purple-700 border-purple-200' },
  { label: 'Green', value: 'green', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { label: 'Cyan', value: 'cyan', bg: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { label: 'Rose', value: 'rose', bg: 'bg-rose-100 text-rose-700 border-rose-200' },
  { label: 'Slate', value: 'slate', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export const TIMEOUT_OPTIONS = [
  { value: '15', label: '15 Minutes (High Security)' },
  { value: '30', label: '30 Minutes (Recommended)' },
  { value: '60', label: '1 Hour' },
  { value: '240', label: '4 Hours (Clinic Shift)' },
  { value: '480', label: '8 Hours' },
  { value: '1440', label: '24 Hours (Low Security)' },
];

export const MFA_POLICIES = [
  {
    id: 'enforce_all',
    title: 'Enforce for All Team Members',
    desc: 'Mandatory 2FA authentication required for all doctors, managers, and front-desk staff.',
  },
  {
    id: 'enforce_admin',
    title: 'Enforce for Administrators Only',
    desc: 'Required for Super Admins and Org Admins; optional for front-desk operators.',
  },
  {
    id: 'optional',
    title: 'Optional for Everyone',
    desc: 'Staff members may self-enroll in Authenticator App (TOTP) from their profile view.',
  },
];

export const PERMISSION_MATRIX = [
  {
    resource: 'Leads & CRM Funnel',
    superAdmin: 'Full Access',
    orgAdmin: 'Full Access',
    clinicManager: 'Clinic Only',
    receptionist: 'View & Create',
    agent: 'Assigned Only',
  },
  {
    resource: 'Appointments & Calendar',
    superAdmin: 'Full Access',
    orgAdmin: 'Full Access',
    clinicManager: 'Clinic Only',
    receptionist: 'Manage All',
    agent: 'Book Only',
  },
  {
    resource: 'Revenue & Invoicing',
    superAdmin: 'Full Access',
    orgAdmin: 'Full Access',
    clinicManager: 'Clinic Only',
    receptionist: 'Restricted',
    agent: 'Restricted',
  },
  {
    resource: 'AI Copilot & Automations',
    superAdmin: 'Manage & Audit',
    orgAdmin: 'Manage',
    clinicManager: 'View & Prompt',
    receptionist: 'View Only',
    agent: 'Assisted Prompts',
  },
  {
    resource: 'Clinic Configuration',
    superAdmin: 'Full Access',
    orgAdmin: 'Org Scope',
    clinicManager: 'Limited',
    receptionist: 'Restricted',
    agent: 'Restricted',
  },
  {
    resource: 'Security & User Roles',
    superAdmin: 'Full Access',
    orgAdmin: 'Org Users',
    clinicManager: 'Restricted',
    receptionist: 'Restricted',
    agent: 'Restricted',
  },
];
