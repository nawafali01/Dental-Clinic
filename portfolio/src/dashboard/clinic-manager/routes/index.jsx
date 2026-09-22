import { lazy, Suspense } from 'react';
import {
  PipelineView,
  TasksView,
  MessagesView
} from '../views/PlaceholderViews';
import AppointmentsView from '@/dashboard/views/appointments/AppointmentsView';

const ManagerDashboardView = lazy(() => import('../views/ManagerDashboardView'));

const fallback = (label = "Loading...") => (
  <div className="h-screen w-screen flex items-center justify-center text-primary font-display font-semibold">
    {label}
  </div>
);

export const clinicManagerRoutes = [
  {
    path: "dashboard",
    element: (
      <Suspense fallback={fallback("Loading Clinic Dashboard...")}>
        <ManagerDashboardView />
      </Suspense>
    ),
  },
  {
    path: "appointments",
    element: <AppointmentsView />,
  },
  {
    path: "pipeline",
    element: <PipelineView />,
  },
  {
    path: "tasks",
    element: <TasksView />,
  },
  {
    path: "messages",
    element: <MessagesView />,
  },
];

