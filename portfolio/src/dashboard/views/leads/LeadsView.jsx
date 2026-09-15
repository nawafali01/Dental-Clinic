import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, RotateCcw, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { useOrg } from '@/dashboard/shared/context/OrgContext';
import { storageService } from '@/services/storage.service';
import { scopeData } from '@/utils/scopeData';
import { PermissionGuard } from '@/guards/PermissionGuard';
import { buildRoleUrl } from '@/utils/getRoleBaseUrl';
import { Badge, StatCard, Table } from '../components/ViewComponents';
import { NewLeadModal } from './components/NewLeadModal';
import { CLINICS, getClinicById, getClinicsByOrgId, isSameClinic } from '@/constants/clinics';
import { organizationsService, INITIAL_ORGANIZATIONS } from '@/services/organizationsService';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'converted', label: 'Converted' },
  { id: 'lost', label: 'Lost' },
];

const getStatusBadgeColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'converted':
      return 'green';
    case 'qualified':
      return 'purple';
    case 'proposal':
      return 'blue';
    case 'contacted':
      return 'amber';
    case 'lost':
      return 'red';
    case 'new':
      return 'blue';
    default:
      return 'blue';
  }
};

export const LeadsView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const { currentOrg } = useOrg();        // ← fixes ReferenceError: currentOrg was used but never defined
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Active role detection
  const role = currentUser?.role;
  const isSuperAdmin = role === 'super_admin';
  const isOrgAdmin = role === 'org_admin';
  const isClinicManager = role === 'clinic_manager';
  const isReceptionist = role === 'receptionist';
  const isAgent = role === 'agent';
  const isAuditor = role === 'auditor';

  // Clinic Manager assigned clinic resolution
  const managerClinicId = currentUser?.clinicId || (currentUser?.clinicIds && currentUser?.clinicIds[0]) || 'clinic-downtown';
  const assignedClinicObj = getClinicById(managerClinicId);
  const assignedClinicName = assignedClinicObj?.name || 'Downtown Dental Excellence';

  // Org ID resolution for Org Admin & Auditor
  const userOrgId = currentUser?.organizationId || (isOrgAdmin || isAuditor ? 'org-001' : null);

  // Scoped user payload ensuring org_admin & auditor are bound to their organization
  const scopedUser = useMemo(() => ({
    ...currentUser,
    role,
    organizationId: currentUser?.organizationId || (isOrgAdmin || isAuditor ? 'org-001' : null),
    clinicId: (isClinicManager || isAgent || isReceptionist) ? managerClinicId : currentUser?.clinicId,
  }), [currentUser, role, isOrgAdmin, isAuditor, isClinicManager, isAgent, isReceptionist, managerClinicId]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState('all');
  const [selectedClinicFilter, setSelectedClinicFilter] = useState(
    (isClinicManager || isAgent || isReceptionist) ? managerClinicId : (selectedClinicId && selectedClinicId !== 'all' ? selectedClinicId : 'all')
  );
  const [statusFilter, setStatusFilter] = useState('all');

  // Organizations list (for Super Admin)
  const organizations = useMemo(() => {
    const orgs = organizationsService.getOrganizationsSync();
    if (orgs && Array.isArray(orgs) && orgs.length > 0) return orgs;
    return INITIAL_ORGANIZATIONS;
  }, []);

  // Clinics available to the current user and filter
  const availableClinics = useMemo(() => {
    if (isOrgAdmin && userOrgId) {
      return getClinicsByOrgId(userOrgId);
    }
    if (isSuperAdmin) {
      if (selectedOrgFilter === 'all') {
        return CLINICS.filter((c) => !c.isAlias);
      }
      return CLINICS.filter((c) => !c.isAlias && c.orgId === selectedOrgFilter);
    }
    if (userOrgId) {
      return getClinicsByOrgId(userOrgId);
    }
    return CLINICS.filter((c) => !c.isAlias);
  }, [isOrgAdmin, isSuperAdmin, userOrgId, selectedOrgFilter]);

  // 1. Fetch raw data and pass through multi-tenant scoping utility
  const rawLeads = storageService.get(storageService.KEYS.LEADS) || [];
  const scopedLeads = useMemo(() => {
    return scopeData({
      resource: 'leads',
      data: rawLeads,
      currentUser: scopedUser,
      selectedClinicId: (isClinicManager || isReceptionist) ? managerClinicId : ((isSuperAdmin || isOrgAdmin) ? 'all' : selectedClinicId),
    });
  }, [rawLeads, scopedUser, isSuperAdmin, isOrgAdmin, isClinicManager, isReceptionist, managerClinicId, selectedClinicId, refreshTrigger]);

  // 2. Apply interactive page-level filters (Search, Org, Clinic, Status)
  const filteredLeads = useMemo(() => {
    return scopedLeads.filter((lead) => {
      // Organization filter (Super Admin only)
      if (isSuperAdmin && selectedOrgFilter !== 'all') {
        const leadClinic = getClinicById(lead.clinicId);
        const leadOrgId = lead.orgId || lead.organizationId || leadClinic?.orgId;
        if (leadOrgId !== selectedOrgFilter) return false;
      }

      // Clinic filter
      if (!isClinicManager && !isReceptionist && selectedClinicFilter !== 'all') {
        if (!isSameClinic(lead.clinicId, selectedClinicFilter)) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if ((lead.status || 'new').toLowerCase() !== statusFilter.toLowerCase()) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const patientName = (lead.patientName || lead.name || '').toLowerCase();
        const email = (lead.email || '').toLowerCase();
        const phone = (lead.phone || lead.phoneNumber || '').toLowerCase();
        const treatment = (lead.treatment || '').toLowerCase();
        const source = (lead.source || '').toLowerCase();
        const clinicObj = getClinicById(lead.clinicId);
        const clinicName = (clinicObj?.name || '').toLowerCase();

        const matches =
          patientName.includes(query) ||
          email.includes(query) ||
          phone.includes(query) ||
          treatment.includes(query) ||
          source.includes(query) ||
          clinicName.includes(query);

        if (!matches) return false;
      }

      return true;
    });
  }, [scopedLeads, isSuperAdmin, selectedOrgFilter, selectedClinicFilter, statusFilter, searchQuery]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    (isSuperAdmin && selectedOrgFilter !== 'all') ||
    selectedClinicFilter !== 'all' ||
    statusFilter !== 'all'
  );

  const resetFilters = () => {
    setSearchQuery('');
    if (isSuperAdmin) setSelectedOrgFilter('all');
    setSelectedClinicFilter('all');
    setStatusFilter('all');
  };

  // Dynamic KPI Counts
  const total = filteredLeads.length;
  const newCount = filteredLeads.filter((l) => (l.status || 'new').toLowerCase() === 'new').length;
  const qualifiedCount = filteredLeads.filter((l) => l.status === 'qualified').length;
  const convertedCount = filteredLeads.filter((l) => l.status === 'converted').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isReceptionist
              ? 'Basic patient contact list for reception & appointment inquiries'
              : isAgent
              ? 'Leads assigned to your workspace pipeline'
              : isClinicManager
              ? `Track and manage leads for ${assignedClinicName}`
              : isOrgAdmin
              ? `Track and manage leads for ${currentOrg?.name || 'your organization'}`
              : 'Track and manage all organization & clinic leads'}
          </p>
        </div>
        <PermissionGuard resource="leads" action="create">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs self-start sm:self-auto"
          >
            + New Lead
          </button>
        </PermissionGuard>
      </div>

      {/* Role Notice Banners */}
      {isReceptionist && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-500 text-white rounded-xl font-bold text-xs">RECEPTIONIST</span>
            <p className="text-sm text-blue-900 font-medium">
              Basic Contact Access Mode — Internal notes, lead values, and pipeline stage controls are hidden.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-blue-200 text-blue-700 rounded-full">
            Basic Contact Only
          </span>
        </div>
      )}

      {isAgent && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
          <span className="p-2 bg-emerald-600 text-white rounded-xl font-bold text-xs">AGENT</span>
          <p className="text-sm text-emerald-900 font-medium">
            Assigned Leads Mode — Displaying only leads currently assigned to you.
          </p>
        </div>
      )}

      {isAuditor && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-purple-600 text-white rounded-xl font-bold text-xs">AUDITOR</span>
            <p className="text-sm text-purple-900 font-medium">
              Read-Only Audit Mode — Reviewing organization-wide patient inquiries and pipeline history. Lead mutations are disabled.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-purple-200 text-purple-700 rounded-full">
            Zero Write Access
          </span>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={isAgent ? 'Assigned Leads' : 'Total Leads'} value={total} sub="Scoped dataset" />
        <StatCard label="New Today" value={newCount} sub="Needs contact" />
        <StatCard label="Qualified" value={qualifiedCount} sub="In pipeline" />
        <StatCard label="Converted" value={convertedCount} sub="Won" />
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads by name, email, phone, or treatment..."
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Organization Selector (Super Admin) OR Org Badge (Org Admin) */}
            {!isClinicManager && !isAgent && !isReceptionist && (
              isSuperAdmin ? (
                <div className="relative">
                  <select
                    aria-label="Filter by Organization"
                    value={selectedOrgFilter}
                    onChange={(e) => {
                      setSelectedOrgFilter(e.target.value);
                      setSelectedClinicFilter('all');
                    }}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
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
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>{currentOrg?.name || 'Smile Care Group'}</span>
                </div>
              )
            )}

            {/* Clinic Selector / Fixed Badge */}
            {(isClinicManager || isAgent || isReceptionist) ? (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span>{assignedClinicName}</span>
              </div>
            ) : (
              <div className="relative">
                <select
                  aria-label="Filter by Clinic"
                  value={selectedClinicFilter}
                  onChange={(e) => setSelectedClinicFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs max-w-[210px] truncate"
                >
                  <option value="all">
                    {isOrgAdmin ? `All Org Clinics (${availableClinics.length})` : `All Clinics (${availableClinics.length})`}
                  </option>
                  {availableClinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Selector */}
            <div className="relative">
              <select
                aria-label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Quick-Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.id;
            const count = tab.id === 'all'
              ? scopedLeads.length
              : scopedLeads.filter((l) => (l.status || 'new').toLowerCase() === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Leads Table */}
      {isReceptionist ? (
        <Table
          headers={['Patient Name', 'Phone', 'Email', 'Status', 'Clinic Branch', 'Date Received', 'Action']}
          rows={filteredLeads.map((l) => {
            const clinic = getClinicById(l.clinicId);
            const clinicName = clinic?.name || l.clinicId || 'Downtown Dental Excellence';
            return [
              <span key="name" className="font-semibold text-slate-900">
                {l.patientName || l.name || 'Anonymous Patient'}
              </span>,
              l.phone || l.phoneNumber || '(555) 123-4567',
              l.email || 'N/A',
              <Badge key="badge" color={getStatusBadgeColor(l.status)}>
                {l.status || 'new'}
              </Badge>,
              <div key="clinic" className="flex flex-col">
                <span className="font-medium text-slate-800">{clinicName}</span>
                {clinic?.city && <span className="text-[11px] text-slate-400">{clinic.city}</span>}
              </div>,
              l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '2026-08-03',
              <button
                key="act"
                onClick={() => navigate(buildRoleUrl(`/leads/${l.id}`, role))}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                View Contact
              </button>,
            ];
          })}
        />
      ) : (
        <Table
          headers={['Lead Name', 'Status', 'Source / Treatment', 'Assigned Agent', 'Clinic', 'Action']}
          rows={filteredLeads.map((l) => {
            const clinic = getClinicById(l.clinicId);
            const clinicName = clinic?.name || l.clinicId || 'Downtown Dental Excellence';
            return [
              <div key="name" className="flex flex-col">
                <span className="font-semibold text-slate-900">{l.patientName || l.name || 'Anonymous Lead'}</span>
                {(l.email || l.phone) && (
                  <span className="text-xs text-slate-400">
                    {l.email || l.phone}
                  </span>
                )}
              </div>,
              <Badge key="badge" color={getStatusBadgeColor(l.status)}>
                {l.status || 'new'}
              </Badge>,
              <div key="treatment" className="flex flex-col">
                <span className="font-medium text-slate-800">{l.treatment || 'Consultation'}</span>
                {l.source && <span className="text-[11px] text-slate-400">{l.source}</span>}
              </div>,
              l.assignedAgentName || l.assignedAgentId || (isAgent ? currentUser?.name : 'Unassigned'),
              <div key="clinic" className="flex flex-col">
                <span className="font-medium text-slate-800">{clinicName}</span>
                {clinic?.city && <span className="text-[11px] text-slate-400">{clinic.city}</span>}
              </div>,
              <button
                key="act"
                onClick={() => navigate(buildRoleUrl(`/leads/${l.id}`, role))}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                {isAuditor ? 'View Record' : 'Manage Lead'}
              </button>,
            ];
          })}
        />
      )}

      {/* New Lead Modal */}
      <NewLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        currentUser={scopedUser}
        selectedClinicId={selectedClinicFilter !== 'all' ? selectedClinicFilter : selectedClinicId}
      />
    </div>
  );
};

export default LeadsView;
