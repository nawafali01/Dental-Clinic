import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, RotateCcw, X, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { useOrg } from '@/dashboard/shared/context/OrgContext';
import { storageService } from '@/services/storage.service';
import { leadsService } from '@/services/leadsService';
import { scopeData } from '@/utils/scopeData';
import { PermissionGuard } from '@/guards/PermissionGuard';
import { buildRoleUrl } from '@/utils/getRoleBaseUrl';
import { Badge, StatCard, Table } from '../components/ViewComponents';
import { Pagination } from '@/dashboard/shared/components/ui/Pagination';
import { NewLeadModal } from './components/NewLeadModal';
import { CLINICS, getClinicById, getClinicsByOrgId, isSameClinic } from '@/constants/clinics';
import { clinicsService } from '@/services/clinicsService';
import { organizationsService, INITIAL_ORGANIZATIONS } from '@/services/organizationsService';
import { usersService, getAgentDisplayName } from '@/services/usersService';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'won', label: 'Won' },
  { id: 'lost', label: 'Lost' },
  { id: 'on_hold', label: 'On Hold' },
];

const getStatusBadgeColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'converted':
    case 'won':
      return 'green';
    case 'qualified':
      return 'purple';
    case 'proposal':
    case 'negotiation':
      return 'blue';
    case 'contacted':
      return 'amber';
    case 'lost':
      return 'red';
    case 'on_hold':
      return 'slate';
    case 'new':
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
  const role = currentUser?.role?.toLowerCase() || '';
  const isSuperAdmin = role === 'super_admin';
  const isOrgAdmin = role === 'org_admin';
  const isClinicManager = role === 'clinic_manager';
  const isReceptionist = role === 'receptionist' || role === 'reception';
  const isAgent = role === 'agent';
  const isAuditor = role === 'auditor';
  const isFinance = role === 'finance';

  // Exclude finance and auditor from pagination as requested
  const isFinanceOrAuditor = isFinance || isAuditor;
  const shouldPaginate = !isFinanceOrAuditor;

  // Pagination state (same as UsersView)
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Clinic Manager assigned clinic resolution
  const managerAssignedClinics = useMemo(() => {
    return [
      ...(Array.isArray(currentUser?.assigned_clinics) ? currentUser.assigned_clinics : []),
      ...(Array.isArray(currentUser?.assignedClinics) ? currentUser.assignedClinics : []),
      ...(Array.isArray(currentUser?.clinicIds) ? currentUser.clinicIds : []),
      ...(currentUser?.clinicId ? [currentUser.clinicId] : []),
      ...(currentUser?.clinic_id ? [currentUser.clinic_id] : []),
    ].filter(Boolean);
  }, [currentUser]);

  const [backendClinics, setBackendClinics] = useState(() => clinicsService.getClinics() || []);
  const [users, setUsers] = useState(() => usersService.getUsersSync() || []);

  useEffect(() => {
    clinicsService.fetchClinics().then((res) => {
      if (res?.data && Array.isArray(res.data)) {
        setBackendClinics(res.data);
      }
    }).catch(() => {});

    usersService.fetchUsers().then((res) => {
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setUsers(res.data);
      }
    }).catch(() => {});
  }, []);

  const usersMap = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      if (u.id) map[u.id] = u;
      if (u._id) map[u._id] = u;
    });
    return map;
  }, [users]);

  const managerClinicId = managerAssignedClinics[0] || currentUser?.clinicId || 'clinic-downtown';
  const assignedClinicObj = useMemo(() => {
    return (
      getClinicById(managerClinicId) ||
      backendClinics.find((c) => c.id === managerClinicId || isSameClinic(c.id, managerClinicId))
    );
  }, [managerClinicId, backendClinics]);
  const assignedClinicName = assignedClinicObj?.name || 'doctor_hospital';

  // Org ID resolution for Org Admin & Auditor
  const userOrgId = currentUser?.organizationId || currentUser?.organization_id || (isOrgAdmin || isAuditor ? 'org-001' : null);

  // Scoped user payload ensuring org_admin & auditor are bound to their organization
  const scopedUser = useMemo(() => ({
    ...currentUser,
    role,
    organizationId: currentUser?.organizationId || currentUser?.organization_id || (isOrgAdmin || isAuditor ? 'org-001' : null),
    clinicId: (isClinicManager || isAgent || isReceptionist) ? managerClinicId : currentUser?.clinicId,
    assigned_clinics: managerAssignedClinics,
    clinicIds: managerAssignedClinics,
  }), [currentUser, role, isOrgAdmin, isAuditor, isClinicManager, isAgent, isReceptionist, managerClinicId, managerAssignedClinics]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState('all');
  const [selectedClinicFilter, setSelectedClinicFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Organizations list (for Super Admin)
  const [backendOrgs, setBackendOrgs] = useState(() => {
    const sync = organizationsService.getOrganizationsSync();
    return (sync && sync.length > 0) ? sync : [];
  });

  useEffect(() => {
    organizationsService.getOrganizations().then((res) => {
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setBackendOrgs(res.data);
      }
    }).catch(() => {});
  }, []);

  const { organizations: orgsFromCtx } = useOrg();
  const organizations = useMemo(() => {
    return orgsFromCtx && orgsFromCtx.length > 0 ? orgsFromCtx : [];
  }, [orgsFromCtx]);

  // Clinics available to the current user and filter
  const availableClinics = useMemo(() => {
    const list = [...backendClinics];
    for (const c of CLINICS) {
      if (!c.isAlias && !list.some((b) => b.id === c.id || isSameClinic(b.id, c.id))) {
        list.push(c);
      }
    }
    if (isClinicManager || isReceptionist) {
      return list.filter((c) => managerAssignedClinics.some((mId) => mId === c.id || isSameClinic(mId, c.id)));
    }
    if (isOrgAdmin && userOrgId && userOrgId !== 'org-001') {
      return list.filter((c) => c.orgId === userOrgId || c.organization_id === userOrgId);
    }
    if (isSuperAdmin && selectedOrgFilter !== 'all' && selectedOrgFilter !== 'org-001') {
      return list.filter((c) => c.orgId === selectedOrgFilter || c.organization_id === selectedOrgFilter);
    }
    return list;
  }, [isClinicManager, isReceptionist, managerAssignedClinics, isOrgAdmin, isSuperAdmin, userOrgId, selectedOrgFilter, backendClinics]);

  // 1. Fetch leads strictly from live API (mock data removed)
  const [leads, setLeads] = useState(() => leadsService.getLeadsSync());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadLeads = async () => {
      setIsLoading(true);
      try {
        let orgParam = (selectedOrgFilter !== 'all' && selectedOrgFilter !== 'org-001') ? selectedOrgFilter : undefined;
        let clinicParam = (selectedClinicFilter !== 'all' && !selectedClinicFilter.startsWith('clinic-')) ? selectedClinicFilter : undefined;

        if (isClinicManager || isReceptionist) {
          clinicParam = managerClinicId;
          orgParam = currentUser?.organization_id || currentUser?.organizationId || undefined;
        }

        const res = await leadsService.fetchLeads({
          organization_id: orgParam,
          clinic_id: clinicParam,
        }, scopedUser);
        if (isMounted) {
          setLeads(res?.data || []);
        }
      } catch (err) {
        console.warn('Error loading leads from API:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadLeads();
    return () => {
      isMounted = false;
    };
  }, [selectedOrgFilter, selectedClinicFilter, refreshTrigger, isSuperAdmin, userOrgId, isClinicManager, isReceptionist, managerClinicId, scopedUser]);

  // 2. Pass through multi-tenant scoping utility
  const scopedLeads = useMemo(() => {
    return scopeData({
      resource: 'leads',
      data: leads,
      currentUser: scopedUser,
      selectedClinicId: (isClinicManager || isReceptionist || isAgent) ? managerClinicId : selectedClinicId,
    });
  }, [leads, scopedUser, isClinicManager, isReceptionist, isAgent, managerClinicId, selectedClinicId]);

  // 3. Apply interactive page-level filters (Search, Org, Clinic, Status)
  const filteredLeads = useMemo(() => {
    return scopedLeads.filter((lead) => {
      // Clinic scoping for Clinic Manager & Receptionist: STRICTLY lock to assigned clinic(s)
      if (isClinicManager || isReceptionist) {
        const leadClinic = lead.clinic_id || lead.clinicId;
        const matchesManagerClinic = managerAssignedClinics.some((cId) =>
          leadClinic === cId || isSameClinic(leadClinic, cId)
        );
        if (!matchesManagerClinic) return false;
      }

      // Organization filter (Super Admin only)
      if (isSuperAdmin && selectedOrgFilter !== 'all') {
        const leadClinic = getClinicById(lead.clinicId) || backendClinics.find((c) => c.id === lead.clinicId);
        const leadOrgId = lead.orgId || lead.organizationId || leadClinic?.orgId || leadClinic?.organization_id;
        if (leadOrgId !== selectedOrgFilter) return false;
      }

      // Clinic filter (for Super Admin / Org Admin)
      if (!isClinicManager && !isReceptionist && selectedClinicFilter !== 'all') {
        const matches = lead.clinicId === selectedClinicFilter || isSameClinic(lead.clinicId, selectedClinicFilter);
        if (!matches) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const leadStatus = (lead.status || 'new').toLowerCase();
        const target = statusFilter.toLowerCase();
        if (target === 'won' || target === 'converted') {
          if (leadStatus !== 'won' && leadStatus !== 'converted') return false;
        } else if (leadStatus !== target) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const patientName = (lead.patientName || lead.name || '').toLowerCase();
        const email = (lead.email || '').toLowerCase();
        const phone = (lead.phone || lead.phoneNumber || '').toLowerCase();
        const treatment = (lead.treatment || '').toLowerCase();
        const source = (lead.source || '').toLowerCase();
        const clinicObj = getClinicById(lead.clinicId) || backendClinics.find((c) => c.id === lead.clinicId);
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
  }, [scopedLeads, isSuperAdmin, selectedOrgFilter, selectedClinicFilter, statusFilter, searchQuery, backendClinics, isClinicManager, isReceptionist, managerAssignedClinics]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    (isSuperAdmin && selectedOrgFilter !== 'all') ||
    selectedClinicFilter !== 'all' ||
    statusFilter !== 'all'
  );

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedOrgFilter, selectedClinicFilter, statusFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    if (isSuperAdmin) setSelectedOrgFilter('all');
    setSelectedClinicFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  // Sort leads newest first so newly registered leads always appear at the top
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.created_at || a.updatedAt || 0).getTime();
      const timeB = new Date(b.createdAt || b.created_at || b.updatedAt || 0).getTime();
      return timeB - timeA;
    });
  }, [filteredLeads]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(sortedLeads.length / PAGE_SIZE));
  const displayedLeads = useMemo(() => {
    if (!shouldPaginate) return sortedLeads;
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedLeads.slice(start, start + PAGE_SIZE);
  }, [sortedLeads, currentPage, shouldPaginate]);

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
            {isFinance
              ? 'Read-only financial auditing view to review revenue and billing details across leads'
              : isReceptionist || isClinicManager
              ? `Track and manage leads for ${assignedClinicName}`
              : isAgent
              ? 'Leads assigned to your workspace pipeline'
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
      {isFinance && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-600 text-white rounded-xl font-bold text-xs">FINANCE</span>
            <p className="text-sm text-emerald-900 font-medium">
              Financial Auditing Scope — Read-only access across leads to review revenue, invoices, and payment receipts. General lead editing is disabled.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-full">
            Financial Audit View
          </span>
        </div>
      )}

      {isReceptionist && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-500 text-white rounded-xl font-bold text-xs">RECEPTIONIST</span>
            <p className="text-sm text-blue-900 font-medium">
              Assigned Clinic Scope — Managing and tracking leads for {assignedClinicName}.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-blue-200 text-blue-700 rounded-full">
            {assignedClinicName}
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

            {/* Sync / Refresh Button */}
            <button
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              title="Sync leads with backend API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
              <span>{isLoading ? 'Syncing...' : 'Sync'}</span>
            </button>

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
      <Table
          isLoading={isLoading}
          emptyMessage="No leads found in backend database"
          emptySubtext={hasActiveFilters ? "Try adjusting or clearing your filters" : "Click '+ New Lead' above to create a new lead in the backend"}
          headers={['Lead Name', 'Status', 'Source / Treatment', 'Assigned Agent', 'Clinic', 'Action']}
          rows={displayedLeads.map((l) => {
            const leadClinicId = l.clinicId || l.clinic_id;
            const clinic = getClinicById(leadClinicId) || backendClinics.find((c) => c.id === leadClinicId || isSameClinic(c.id, leadClinicId));
            const clinicName = clinic?.name || (leadClinicId === 'f0c74f65-f068-47ad-b82c-27f3413976e2' ? 'Doctor Hospital' : leadClinicId) || 'Doctor Hospital';
            const agentName = getAgentDisplayName(
              l.assigned_to || l.assignedAgentId || l.assignedAgentName,
              usersMap,
              isAgent ? currentUser : null
            );
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
                <span className="font-medium text-slate-800">{l.treatment_interest || l.treatment || 'Consultation'}</span>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  {l.source && <span className="capitalize">{l.source.replace('_', ' ')}</span>}
                  {l.expected_revenue !== undefined && l.expected_revenue !== null ? (
                    <>
                      <span>•</span>
                      <span className="font-medium text-emerald-600">${Number(l.expected_revenue).toLocaleString()}</span>
                    </>
                  ) : null}
                </div>
              </div>,
              <span key="agent" className="font-medium text-slate-800">
                {agentName}
              </span>,
              <div key="clinic" className="flex flex-col">
                <span className="font-medium text-slate-800">{clinicName}</span>
                {clinic?.city && <span className="text-[11px] text-slate-400">{clinic.city}</span>}
              </div>,
              <button
                key="act"
                onClick={() => navigate(buildRoleUrl(`/leads/${l.id}`, role))}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                {isAuditor ? 'View Record' : isFinance ? 'Review Billing' : 'Manage Lead'}
              </button>,
            ];
          })}
          footer={
            shouldPaginate && filteredLeads.length > 0 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredLeads.length}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
                itemLabel="leads"
              />
            ) : null
          }
        />

      {/* New Lead Modal */}
      <NewLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(created) => {
          if (created) {
            setLeads((prev) => [created, ...prev.filter((l) => l.id !== created.id)]);
            setStatusFilter('all');
            setSelectedClinicFilter('all');
            setSelectedOrgFilter('all');
            setSearchQuery('');
            setCurrentPage(1);
          }
          setRefreshTrigger((prev) => prev + 1);
        }}
        currentUser={scopedUser}
        selectedClinicId={selectedClinicFilter !== 'all' ? selectedClinicFilter : selectedClinicId}
      />
    </div>
  );
};

export default LeadsView;
