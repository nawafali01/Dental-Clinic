import React, { useState, useRef, useEffect } from 'react';
import { useClinic } from '@/context/ClinicContext';
import { Building2, ChevronDown, Check, MapPin } from 'lucide-react';

/**
 * ClinicSwitcher
 *
 * Allows multi-clinic roles (super_admin, org_admin) to switch the active
 * branch scope directly from the dashboard header. The selected clinic is
 * persisted in localStorage (key: 'selectedBranch') and survives page refresh.
 *
 * For all other roles the component renders nothing — they are automatically
 * scoped to their assigned clinic via ClinicContext.
 *
 * Placement: Existing dashboard Header, alongside OrgSwitcher / role badge.
 * Design: Reuses the existing design system (rounded-xl, border-slate-200,
 *          primary colour token, text-xs sizes) — no redesign.
 */
export const ClinicSwitcher = () => {
  const { selectedClinic, availableClinics, setSelectedClinicId, canSwitch } =
    useClinic();
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button — matches existing header control style */}
      <button
        id="clinic-switcher-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Switch clinic branch"
      >
        <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="font-semibold text-slate-800 hidden sm:inline max-w-[130px] truncate">
          {selectedClinic?.name || 'Select Clinic'}
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
          className="absolute right-0 mt-2 w-68 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-0.5"
          style={{ minWidth: '240px' }}
        >
          {/* Section header */}
          <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Building2 className="w-3 h-3" />
            <span>Switch Clinic Branch</span>
          </div>

          {availableClinics.map((clinic) => {
            const isSelected = selectedClinic?.id === clinic.id;
            return (
              <button
                key={clinic.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setSelectedClinicId(clinic.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-xl text-xs transition-colors text-left ${
                  isSelected
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{clinic.name}</div>
                  <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    <span>{clinic.city}</span>
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
