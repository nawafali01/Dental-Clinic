import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { UnifiedDashboardLayout } from "@/dashboard/UnifiedDashboardLayout";
import { superAdminRoutes } from "./super-admin.routes";
import { sharedRoutes } from "./shared.routes";
import { orgAdminRoutes } from "./org-admin.routes";
import { clinicManagerRoutes } from "./clinic-manager.routes";

// --- Lazy Loads ---
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

// --- New Auth Flows ---
const LoginView = lazy(() => import("@/features/auth/LoginView"));
const AcceptInviteView = lazy(() => import("@/features/auth/AcceptInviteView"));
const OnboardingView = lazy(() => import("@/features/auth/OnboardingView"));

const fallback = (label = "Loading...") => (
  <div className="h-screen w-screen flex items-center justify-center text-primary font-display font-semibold bg-white">
    {label}
  </div>
);

const router = createBrowserRouter([
  // Public Website Routes
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Suspense fallback={fallback()}><Home /></Suspense> },
      { path: "about", element: <Suspense fallback={fallback()}><About /></Suspense> },
      { path: "services", element: <Suspense fallback={fallback()}><ServicesPage /></Suspense> },
      { path: "doctors", element: <Suspense fallback={fallback()}><Doctors /></Suspense> },
      { path: "doctors/:id", element: <Suspense fallback={fallback()}><DoctorDetails /></Suspense> },
      { path: "gallery", element: <Suspense fallback={fallback()}><Gallery /></Suspense> },
      { path: "testimonials", element: <Suspense fallback={fallback()}><Testimonials /></Suspense> },
      { path: "blog", element: <Suspense fallback={fallback()}><Blog /></Suspense> },
      { path: "blog/:slug", element: <Suspense fallback={fallback()}><BlogDetails /></Suspense> },
      { path: "faq", element: <Suspense fallback={fallback()}><FAQ /></Suspense> },
      { path: "contact", element: <Suspense fallback={fallback()}><Contact /></Suspense> },
      { path: "book-appointment", element: <Suspense fallback={fallback()}><BookAppointment /></Suspense> },
      { path: "*", element: <Suspense fallback={fallback()}><NotFound /></Suspense> },
    ],
  },

  // Authentication Flow
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Suspense fallback={fallback("Loading Login...")}><LoginView /></Suspense>,
      },
      {
        path: "accept-invite",
        element: <Suspense fallback={fallback("Verifying Invite...")}><AcceptInviteView /></Suspense>,
      },
      {
        path: "onboarding",
        element: (
          <AuthGuard>
            <Suspense fallback={fallback("Loading Onboarding...")}><OnboardingView /></Suspense>
          </AuthGuard>
        ),
      },
    ],
  },

  // Protected Unified Dashboard Area
  {
    path: "/admin",
    element: (
      <AuthGuard>
        <UnifiedDashboardLayout />
      </AuthGuard>
    ),
    children: [
      ...sharedRoutes,
      ...superAdminRoutes,
      ...orgAdminRoutes,
      ...clinicManagerRoutes,
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
