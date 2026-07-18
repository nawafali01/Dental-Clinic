import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { PublicLayout } from "@/layouts/PublicLayout";

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
        path: ROUTES.HOME,
        element: (
          <Suspense fallback={fallback("Loading Aurea...")}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: ROUTES.ABOUT,
        element: (
          <Suspense fallback={fallback("Loading...")}>
            <About />
          </Suspense>
        ),
      },
      {
        path: ROUTES.SERVICES,
        element: (
          <Suspense fallback={fallback("Loading...")}>
            <ServicesPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.DOCTORS,
        element: (
          <Suspense fallback={fallback("Loading Doctors...")}>
            <Doctors />
          </Suspense>
        ),
      },
      {
        path: ROUTES.DOCTOR_DETAILS,
        element: (
          <Suspense fallback={fallback("Loading Profile...")}>
            <DoctorDetails />
          </Suspense>
        ),
      },
      {
        path: ROUTES.GALLERY,
        element: (
          <Suspense fallback={fallback("Loading Gallery...")}>
            <Gallery />
          </Suspense>
        ),
      },
      {
        path: ROUTES.TESTIMONIALS,
        element: (
          <Suspense fallback={fallback("Loading Testimonials...")}>
            <Testimonials />
          </Suspense>
        ),
      },
      {
        path: ROUTES.BLOG,
        element: (
          <Suspense fallback={fallback("Loading Blog...")}>
            <Blog />
          </Suspense>
        ),
      },
      {
        path: ROUTES.BLOG_DETAILS,
        element: (
          <Suspense fallback={fallback("Loading Article...")}>
            <BlogDetails />
          </Suspense>
        ),
      },
      {
        path: ROUTES.FAQ,
        element: (
          <Suspense fallback={fallback("Loading FAQ...")}>
            <FAQ />
          </Suspense>
        ),
      },
      {
        path: ROUTES.CONTACT,
        element: (
          <Suspense fallback={fallback("Loading Contact...")}>
            <Contact />
          </Suspense>
        ),
      },
      {
        path: ROUTES.BOOKING,
        element: (
          <Suspense fallback={fallback("Loading Booking...")}>
            <BookAppointment />
          </Suspense>
        ),
      },
      {
        path: ROUTES.NOT_FOUND,
        element: (
          <Suspense fallback={fallback("Loading...")}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
