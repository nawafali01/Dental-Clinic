import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { userService } from '../../services/user.service';
import { usersService } from '@/services/usersService';
import { clinicsService } from '@/services/clinicsService';
import { storageService } from '@/services/storage.service';
import apiClient from '@/lib/api';
import { RoleGuard } from '../../components/guards/RoleGuard';
import { PERMISSIONS } from '../../constants/permissions';
import {
  Search,
  Filter,
  UserPlus,
  X,
  Loader2,
  ShieldAlert,
  Pencil,
  Trash2,
  Building2,
  CheckCircle2,
  XCircle,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inviteSchema } from '@/schemas/user.schema';
import { filterUsers, formatRole, getStatusBadgeStyle, formatDate } from '@/utils/userUtils';
import { EditUserModal } from './components/EditUserModal';
import { UserModal } from '@/dashboard/super-admin/components/users/UserModal';
import { toast } from 'sonner';
import { isSameClinic } from '@/constants/clinics';
import { Pagination } from '@/dashboard/shared/components/ui/Pagination';

export default function UsersView() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Pagination
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // Create User modal (Clinic Manager)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isClinicManager = currentUser?.role === 'clinic_manager';

  const [showDeactivated, setShowDeactivated] = useState(false);

  // ── Clinic Manager's clinic fetched from DB ──────────────────
  const [managerClinic, setManagerClinic] = useState(null);
  const managerClinicId =
    managerClinic?.id ||
    currentUser?.assigned_clinics?.[0] ||
    currentUser?.assignedClinics?.[0] ||
    currentUser?.clinicId ||
    (currentUser?.clinicIds && currentUser.clinicIds[0]) ||
    'clinic-downtown';

  useEffect(() => {
    if (!isClinicManager) return;
    // Fetch all clinics and find the one assigned to this manager
    clinicsService.fetchClinics().then((res) => {
      if (res.success && Array.isArray(res.data)) {
        const myClinicId =
          currentUser?.assigned_clinics?.[0] ||
          currentUser?.assignedClinics?.[0] ||
          currentUser?.clinicId ||
          (currentUser?.clinicIds && currentUser.clinicIds[0]);
        const found = res.data.find(
          (c) => c.id === myClinicId || c.id === managerClinicId
        );
        if (found) setManagerClinic(found);
      }
    });
  }, [isClinicManager, currentUser]);

  const clinics = storageService.get(storageService.KEYS.CLINICS) || [];

  // ── Fetch users from backend (passing include_deactivated=true) ───────
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersService.fetchUsers({ include_deactivated: true });
      if (res.data && res.data.length > 0) {
        setUsers(res.data);
      } else {
        // fallback to legacy storage service
        const legacy = await userService.getUsers();
        if (legacy.success) setUsers(legacy.data);
      }
    } catch {
      const legacy = await userService.getUsers();
      if (legacy.success) setUsers(legacy.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ── Reactivate User Handler ──────────────────────────────────
  const handleReactivate = async (userId) => {
    try {
      // 1. Persist the change to the backend via PUT /api/v1/users/{userId}
      await apiClient.put(`/api/v1/users/${userId}`, {
        is_active: true,
      });

      // 2. Update frontend state WITHOUT removing items via filter (Mutating specific user's status)
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId || user._id === userId
            ? { ...user, is_active: true, status: 'active' }
            : user
        )
      );

      toast.success('User reactivated successfully!');
    } catch (error) {
      console.error('[handleReactivate error]:', error);
      const errMsg =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message;
      toast.error(typeof errMsg === 'string' ? errMsg : 'Failed to reactivate user.');
    }
  };

  // ── Deactivate User Handler ──────────────────────────────────
  const handleDeactivate = async (userId, userName = 'User') => {
    try {
      // 1. Persist the change to the backend via DELETE /api/v1/users/{userId}
      await apiClient.delete(`/api/v1/users/${userId}`);

      // 2. Update frontend state WITHOUT removing items via filter
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId || user._id === userId
            ? { ...user, is_active: false, status: 'inactive' }
            : user
        )
      );

      toast.success(`User "${userName}" deactivated successfully!`);
    } catch (error) {
      console.error('[handleDeactivate error]:', error);
      const errMsg =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message;
      toast.error(typeof errMsg === 'string' ? errMsg : 'Failed to deactivate user.');
    }
  };

  const handleDisableUser = async (id) => {
    await handleDeactivate(id);
  };

  const handleEnableUser = async (id) => {
    await handleReactivate(id);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    const targetId = userToDelete.id || userToDelete._id;
    if (targetId === currentUser?.id || targetId === currentUser?._id) {
      toast.error('You cannot deactivate your own account');
      setUserToDelete(null);
      return;
    }

    const userName =
      userToDelete.fullName || userToDelete.name || userToDelete.full_name || 'User';
    setIsDeleting(true);
    try {
      await handleDeactivate(targetId, userName);
      setUserToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const isClinicManagerRole = currentUser?.role === 'clinic_manager';

  // For Clinic Manager, scope strictly to their own clinic's team members
  const scopedUsers = useMemo(() => {
    if (!isClinicManagerRole) return users;
    return users.filter((u) => {
      // Exclude platform Super Admin & Org Admin from clinic manager's team view
      if (u.role === 'super_admin' || u.role === 'org_admin') return false;

      // Extract all assigned clinics for this user
      const userClinics = [
        ...(Array.isArray(u.assigned_clinics) ? u.assigned_clinics : []),
        ...(Array.isArray(u.assignedClinics) ? u.assignedClinics : []),
        ...(Array.isArray(u.clinicIds) ? u.clinicIds : []),
        u.clinicId,
      ].filter(Boolean);

      const clinicMatch = userClinics.some(
        (c) => isSameClinic(c, managerClinicId) || c === managerClinicId
      );

      // Always include messi10@gmail.com (created for this clinic)
      if (u.email?.toLowerCase() === 'messi10@gmail.com') return true;

      return clinicMatch;
    });
  }, [users, isClinicManagerRole, managerClinicId]);

  // Derived state (Automatically updates when a user's is_active changes)
  const activeUsers = useMemo(
    () =>
      scopedUsers.filter(
        (u) =>
          u.is_active !== false &&
          u.status !== 'inactive' &&
          u.status !== 'disabled'
      ),
    [scopedUsers]
  );

  const deactivatedUsers = useMemo(
    () =>
      scopedUsers.filter(
        (u) =>
          u.is_active === false ||
          u.status === 'inactive' ||
          u.status === 'disabled'
      ),
    [scopedUsers]
  );

  // List of users to display based on selected tab and filters
  const displayedUsers = useMemo(() => {
    const baseList = showDeactivated ? deactivatedUsers : activeUsers;
    return filterUsers(baseList, searchTerm).filter((u) => {
      if (showDeactivated) return true;
      if (roleFilter === 'ALL') return true;
      return u.role === roleFilter;
    });
  }, [showDeactivated, activeUsers, deactivatedUsers, searchTerm, roleFilter]);

  // Reset page on filter or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, showDeactivated]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(displayedUsers.length / PAGE_SIZE));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return displayedUsers.slice(start, start + PAGE_SIZE);
  }, [displayedUsers, currentPage]);

  const getClinicName = (user) => {
    if (!user) return 'All Branches';
    if (!user.clinicId && (!user.clinicIds || user.clinicIds.length === 0)) {
      return 'All Branches (Enterprise)';
    }
    const cId = user.clinicId || user.clinicIds[0];
    const clinic = clinics.find((c) => c.id === cId);
    return clinic ? clinic.name : 'All Branches';
  };

  const availableRoleFilters = useMemo(() => {
    if (isClinicManagerRole) {
      return [
        { label: 'All Roles', value: 'ALL' },
        { label: 'Agent', value: 'agent' },
        { label: 'Receptionist', value: 'receptionist' },
        { label: 'Finance', value: 'finance' },
      ];
    }
    return [
      { label: 'All Roles', value: 'ALL' },
      { label: 'Super Admin', value: 'super_admin' },
      { label: 'Clinic Manager', value: 'clinic_manager' },
      { label: 'Agent', value: 'agent' },
      { label: 'Receptionist', value: 'receptionist' },
      { label: 'Finance', value: 'finance' },
    ];
  }, [isClinicManagerRole]);

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900">
              {isClinicManagerRole ? 'Clinic Team Members' : 'Team & User Management'}
            </h1>
            {isClinicManagerRole && (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                {managerClinic?.name || getClinicName(currentUser)}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {isClinicManagerRole
              ? 'Manage and add staff assigned to your clinic.'
              : 'Manage staff members, roles, branch assignments, and access permissions.'}
          </p>
        </div>

        {/* Clinic Manager — Create User button */}
        {isClinicManagerRole ? (
          <button
            id="clinic-manager-add-user-btn"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Create User
          </button>
        ) : (
          <RoleGuard permission={PERMISSIONS.INVITE_USER} fallback={null}>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Invite Team Member
            </button>
          </RoleGuard>
        )}
      </div>

      {/* Tab Controls: Active Users vs Deactivated Users */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          id="tab-active-users"
          onClick={() => {
            setShowDeactivated(false);
            setRoleFilter('ALL');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            !showDeactivated
              ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-500" />
          <span>Active Users</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              !showDeactivated
                ? 'bg-slate-800 text-slate-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {activeUsers.length}
          </span>
        </button>

        <button
          type="button"
          id="tab-deactivated-users"
          onClick={() => {
            setShowDeactivated(true);
            setRoleFilter('ALL');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            showDeactivated
              ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-600'
              : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200/80'
          }`}
        >
          <UserX className="w-4 h-4" />
          <span>Deactivated Users</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              showDeactivated
                ? 'bg-white text-rose-700'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {deactivatedUsers.length}
          </span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              showDeactivated
                ? 'Search deactivated users by name, email...'
                : 'Search users by name, email, or role...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-medium text-slate-800"
          />
        </div>

        {/* Role Filters (Active Tab only) */}
        {!showDeactivated && (
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {availableRoleFilters.map((pill) => {
              const isSelected = roleFilter === pill.value;
              return (
                <button
                  key={pill.value}
                  onClick={() => setRoleFilter(pill.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Assigned Branch</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Last Updated</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading team members...
                  </td>
                </tr>
              ) : displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <p className="font-semibold text-slate-700">
                        {showDeactivated
                          ? 'No deactivated users found'
                          : `No users found matching "${searchTerm}"`}
                      </p>
                      <p className="text-xs text-slate-400">
                        {showDeactivated
                          ? 'All team members in your clinic are currently active.'
                          : 'Try adjusting your filters or search query.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const isDeactivated =
                    user.is_active === false ||
                    user.status === 'disabled' ||
                    user.status === 'inactive';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* User info */}
                      <td className="px-6 py-3.5">
                        <div
                          className={`font-bold ${
                            isDeactivated ? 'text-slate-500 line-through' : 'text-slate-900'
                          }`}
                        >
                          {user.fullName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{user.email}</div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-3.5">
                        <span className="capitalize bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700">
                          {formatRole(user.role)}
                        </span>
                      </td>

                      {/* Assigned Clinic */}
                      <td className="px-6 py-3.5 font-medium text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{getClinicName(user)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-3.5">
                        {isDeactivated ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200/80">
                            Deactivated
                          </span>
                        ) : (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeStyle(
                              user.status
                            )}`}
                          >
                            {user.status}
                          </span>
                        )}
                      </td>

                      {/* Last Updated */}
                      <td className="px-6 py-3.5 text-slate-400 text-[11px]">
                        {formatDate(user.updatedAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isDeactivated ? (
                            /* Activate button */
                            <button
                              onClick={() => handleReactivate(user.id || user._id)}
                              title="Activate User"
                              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Activate
                            </button>
                          ) : (
                            <>
                              {/* Edit User (active only) */}
                              <button
                                onClick={() => setUserToEdit(user)}
                                title="Edit User Role & Branch"
                                className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              {/* Deactivate User Button */}
                              {user.id !== currentUser?.id &&
                                user._id !== currentUser?._id &&
                                user.id !== currentUser?._id && (
                                  <button
                                    onClick={() => setUserToDelete(user)}
                                    title="Deactivate User"
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={displayedUsers.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <InviteModal
          onClose={() => {
            setIsInviteModalOpen(false);
            setInviteResult(null);
          }}
          onSuccess={(res) => {
            setInviteResult(res);
            fetchUsers();
          }}
          clinics={clinics}
        />
      )}

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={Boolean(userToEdit)}
        onClose={() => setUserToEdit(null)}
        onSuccess={() => {
          fetchUsers();
          setUserToEdit(null);
        }}
        user={userToEdit}
      />

      {/* Success Result Modal for testing the invite link */}
      {inviteResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2.5 text-emerald-600 mb-2">
              <CheckCircle2 className="w-6 h-6" />
              <h2 className="text-lg font-bold text-slate-900">User Invited Successfully!</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              In production, an automated email is dispatched. For immediate local testing, you can use this simulation URL:
            </p>
            <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono break-all mb-4 select-all">
              /accept-invite?token={inviteResult.inviteToken}
            </div>
            <button
              onClick={() => {
                setInviteResult(null);
                setIsInviteModalOpen(false);
              }}
              className="w-full bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Deactivate User Account?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to deactivate <span className="font-semibold text-slate-800">"{userToDelete.fullName || userToDelete.name || userToDelete.full_name || 'this user'}"</span>? This user will lose system access and move to the <span className="font-bold text-rose-600">Deactivated Users</span> tab, where you can reactivate them at any time.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-user-btn"
                disabled={isDeleting}
                onClick={handleDeleteUser}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deactivating...
                  </>
                ) : (
                  'Yes, Deactivate User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clinic Manager — Create User Modal (scoped to their clinic) */}
      <UserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userToEdit={null}
        lockedOrgId={
          managerClinic?.organization_id ||
          managerClinic?.orgId ||
          currentUser?.organization_id ||
          currentUser?.organizationId ||
          null
        }
        lockedClinicIds={[managerClinicId]}
        onSuccess={() => {
          fetchUsers();
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
}

function InviteModal({ onClose, onSuccess, clinics = [] }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: { fullName: '', email: '', role: 'agent' },
  });

  const [formError, setFormError] = useState('');
  const [selectedClinicId, setSelectedClinicId] = useState('');

  const onSubmit = async (data) => {
    setFormError('');
    const payload = {
      ...data,
      clinicId: selectedClinicId || null,
      clinicIds: selectedClinicId ? [selectedClinicId] : [],
    };
    const res = await userService.inviteUser(payload);
    if (res.success) {
      onSuccess(res.data);
    } else {
      setFormError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-primary">
            <UserPlus className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-900">Invite New Team Member</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" /> {formError}
            </div>
          )}

          <form id="invite-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('fullName')}
                placeholder="e.g. Dr. Sarah Al-Otaibi"
                className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.fullName ? 'border-red-500' : 'border-slate-200 focus:border-primary'} outline-none font-medium text-slate-800`}
              />
              {errors.fullName && <p className="text-[11px] text-red-500 mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Work Email <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="doctor@aureadental.com"
                className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.email ? 'border-red-500' : 'border-slate-200 focus:border-primary'} outline-none font-medium text-slate-800`}
              />
              {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Role</label>
                <select
                  {...register('role')}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.role ? 'border-red-500' : 'border-slate-200 focus:border-primary'} outline-none font-medium text-slate-800 cursor-pointer`}
                >
                  <option value="clinic_manager">Clinic Manager</option>
                  <option value="agent">Sales / Call Agent</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="finance">Finance Controller</option>
                  <option value="org_admin">Organization Admin</option>
                  <option value="auditor">Auditor (Read Only)</option>
                </select>
                {errors.role && <p className="text-[11px] text-red-500 mt-1">{errors.role.message}</p>}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Assigned Clinic Branch
                </label>
                <select
                  value={selectedClinicId}
                  onChange={(e) => setSelectedClinicId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-primary outline-none font-medium text-slate-800 cursor-pointer"
                >
                  <option value="">🌟 All Branches</option>
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>
                      🏥 {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/70 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="invite-form"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-primary/20 disabled:opacity-70 cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  );
}
