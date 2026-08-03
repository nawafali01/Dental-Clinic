import React from 'react';
import { useAdmin } from '@/dashboard/super-admin/context/AdminContext';
import { useRole } from '@/dashboard/shared/context/RoleContext';
import { useOrg } from '@/dashboard/shared/context/OrgContext';
import { Breadcrumbs } from './Breadcrumbs';
import { RecentItems } from './RecentItems';
import { UserMenu } from './UserMenu';
import { OrgSwitcher } from './OrgSwitcher';
import { Menu, Search, Bell } from 'lucide-react';

export const Header = () => {
  const { isSidebarCollapsed, toggleMobileSidebar, setIsCommandPaletteOpen, setIsNotificationsOpen } = useAdmin();
  const { userRole, currentRole } = useRole();
  const { currentOrg } = useOrg();

  return (
    <header
      className={`sticky top-0 z-30 h-16 bg-white backdrop-blur-md border-b border-slate-200 transition-all duration-300 flex items-center justify-between px-4 sm:px-6 ${
        isSidebarCollapsed ? 'lg:pl-24' : 'lg:pl-68'
      }`}
      style={{ backgroundColor: '#ffffff', color: '#111827' }}
    >
      {/* Left Section: Mobile Menu + Breadcrumbs + Recent */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>

        <RecentItems />
      </div>

      {/* Right Section: Role Badge + Command Palette Trigger + Notifications + User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dynamic Role Badge */}
        <span
          className={`hidden md:inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold border ${
            currentRole?.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          {currentRole?.label || 'Dashboard'}
        </span>

        {userRole === 'super_admin' ? (
          <OrgSwitcher />
        ) : (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold">
            {currentOrg.isGlobal ? (
               <div className="w-5 h-5 rounded-md flex items-center justify-center bg-purple-100 text-purple-600">
                 <span className="text-[10px]">🌐</span>
               </div>
            ) : (
              <div className={`w-5 h-5 rounded-md bg-gradient-to-tr ${currentOrg.logoColor} text-white flex items-center justify-center font-bold text-[9px]`}>
                {currentOrg.logoText}
              </div>
            )}
            <span className="text-slate-800">{currentOrg.name}</span>
          </div>
        )}

        {/* Global Search Command Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-500 hover:text-slate-900:text-slate-100 hover:bg-slate-100:bg-slate-800 transition-colors text-xs"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline font-medium">Search or press</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-500 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Drawer Trigger */}
        <button
          onClick={() => setIsNotificationsOpen(true)}
          className="relative p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-white animate-pulse" />
        </button>

        {/* User Profile Menu */}
        <UserMenu />
      </div>
    </header>
  );
};
