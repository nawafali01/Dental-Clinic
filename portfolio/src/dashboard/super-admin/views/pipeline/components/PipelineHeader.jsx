import React from 'react';
import { Search, Download, LayoutList, Kanban, Filter, Plus } from 'lucide-react';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { Button } from '@/dashboard/shared/components/ui/Button';
import { PIPELINE_STATUSES, LEAD_SOURCES } from '../constants';

export const PipelineHeader = ({
  searchQuery,
  onSearchChange,
  selectedOrgId,
  onSelectOrgId,
  selectedClinicId,
  onSelectClinicId,
  selectedStatus,
  onSelectStatus,
  selectedSource,
  onSelectSource,
  viewMode,
  onToggleViewMode,
  organizations,
  availableClinics,
  onExport,
  onNewLead,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Banner Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Global Lead Pipeline & CRM</h1>
            <Badge variant="purple" dot>
              Cross-Network Live Feed
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Multi-clinic lead acquisition, attribution tracking, and intelligent assignment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => onToggleViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              Table View
            </button>
            <button
              onClick={() => onToggleViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              Kanban Board
            </button>
          </div>

          {/* Quick CSV Export */}
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={onExport}
            className="cursor-pointer shadow-2xs hover:bg-slate-50"
          >
            Export Leads
          </Button>

          {/* New Lead Quick Action */}
          {onNewLead && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={onNewLead}
              className="cursor-pointer shadow-2xs"
            >
              Add Lead
            </Button>
          )}
        </div>
      </div>

      {/* Multi-Tenant Global Filters Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Organization Filter */}
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

          {/* Clinic Filter */}
          <select
            aria-label="Filter by Clinic"
            value={selectedClinicId}
            onChange={(e) => onSelectClinicId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs max-w-[180px] truncate"
          >
            <option value="all">All Clinics ({availableClinics.length})</option>
            {availableClinics.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name}
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
            {PIPELINE_STATUSES.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>

          {/* Source Filter */}
          <select
            aria-label="Filter by Source"
            value={selectedSource}
            onChange={(e) => onSelectSource(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
          >
            {LEAD_SOURCES.map((src) => (
              <option key={src.id} value={src.id}>
                {src.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
