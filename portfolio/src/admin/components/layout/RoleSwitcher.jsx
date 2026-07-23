import React, { useState, useRef, useEffect } from 'react';
import { useRole } from '../../context/RoleContext';
import { Shield, ChevronDown, Check, Building } from 'lucide-react';

export const RoleSwitcher = () => {
  const { currentRole, setCurrentRole, roles, activeClinic, setActiveClinic, clinicsScope } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
      >
        <Shield className="w-3.5 h-3.5 text-primary" />
        <span className="font-semibold text-slate-800 dark:text-slate-200">{currentRole.label}</span>
        <span className="text-slate-400 dark:text-slate-600">|</span>
        <span className="text-slate-500 dark:text-slate-400 truncate max-w-[120px] hidden sm:inline">
          {activeClinic.name}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Role Selection */}
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Simulated Role Access
            </div>
            <div className="mt-1 space-y-0.5">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    setCurrentRole(role);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    currentRole.id === role.id
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] border ${role.badgeColor}`}>
                      {role.label}
                    </span>
                  </span>
                  {currentRole.id === role.id && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* Clinic Scope Selection */}
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Building className="w-3 h-3" />
              <span>Clinic Scope</span>
            </div>
            <div className="mt-1 space-y-0.5">
              {clinicsScope.map((clinic) => (
                <button
                  key={clinic.id}
                  onClick={() => {
                    setActiveClinic(clinic);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                    activeClinic.id === clinic.id
                      ? 'bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-100'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className="truncate">{clinic.name}</span>
                  {activeClinic.id === clinic.id && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-slate-100" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
