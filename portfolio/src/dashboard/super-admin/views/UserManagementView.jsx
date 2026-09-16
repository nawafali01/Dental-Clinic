import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Building2,
  MapPin,
  Pencil,
  Power,
  Trash2,
  Eye,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api';
import { usersService } from '@/services/usersService';
import { organizationsService } from '@/services/organizationsService';
import { clinicsService } from '@/services/clinicsService';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { Button } from '@/dashboard/shared/components/ui/Button';
import { UserModal } from '@/dashboard/super-admin/components/users/UserModal';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/dashboard/shared/context/RoleContext';
import { useOrg } from '@/dashboard/shared/context/OrgContext';
import { ROLES } from '@/constants/permissions';
import {
  ROLE_BADGE_CONFIG,
  ROLE_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '@/constants/userConstants';

export default function UserManagementView({ readOnly = false }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { userRole } = useRole();
  const { currentOrg } = useOrg();
  const isSuperAdmin = userRole === 'super_admin';
  const isOrgAdmin = userRole === 'org_admin';
  const isClinicManager = userRole === 'clinic_manager';
  const isAuditor = userRole === 'auditor';
  // Roles that can create users (all except auditor and below)
  const canManageUsers = isSuperAdmin || isOrgAdmin || isClinicManager;
  const userOrgId = currentUser?.organizationId || currentUser?.organization_id || currentOrg?.id || 'org-001';

  const [users, setUsers] = useState(() => usersService.getUsers() || []);
  const [organizations, setOrganizations] = useState(() => organizationsService.getOrganizationsSync() || []);
  const [clinics, setClinics] = useState(() => clinicsService.getClinics() || []);
  const [isLoading, setIsLoading] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState('ALL');
  const [selectedClinicFilter, setSelectedClinicFilter] = useState('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [statusConfirmUser, setStatusConfirmUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const rawOrgs = organizationsService.getOrganizationsSync();
      const c = clinicsService.getClinics();
      setOrganizations(Array.isArray(rawOrgs) ? rawOrgs : []);
      setClinics(Array.isArray(c) ? c : []);

      // Fetch live users directly from backend GET /api/v1/users/
      const result = await usersService.fetchUsers();
      if (result.data) {
        setUsers(result.data);
      } else {
        setUsers(usersService.getUsersSync());
      }
    } catch (err) {
      console.warn('Failed to load live users:', err.message);
      setUsers(usersService.getUsersSync());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Base users list strictly scoped for org_admin and auditor, excluding super_admin accounts
  const baseScopedUsers = useMemo(() => {
    const staffUsers = users.filter(
      (u) => u.role !== ROLES.SUPER_ADMIN && u.role !== 'super_admin'
    );
    if (isAuditor) {
      return staffUsers.filter((u) => u.organizationId === userOrgId);
    }
    if (isOrgAdmin) {
      const allClinicIds = clinics.map((c) => c.id);
      if (selectedClinicFilter !== 'ALL') {
        return staffUsers.filter(
          (u) =>
            u.clinicId === selectedClinicFilter ||
            (Array.isArray(u.clinicIds) && u.clinicIds.includes(selectedClinicFilter)) ||
            (Array.isArray(u.assignedClinics) && u.assignedClinics.includes(selectedClinicFilter)) ||
            u.organizationId === userOrgId ||
            !u.organizationId
        );
      }
      return staffUsers.filter(
        (u) => !u.organizationId || u.organizationId === userOrgId || u.organizationId === 'org-001'
      );
    }
    return staffUsers;
  }, [users, clinics, isOrgAdmin, isAuditor, userOrgId, selectedClinicFilter]);

  // Role filter options excluding Super Admin
  const roleFilterOptions = useMemo(() => {
    return ROLE_FILTER_OPTIONS.filter(
      (opt) => opt.value !== ROLES.SUPER_ADMIN && opt.value !== 'super_admin'
    ).map((opt) => (opt.value === 'ALL' ? { ...opt, label: 'All Roles' } : opt));
  }, []);

  // Filter available clinics in the filter dropdown (all clinics accessible or filtered by selectedOrgFilter)
  const filterClinicOptions = useMemo(() => {
    if (selectedOrgFilter && selectedOrgFilter !== 'ALL') {
      return clinics.filter((c) => c.orgId === selectedOrgFilter);
    }
    return clinics;
  }, [clinics, selectedOrgFilter]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return baseScopedUsers.filter((u) => {
      // 1. Search Query (name or email)
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        (u.name || '').toLowerCase().includes(q) ||
        (u.fullName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // 2. Organization Filter (Super Admin only)
      if (!isOrgAdmin && selectedOrgFilter !== 'ALL') {
        if (selectedOrgFilter === 'GLOBAL') {
          if (u.organizationId) return false;
        } else if (u.organizationId !== selectedOrgFilter) {
          return false;
        }
      }

      // 3. Clinic Filter — checks clinicId, clinicIds, and assignedClinics
      if (selectedClinicFilter !== 'ALL') {
        const matchesClinic =
          u.clinicId === selectedClinicFilter ||
          (Array.isArray(u.clinicIds) && u.clinicIds.includes(selectedClinicFilter)) ||
          (Array.isArray(u.assignedClinics) && u.assignedClinics.includes(selectedClinicFilter));
        if (!matchesClinic) return false;
      }

      // 4. Role Filter
      if (selectedRoleFilter !== 'ALL') {
        if (u.role !== selectedRoleFilter) return false;
      }

      // 5. Status Filter
      if (selectedStatusFilter !== 'ALL') {
        if (selectedStatusFilter === 'active' && u.status !== 'active') return false;
        if (selectedStatusFilter === 'inactive' && u.status !== 'inactive') return false;
        if (selectedStatusFilter === 'invited' && u.status !== 'invited') return false;
      }

      return true;
    });
  }, [
    baseScopedUsers,
    searchQuery,
    isOrgAdmin,
    selectedOrgFilter,
    selectedClinicFilter,
    selectedRoleFilter,
    selectedStatusFilter,
  ]);

  // Statistics
  const totalUsersCount = baseScopedUsers.length;
  const activeUsersCount = baseScopedUsers.filter((u) => u.status === 'active').length;
  const orgAdminsCount = baseScopedUsers.filter((u) => u.role === ROLES.ORG_ADMIN).length;
  const managersCount = baseScopedUsers.filter((u) => u.role === ROLES.CLINIC_MANAGER).length;

  // Actions
  const handleOpenCreate = () => {
    if (!canManageUsers) return;
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user, e) => {
    e.stopPropagation();
    if (!canManageUsers) return;
    if (isOrgAdmin && (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ORG_ADMIN)) {
      toast.error('You cannot modify Super Admin or Org Admin accounts.');
      return;
    }
    if (isClinicManager && (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ORG_ADMIN || user.role === ROLES.AUDITOR)) {
      toast.error('Clinic Managers cannot modify this account.');
      return;
    }
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!canManageUsers || !statusConfirmUser) return;
    if ((isOrgAdmin || isClinicManager) && (statusConfirmUser.role === ROLES.SUPER_ADMIN || statusConfirmUser.role === ROLES.ORG_ADMIN)) {
      toast.error('You cannot change the status of this account.');
      setStatusConfirmUser(null);
      return;
    }
    try {
      const isCurrentlyActive = statusConfirmUser.status === 'active' || statusConfirmUser.is_active;
      const updated = isCurrentlyActive
        ? await usersService.deactivateUser(statusConfirmUser.id)
        : await usersService.activateUser(statusConfirmUser.id);

      await loadData();
      toast.success(`User "${updated.name}" is now ${updated.status}`);
      setStatusConfirmUser(null);
    } catch (err) {
      toast.error('Failed to change status');
    }
  };

  const handleConfirmDelete = async () => {
    if (!canManageUsers || !deleteConfirmUser) return;
    if ((isOrgAdmin || isClinicManager) && (deleteConfirmUser.role === ROLES.SUPER_ADMIN || deleteConfirmUser.role === ROLES.ORG_ADMIN)) {
      toast.error('You cannot delete this account.');
      setDeleteConfirmUser(null);
      return;
    }
    try {
      await usersService.deleteUser(deleteConfirmUser.id, currentUser || userRole);
      await loadData();
      toast.success(`User "${deleteConfirmUser.name}" deleted successfully.`);
      setDeleteConfirmUser(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedOrgFilter('ALL');
    setSelectedClinicFilter('ALL');
    setSelectedRoleFilter('ALL');
    setSelectedStatusFilter('ALL');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-primary" />
            Users & Access Management
            {isAuditor && (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                Read Only • Auditing
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAuditor
              ? 'Read-only staff directory for Smile Care Group. Role assignments and branch scopes.'
              : 'Global directory of platform staff, role assignments, multi-tenant permissions, and branch scoping.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={loadData}
            title="Reload data"
          />
          {canManageUsers && (
            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={handleOpenCreate}
            >
              Create User
            </Button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalUsersCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Across all organizations</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Staff</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeUsersCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Active login access</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Organization Admins</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{orgAdminsCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Multi-clinic scope</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinic Managers</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{managersCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Branch operational leads</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
            />
          </div>

          {/* Quick Clear */}
          {(searchQuery ||
            selectedOrgFilter !== 'ALL' ||
            selectedClinicFilter !== 'ALL' ||
            selectedRoleFilter !== 'ALL' ||
            selectedStatusFilter !== 'ALL') && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-rose-600 hover:underline font-semibold whitespace-nowrap cursor-pointer self-center"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1 text-xs">
          {/* Organization Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Organization
            </label>
            {isSuperAdmin ? (
              <select
                value={selectedOrgFilter}
                onChange={(e) => {
                  setSelectedOrgFilter(e.target.value);
                  setSelectedClinicFilter('ALL'); // Reset clinic on org change
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium cursor-pointer"
              >
                <option value="ALL">All Organizations</option>
                {Array.isArray(organizations) &&
                  organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
              </select>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span>{currentOrg?.name || 'Smile Care Group'}</span>
              </div>
            )}
          </div>

          {/* Clinic Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Clinic Branch
            </label>
            <select
              value={selectedClinicFilter}
              onChange={(e) => setSelectedClinicFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium cursor-pointer"
            >
              <option value="ALL">All Clinics ({filterClinicOptions.length})</option>
              {filterClinicOptions.map((clinic) => {
                const org = organizations.find((o) => o.id === clinic.orgId);
                const orgSuffix = org ? ` • ${org.name}` : '';
                return (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.name} ({clinic.city || 'Branch'}{orgSuffix})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Platform Role
            </label>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium cursor-pointer"
            >
              {roleFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Status
            </label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium cursor-pointer"
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Organization</th>
                <th className="px-5 py-3.5">Branch Clinic</th>
                <th className="px-5 py-3.5">Status</th>
                {!isAuditor && <th className="px-5 py-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={isAuditor ? 5 : 6} className="text-center py-12 text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                    <p className="font-semibold text-slate-700 text-sm">No users matched your filters</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try searching for a different keyword or resetting filters.
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleConfig = ROLE_BADGE_CONFIG[u.role] || {
                    label: u.role,
                    color: 'bg-slate-100 text-slate-700 border-slate-200',
                  };

                  const clinic = clinics.find(
                    (c) =>
                      c.id === u.clinicId ||
                      (Array.isArray(u.clinicIds) && u.clinicIds.includes(c.id)) ||
                      (Array.isArray(u.assignedClinics) && u.assignedClinics.includes(c.id))
                  );
                  // For multi-clinic users show count instead of first clinic
                  const assignedCount = (u.assignedClinics || []).length;
                  const targetOrgId =
                    u.organizationId ||
                    u.organization_id ||
                    clinic?.orgId ||
                    (isOrgAdmin ? userOrgId : null);
                  const org =
                    organizations.find((o) => o.id === targetOrgId) ||
                    (targetOrgId === 'org-001' ? { id: 'org-001', name: 'Smile Care Group' } : null) ||
                    (currentOrg && (!targetOrgId || targetOrgId === currentOrg.id) ? currentOrg : null) ||
                    (targetOrgId ? { id: targetOrgId, name: currentOrg?.name || 'Smile Care Group' } : null);
                  const isActive = u.status === 'active';

                  return (
                    <tr
                      key={u.id}
                      onClick={() => !isAuditor && navigate(`/admin/users/${u.id}`)}
                      className={`hover:bg-slate-50/80 transition-colors ${isAuditor ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {/* Name & Email */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 hover:text-primary transition-colors">
                              {u.name || u.fullName}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${roleConfig.color}`}
                        >
                          {roleConfig.label}
                        </span>
                      </td>

                      {/* Organization */}
                      <td className="px-5 py-3.5">
                        {u.role === ROLES.SUPER_ADMIN ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                            <Sparkles className="w-3 h-3 text-purple-500" /> Global Scope
                          </span>
                        ) : org ? (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-800 text-xs truncate max-w-[150px]">
                              {org.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Clinic Branch */}
                      <td className="px-5 py-3.5">
                        {clinic ? (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium text-slate-700 text-xs truncate max-w-[150px]">
                              {clinic.name}
                              {assignedCount > 1 && (
                                <span className="ml-1 text-[10px] text-slate-400">+{assignedCount - 1} more</span>
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">
                            {u.role === ROLES.SUPER_ADMIN ? 'All Branches' : 'All Branches (Org-wide)'}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={
                            u.status === 'active'
                              ? 'success'
                              : u.status === 'invited'
                              ? 'warning'
                              : 'neutral'
                          }
                          dot
                        >
                          {u.status === 'invited' ? 'Invited' : isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>

                      {/* Actions */}
                      {!isAuditor && (
                        <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Detail */}
                            <button
                              onClick={() => navigate(`/admin/users/${u.id}`)}
                              title="View user details"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Quick Edit / Reassign */}
                            {(!isOrgAdmin || (u.role !== ROLES.SUPER_ADMIN && u.role !== ROLES.ORG_ADMIN)) && (
                              <button
                                onClick={(e) => handleOpenEdit(u, e)}
                                title="Edit Role & Clinic Assignment"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}

                            {/* Toggle Active / Inactive status */}
                            {(!isOrgAdmin || (u.role !== ROLES.SUPER_ADMIN && u.role !== ROLES.ORG_ADMIN)) && (
                              <button
                                onClick={() => setStatusConfirmUser(u)}
                                title={isActive ? 'Deactivate User' : 'Activate User'}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  isActive
                                    ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                    : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                              >
                                <Power className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete User */}
                            {u.role !== ROLES.SUPER_ADMIN && (!isOrgAdmin || u.role !== ROLES.ORG_ADMIN) && (
                              <button
                                onClick={() => setDeleteConfirmUser(u)}
                                title="Delete User Account"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
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
      </div>

      {/* Confirmation Dialog for Activate/Deactivate */}
      {statusConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setStatusConfirmUser(null)}
          />
          <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl max-w-sm w-full p-6 z-10 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {statusConfirmUser.status === 'active' ? 'Deactivate User Account?' : 'Activate User Account?'}
            </h3>
            <p className="text-xs text-slate-500">
              {statusConfirmUser.status === 'active'
                ? `Deactivating "${statusConfirmUser.name}" will immediately revoke their ability to log in and perform actions.`
                : `Activating "${statusConfirmUser.name}" will restore their platform access.`}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setStatusConfirmUser(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmToggleStatus}
                className={`px-3.5 py-2 text-xs font-semibold text-white rounded-xl cursor-pointer ${
                  statusConfirmUser.status === 'active'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Confirm {statusConfirmUser.status === 'active' ? 'Deactivation' : 'Activation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Delete User */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setDeleteConfirmUser(null)}
          />
          <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl max-w-sm w-full p-6 z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Delete User Account?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently remove <span className="font-semibold text-slate-700">{deleteConfirmUser.name}</span> ({deleteConfirmUser.email})? This action will completely remove them from the platform.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer shadow-xs"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToEdit={userToEdit}
        lockedOrgId={(isOrgAdmin || isClinicManager) ? userOrgId : null}
        onSuccess={() => {
          loadData();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
