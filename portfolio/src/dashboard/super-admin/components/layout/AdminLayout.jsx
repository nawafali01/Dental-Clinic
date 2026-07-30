import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminProvider, useAdmin } from '@/dashboard/super-admin/context/AdminContext';
import { RoleProvider } from '@/dashboard/shared/context/RoleContext';
import { OrgProvider } from '@/dashboard/shared/context/OrgContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import { NotificationsDrawer } from './NotificationsDrawer';

const MainShell = () => {
  const { isSidebarCollapsed } = useAdmin();

  return (
    <div
      className="min-h-screen bg-white text-slate-900 flex flex-col font-sans"
      style={{ backgroundColor: '#ffffff', color: '#111827' }}
    >
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Sticky Top Header */}
      <Header />

      {/* Interactive Command Palette Modal */}
      <CommandPalette />

      {/* Slide-out Notifications Drawer */}
      <NotificationsDrawer />

      {/* Main Page Workspace Content */}
      <main
        className={`flex-1 transition-all duration-300 p-4 sm:p-6 lg:p-8 bg-white ${
          isSidebarCollapsed ? 'lg:pl-24' : 'lg:pl-68'
        }`}
        style={{ backgroundColor: '#ffffff', color: '#111827' }}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export const AdminLayout = () => {
  return (
    <AdminProvider>
      <RoleProvider>
        <OrgProvider>
          <MainShell />
        </OrgProvider>
      </RoleProvider>
    </AdminProvider>
  );
};
