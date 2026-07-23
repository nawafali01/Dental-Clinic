import React, { useState, useRef, useEffect } from 'react';
import { useOrg } from '../../context/OrgContext';
import { Building2, ChevronDown, Check, Globe } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const OrgSwitcher = () => {
  const { selectedOrgId, setSelectedOrgId, currentOrg, organizations } = useOrg();
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold"
      >
        <Building2 className="w-3.5 h-3.5 text-primary" />
        <span className="text-slate-800 dark:text-slate-200">{currentOrg.name}</span>
        <Badge variant={currentOrg.isGlobal ? 'purple' : 'info'} className="text-[10px] py-0 px-1.5">
          {currentOrg.badgeText}
        </Badge>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Select Organization Scope
          </div>
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => {
                setSelectedOrgId(org.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                selectedOrgId === org.id
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {org.isGlobal ? (
                  <Globe className="w-4 h-4 text-purple-500 shrink-0" />
                ) : (
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${org.logoColor} text-white flex items-center justify-center font-bold text-[10px] shrink-0`}>
                    {org.logoText}
                  </div>
                )}
                <div className="text-left truncate">
                  <div className="truncate font-medium">{org.name}</div>
                  <div className="text-[10px] text-slate-400">{org.clinicsCount} Clinic Branches</div>
                </div>
              </div>
              {selectedOrgId === org.id && <Check className="w-4 h-4 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
