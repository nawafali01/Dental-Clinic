/**
 * Mock Data & Definitions for Dashboard Widgets
 * Located in src/data/ for clean separation of UI and mock data.
 */

import {
  Bell,
  Globe,
  Shield,
  Settings,
  User,
  AlertTriangle,
  ShieldCheck,
  Building2,
  TrendingUp,
  Users,
  Activity,
  PhoneCall,
  Clock
} from 'lucide-react';

// --- Leads Widget Data ---
export const MOCK_LEADS = [
  { id: 1, name: 'Sarah Mitchell',    status: 'qualified', source: 'Website',     value: '$2,400', time: '5m ago'  },
  { id: 2, name: 'James Thornton',    status: 'contacted', source: 'Google Ads',  value: '$1,800', time: '18m ago' },
  { id: 3, name: 'Priya Kapoor',      status: 'new',       source: 'Referral',    value: '$3,100', time: '34m ago' },
  { id: 4, name: 'Marcus Lee',        status: 'converted', source: 'Walk-in',     value: '$5,600', time: '1h ago'  },
  { id: 5, name: 'Elena Vasquez',     status: 'proposal',  source: 'AI Voice Bot', value: '$2,950', time: '2h ago' },
];

export const LEAD_STATUS_STYLES = {
  new:       'bg-blue-100   text-blue-700',
  contacted: 'bg-amber-100  text-amber-700',
  qualified: 'bg-purple-100 text-purple-700',
  proposal:  'bg-cyan-100   text-cyan-700',
  converted: 'bg-emerald-100 text-emerald-700',
  lost:      'bg-red-100    text-red-700',
};

// --- Overview Widget Config ---
export const OVERVIEW_STATS_CONFIG = [
  { key: 'orgs',    label: 'Active Organizations', icon: Building2,  color: 'bg-violet-500/10  text-violet-600',  allValue: '12',    scopedValue: '1'     },
  { key: 'clinics', label: 'Total Clinics',        icon: Activity,   color: 'bg-blue-500/10    text-blue-600',    allValue: '48',    scopedValue: '6'     },
  { key: 'users',   label: 'Platform Users',       icon: Users,      color: 'bg-emerald-500/10 text-emerald-600', allValue: '234',   scopedValue: '32'    },
  { key: 'health',  label: 'System Health',        icon: TrendingUp, color: 'bg-amber-500/10   text-amber-600',   allValue: '99.8%', scopedValue: '99.8%' },
];

// --- Leads KPI Config ---
export const LEADS_KPI_CONFIG = [
  { key: 'total',     label: 'Total',     icon: Users,      color: 'bg-blue-500/10   text-blue-600'  },
  { key: 'hot',       label: 'Hot',       icon: TrendingUp, color: 'bg-rose-500/10   text-rose-600'  },
  { key: 'contacted', label: 'Contacted', icon: PhoneCall,  color: 'bg-amber-500/10  text-amber-600' },
  { key: 'pending',   label: 'Pending',   icon: Clock,      color: 'bg-slate-500/10  text-slate-600' },
];

// --- Appointments Widget Data ---
export const MOCK_APPOINTMENTS = [
  { id: 1, patient: 'Sarah Mitchell',  time: '09:00 AM', type: 'Teeth Whitening',   status: 'confirmed', dentist: 'Dr. Patel'    },
  { id: 2, patient: 'James Thornton',  time: '10:30 AM', type: 'Root Canal',         status: 'confirmed', dentist: 'Dr. Okafor'   },
  { id: 3, patient: 'Priya Kapoor',    time: '11:00 AM', type: 'Dental Implant',     status: 'pending',   dentist: 'Dr. Patel'    },
  { id: 4, patient: 'Marcus Lee',      time: '02:00 PM', type: 'Braces Adjustment',  status: 'confirmed', dentist: 'Dr. Reyes'    },
  { id: 5, patient: 'Elena Vasquez',   time: '03:30 PM', type: 'Routine Checkup',    status: 'pending',   dentist: 'Dr. Okafor'   },
];

export const APPOINTMENT_STATUS_STYLES = {
  confirmed: 'bg-emerald-100 text-emerald-700',
  pending:   'bg-amber-100   text-amber-700',
  cancelled: 'bg-red-100     text-red-700',
  completed: 'bg-slate-100   text-slate-600',
};

// --- Revenue Widget Data ---
export const REVENUE_SPARKLINE_DATA = [
  { day: 'Mon', v: 12400 },
  { day: 'Tue', v: 14200 },
  { day: 'Wed', v: 13100 },
  { day: 'Thu', v: 16800 },
  { day: 'Fri', v: 15300 },
  { day: 'Sat', v: 18700 },
  { day: 'Sun', v: 21200 },
];

export const REVENUE_BY_SCOPE = {
  all:                 { total: '$421,800', monthly: '$62,400', change: '+12.4%', positive: true  },
  all_org:             { total: '$186,200', monthly: '$28,100', change: '+8.7%',  positive: true  },
  own_clinic_manage:   { total: '$54,300',  monthly: '$9,200',  change: '+5.2%',  positive: true  },
  own_view:            { total: '$3,800',   monthly: '$1,200',  change: '-2.1%',  positive: false },
  default:             { total: '$54,300',  monthly: '$9,200',  change: '+5.2%',  positive: true  },
};

// --- Users Widget Data ---
export const MOCK_USERS_LIST = [
  { id: 1, name: 'Maria Santos',    role: 'org_admin',      status: 'active',  email: 'maria@apexdental.com'  },
  { id: 2, name: 'David Kim',       role: 'clinic_manager', status: 'active',  email: 'david@apexdental.com'  },
  { id: 3, name: 'Aisha Patel',     role: 'agent',          status: 'active',  email: 'aisha@apexdental.com'  },
  { id: 4, name: 'Tom Reynolds',    role: 'receptionist',   status: 'invited', email: 'tom@apexdental.com'    },
  { id: 5, name: 'Chloe Martin',    role: 'finance',        status: 'active',  email: 'chloe@apexdental.com'  },
];

export const USER_ROLE_BADGES = {
  super_admin:    'bg-purple-100 text-purple-700',
  org_admin:      'bg-blue-100   text-blue-700',
  clinic_manager: 'bg-emerald-100 text-emerald-700',
  agent:          'bg-cyan-100   text-cyan-700',
  receptionist:   'bg-amber-100  text-amber-700',
  finance:        'bg-rose-100   text-rose-700',
};

// --- Reports Widget Data ---
export const ALL_REPORTS_LIST = [
  { id: 'r1', title: 'Platform Revenue Summary',    period: 'Monthly',   scope: 'all',     status: 'ready'    },
  { id: 'r2', title: 'Lead Conversion Analysis',    period: 'Weekly',    scope: 'all_org', status: 'ready'    },
  { id: 'r3', title: 'Clinic Performance Report',   period: 'Monthly',   scope: 'clinic',  status: 'ready'    },
  { id: 'r4', title: 'Appointment Attendance Rate', period: 'Weekly',    scope: 'clinic',  status: 'generating'},
  { id: 'r5', title: 'My Activity Report',          period: 'Weekly',    scope: 'personal',status: 'ready'    },
  { id: 'r6', title: 'Personal Revenue Target',     period: 'Monthly',   scope: 'personal',status: 'ready'    },
];

export const REPORT_STATUS_STYLES = {
  ready:      'bg-emerald-100 text-emerald-700',
  generating: 'bg-amber-100   text-amber-700',
  failed:     'bg-red-100     text-red-700',
};

// --- Audit Logs Widget Data ---
export const MOCK_AUDIT_LOGS = [
  { id: 1, actor: 'admin@system.com',     action: 'create',     resource: 'User invited: david@apexdental.com',      time: '2 min ago',  severity: 'info'    },
  { id: 2, actor: 'maria@apexdental.com', action: 'update',     resource: 'Clinic settings updated: Downtown Dental', time: '18 min ago', severity: 'info'    },
  { id: 3, actor: 'david@apexdental.com', action: 'login',      resource: 'Successful login from 192.168.1.42',        time: '34 min ago', severity: 'info'    },
  { id: 4, actor: 'admin@system.com',     action: 'permission', resource: 'Role changed: tom → clinic_manager',        time: '1 hr ago',   severity: 'warning' },
  { id: 5, actor: 'system',              action: 'delete',      resource: 'Stale session purged (3 tokens)',           time: '2 hr ago',   severity: 'warning' },
];

export const AUDIT_ACTION_ICONS = {
  login:         User,
  logout:        User,
  create:        Globe,
  update:        Globe,
  delete:        AlertTriangle,
  permission:    ShieldCheck,
};

export const AUDIT_ACTION_COLORS = {
  login:      'bg-emerald-500/10 text-emerald-600',
  logout:     'bg-slate-500/10   text-slate-600',
  create:     'bg-blue-500/10    text-blue-600',
  update:     'bg-amber-500/10   text-amber-600',
  delete:     'bg-red-500/10     text-red-600',
  permission: 'bg-purple-500/10  text-purple-600',
};

// --- Settings Widget Data ---
export const ALL_SETTINGS_LIST = [
  { id: 's1', title: 'Notification Preferences', description: 'Email, SMS & push alerts',       icon: Bell,    scope: 'limited', path: '/admin/notifications'    },
  { id: 's2', title: 'Clinic Configuration',     description: 'Hours, staff & services',         icon: Globe,   scope: 'limited', path: '/admin/settings'         },
  { id: 's3', title: 'Organisation Settings',    description: 'Billing, branding & integrations', icon: Globe,   scope: 'org',     path: '/admin/org-settings'     },
  { id: 's4', title: 'User Roles & Permissions', description: 'RBAC & role assignment',           icon: Shield,  scope: 'org',     path: '/admin/users'            },
  { id: 's5', title: 'System Configuration',     description: 'Platform-wide settings',           icon: Settings,scope: 'all',     path: '/admin/settings'         },
  { id: 's6', title: 'AI Automation Rules',      description: 'Trigger logic & schedules',        icon: Shield,  scope: 'all',     path: '/admin/ai-automations'   },
];
