import React, { lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import CanView from '../components/auth/CanView';
import { getGreeting } from '../utils/dashboardUtils';

// ── Existing sub-views (preserved — not replaced) ────────────
// Super Admin and Org Admin continue to use their fully-featured overview.
import DashboardOverviewView from './super-admin/views/DashboardOverviewView';

// Agent view lazy-loaded to avoid bloating other roles' bundles
const AgentDashboardView = lazy(() =>
  import('../features/agent/views/AgentDashboardView')
);

// ── Shared Dashboard Widgets ──────────────────────────────────
// Each widget is wrapped with <CanView permission="..."> in the
// RoleBasedDashboard below. No role === "..." inside any widget.
import OverviewWidget     from './widgets/OverviewWidget';
import LeadsWidget        from './widgets/LeadsWidget';
import AppointmentsWidget from './widgets/AppointmentsWidget';
import RevenueWidget      from './widgets/RevenueWidget';
import UsersWidget        from './widgets/UsersWidget';
import ReportsWidget      from './widgets/ReportsWidget';
import AuditLogsWidget    from './widgets/AuditLogsWidget';
import SettingsWidget     from './widgets/SettingsWidget';

// ── Utility wrappers ─────────────────────────────────────────

/**
 * DashboardSuspense
 * Wraps lazy-loaded views with a lightweight loading fallback.
 */
const DashboardSuspense = ({ children }) => (
  <Suspense
    fallback={
      <div className="p-8 flex items-center justify-center text-slate-400 text-sm">
        Loading…
      </div>
    }
  >
    {children}
  </Suspense>
);

/**
 * RoleBasedDashboard
 * ─────────────────────────────────────────────────────────────
 * The shared, unified dashboard page for all roles that do not
 * have a dedicated bespoke view (clinic_manager, receptionist,
 * finance, auditor, and future roles).
 *
 * Authorization logic is fully centralised:
 *   • Each widget is gated by <CanView permission="resource">
 *   • CanView reads the current user's role from AuthContext
 *   • It checks against RESOURCE_PERMISSIONS in permissions.js
 *   • No raw role === "..." comparisons exist here or in widgets
 *
 * Adding a new role:
 *   1. Add its resource access levels to RESOURCE_PERMISSIONS
 *   2. No changes needed here or in any widget
 *
 * Connecting a real backend later:
 *   1. Update auth.service.js — nothing else changes
 */
const RoleBasedDashboard = ({ user }) => {
  const greeting = getGreeting();
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Here's a summary of what's happening in your workspace today.
            </p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize border border-slate-200">
            {user?.role?.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/*
        ── Widget Grid ────────────────────────────────────────────
        Every section is gated by <CanView permission="resource">.
        Widgets are invisible to roles that have 'none' access to
        that resource — no additional logic needed anywhere.
        ──────────────────────────────────────────────────────────
      */}

      {/* Row 1: Overview + Revenue (top-level summaries) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CanView permission="organizations">
          <OverviewWidget />
        </CanView>
        <CanView permission="revenue">
          <RevenueWidget />
        </CanView>
      </div>

      {/* Row 2: Leads + Appointments (operational) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CanView permission="leads">
          <LeadsWidget />
        </CanView>
        <CanView permission="appointments">
          <AppointmentsWidget />
        </CanView>
      </div>

      {/* Row 3: Users + Reports (management) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CanView permission="users">
          <UsersWidget />
        </CanView>
        <CanView permission="reports">
          <ReportsWidget />
        </CanView>
      </div>

      {/* Row 4: Audit Logs + Settings (governance — restricted) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* audit_logs: super_admin (all) | org_admin (org_scope) | auditor (all) */}
        <CanView permission="audit_logs">
          <AuditLogsWidget />
        </CanView>

        {/* settings: super_admin (all) | org_admin (org) | clinic_manager (limited) */}
        <CanView permission="settings">
          <SettingsWidget />
        </CanView>
      </div>

    </div>
  );
};

// ── Main export ───────────────────────────────────────────────

/**
 * UnifiedDashboard
 * ─────────────────────────────────────────────────────────────
 * Selects which dashboard view to render based on the user's role.
 *
 * PRESERVED:
 *   super_admin / org_admin → DashboardOverviewView  (rich existing view)
 *   agent                   → AgentDashboardView     (rich existing view)
 *
 * REPLACED (was PlaceholderDashboard):
 *   clinic_manager / receptionist / finance / auditor
 *                           → RoleBasedDashboard     (shared widget grid)
 *
 * The only role comparison in this file is the initial routing
 * decision to select WHICH view to use. All fine-grained widget
 * visibility is handled by <CanView> — no role checks in widgets.
 */
export default function UnifiedDashboard() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const { role } = currentUser;

  // ── Super Admin and Org Admin: existing full-featured overview ─
  if (role === 'super_admin' || role === 'org_admin') {
    return <DashboardOverviewView />;
  }

  // ── Agent: existing rich agent view (lazy-loaded) ──────────────
  if (role === 'agent') {
    return (
      <DashboardSuspense>
        <AgentDashboardView />
      </DashboardSuspense>
    );
  }

  // ── All other roles: shared RBAC widget dashboard ──────────────
  // clinic_manager, receptionist, finance, auditor, and any future
  // roles all land here. CanView handles what each one sees.
  return <RoleBasedDashboard user={currentUser} />;
}
