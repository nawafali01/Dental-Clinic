import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { useRole } from '@/dashboard/shared/context/RoleContext';
import { useOrg } from '@/dashboard/shared/context/OrgContext';
import { clinicsService } from '@/services/clinicsService';
import { scopeData } from '@/utils/scopeData';
import { Badge, StatCard, PageHeader } from '../components/ViewComponents';
import { ClinicModal } from './components/ClinicModal';

export const ClinicsView = () => {
  const { currentUser } = useAuth();
  const { userRole } = useRole();
  const { selectedClinicId } = useClinic();
  const { selectedOrgId, setSelectedOrgId, organizations, currentOrg } = useOrg();
  const role = userRole || currentUser?.role || 'org_admin';
  const isSuperAdmin = role === 'super_admin';
  const isOrgAdmin = role === 'org_admin';
  const isFinance = role === 'finance';
  const isAuditor = role === 'auditor';
  const isOrgScoped = isOrgAdmin || isFinance || isAuditor;
  const canManageClinics = isSuperAdmin || isOrgAdmin;
  const userOrgId = currentUser?.organizationId || (isOrgScoped ? 'org-001' : null);

  const scopedUser = useMemo(() => ({
    ...currentUser,
    role,
    organizationId: userOrgId,
  }), [currentUser, role, userOrgId]);

  const [clinicsList, setClinicsList] = useState(() => clinicsService.getClinics());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clinicToEdit, setClinicToEdit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [clinicToDelete, setClinicToDelete] = useState(null);

  const refreshClinics = () => {
    setClinicsList(clinicsService.getClinics());
  };

  // Scope data according to logged in user role & branch selection
  const scopedClinics = useMemo(() => {
    return scopeData({
      resource: 'clinics',
      data: clinicsList,
      currentUser: scopedUser,
      selectedClinicId: (isSuperAdmin || isOrgScoped) ? 'all' : selectedClinicId,
    });
  }, [clinicsList, scopedUser, isSuperAdmin, isOrgScoped, selectedClinicId]);

  // Filtered clinics by Organization, Search, and Status
  const filteredClinics = useMemo(() => {
    return scopedClinics.filter((c) => {
      // Organization filter
      const effectiveOrg = isOrgScoped ? (userOrgId || 'org-001') : selectedOrgId;
      if (effectiveOrg && effectiveOrg !== 'all') {
        if (c.orgId !== effectiveOrg) return false;
      }

      const orgName = organizations.find((o) => o.id === c.orgId)?.name || '';

      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        orgName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && c.status !== 'inactive') ||
        (statusFilter === 'INACTIVE' && c.status === 'inactive');

      return matchesSearch && matchesStatus;
    });
  }, [scopedClinics, selectedOrgId, searchQuery, statusFilter, organizations]);

  // Actions
  const handleOpenAdd = () => {
    if (!canManageClinics) return;
    setClinicToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (clinic, e) => {
    e.stopPropagation();
    if (!canManageClinics) return;
    setClinicToEdit(clinic);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (clinicId, e) => {
    e.stopPropagation();
    if (!canManageClinics) {
      toast.error('Unauthorized: Read-only access');
      return;
    }
    try {
      const updated = clinicsService.toggleClinicStatus(clinicId);
      refreshClinics();
      toast.success(`Clinic "${updated.name}" is now ${updated.status}!`);
    } catch (err) {
      toast.error('Failed to change clinic status');
    }
  };

  const handleConfirmDelete = () => {
    if (!clinicToDelete) return;
    if (!canManageClinics) {
      toast.error('Unauthorized: Read-only access');
      return;
    }
    try {
      clinicsService.deleteClinic(clinicToDelete.id);
      refreshClinics();
      toast.success(`Clinic "${clinicToDelete.name}" removed`);
      setClinicToDelete(null);
    } catch (err) {
      toast.error('Failed to delete clinic');
    }
  };

  const activeCount = filteredClinics.filter((c) => c.status !== 'inactive').length;
  const inactiveCount = filteredClinics.filter((c) => c.status === 'inactive').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isFinance || isAuditor ? "Clinic Branches" : "Clinics Management"}
        description={
          isFinance || isAuditor
            ? "Dental clinic branches, locations, and operational contacts across your organization (Read Only)."
            : "Configure dental clinic branches, locations, operating hours, and operational status."
        }
        action={canManageClinics ? "+ Add Clinic Branch" : undefined}
        onAction={canManageClinics ? handleOpenAdd : undefined}
      />

      {/* KPI Cards (Recalculated per filtered scope) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Branches"
          value={filteredClinics.length}
          sub={isOrgScoped ? 'Your organization' : (selectedOrgId === 'all' ? 'All organizations' : 'Selected organization')}
        />
        <StatCard label="Active Locations" value={activeCount} sub="Operational & accepting leads" />
        <StatCard label="Maintenance / Inactive" value={inactiveCount} sub="Temporarily paused" />
        <StatCard label="Avg Branch Rating" value="4.9 ★" sub="Patient feedback score" />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search branch name, city, organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Organization Filter or Locked Badge for Org-Scoped Roles */}
          {isOrgScoped ? (
            <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs self-stretch sm:self-auto">
              <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{organizations.find((o) => o.id === (userOrgId || 'org-001'))?.name || 'Smile Care Group'}</span>
            </div>
          ) : (
            <div className="relative sm:w-64">
              <select
                aria-label="Filter by Organization"
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
              >
                <option value="all">All Organizations ({organizations.filter((o) => !o.isGlobal).length})</option>
                {organizations
                  .filter((org) => !org.isGlobal)
                  .map((org) => {
                    const branchCount = clinicsList.filter((c) => c.orgId === org.id).length;
                    return (
                      <option key={org.id} value={org.id}>
                        {org.name} ({branchCount} branches)
                      </option>
                    );
                  })}
              </select>
            </div>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {[
            { label: 'All', value: 'ALL' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Inactive', value: 'INACTIVE' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                statusFilter === tab.value
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clinics Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
            <tr>
              <th className="px-5 py-3 font-bold uppercase tracking-wider text-[10px]">Clinic Branch</th>
              <th className="px-5 py-3 font-bold uppercase tracking-wider text-[10px]">Organization</th>
              <th className="px-5 py-3 font-bold uppercase tracking-wider text-[10px]">Location & City</th>
              <th className="px-5 py-3 font-bold uppercase tracking-wider text-[10px]">Contact Phone</th>
              <th className="px-5 py-3 font-bold uppercase tracking-wider text-[10px]">Operating Hours</th>
              <th className="px-5 py-3 font-bold uppercase tracking-wider text-[10px]">Status</th>
              {canManageClinics && (
                <th className="px-5 py-3 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredClinics.length === 0 ? (
              <tr>
                <td colSpan={canManageClinics ? 7 : 6} className="text-center py-12 text-slate-400">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                  <p className="font-semibold text-slate-600">No clinic branches found</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {canManageClinics ? 'Try adjusting your filters or add a new branch' : 'No branches match your search query'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredClinics.map((c) => {
                const isActive = c.status !== 'inactive';
                const parentOrg = organizations.find((o) => o.id === c.orgId);

                return (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Branch Info */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{c.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">{c.id}</span>
                            <span className="text-[10px] text-slate-300">•</span>
                            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                              Mgr: {c.manager || 'Unassigned'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Parent Organization */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        <Building2 className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate max-w-[130px]">
                          {parentOrg?.shortName || parentOrg?.name || c.orgId || 'Smile Care Group'}
                        </span>
                      </span>
                    </td>

                    {/* City & Address */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-start gap-1 text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800">{c.city || 'Riyadh'}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{c.address || 'Central District'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-3.5 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{c.phone || '+1 (555) 020-0000'}</span>
                      </div>
                    </td>

                    {/* Operating Hours */}
                    <td className="px-5 py-3.5 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{c.operatingHours || '08:00 AM - 08:00 PM'}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions (Hidden for View-Only roles like Finance) */}
                    {canManageClinics && (
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle status */}
                          <button
                            onClick={(e) => handleToggleStatus(c.id, e)}
                            title={isActive ? 'Deactivate Branch' : 'Activate Branch'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isActive
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={(e) => handleOpenEdit(c, e)}
                            title="Edit Clinic Details"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setClinicToDelete(c);
                            }}
                            title="Delete Clinic"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Clinic Modal */}
      <ClinicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshClinics}
        currentUser={scopedUser}
        clinicToEdit={clinicToEdit}
      />

      {/* Delete Confirmation Modal */}
      {clinicToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Clinic Branch?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-slate-800">"{clinicToDelete.name}"</span>? Associated operational stats may become unlinked.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setClinicToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicsView;
