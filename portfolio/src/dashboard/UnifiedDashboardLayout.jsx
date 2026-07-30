import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './super-admin/components/layout/Sidebar'; // Using this as the unified sidebar
import { Header } from './super-admin/components/layout/Header'; // Using this as the unified header
import { AdminProvider, useAdmin } from './super-admin/context/AdminContext'; // We'll adapt this for the unified layout state (like collapsed sidebar)

const DashboardShell = () => {
  const { isSidebarCollapsed } = useAdmin();

  return (
    <div
      className="min-h-screen bg-white text-slate-900 flex flex-col font-sans"
      style={{ backgroundColor: '#ffffff', color: '#111827' }}
    >
      <Sidebar />
      <Header />
      
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

export const UnifiedDashboardLayout = () => {
  return (
    <AdminProvider>
      <DashboardShell />
    </AdminProvider>
  );
};
