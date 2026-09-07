import React from 'react';
import { Search, Plus, Calendar, LayoutList, CalendarDays, CalendarRange, Building2 } from 'lucide-react';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { Button } from '@/dashboard/shared/components/ui/Button';
import { useRole } from '@/dashboard/shared/context/RoleContext';
import { useOrg } from '@/dashboard/shared/context/OrgContext';
import {
  VIEW_MODES,
  APPOINTMENT_STATUSES,
  DOCTORS_LIST,
  TREATMENTS_FILTER_LIST,
} from '../constants';

export const Header = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  selectedOrgId,
  onSelectOrgId,
  selectedClinicId,
  onSelectClinicId,
  selectedDoctorId,
  onSelectDoctorId,
  selectedTreatment,
  onSelectTreatment,
  selectedStatus,
  onSelectStatus,
  organizations,
  availableClinics,
  onOpenBookingModal,
  isClinicManager = false,
  assignedClinicName = 'Downtown Dental Excellence',
}) => {
  const { userRole } = useRole();
  const { currentOrg } = useOrg();
  const isSuperAdmin = userRole === 'super_admin';

  const getViewIcon = (id) => {
    switch (id) {
      case 'day':
        return Calendar;
      case 'week':
        return CalendarDays;
      case 'month':
        return CalendarRange;
      case 'list':
      default:
        return LayoutList;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {userRole === 'agent'
                ? 'My Appointments & Schedule'
                : isClinicManager
                ? 'Clinic Appointments & Scheduling'
                : isSuperAdmin
                ? 'Appointment Operations & Scheduling'
                : 'Organization Appointments & Scheduling'}
            </h1>
            <Badge variant={isClinicManager ? 'green' : isSuperAdmin ? 'purple' : 'blue'} dot>
              {isClinicManager ? assignedClinicName : isSuperAdmin ? 'Live Clinical Feed' : 'Organization Feed'}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {userRole === 'agent'
              ? `Personal appointments and patient schedule for ${assignedClinicName}.`
              : isClinicManager
              ? `Patient appointment calendar, bookings, and treatment schedules for ${assignedClinicName}.`
              : isSuperAdmin
              ? 'Multi-clinic calendar scheduling, real-time status transitions, and AI no-show risk mitigation.'
              : `Multi-clinic calendar scheduling and appointment operations for ${currentOrg?.name || 'your organization'}.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
            {VIEW_MODES.map((mode) => {
              const Icon = getViewIcon(mode.id);
              return (
                <button
                  key={mode.id}
                  onClick={() => onViewModeChange(mode.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === mode.id
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {mode.label}
                </button>
              );
            })}
          </div>

          {/* Book Appointment CTA */}
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={onOpenBookingModal}
            className="cursor-pointer shadow-2xs"
          >
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Multi-Tenant Global Filters Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient name, contact, doctor, or treatment..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Organization Filter: Super Admin has dropdown, Org Admin has fixed organization badge */}
          {!isClinicManager && (
            isSuperAdmin ? (
              <select
                aria-label="Filter by Organization"
                value={selectedOrgId}
                onChange={(e) => onSelectOrgId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
              >
                <option value="all">All Organizations</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span>{currentOrg?.name || 'Smile Care Group'}</span>
              </div>
            )
          )}

          {/* Clinic Filter: If Clinic Manager, show assigned clinic badge; otherwise show dropdown */}
          {isClinicManager ? (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>{assignedClinicName}</span>
            </div>
          ) : (
            <select
              aria-label="Filter by Clinic"
              value={selectedClinicId}
              onChange={(e) => onSelectClinicId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs max-w-[170px] truncate"
            >
              <option value="all">
                {isSuperAdmin ? `All Clinics (${availableClinics.length})` : `All Org Clinics (${availableClinics.length})`}
              </option>
              {availableClinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
          )}

          {/* Doctor / Provider Filter */}
          <select
            aria-label="Filter by Doctor"
            value={selectedDoctorId}
            onChange={(e) => onSelectDoctorId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs max-w-[180px] truncate"
          >
            {DOCTORS_LIST.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>

          {/* Treatment Filter */}
          <select
            aria-label="Filter by Treatment"
            value={selectedTreatment}
            onChange={(e) => onSelectTreatment(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs max-w-[170px] truncate"
          >
            {TREATMENTS_FILTER_LIST.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            aria-label="Filter by Status"
            value={selectedStatus}
            onChange={(e) => onSelectStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
          >
            {APPOINTMENT_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export const AppointmentsHeader = Header;
export default Header;
