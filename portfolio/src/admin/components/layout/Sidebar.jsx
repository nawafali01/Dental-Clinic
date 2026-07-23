import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useRole } from '../../context/RoleContext';
import { NAVIGATION_GROUPS } from '../../constants/adminConstants';
import { PERMISSIONS } from '../../config/permissions';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  X,
} from 'lucide-react';

export const Sidebar = () => {
  const { isSidebarCollapsed, toggleSidebar, isMobileSidebarOpen, setIsMobileSidebarOpen } = useAdmin();
  const { hasPermission } = useRole();

  const isItemVisible = (path) => {
    switch(path) {
      case '/admin/clinics':
        return hasPermission(PERMISSIONS.MANAGE_MULTI_TENANT);
      case '/admin/ai-ops':
        return hasPermission(PERMISSIONS.VIEW_AI_GOVERNANCE);
      case '/admin/audit-logs':
        return hasPermission(PERMISSIONS.VIEW_GLOBAL_AUDIT);
      default:
        return true;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-cyan-500 to-emerald-400 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight truncate">
                  DentalAI SuperAdmin
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-mono">
                  v4.8 Enterprise
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Toggle */}
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {NAVIGATION_GROUPS.map((group, gIdx) => {
            const visibleItems = group.items.filter(item => isItemVisible(item.path));
            if (visibleItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                {!isSidebarCollapsed && (
                  <div className="px-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    {group.title}
                  </div>
                )}
                {visibleItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                          isActive
                            ? 'bg-primary text-white shadow-md shadow-primary/25 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        } ${isSidebarCollapsed ? 'justify-center' : ''}`
                      }
                      title={isSidebarCollapsed ? item.name : undefined}
                    >
                      {({ isActive }) => (
                        <>
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

                          {!isSidebarCollapsed && item.badge && (
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400')
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer Widget */}
        {!isSidebarCollapsed && (
          <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Zap className="w-3.5 h-3.5 fill-emerald-400" />
              <span>AI Engine Operational</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 leading-tight">
              99.98% System Uptime • 4 Active Clinics
            </p>
          </div>
        )}
      </aside>
    </>
  );
};
