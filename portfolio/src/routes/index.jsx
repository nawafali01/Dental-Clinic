import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AdminLayout } from "@/dashboard/super-admin/components/layout/AdminLayout";
import { ManagerLayout } from "@/dashboard/clinic-manager/components/layout/ManagerLayout";
import { superAdminRoutes } from "@/dashboard/super-admin/routes";
import { clinicManagerRoutes } from "@/dashboard/clinic-manager/routes";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { ROLES } from "@/constants/roles";

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
const StaffLogin = lazy(() => import("@/pages/StaffLogin"));
const ForgotPassword = lazy(() => import("@/features/auth/components/ForgotPassword"));
const ResetPassword = lazy(() => import("@/features/auth/components/ResetPassword"));
const AcceptInviteForm = lazy(() => import("@/features/invite/components/AcceptInviteForm"));
const OnboardingForm = lazy(() => import("@/features/invite/components/OnboardingForm"));
const UsersTable = lazy(() => import("@/features/users/components/UsersTable"));
const NotFound = lazy(() => import("@/pages/NotFound"));

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
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: (
          <Suspense fallback={fallback("Loading Login...")}>
            <StaffLogin />
          </Suspense>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <Suspense fallback={fallback("Loading...")}>
            <ForgotPassword />
          </Suspense>
        ),
      },
      {
        path: "reset-password",
        element: (
          <Suspense fallback={fallback("Loading...")}>
            <ResetPassword />
          </Suspense>
        ),
      },
      {
        path: "accept-invite",
        element: (
          <Suspense fallback={fallback("Loading...")}>
            <AcceptInviteForm />
          </Suspense>
        ),
      },
      {
        path: "onboarding",
        element: (
          <AuthGuard>
            <Suspense fallback={fallback("Loading...")}>
              <OnboardingForm />
            </Suspense>
          </AuthGuard>
        ),
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <AuthGuard>
        <AdminLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "users",
        element: (
          <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ORG_ADMIN]}>
            <Suspense fallback={fallback("Loading Users...")}>
              <UsersTable />
            </Suspense>
          </RoleGuard>
        ),
      },
      ...superAdminRoutes,
    ],
  },
  {
    path: "/manager",
    element: (
      <AuthGuard>
        <ManagerLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/manager/dashboard" replace />,
      },
      ...clinicManagerRoutes,
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}


