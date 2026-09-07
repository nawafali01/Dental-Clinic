import React, { useState, useMemo } from 'react';
import { Search, Filter, RotateCcw, Building2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { storageService } from '@/services/storage.service';
import { scopeData } from '@/utils/scopeData';
import { clinicsService } from '@/services/clinicsService';
import { getClinicById, isSameClinic } from '@/constants/clinics';
import { Badge, StatCard, PageHeader, Table } from '../components/ViewComponents';
import { useRole } from '@/dashboard/shared/context/RoleContext';
import { LogCallModal } from './components/LogCallModal';

export const CallsView = () => {
  const { currentUser } = useAuth();
  const { userRole } = useRole();
  const { selectedClinicId } = useClinic();
  const role = userRole || currentUser?.role || 'org_admin';
  const isSuperAdmin = role === 'super_admin';
  const isOrgAdmin = role === 'org_admin';
  const isClinicManager = role === 'clinic_manager';
  const isAgent = role === 'agent';
  const isScopedClinic = isClinicManager || isAgent;

  const managerClinicId = currentUser?.clinicId || (currentUser?.clinicIds && currentUser?.clinicIds[0]) || 'clinic-downtown';
  const assignedClinicObj = getClinicById(managerClinicId);
  const assignedClinicName = assignedClinicObj?.name || 'Downtown Dental Excellence';

  const scopedUser = useMemo(() => ({
    ...currentUser,
    role,
    organizationId: currentUser?.organizationId || (isOrgAdmin ? 'org-001' : null),
    clinicId: isScopedClinic ? managerClinicId : currentUser?.clinicId,
  }), [currentUser, role, isOrgAdmin, isScopedClinic, managerClinicId]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClinicFilter, setSelectedClinicFilter] = useState(
    isScopedClinic ? managerClinicId : 'all'
  );
  const [selectedOutcomeFilter, setSelectedOutcomeFilter] = useState('all');

  const rawCalls = useMemo(() => {
    return storageService.get(storageService.KEYS.CALLS) || [];
  }, [refreshTrigger]);

  const scopedCalls = useMemo(() => {
    return scopeData({
      resource: 'calls',
      data: rawCalls,
      currentUser: scopedUser,
      selectedClinicId: isScopedClinic ? managerClinicId : ((isSuperAdmin || isOrgAdmin) ? 'all' : selectedClinicId),
    });
  }, [rawCalls, scopedUser, isSuperAdmin, isOrgAdmin, isScopedClinic, managerClinicId, selectedClinicId]);

  // Clinics available for filter dropdown
  const clinicsList = useMemo(() => {
    try {
      const all = clinicsService.getClinics();
      if (!Array.isArray(all)) return [];
      const userOrgId = scopedUser?.organizationId || (isOrgAdmin ? 'org-001' : null);
      if (isOrgAdmin && userOrgId) {
        return all.filter((c) => c.orgId === userOrgId);
      }
      return all;
    } catch {
      return [];
    }
  }, [scopedUser, isOrgAdmin]);

  // Filtered dataset
  const filteredCalls = useMemo(() => {
    return scopedCalls.filter((c) => {
      // Clinic Filter
      if (!isScopedClinic && selectedClinicFilter !== 'all') {
        if (!isSameClinic(c.clinicId, selectedClinicFilter)) {
          return false;
        }
      }

      // Outcome Filter
      if (selectedOutcomeFilter !== 'all') {
        const outcome = (c.outcome || '').toLowerCase();
        if (selectedOutcomeFilter === 'missed-any') {
          if (outcome !== 'missed' && outcome !== 'no-answer') return false;
        } else if (outcome !== selectedOutcomeFilter.toLowerCase()) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const leadName = (c.leadName || '').toLowerCase();
        const notes = (c.notes || '').toLowerCase();
        const outcome = (c.outcome || '').toLowerCase();
        const clinicName = (getClinicById(c.clinicId)?.name || c.clinicId || '').toLowerCase();

        return (
          leadName.includes(query) ||
          notes.includes(query) ||
          outcome.includes(query) ||
          clinicName.includes(query)
        );
      }

      return true;
    });
  }, [scopedCalls, selectedClinicFilter, selectedOutcomeFilter, searchQuery]);

  const hasActiveFilters = searchQuery !== '' || selectedClinicFilter !== 'all' || selectedOutcomeFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedClinicFilter('all');
    setSelectedOutcomeFilter('all');
  };

  const total = filteredCalls.length;
  const booked = filteredCalls.filter(c => c.outcome === 'booked').length;
  const missed = filteredCalls.filter(c => c.outcome === 'missed' || c.outcome === 'no-answer').length;
  const contacted = filteredCalls.filter(c => c.outcome === 'contacted').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calls"
        description="Track all inbound, outbound calls, and branch attribution"
        action="+ Log Call"
        onAction={() => setIsModalOpen(true)}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Calls" value={total} sub={hasActiveFilters ? "Filtered results" : "Scoped dataset"} />
        <StatCard label="Booked" value={booked} sub="Successful bookings" />
        <StatCard label="Contacted" value={contacted} sub="In conversation" />
        <StatCard label="Missed / Unanswered" value={missed} sub="Follow-up needed" />
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by caller, lead, notes, outcome or clinic..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Clinic Filter / Fixed Badge */}
            {isScopedClinic ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span>{assignedClinicName}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedClinicFilter}
                  onChange={(e) => setSelectedClinicFilter(e.target.value)}
                  className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none py-1 cursor-pointer"
                >
                  <option value="all">All Clinics</option>
                  {clinicsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city || 'Branch'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Outcome Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <select
                value={selectedOutcomeFilter}
                onChange={(e) => setSelectedOutcomeFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none py-1 cursor-pointer"
              >
                <option value="all">All Outcomes</option>
                <option value="booked">Booked</option>
                <option value="contacted">Contacted</option>
                <option value="missed">Missed</option>
                <option value="no-answer">No Answer</option>
                <option value="missed-any">All Missed/Unanswered</option>
              </select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium px-2.5 py-1.5 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <Table
        headers={["Caller / Lead", "Clinic Branch", "Duration", "Outcome", "Date & Time"]}
        rows={filteredCalls.map(c => {
          const clinicObj = getClinicById(c.clinicId);
          const clinicDisplayName = clinicObj?.name || c.clinicId || 'Downtown Dental';

          return [
            <div key="caller" className="flex flex-col">
              <span className="font-semibold text-slate-900">{c.leadName || 'Caller'}</span>
              {c.notes && <span className="text-xs text-slate-500 mt-0.5">{c.notes}</span>}
            </div>,
            <div key="clinic" className="flex flex-col">
              <span className="text-slate-900 font-medium">{clinicDisplayName}</span>
              {clinicObj?.city && <span className="text-[11px] text-slate-400">{clinicObj.city}</span>}
            </div>,
            c.duration ? `${Math.floor(c.duration / 60)}m ${c.duration % 60}s` : '0m 0s',
            <Badge key="badge" color={c.outcome === 'booked' ? 'green' : (c.outcome === 'missed' || c.outcome === 'no-answer') ? 'red' : 'amber'}>
              {c.outcome === 'no-answer' ? 'No Answer' : (c.outcome || 'contacted')}
            </Badge>,
            c.date ? new Date(c.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Aug 3 — 09:15 AM'
          ];
        })}
      />

      <LogCallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        currentUser={currentUser}
        selectedClinicId={selectedClinicId}
      />
    </div>
  );
};

export default CallsView;
