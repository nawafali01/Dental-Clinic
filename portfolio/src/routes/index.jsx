import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AdminLayout } from "@/dashboard/super-admin/components/layout/AdminLayout";
import { ManagerLayout } from "@/dashboard/clinic-manager/components/layout/ManagerLayout";
import { superAdminRoutes } from "@/dashboard/super-admin/routes";
import { clinicManagerRoutes } from "@/dashboard/clinic-manager/routes";

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
const StaffSignup = lazy(() => import("@/pages/StaffSignup"));
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
        path: "login",
        element: (
          <Suspense fallback={fallback("Loading Login...")}>
            <StaffLogin />
          </Suspense>
        ),
      },
      {
        path: "signup",
        element: (
          <Suspense fallback={fallback("Loading Signup...")}>
            <StaffSignup />
          </Suspense>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <Suspense fallback={fallback("Loading... ")}>
            <div className="min-h-screen bg-muted/40 px-4 py-10 sm:px-6 lg:px-8">
              <div className="mx-auto flex max-w-xl items-center justify-center">
                <div className="w-full rounded-[32px] border border-border bg-background/95 p-8 text-center shadow-[0_25px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
                  <h1 className="font-display text-3xl font-semibold text-secondary">Password reset</h1>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Password reset for internal staff accounts will be connected here in a future update.
                  </p>
                </div>
              </div>
            </div>
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
      ...superAdminRoutes,
    ],
  },
  {
    path: "/manager",
    element: <ManagerLayout />,
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


