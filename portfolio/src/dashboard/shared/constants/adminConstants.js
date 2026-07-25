import {
  LayoutDashboard,
  BarChart3,
  Users,
  Building2,
  UserCheck,
  Cpu,
  DollarSign,
  ShieldCheck,
  Settings,
  Zap,
} from 'lucide-react';

// Platform Roles Constant Data
export const ROLES = [
  { id: 'super_admin', label: 'Super Admin', badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  { id: 'org_admin', label: 'Org Admin', badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  { id: 'clinic_manager', label: 'Clinic Manager', badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { id: 'agent', label: 'AI Operations Agent', badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' },
  { id: 'receptionist', label: 'Front Desk / Reception', badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  { id: 'finance', label: 'Finance Controller', badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
];

// Multi-Clinic Scope Constant Data
export const CLINICS_SCOPE = [
  { id: 'all', name: 'All Clinics (System-Wide)' },
  { id: 'c1', name: 'Downtown Dental Excellence' },
  { id: 'c2', name: 'Apex Orthodontics & Smiles' },
  { id: 'c3', name: 'Westside Pediatric & Family' },
  { id: 'c4', name: 'Metro Cosmetic Care' },
];

// Sidebar Navigation Groups Constant Data
export const NAVIGATION_GROUPS = [
  {
    title: 'Core Platform',
    items: [
      { name: 'Dashboard Overview', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Analytics Suite', path: '/admin/analytics', icon: BarChart3 },
      { name: 'Lead Pipeline (CRM)', path: '/admin/pipeline', icon: Users, badge: 'Live' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { name: 'Clinic Management', path: '/admin/clinics', icon: Building2 },
      { name: 'User & Access Control', path: '/admin/users', icon: UserCheck },
      { name: 'AI Operations & Kill Switch', path: '/admin/ai-ops', icon: Cpu, badge: 'Active', badgeColor: 'bg-emerald-500/10 text-emerald-500' },
    ],
  },
  {
    title: 'Governance & Config',
    items: [
      { name: 'Revenue & Financials', path: '/admin/revenue', icon: DollarSign },
      { name: 'Audit Logs & Compliance', path: '/admin/audit-logs', icon: ShieldCheck },
      { name: 'Settings & Integrations', path: '/admin/settings', icon: Settings },
    ],
  },
];

// Command Palette Navigation & Quick Actions Constant Data
export const COMMAND_NAVIGATION_ITEMS = [
  { title: 'Dashboard Overview', path: '/admin/dashboard', icon: LayoutDashboard, category: 'Navigation' },
  { title: 'Analytics & Funnels', path: '/admin/analytics', icon: BarChart3, category: 'Navigation' },
  { title: 'Lead Pipeline (CRM)', path: '/admin/pipeline', icon: Users, category: 'Navigation' },
  { title: 'Clinic Management', path: '/admin/clinics', icon: Building2, category: 'Navigation' },
  { title: 'User Management & Roles', path: '/admin/users', icon: UserCheck, category: 'Navigation' },
  { title: 'AI Operations & Kill Switch', path: '/admin/ai-ops', icon: Cpu, category: 'Navigation' },
  { title: 'Revenue & Financials', path: '/admin/revenue', icon: DollarSign, category: 'Navigation' },
  { title: 'Audit Logs & Compliance', path: '/admin/audit-logs', icon: ShieldCheck, category: 'Navigation' },
  { title: 'Settings & Integrations', path: '/admin/settings', icon: Settings, category: 'Navigation' },
];

export const COMMAND_QUICK_ACTIONS = [
  { title: 'Trigger AI Emergency Kill Switch', action: 'kill_switch', icon: Zap, category: 'Quick Action', path: '/admin/ai-ops' },
  { title: 'Export Lead Conversion Report', action: 'export', icon: BarChart3, category: 'Quick Action', path: '/admin/analytics' },
  { title: 'Add New Dental Clinic Branch', action: 'add_clinic', icon: Building2, category: 'Quick Action', path: '/admin/clinics' },
  { title: 'Create Super Admin User', action: 'add_user', icon: UserCheck, category: 'Quick Action', path: '/admin/users' },
];

// Route Name Mapping Constant Data
export const ROUTE_NAME_MAP = {
  admin: 'Super Admin',
  dashboard: 'Dashboard Overview',
  analytics: 'Analytics & Performance',
  pipeline: 'Lead Pipeline (CRM)',
  clinics: 'Clinic Management',
  users: 'User & Access Control',
  'ai-ops': 'AI Operations & Monitoring',
  revenue: 'Revenue & Financials',
  'audit-logs': 'Audit Logs & Compliance',
  settings: 'Settings & Integrations',
};
