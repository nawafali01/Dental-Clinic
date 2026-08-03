import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCircle,
  Phone,
  CheckSquare,
  DollarSign,
  CreditCard,
  FileText,
  Building2,
  UserCheck,
  Activity,
  Target,
  Tag,
  Play,
  GitBranch,
  Globe,
  FileInput,
  Link,
  BarChart3,
  Cpu,
  ShieldCheck,
  Settings,
  Bell,
  Zap,
  CalendarCheck,
  Sparkles,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Platform Roles
// ─────────────────────────────────────────────────────────────
export const ROLES = [
  { id: 'super_admin',    label: 'Super Admin',             badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  { id: 'org_admin',      label: 'Org Admin',               badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  { id: 'clinic_manager', label: 'Clinic Manager',          badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { id: 'agent',          label: 'AI Operations Agent',     badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' },
  { id: 'receptionist',   label: 'Front Desk / Reception',  badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  { id: 'finance',        label: 'Finance Controller',      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
];

// ─────────────────────────────────────────────────────────────
// Multi-Clinic Scope
// ─────────────────────────────────────────────────────────────
export const CLINICS_SCOPE = [
  { id: 'all', name: 'All Clinics (System-Wide)' },
  { id: 'c1',  name: 'Downtown Dental Excellence' },
  { id: 'c2',  name: 'Apex Orthodontics & Smiles' },
  { id: 'c3',  name: 'Westside Pediatric & Family' },
  { id: 'c4',  name: 'Metro Cosmetic Care' },
];

// ─────────────────────────────────────────────────────────────
// Super Admin Navigation (Full Access)
// ─────────────────────────────────────────────────────────────
export const SUPER_ADMIN_NAVIGATION = [
  {
    title: 'Core Operations',
    items: [
      { name: 'Dashboard',    path: '/admin/dashboard',    icon: LayoutDashboard },
      { name: 'Leads',        path: '/admin/leads',        icon: Users },
      { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
      { name: 'Patients',     path: '/admin/patients',     icon: UserCircle },
      { name: 'Calls',        path: '/admin/calls',        icon: Phone },
      { name: 'Tasks',        path: '/admin/tasks',        icon: CheckSquare },
    ],
  },
  {
    title: 'Revenue',
    items: [
      { name: 'Revenue',  path: '/admin/revenue',  icon: DollarSign },
      { name: 'Payments', path: '/admin/payments', icon: CreditCard },
      { name: 'Reports',  path: '/admin/reports',  icon: FileText },
    ],
  },
  {
    title: 'Management',
    items: [
      { name: 'Clinics', path: '/admin/clinics', icon: Building2 },
      { name: 'Users',   path: '/admin/users',   icon: UserCheck },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { name: 'Treatments',    path: '/admin/treatments-config', icon: Activity },
      { name: 'Lead Sources',  path: '/admin/lead-sources',      icon: Target },
      { name: 'Lead Statuses', path: '/admin/lead-statuses',     icon: Tag },
    ],
  },
  {
    title: 'AI & Automation',
    items: [
      { name: 'AI Copilot',    path: '/admin/ai-copilot',    icon: Sparkles },
      { name: 'AI Runs',       path: '/admin/ai-runs',       icon: Play },
      { name: 'AI Automations',path: '/admin/ai-automations',icon: GitBranch },
      { name: 'AI Ops',        path: '/admin/ai-ops',        icon: Cpu, badge: 'Active', badgeColor: 'bg-emerald-500/10 text-emerald-600' },
    ],
  },
  {
    title: 'Content & Integrations',
    items: [
      { name: 'Website Content', path: '/admin/website-content', icon: Globe },
      { name: 'Lead Forms',      path: '/admin/lead-forms',      icon: FileInput },
      { name: 'Integrations',    path: '/admin/integrations',    icon: Link },
    ],
  },
  {
    title: 'Platform',
    items: [
      { name: 'Analytics',    path: '/admin/analytics',   icon: BarChart3 },
      { name: 'Audit Logs',   path: '/admin/audit-logs',  icon: ShieldCheck },
      { name: 'Notifications',path: '/admin/notifications',icon: Bell },
      { name: 'Settings',     path: '/admin/settings',    icon: Settings },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Organization Admin Navigation (Org Scope)
// ─────────────────────────────────────────────────────────────
export const ORG_ADMIN_NAVIGATION = [
  {
    title: 'Core Operations',
    items: [
      { name: 'Dashboard',    path: '/admin/dashboard',    icon: LayoutDashboard },
      { name: 'Leads',        path: '/admin/leads',        icon: Users },
      { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
      { name: 'Patients',     path: '/admin/patients',     icon: UserCircle },
      { name: 'Calls',        path: '/admin/calls',        icon: Phone },
      { name: 'Tasks',        path: '/admin/tasks',        icon: CheckSquare },
    ],
  },
  {
    title: 'Revenue',
    items: [
      { name: 'Revenue',  path: '/admin/revenue',  icon: DollarSign },
      { name: 'Payments', path: '/admin/payments', icon: CreditCard },
      { name: 'Reports',  path: '/admin/reports',  icon: FileText },
    ],
  },
  {
    title: 'Management',
    items: [
      { name: 'Clinics', path: '/admin/clinics', icon: Building2 },
      { name: 'Users',   path: '/admin/users',   icon: UserCheck },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { name: 'Treatments',    path: '/admin/treatments-config', icon: Activity },
      { name: 'Lead Sources',  path: '/admin/lead-sources',      icon: Target },
      { name: 'Lead Statuses', path: '/admin/lead-statuses',     icon: Tag },
    ],
  },
  {
    title: 'AI & Automation',
    items: [
      { name: 'AI Copilot',    path: '/admin/ai-copilot',     icon: Sparkles },
      { name: 'AI Runs',       path: '/admin/ai-runs',        icon: Play },
      { name: 'AI Automations',path: '/admin/ai-automations', icon: GitBranch },
    ],
  },
  {
    title: 'Content & Integrations',
    items: [
      { name: 'Website Content', path: '/admin/website-content', icon: Globe },
      { name: 'Lead Forms',      path: '/admin/lead-forms',      icon: FileInput },
      { name: 'Integrations',    path: '/admin/integrations',    icon: Link },
    ],
  },
  {
    title: 'Settings',
    items: [
      { name: 'Notifications',        path: '/admin/notifications', icon: Bell },
      { name: 'Organization Settings',path: '/admin/org-settings',  icon: Settings },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Clinic Manager Navigation (Clinic Scope)
// ─────────────────────────────────────────────────────────────
export const CLINIC_MANAGER_NAVIGATION = [
  {
    title: 'Operations',
    items: [
      { name: 'Dashboard',    path: '/admin/dashboard',    icon: LayoutDashboard },
      { name: 'Leads',        path: '/admin/leads',        icon: Users },
      { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
      { name: 'Patients',     path: '/admin/patients',     icon: UserCircle },
      { name: 'Calls',        path: '/admin/calls',        icon: Phone },
      { name: 'Tasks',        path: '/admin/tasks',        icon: CheckSquare },
    ],
  },
  {
    title: 'Finance',
    items: [
      { name: 'Revenue', path: '/admin/revenue', icon: DollarSign },
      { name: 'Reports', path: '/admin/reports', icon: FileText },
    ],
  },
  {
    title: 'Clinic',
    items: [
      { name: 'Clinics', path: '/admin/clinics', icon: Building2 },
      { name: 'Users',   path: '/admin/users',   icon: UserCheck },
    ],
  },
  {
    title: 'Tools',
    items: [
      { name: 'AI Copilot',   path: '/admin/ai-copilot',   icon: Sparkles },
      { name: 'Notifications',path: '/admin/notifications', icon: Bell },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Navigation Map — keyed by role ID
// ─────────────────────────────────────────────────────────────
export const NAVIGATION_MAP = {
  super_admin:    SUPER_ADMIN_NAVIGATION,
  org_admin:      ORG_ADMIN_NAVIGATION,
  clinic_manager: CLINIC_MANAGER_NAVIGATION,
  agent:          CLINIC_MANAGER_NAVIGATION,
  receptionist:   CLINIC_MANAGER_NAVIGATION,
  finance:        ORG_ADMIN_NAVIGATION,
};

// Backward compatibility alias
export const NAVIGATION_GROUPS = SUPER_ADMIN_NAVIGATION;

// ─────────────────────────────────────────────────────────────
// Command Palette
// ─────────────────────────────────────────────────────────────
export const COMMAND_NAVIGATION_ITEMS = [
  { title: 'Dashboard',          path: '/admin/dashboard',         icon: LayoutDashboard, category: 'Navigation' },
  { title: 'Leads',              path: '/admin/leads',             icon: Users,           category: 'Navigation' },
  { title: 'Appointments',       path: '/admin/appointments',      icon: Calendar,        category: 'Navigation' },
  { title: 'Patients',           path: '/admin/patients',          icon: UserCircle,      category: 'Navigation' },
  { title: 'Calls',              path: '/admin/calls',             icon: Phone,           category: 'Navigation' },
  { title: 'Tasks',              path: '/admin/tasks',             icon: CheckSquare,     category: 'Navigation' },
  { title: 'Revenue',            path: '/admin/revenue',           icon: DollarSign,      category: 'Navigation' },
  { title: 'Payments',           path: '/admin/payments',          icon: CreditCard,      category: 'Navigation' },
  { title: 'Reports',            path: '/admin/reports',           icon: FileText,        category: 'Navigation' },
  { title: 'Clinics',            path: '/admin/clinics',           icon: Building2,       category: 'Navigation' },
  { title: 'Users',              path: '/admin/users',             icon: UserCheck,       category: 'Navigation' },
  { title: 'Treatments Config',  path: '/admin/treatments-config', icon: Activity,        category: 'Navigation' },
  { title: 'AI Copilot',         path: '/admin/ai-copilot',        icon: Sparkles,        category: 'Navigation' },
  { title: 'AI Runs',            path: '/admin/ai-runs',           icon: Play,            category: 'Navigation' },
  { title: 'AI Automations',     path: '/admin/ai-automations',    icon: GitBranch,       category: 'Navigation' },
  { title: 'AI Ops',             path: '/admin/ai-ops',            icon: Cpu,             category: 'Navigation' },
  { title: 'Website Content',    path: '/admin/website-content',   icon: Globe,           category: 'Navigation' },
  { title: 'Lead Forms',         path: '/admin/lead-forms',        icon: FileInput,       category: 'Navigation' },
  { title: 'Integrations',       path: '/admin/integrations',      icon: Link,            category: 'Navigation' },
  { title: 'Analytics',          path: '/admin/analytics',         icon: BarChart3,       category: 'Navigation' },
  { title: 'Audit Logs',         path: '/admin/audit-logs',        icon: ShieldCheck,     category: 'Navigation' },
  { title: 'Notifications',      path: '/admin/notifications',     icon: Bell,            category: 'Navigation' },
  { title: 'Settings',           path: '/admin/settings',          icon: Settings,        category: 'Navigation' },
];

export const COMMAND_QUICK_ACTIONS = [
  { title: 'Trigger AI Emergency Kill Switch', action: 'kill_switch', icon: Zap,       category: 'Quick Action', path: '/admin/ai-ops' },
  { title: 'Export Lead Conversion Report',    action: 'export',      icon: BarChart3, category: 'Quick Action', path: '/admin/analytics' },
  { title: 'Add New Dental Clinic Branch',     action: 'add_clinic',  icon: Building2, category: 'Quick Action', path: '/admin/clinics' },
  { title: 'Create Super Admin User',          action: 'add_user',    icon: UserCheck, category: 'Quick Action', path: '/admin/users' },
];

// ─────────────────────────────────────────────────────────────
// Route Name Map
// ─────────────────────────────────────────────────────────────
export const ROUTE_NAME_MAP = {
  admin:               'Dashboard',
  dashboard:           'Dashboard Overview',
  leads:               'Leads',
  appointments:        'Appointments',
  patients:            'Patients',
  calls:               'Calls',
  tasks:               'Tasks',
  revenue:             'Revenue',
  payments:            'Payments',
  reports:             'Reports',
  clinics:             'Clinic Management',
  users:               'Users',
  'treatments-config': 'Treatments Configuration',
  'lead-sources':      'Lead Sources',
  'lead-statuses':     'Lead Statuses',
  'ai-copilot':        'AI Copilot',
  'ai-runs':           'AI Runs',
  'ai-automations':    'AI Automations',
  'ai-ops':            'AI Operations',
  'website-content':   'Website Content',
  'lead-forms':        'Lead Forms',
  integrations:        'Integrations',
  analytics:           'Analytics Suite',
  'audit-logs':        'Audit Logs',
  notifications:       'Notifications',
  settings:            'System Settings',
  'org-settings':      'Organization Settings',
  profile:             'My Profile',
};
