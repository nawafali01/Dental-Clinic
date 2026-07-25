import React from 'react';
import { useManager } from '../../context/ManagerContext';
import { Menu, Search, Bell } from 'lucide-react';

export const ManagerHeader = () => {
  const { isSidebarCollapsed, toggleMobileSidebar, setIsCommandPaletteOpen, setIsNotificationsOpen, activeClinic } = useManager();

  return (
    <header
      className={`sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300 flex items-center justify-between px-4 sm:px-6 ${
        isSidebarCollapsed ? 'lg:pl-24' : 'lg:pl-68'
      }`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {activeClinic.name} Workspace
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline font-medium">Search</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={() => setIsNotificationsOpen(true)}
          className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </button>
        
        {/* Simplified User Menu for Mockup */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer">
          CM
        </div>
      </div>
    </header>
  );
};
