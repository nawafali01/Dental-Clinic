import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, RotateCcw, Building2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { storageService } from '@/services/storage.service';
import { scopeData } from '@/utils/scopeData';
import { clinicsService } from '@/services/clinicsService';
import { getClinicById, isSameClinic } from '@/constants/clinics';
import { getRevenues } from '@/services/revenueService';
import { StatCard, DevBanner, PageHeader, Table } from '../components/ViewComponents';

import { useRole } from '@/dashboard/shared/context/RoleContext';

export const RevenueView = () => {
  const { currentUser } = useAuth();
  const { userRole } = useRole();
  const { selectedClinicId } = useClinic();
  const role = userRole || currentUser?.role || 'org_admin';
  const isSuperAdmin = role === 'super_admin';
  const isOrgAdmin = role === 'org_admin';
  const isClinicManager = role === 'clinic_manager';

  const managerClinicId = currentUser?.clinicId || (currentUser?.clinicIds && currentUser?.clinicIds[0]) || 'clinic-downtown';
  const assignedClinicObj = getClinicById(managerClinicId);
  const assignedClinicName = assignedClinicObj?.name || 'Downtown Dental Excellence';

  const scopedUser = useMemo(() => ({
    ...currentUser,
    role,
    organizationId: currentUser?.organizationId || (isOrgAdmin ? 'org-001' : null),
    clinicId: isClinicManager ? managerClinicId : currentUser?.clinicId,
  }), [currentUser, role, isOrgAdmin, isClinicManager, managerClinicId]);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClinicFilter, setSelectedClinicFilter] = useState(
    isClinicManager ? managerClinicId : 'all'
  );
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('all');
  const [rawRev, setRawRev] = useState([]);

  useEffect(() => {
    let active = true;
    async function loadRevenues() {
      try {
        const data = await getRevenues({}, currentUser);
        if (active) setRawRev(data || []);
      } catch (err) {
        console.warn('RevenueView fetch error:', err);
      }
    }
    loadRevenues();
    return () => { active = false; };
  }, [currentUser]);

  const scopedRev = useMemo(() => {
    return scopeData({
      resource: 'revenue',
      data: rawRev,
      currentUser: scopedUser,
      selectedClinicId: isClinicManager ? managerClinicId : ((isSuperAdmin || isOrgAdmin) ? 'all' : selectedClinicId),
    });
  }, [rawRev, scopedUser, isSuperAdmin, isOrgAdmin, isClinicManager, managerClinicId, selectedClinicId]);

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

  // Distinct months in dataset
  const availableMonths = useMemo(() => {
    const months = new Set();
    scopedRev.forEach((r) => {
      const m = r.month || (r.created_at ? r.created_at.slice(0, 7) : null);
      if (m) months.add(m);
    });
    return Array.from(months).sort().reverse();
  }, [scopedRev]);

  // Filtered dataset
  const filteredRev = useMemo(() => {
    return scopedRev.filter((r) => {
      // Clinic Filter
      if (!isClinicManager && selectedClinicFilter !== 'all') {
        if (!isSameClinic(r.clinicId || r.clinic_id, selectedClinicFilter)) {
          return false;
        }
      }

      // Month Filter
      if (selectedMonthFilter !== 'all') {
        const m = r.month || (r.created_at ? r.created_at.slice(0, 7) : '');
        if (m !== selectedMonthFilter) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const clinicName = (getClinicById(r.clinicId || r.clinic_id)?.name || r.clinicId || r.clinic_id || '').toLowerCase();
        const month = (r.month || (r.created_at ? r.created_at.slice(0, 7) : '')).toLowerCase();

        return clinicName.includes(query) || month.includes(query);
      }

      return true;
    });
  }, [scopedRev, selectedClinicFilter, selectedMonthFilter, searchQuery]);

  const hasActiveFilters = searchQuery !== '' || selectedClinicFilter !== 'all' || selectedMonthFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedClinicFilter('all');
    setSelectedMonthFilter('all');
  };

  const totalAmount = filteredRev.reduce((acc, r) => acc + (r.revenue || r.total_amount || 0), 0);
  const totalConversions = filteredRev.reduce((acc, r) => acc + (r.conversions !== undefined ? r.conversions : (Number(r.revenue || r.total_amount) > 0 ? 1 : 0)), 0);
  const formattedTotal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalAmount);
  const avgAmount = filteredRev.length > 0 ? totalAmount / filteredRev.length : 0;
  const formattedAvg = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(avgAmount);

  return (
    <div className="space-y-6">
      <PageHeader title="Revenue" description="Financial overview, branch revenue tracking, and period comparisons" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formattedTotal} sub={hasActiveFilters ? "Filtered total" : "Scoped dataset"} />
        <StatCard label="Monthly Records" value={filteredRev.length} sub={hasActiveFilters ? "Matching records" : "All periods"} />
        <StatCard label="Avg Revenue" value={formattedAvg} sub="Per monthly record" />
        <StatCard label="Total Conversions" value={totalConversions} sub="Patient conversions" />
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
              placeholder="Search by clinic name or month (YYYY-MM)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Clinic Filter / Fixed Badge */}
            {isClinicManager ? (
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

            {/* Month Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <select
                value={selectedMonthFilter}
                onChange={(e) => setSelectedMonthFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none py-1 cursor-pointer"
              >
                <option value="all">All Months</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
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
        headers={["Clinic Branch", "Month", "Revenue", "Conversions", "Conv. Rate"]}
        rows={filteredRev.map(r => {
          const clinicObj = getClinicById(r.clinicId || r.clinic_id);
          const clinicDisplayName = clinicObj?.name || r.clinicId || r.clinic_id || 'Downtown Dental';
          const monthStr = r.month || (r.created_at ? r.created_at.slice(0, 7) : '2026-09');
          const conversionsVal = r.conversions !== undefined ? r.conversions : (Number(r.revenue || r.total_amount) > 0 ? 1 : 0);
          const rateVal = r.conversionRate !== undefined ? r.conversionRate : (conversionsVal > 0 ? 100 : 0);

          return [
            <div key="clinic" className="flex flex-col">
              <span className="font-semibold text-slate-900">{clinicDisplayName}</span>
              {clinicObj?.city && <span className="text-[11px] text-slate-400">{clinicObj.city}</span>}
            </div>,
            monthStr,
            <span key="rev" className="font-semibold text-emerald-600">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(r.revenue || r.total_amount || 0)}
            </span>,
            conversionsVal,
            `${rateVal}%`
          ];
        })}
      />
    </div>
  );
};

export default RevenueView;
