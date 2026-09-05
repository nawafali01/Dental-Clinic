import { lazy, Suspense } from "react";

const SettingsWorkspace = lazy(() => import("@/features/settings/SettingsWorkspace"));

const fallback = (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
    <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    <p className="text-sm text-slate-500 font-medium">Loading Organization Settings...</p>
  </div>
);

export const orgAdminRoutes = [
  {
    path: "org-settings",
    element: (
      <Suspense fallback={fallback}>
        <SettingsWorkspace />
      </Suspense>
    ),
  },
];

