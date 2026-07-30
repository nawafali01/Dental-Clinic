import React from 'react';
import { Outlet } from 'react-router-dom';
import { ManagerProvider, useManager } from '@/dashboard/clinic-manager/context/ManagerContext';
import { ManagerSidebar } from './ManagerSidebar';
import { ManagerHeader } from './ManagerHeader';

const ManagerShell = () => {
  const { isSidebarCollapsed } = useManager();

  return (
    <div
      className="min-h-screen bg-white text-slate-900 flex flex-col font-sans"
      style={{ backgroundColor: '#ffffff', color: '#111827' }}
    >
      <ManagerSidebar />
      <ManagerHeader />
      
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

export const ManagerLayout = () => {
  return (
    <ManagerProvider>
      <ManagerShell />
    </ManagerProvider>
  );
};
