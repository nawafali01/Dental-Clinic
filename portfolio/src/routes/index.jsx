import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AdminLayout } from "../admin/components/layout/AdminLayout";
import { ProtectedRoute } from "../admin/components/auth/ProtectedRoute";
import { PERMISSIONS } from "../admin/config/permissions";

const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const ServicesPage = lazy(() => import("@/pages/ServicesPage"));
const Doctors = lazy(() => import("@/pages/Doctors"));
const DoctorDetails = lazy(() => import("@/pages/DoctorDetails"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const Testimonials = lazy(() => import("@/pages/Testimonials"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogDetails = lazy(() => import("@/pages/BlogDetails"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Contact = lazy(() => import("@/pages/Contact"));
const BookAppointment = lazy(() => import("@/pages/BookAppointment"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Admin views
const DashboardOverviewView = lazy(() => import("../admin/views/DashboardOverviewView"));
const AnalyticsView = lazy(() => import("../admin/views/AnalyticsView"));
const LeadPipelineView = lazy(() => import("../admin/views/LeadPipelineView"));
const ClinicManagementView = lazy(() => import("../admin/views/ClinicManagementView"));
const UserManagementView = lazy(() => import("../admin/views/UserManagementView"));
const AiOpsView = lazy(() => import("../admin/views/AiOpsView"));
const RevenueView = lazy(() => import("../admin/views/RevenueView"));
const AuditLogsView = lazy(() => import("../admin/views/AuditLogsView"));
const SettingsView = lazy(() => import("../admin/views/SettingsView"));

const fallback = (label = "Loading...") => (
  <div className="h-screen w-screen flex items-center justify-center text-primary font-display font-semibold">
    {label}
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={fallback("Loading Aurea...")}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: "about",
        element: (
          <Suspense fallback={fallback("Loading...")}>
            <About />
          </Suspense>
        ),
      },
      {
        path: "services",
        element: (
          <Suspense fallback={fallback("Loading...")}>
            <ServicesPage />
          </Suspense>
        ),
      },
      {
        path: "doctors",
        element: (
          <Suspense fallback={fallback("Loading Doctors...")}>
            <Doctors />
          </Suspense>
        ),
      },
      {
        path: "doctors/:id",
        element: (
          <Suspense fallback={fallback("Loading Profile...")}>
            <DoctorDetails />
          </Suspense>
        ),
      },
      {
        path: "gallery",
        element: (
          <Suspense fallback={fallback("Loading Gallery...")}>
            <Gallery />
          </Suspense>
        ),
      },
      {
        path: "testimonials",
        element: (
          <Suspense fallback={fallback("Loading Testimonials...")}>
            <Testimonials />
          </Suspense>
        ),
      },
      {
        path: "blog",
        element: (
          <Suspense fallback={fallback("Loading Blog...")}>
            <Blog />
          </Suspense>
        ),
      },
      {
        path: "blog/:slug",
        element: (
          <Suspense fallback={fallback("Loading Article...")}>
            <BlogDetails />
          </Suspense>
        ),
      },
      {
        path: "faq",
        element: (
          <Suspense fallback={fallback("Loading FAQ...")}>
            <FAQ />
          </Suspense>
        ),
      },
      {
        path: "contact",
        element: (
          <Suspense fallback={fallback("Loading Contact...")}>
            <Contact />
          </Suspense>
        ),
      },
      {
        path: "book-appointment",
        element: (
          <Suspense fallback={fallback("Loading Booking...")}>
            <BookAppointment />
          </Suspense>
        ),
      },
      {
        path: "*",
        element: (
          <Suspense fallback={fallback("Loading...")}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
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
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}


