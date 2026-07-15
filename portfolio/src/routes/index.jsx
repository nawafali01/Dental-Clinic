import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { PublicLayout } from "@/layouts/PublicLayout";

const Home = lazy(() => import("@/pages/Home"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        path: ROUTES.HOME,
        element: (
          <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center text-primary font-display font-semibold">Loading Aurea...</div>}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: ROUTES.NOT_FOUND,
        element: (
          <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center text-primary font-display font-semibold">Loading...</div>}>
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
