import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { PublicRoute } from "@/features/auth/components/PublicRoute";
import { ROLES } from "@/features/auth/constants/authConstants";

// Lazy general pages
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

// Lazy authentication pages
const StaffLogin = lazy(() => import("@/features/auth/pages/StaffLogin"));
const AdminLogin = lazy(() => import("@/features/auth/pages/AdminLogin"));
const SuperAdminLogin = lazy(() => import("@/features/auth/pages/SuperAdminLogin"));
const Register = lazy(() => import("@/features/auth/pages/Register"));

// Lazy dashboard views
const StaffDashboard = lazy(() => import("@/pages/StaffDashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const SuperAdminDashboard = lazy(() => import("@/pages/SuperAdminDashboard"));

const fallback = (label = "Loading...") => (
  <div className="h-screen w-screen flex items-center justify-center text-primary font-display font-semibold">
    {label}
  </div>
);

const router = createBrowserRouter([
  // Root redirect → Staff Login (first screen on site open)
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },

  // Public website pages (inside PublicLayout navbar wrapper)
  {
    path: "/home",
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
    ],
  },

  // Auth pages (wrapped in PublicRoute so logged-in users cannot access them)
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Suspense fallback={fallback("Loading Staff Login...")}>
          <StaffLogin />
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Suspense fallback={fallback("Registering Account...")}>
          <Register />
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: "/register-admin",
    element: (
      <PublicRoute>
        <Suspense fallback={fallback("Registering Administrator Account...")}>
          <Register />
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: "/register-super-admin",
    element: (
      <PublicRoute>
        <Suspense fallback={fallback("Registering Operations Account...")}>
          <Register />
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: "/admin-login",
    element: (
      <PublicRoute>
        <Suspense fallback={fallback("Loading Admin Login...")}>
          <AdminLogin />
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: "/super-admin-login",
    element: (
      <PublicRoute>
        <Suspense fallback={fallback("Loading System Login...")}>
          <SuperAdminLogin />
        </Suspense>
      </PublicRoute>
    ),
  },

  // Protected Dashboard layouts (Only authenticated roles can access)
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.CLINIC_MANAGER, ROLES.RECEPTION, ROLES.FINANCE, ROLES.AGENT]}>
        <Suspense fallback={fallback("Loading Workstation...")}>
          <StaffDashboard />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <Suspense fallback={fallback("Loading Clinic Workspace...")}>
          <AdminDashboard />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/super-admin/dashboard",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
        <Suspense fallback={fallback("Loading Core Registry...")}>
          <SuperAdminDashboard />
        </Suspense>
      </ProtectedRoute>
    ),
  },

  // Catch-all NotFound Route
  {
    path: "*",
    element: (
      <Suspense fallback={fallback("Redirecting...")}>
        <NotFound />
      </Suspense>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

