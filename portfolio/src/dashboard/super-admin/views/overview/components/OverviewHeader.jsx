import React from 'react';
import { Download, Building2 } from 'lucide-react';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { Button } from '@/dashboard/shared/components/ui/Button';
import { useRole } from '@/dashboard/shared/context/RoleContext';
import { useOrg } from '@/dashboard/shared/context/OrgContext';
import { DATE_RANGES } from '../constants';

export const OverviewHeader = ({
  selectedDateRange,
  onSelectDateRange,
  selectedOrgId,
  onSelectOrgId,
  selectedClinicId,
  onSelectClinicId,
  organizations,
  availableClinics,
  onExport,
}) => {
  const { userRole } = useRole();
  const { currentOrg } = useOrg();
  const isSuperAdmin = userRole === 'super_admin';

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {isSuperAdmin ? 'Super Admin Dashboard' : 'Organization Dashboard'}
          </h1>
          <Badge variant={isSuperAdmin ? 'purple' : 'blue'} dot>
            {isSuperAdmin ? 'System Executive View' : 'Organization View'}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {isSuperAdmin
            ? 'System-wide multi-clinic operations, revenue analytics, and performance health.'
            : `Multi-clinic operations, revenue analytics, and performance health for ${currentOrg?.name || 'your organization'}.`}
        </p>
      </div>

      {/* Global Controls Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Date Range Selector */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
          {DATE_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => onSelectDateRange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedDateRange === range
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Organization Filter: Super Admin has dropdown, Org Admin has fixed organization badge */}
        {isSuperAdmin ? (
          <div className="relative">
            <select
              aria-label="Filter by Organization"
              value={selectedOrgId}
              onChange={(e) => onSelectOrgId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
            >
              <option value="all">All Organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            <span>{currentOrg?.name || 'Smile Care Group'}</span>
          </div>
        )}

        {/* Clinic Filter */}
        <div className="relative">
          <select
            aria-label="Filter by Clinic"
            value={selectedClinicId}
            onChange={(e) => onSelectClinicId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs max-w-[200px] truncate"
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
        </div>

        {/* Quick Export Button */}
        <Button
          variant="outline"
          size="sm"
          icon={Download}
          onClick={onExport}
          className="cursor-pointer shadow-2xs hover:bg-slate-50"
        >
          Quick Export
        </Button>
      </div>
    </div>
  );
};
