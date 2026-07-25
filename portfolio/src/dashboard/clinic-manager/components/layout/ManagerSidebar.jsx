import React from 'react';
import { NavLink } from 'react-router-dom';
import { useManager } from '../../context/ManagerContext';
import {
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  X,
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  MessageSquare
} from 'lucide-react';

export const ManagerSidebar = () => {
  const { isSidebarCollapsed, toggleSidebar, isMobileSidebarOpen, setIsMobileSidebarOpen, activeClinic } = useManager();

  const navItems = [
    { name: 'Clinic Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Patient Appointments', path: '/manager/appointments', icon: CalendarDays },
    { name: 'Local Lead Pipeline', path: '/manager/pipeline', icon: Users },
    { name: 'Task Manager', path: '/manager/tasks', icon: ClipboardList },
    { name: 'Patient Messages', path: '/manager/messages', icon: MessageSquare }
  ];

  return (
    <>
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out flex flex-col ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Branding */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-500/20 shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight truncate">
                  Clinic Manager
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-mono">
                  {activeClinic.name}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 scrollbar-thin">
          {!isSidebarCollapsed && (
            <div className="px-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Operations
            </div>
          )}
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  } ${isSidebarCollapsed ? 'justify-center' : ''}`
                }
                title={isSidebarCollapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <div className="flex items-center gap-3 min-w-0">
                    <IconComponent
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                      }`}
                    />
                    {!isSidebarCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </aside>
    </>
  );
};
