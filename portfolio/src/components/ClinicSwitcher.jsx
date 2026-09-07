import React, { useState, useRef, useEffect } from 'react';
import { useClinic } from '@/context/ClinicContext';
import { useOrg } from '@/dashboard/shared/context/OrgContext';
import { Building2, ChevronDown, Check, MapPin, Layers } from 'lucide-react';

/**
 * ClinicSwitcher
 *
 * Allows multi-clinic roles (super_admin, org_admin) to switch the active
 * branch scope directly from the dashboard header.
 * Interconnected with OrgSwitcher — filters dynamically to only show
 * clinics that belong to the active organization scope.
 */
export const ClinicSwitcher = () => {
  const { selectedClinic, selectedClinicId, availableClinics, setSelectedClinicId, canSwitch } =
    useClinic();
  const { currentOrg, selectedOrgId } = useOrg();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Don't render for roles without multi-clinic access
  if (!canSwitch) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAllSelected = selectedClinicId === 'all';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        id="clinic-switcher-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-semibold cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Switch clinic branch"
      >
        <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="text-slate-800 hidden sm:inline max-w-[150px] truncate">
          {selectedClinic?.name || 'Select Clinic'}
        </span>
        <span className="hidden lg:inline-flex px-1.5 py-0.2 rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold font-mono">
          {availableClinics.length}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[380px] overflow-y-auto"
        >
          {/* Section header */}
          <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3 h-3" />
              <span>
                {selectedOrgId === 'all' ? 'All Clinic Branches' : `${currentOrg?.shortName || 'Org'} Branches`}
              </span>
            </span>
            <span className="text-slate-500 font-mono text-[10px]">
              {availableClinics.length} available
            </span>
          </div>

          {/* Option: All Clinics */}
          <button
            role="option"
            aria-selected={isAllSelected}
            onClick={() => {
              setSelectedClinicId('all');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left cursor-pointer ${
              isAllSelected
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate">All Clinics</div>
                <div className="text-[10px] text-slate-400 truncate">
                  {selectedOrgId === 'all'
                    ? 'All clinic branches globally'
                    : `All branches in ${currentOrg?.shortName || currentOrg?.name}`}
                </div>
              </div>
            </div>
            {isAllSelected && <Check className="w-4 h-4 text-primary shrink-0 ml-2" />}
          </button>

          <div className="border-t border-slate-100 my-1" />

          {/* Individual clinic branches */}
          {availableClinics.map((clinic) => {
            const isSelected = selectedClinicId === clinic.id;
            return (
              <button
                key={clinic.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setSelectedClinicId(clinic.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left cursor-pointer ${
                  isSelected
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-medium truncate text-slate-800">{clinic.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                    <MapPin className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                    <span>{clinic.city}</span>
                    {clinic.status === 'inactive' && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-600 text-[9px] font-bold">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-primary shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
