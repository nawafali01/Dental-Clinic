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
import { PatientModal } from './components/PatientModal';

export const PatientsView = () => {
  const { currentUser } = useAuth();
  const { userRole } = useRole();
  const { selectedClinicId } = useClinic();
  const role = userRole || currentUser?.role || 'org_admin';
  const isSuperAdmin = role === 'super_admin';
  const isOrgAdmin = role === 'org_admin';
  const isClinicManager = role === 'clinic_manager';
  const isAgent = role === 'agent';
  const isReceptionist = role === 'receptionist';
  const isScopedClinic = isClinicManager || isAgent || isReceptionist;

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
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  const rawPatients = useMemo(() => {
    return storageService.get(storageService.KEYS.PATIENTS) || [];
  }, [refreshTrigger]);

  const scopedPatients = useMemo(() => {
    return scopeData({
      resource: 'patients',
      data: rawPatients,
      currentUser: scopedUser,
      selectedClinicId: isScopedClinic ? managerClinicId : ((isSuperAdmin || isOrgAdmin) ? 'all' : selectedClinicId),
    });
  }, [rawPatients, scopedUser, isSuperAdmin, isOrgAdmin, isScopedClinic, managerClinicId, selectedClinicId]);

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
  const filteredPatients = useMemo(() => {
    return scopedPatients.filter((p) => {
      // Clinic Filter
      if (!isScopedClinic && selectedClinicFilter !== 'all') {
        if (!isSameClinic(p.clinicId, selectedClinicFilter)) {
          return false;
        }
      }

      // Status Filter
      if (selectedStatusFilter !== 'all') {
        const patientStatus = (p.status || 'Active').toLowerCase();
        if (patientStatus !== selectedStatusFilter.toLowerCase()) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const fullName = (p.fullName || p.name || '').toLowerCase();
        const phone = (p.phone || '').toLowerCase();
        const email = (p.email || '').toLowerCase();
        const medicalHistory = (p.medicalHistory || '').toLowerCase();
        const clinicName = (getClinicById(p.clinicId)?.name || p.clinicId || '').toLowerCase();

        return (
          fullName.includes(query) ||
          phone.includes(query) ||
          email.includes(query) ||
          medicalHistory.includes(query) ||
          clinicName.includes(query)
        );
      }

      return true;
    });
  }, [scopedPatients, selectedClinicFilter, selectedStatusFilter, searchQuery]);

  const hasActiveFilters = searchQuery !== '' || selectedClinicFilter !== 'all' || selectedStatusFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedClinicFilter('all');
    setSelectedStatusFilter('all');
  };

  const total = scopedPatients.length;
  const filteredTotal = filteredPatients.length;
  const activeCount = filteredPatients.filter(p => (p.status || 'Active').toLowerCase() === 'active').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="Patient records, branch attribution, and medical history"
        action="+ Add Patient"
        onAction={() => setIsModalOpen(true)}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Patients" value={total} sub="In active scope" />
        <StatCard label="Filtered Results" value={filteredTotal} sub={hasActiveFilters ? "Matches criteria" : "Showing all"} />
        <StatCard label="Active Patients" value={activeCount} sub="Regular status" />
        <StatCard label="New This Month" value={Math.ceil(total * 0.4)} sub="Recent signups" />
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
              placeholder="Search by name, phone, email, notes or clinic..."
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

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none py-1 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
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
        headers={["Patient Name", "Phone", "Email / Notes", "Clinic Branch", "Status"]}
        rows={filteredPatients.map(p => {
          const clinicObj = getClinicById(p.clinicId);
          const clinicDisplayName = clinicObj?.name || p.clinicId || 'Downtown Dental';
          const clinicCity = clinicObj?.city ? ` • ${clinicObj.city}` : '';

          return [
            <span key="name" className="font-semibold text-slate-900">{p.fullName || p.name || 'John Doe'}</span>,
            p.phone || '+1-555-0000',
            <div key="contact" className="flex flex-col">
              <span className="text-slate-700">{p.email || 'N/A'}</span>
              {p.medicalHistory && <span className="text-xs text-slate-400 italic">{p.medicalHistory}</span>}
            </div>,
            <div key="clinic" className="flex flex-col">
              <span className="text-slate-900 font-medium">{clinicDisplayName}</span>
              <span className="text-[11px] text-slate-400">{p.clinicId}{clinicCity}</span>
            </div>,
            <Badge key="status" color={(p.status || 'Active').toLowerCase() === 'active' ? "green" : "amber"}>
              {p.status || 'Active'}
            </Badge>
          ];
        })}
      />

      <PatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        currentUser={currentUser}
        selectedClinicId={selectedClinicId}
      />
    </div>
  );
};

export default PatientsView;
