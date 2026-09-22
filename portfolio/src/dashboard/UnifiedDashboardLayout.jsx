import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './super-admin/components/layout/Sidebar'; // Using this as the unified sidebar
import { Header } from './super-admin/components/layout/Header'; // Using this as the unified header
import { CommandPalette } from './super-admin/components/layout/CommandPalette';
import { NotificationsDrawer } from './super-admin/components/layout/NotificationsDrawer';
import { AdminProvider, useAdmin } from './shared/context/AdminContext'; // We'll adapt this for the unified layout state (like collapsed sidebar)
import { RoleProvider, useRole } from './shared/context/RoleContext';
import { OrgProvider } from './shared/context/OrgContext';
import { ClinicProvider } from '@/context/ClinicContext';
import { getRoleBaseUrl, buildRoleUrl } from '@/utils/getRoleBaseUrl';

const DashboardShell = () => {
  const { isSidebarCollapsed } = useAdmin();
  const { currentRole } = useRole();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentRole?.id) return;
    const expectedBase = getRoleBaseUrl(currentRole.id);
    const pathParts = location.pathname.split('/').filter(Boolean);
    const currentBase = pathParts[0];
    const knownBasePaths = ['admin', 'manager', 'agent', 'receptionist', 'reception', 'finance', 'auditor'];

    if (knownBasePaths.includes(currentBase) && currentBase !== expectedBase) {
      const targetUrl = buildRoleUrl(location.pathname, currentRole.id);
      if (targetUrl !== location.pathname) {
        navigate(targetUrl, { replace: true });
      }
    }
  }, [currentRole?.id, location.pathname, navigate]);

  return (
    <div
      className="min-h-screen bg-white text-slate-900 flex flex-col font-sans overflow-x-hidden max-w-full"
      style={{ backgroundColor: '#ffffff', color: '#111827' }}
    >
      <Sidebar />
      <Header />
      <CommandPalette />
      <NotificationsDrawer />
      
      <main
        className={`flex-1 min-w-0 max-w-full transition-all duration-300 p-4 sm:p-6 lg:p-8 bg-white ${
          isSidebarCollapsed ? 'lg:pl-24' : 'lg:pl-68'
        }`}
        style={{ backgroundColor: '#ffffff', color: '#111827' }}
      >
        <div className="max-w-7xl mx-auto space-y-6 w-full min-w-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export const UnifiedDashboardLayout = () => {
  return (
    <AdminProvider>
      <RoleProvider>
        <OrgProvider>
          <ClinicProvider>
            <DashboardShell />
          </ClinicProvider>
        </OrgProvider>
      </RoleProvider>
    </AdminProvider>
  );
};
