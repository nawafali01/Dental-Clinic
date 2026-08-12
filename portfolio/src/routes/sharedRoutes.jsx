import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { PERMISSIONS } from "@/dashboard/shared/config/permissions";

// ─── Lazy-Loaded View Components ──────────────────────────────
const UnifiedDashboard     = lazy(() => import("@/dashboard/UnifiedDashboard"));
const LeadsView            = lazy(() => import("@/dashboard/views/leads/LeadsView"));
const LeadDetailView       = lazy(() => import("@/dashboard/views/leads/LeadDetailView"));
const AppointmentsView     = lazy(() => import("@/dashboard/views/appointments/AppointmentsView"));
const PatientsView         = lazy(() => import("@/dashboard/views/patients/PatientsView"));
const CallsView            = lazy(() => import("@/dashboard/views/calls/CallsView"));
const TasksView            = lazy(() => import("@/dashboard/views/tasks/TasksView"));
const RevenueView          = lazy(() => import("@/dashboard/views/revenue/RevenueView"));
const PaymentsView         = lazy(() => import("@/dashboard/views/config/PaymentsView"));
const ReportsView          = lazy(() => import("@/dashboard/views/reports/ReportsView"));
const ClinicsView          = lazy(() => import("@/dashboard/views/clinics/ClinicsView"));
const UsersView            = lazy(() => import("@/features/users/UsersView"));
const ProfileView          = lazy(() => import("@/features/profile/ProfileView"));

// Operations & Config Views
const PatientCheckInView   = lazy(() => import("@/dashboard/views/operations/PatientCheckInView"));
const RescheduleView       = lazy(() => import("@/dashboard/views/operations/RescheduleView"));
const MyScheduleView       = lazy(() => import("@/dashboard/views/operations/MyScheduleView"));
const NotificationsView    = lazy(() => import("@/dashboard/views/operations/NotificationsView"));
const AiCopilotView        = lazy(() => import("@/dashboard/views/operations/AiCopilotView"));
const TreatmentsConfigView = lazy(() => import("@/dashboard/views/config/TreatmentsConfigView"));
const LeadSourcesView      = lazy(() => import("@/dashboard/views/config/LeadSourcesView"));
const LeadStatusesView     = lazy(() => import("@/dashboard/views/config/LeadStatusesView"));
const AiRunsView           = lazy(() => import("@/dashboard/views/config/AiRunsView"));
const AiAutomationsView    = lazy(() => import("@/dashboard/views/config/AiAutomationsView"));
const WebsiteContentView   = lazy(() => import("@/dashboard/views/config/WebsiteContentView"));
const LeadFormsView        = lazy(() => import("@/dashboard/views/config/LeadFormsView"));
const IntegrationsView     = lazy(() => import("@/dashboard/views/config/IntegrationsView"));

// ─── Fallback loader ──────────────────────────────────────────
const PageLoader = ({ label = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
    <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    <p className="text-sm text-slate-500 font-medium">{label}</p>
  </div>
);

const fallback = (label) => <PageLoader label={label} />;

// ─── Route Definitions ────────────────────────────────────────
export const sharedRoutes = [
  { index: true, element: <Navigate to="dashboard" replace /> },
  { path: "dashboard", element: <Suspense fallback={fallback("Loading Dashboard...")}><UnifiedDashboard /></Suspense> },

  { path: "leads", element: <RoleGuard permission={PERMISSIONS.VIEW_LEADS}><Suspense fallback={fallback("Loading Leads...")}><LeadsView /></Suspense></RoleGuard> },
  { path: "leads/:id", element: <RoleGuard permission={PERMISSIONS.VIEW_LEADS}><Suspense fallback={fallback("Loading Lead Details...")}><LeadDetailView /></Suspense></RoleGuard> },
  { path: "appointments", element: <RoleGuard permission={PERMISSIONS.VIEW_APPOINTMENTS}><Suspense fallback={fallback("Loading Appointments...")}><AppointmentsView /></Suspense></RoleGuard> },
  { path: "patients", element: <RoleGuard permission={PERMISSIONS.VIEW_PATIENTS}><Suspense fallback={fallback("Loading Patients...")}><PatientsView /></Suspense></RoleGuard> },
  { path: "calls", element: <RoleGuard permission={PERMISSIONS.VIEW_CALLS}><Suspense fallback={fallback("Loading Calls...")}><CallsView /></Suspense></RoleGuard> },
  { path: "tasks", element: <RoleGuard permission={PERMISSIONS.VIEW_TASKS}><Suspense fallback={fallback("Loading Tasks...")}><TasksView /></Suspense></RoleGuard> },
  { path: "revenue", element: <RoleGuard permission={PERMISSIONS.VIEW_REVENUE}><Suspense fallback={fallback("Loading Revenue...")}><RevenueView /></Suspense></RoleGuard> },
  { path: "payments", element: <RoleGuard permission={PERMISSIONS.VIEW_PAYMENTS}><Suspense fallback={fallback("Loading Payments...")}><PaymentsView /></Suspense></RoleGuard> },
  { path: "reports", element: <RoleGuard permission={PERMISSIONS.VIEW_REPORTS}><Suspense fallback={fallback("Loading Reports...")}><ReportsView /></Suspense></RoleGuard> },
  { path: "clinics", element: <RoleGuard permission={PERMISSIONS.VIEW_CLINICS}><Suspense fallback={fallback("Loading Clinics...")}><ClinicsView /></Suspense></RoleGuard> },
  { path: "users", element: <RoleGuard permission={PERMISSIONS.VIEW_USERS}><Suspense fallback={fallback("Loading Users...")}><UsersView /></Suspense></RoleGuard> },
  { path: "patient-checkin", element: <RoleGuard permission={PERMISSIONS.VIEW_APPOINTMENTS}><Suspense fallback={fallback("Loading Check-In...")}><PatientCheckInView /></Suspense></RoleGuard> },
  { path: "reschedule", element: <RoleGuard permission={PERMISSIONS.VIEW_APPOINTMENTS}><Suspense fallback={fallback("Loading Reschedule...")}><RescheduleView /></Suspense></RoleGuard> },
  { path: "my-schedule", element: <RoleGuard permission={PERMISSIONS.VIEW_APPOINTMENTS}><Suspense fallback={fallback("Loading My Schedule...")}><MyScheduleView /></Suspense></RoleGuard> },
  { path: "notifications", element: <RoleGuard permission={PERMISSIONS.VIEW_NOTIFICATIONS}><Suspense fallback={fallback("Loading Notifications...")}><NotificationsView /></Suspense></RoleGuard> },
  { path: "ai-copilot", element: <RoleGuard permission={PERMISSIONS.VIEW_AI_COPILOT}><Suspense fallback={fallback("Loading AI Copilot...")}><AiCopilotView /></Suspense></RoleGuard> },
  { path: "profile", element: <Suspense fallback={fallback("Loading Profile...")}><ProfileView /></Suspense> },

  { path: "treatments-config", element: <RoleGuard permission={PERMISSIONS.MANAGE_TREATMENTS}><Suspense fallback={fallback("Loading Treatments...")}><TreatmentsConfigView /></Suspense></RoleGuard> },
  { path: "lead-sources", element: <RoleGuard permission={PERMISSIONS.MANAGE_LEAD_SOURCES}><Suspense fallback={fallback("Loading Sources...")}><LeadSourcesView /></Suspense></RoleGuard> },
  { path: "lead-statuses", element: <RoleGuard permission={PERMISSIONS.MANAGE_LEAD_STATUSES}><Suspense fallback={fallback("Loading Statuses...")}><LeadStatusesView /></Suspense></RoleGuard> },
  { path: "ai-runs", element: <RoleGuard permission={PERMISSIONS.MANAGE_AI_RUNS}><Suspense fallback={fallback("Loading AI Runs...")}><AiRunsView /></Suspense></RoleGuard> },
  { path: "ai-automations", element: <RoleGuard permission={PERMISSIONS.MANAGE_AI_AUTOMATIONS}><Suspense fallback={fallback("Loading AI Automations...")}><AiAutomationsView /></Suspense></RoleGuard> },
  { path: "website-content", element: <RoleGuard permission={PERMISSIONS.MANAGE_WEBSITE_CONTENT}><Suspense fallback={fallback("Loading Website Content...")}><WebsiteContentView /></Suspense></RoleGuard> },
  { path: "lead-forms", element: <RoleGuard permission={PERMISSIONS.MANAGE_LEAD_FORMS}><Suspense fallback={fallback("Loading Lead Forms...")}><LeadFormsView /></Suspense></RoleGuard> },
  { path: "integrations", element: <RoleGuard permission={PERMISSIONS.MANAGE_INTEGRATIONS}><Suspense fallback={fallback("Loading Integrations...")}><IntegrationsView /></Suspense></RoleGuard> },
];
