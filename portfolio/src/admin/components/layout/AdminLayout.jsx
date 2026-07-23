import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminProvider, useAdmin } from '../../context/AdminContext';
import { RoleProvider } from '../../context/RoleContext';
import { OrgProvider } from '../../context/OrgContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import { NotificationsDrawer } from './NotificationsDrawer';

const MainShell = () => {
  const { isSidebarCollapsed } = useAdmin();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
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
        className={`flex-1 transition-all duration-300 p-4 sm:p-6 lg:p-8 ${
          isSidebarCollapsed ? 'lg:pl-24' : 'lg:pl-68'
        }`}
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
