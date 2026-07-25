import { lazy, Suspense } from 'react';
import { ProtectedRoute } from '@/dashboard/shared/components/guards/ProtectedRoute';
import { PERMISSIONS } from '@/dashboard/shared/config/permissions';

const DashboardOverviewView = lazy(() => import('../views/DashboardOverviewView'));
const AnalyticsView = lazy(() => import('../views/AnalyticsView'));
const LeadPipelineView = lazy(() => import('../views/LeadPipelineView'));
const ClinicManagementView = lazy(() => import('../views/ClinicManagementView'));
const UserManagementView = lazy(() => import('../views/UserManagementView'));
const AiOpsView = lazy(() => import('../views/AiOpsView'));
const RevenueView = lazy(() => import('../views/RevenueView'));
const AuditLogsView = lazy(() => import('../views/AuditLogsView'));
const SettingsView = lazy(() => import('../views/SettingsView'));

const fallback = (label = "Loading...") => (
  <div className="h-screen w-screen flex items-center justify-center text-primary font-display font-semibold">
    {label}
  </div>
);

export const superAdminRoutes = [
  {
    path: "dashboard",
    element: (
      <Suspense fallback={fallback("Loading Dashboard...")}>
        <DashboardOverviewView />
      </Suspense>
    ),
  },
  {
    path: "analytics",
    element: (
      <Suspense fallback={fallback("Loading Analytics...")}>
        <AnalyticsView />
      </Suspense>
    ),
  },
  {
    path: "pipeline",
    element: (
      <Suspense fallback={fallback("Loading Pipeline...")}>
        <LeadPipelineView />
      </Suspense>
    ),
  },
  {
    path: "clinics",
    element: (
      <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_MULTI_TENANT}>
        <Suspense fallback={fallback("Loading Clinics...")}>
          <ClinicManagementView />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "users",
    element: (
      <Suspense fallback={fallback("Loading Users...")}>
        <UserManagementView />
      </Suspense>
    ),
  },
  {
    path: "ai-ops",
    element: (
      <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_AI_GOVERNANCE}>
        <Suspense fallback={fallback("Loading AI Ops...")}>
          <AiOpsView />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "revenue",
    element: (
      <Suspense fallback={fallback("Loading Revenue...")}>
        <RevenueView />
      </Suspense>
    ),
  },
  {
    path: "audit-logs",
    element: (
      <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_GLOBAL_AUDIT}>
        <Suspense fallback={fallback("Loading Audit Logs...")}>
          <AuditLogsView />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "settings",
    element: (
      <Suspense fallback={fallback("Loading Settings...")}>
        <SettingsView />
      </Suspense>
    ),
  },
];
