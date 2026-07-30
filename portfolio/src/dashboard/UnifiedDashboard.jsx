import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/permissions';

// --- Imports for Sub-Dashboards ---
// For now, these are placeholder components or imported from existing views.
// In a real implementation, you would import these from their respective feature folders.
import DashboardOverviewView from './super-admin/views/DashboardOverviewView';
// If other dashboards don't exist yet, we'll create simple placeholders that can be replaced later.

const PlaceholderDashboard = ({ title }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
    <p className="text-slate-500 mt-2">This is the dashboard view for {title}.</p>
  </div>
);

// Mapped specific dashboard layouts if they exist, else placeholders
const dashboardMap = {
  [ROLES.SUPER_ADMIN]: <DashboardOverviewView />,
  [ROLES.ORG_ADMIN]: <PlaceholderDashboard title="Organization Admin Dashboard" />,
  [ROLES.CLINIC_MANAGER]: <PlaceholderDashboard title="Clinic Manager Dashboard" />,
  [ROLES.AGENT]: <PlaceholderDashboard title="Agent Dashboard" />,
  [ROLES.RECEPTIONIST]: <PlaceholderDashboard title="Receptionist Dashboard" />,
  [ROLES.FINANCE]: <PlaceholderDashboard title="Finance Dashboard" />,
  [ROLES.AUDITOR]: <PlaceholderDashboard title="Auditor Dashboard" />
};

export default function UnifiedDashboard() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  return (
    <>
      {dashboardMap[currentUser.role] || (
        <div className="p-6 text-red-500 font-bold">Unknown Role Dashboard</div>
      )}
    </>
  );
}
