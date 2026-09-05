import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { userService } from '../../services/user.service';
import { storageService } from '@/services/storage.service';
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
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inviteSchema } from '@/schemas/user.schema';
import { filterUsers, formatRole, getStatusBadgeStyle, formatDate } from '@/utils/userUtils';
import { EditUserModal } from './components/EditUserModal';
import { toast } from 'sonner';

export default function UsersView() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const clinics = storageService.get(storageService.KEYS.CLINICS) || [];

  const fetchUsers = async () => {
    setLoading(true);
    const res = await userService.getUsers();
    if (res.success) {
      setUsers(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDisableUser = async (id) => {
    await userService.disableUser(id);
    toast.success('User account disabled');
    fetchUsers();
  };

  const handleEnableUser = async (id) => {
    await userService.enableUser(id);
    toast.success('User account activated');
    fetchUsers();
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    if (userToDelete.id === currentUser.id) {
      toast.error('You cannot delete your own account');
      setUserToDelete(null);
      return;
    }

    const res = await userService.deleteUser(userToDelete.id);
    if (res.success) {
      toast.success(`User "${userToDelete.fullName}" deleted successfully`);
      fetchUsers();
    } else {
      toast.error(res.message || 'Failed to delete user');
    }
    setUserToDelete(null);
  };

  const filteredUsers = filterUsers(users, searchTerm).filter((u) => {
    if (roleFilter === 'ALL') return true;
    return u.role === roleFilter;
  });

  const getClinicName = (user) => {
    if (!user.clinicId && (!user.clinicIds || user.clinicIds.length === 0)) {
      return 'All Branches (Enterprise)';
    }
    const cId = user.clinicId || user.clinicIds[0];
    const clinic = clinics.find((c) => c.id === cId);
    return clinic ? clinic.name : 'All Branches';
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team & User Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage staff members, roles, branch assignments, and access permissions.
          </p>
        </div>

        <RoleGuard permission={PERMISSIONS.INVITE_USER}>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Invite Team Member
          </button>
        </RoleGuard>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-medium text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: 'All Roles', value: 'ALL' },
            { label: 'Super Admin', value: 'super_admin' },
            { label: 'Clinic Manager', value: 'clinic_manager' },
            { label: 'Agent', value: 'agent' },
            { label: 'Receptionist', value: 'receptionist' },
            { label: 'Finance', value: 'finance' },
          ].map((pill) => (
            <button
              key={pill.value}
              onClick={() => setRoleFilter(pill.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                roleFilter === pill.value
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
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
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No users found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* User info */}
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-900">{user.fullName}</div>
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
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeStyle(user.status)}`}>
                        {user.status}
                      </span>
                    </td>

                    {/* Last Updated */}
                    <td className="px-6 py-3.5 text-slate-400 text-[11px]">
                      {formatDate(user.updatedAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit User */}
                        <button
                          onClick={() => setUserToEdit(user)}
                          title="Edit User Role & Branch"
                          className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Enable / Disable */}
                        {user.id !== currentUser?.id && (
                          <>
                            {user.status === 'active' && (
                              <button
                                onClick={() => handleDisableUser(user.id)}
                                title="Disable Account"
                                className="px-2 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                              >
                                Disable
                              </button>
                            )}
                            {user.status === 'disabled' && (
                              <button
                                onClick={() => handleEnableUser(user.id)}
                                title="Activate Account"
                                className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                              >
                                Enable
                              </button>
                            )}
                            {user.status === 'invited' && (
                              <button
                                onClick={() => userService.resendInvite(user.id).then(fetchUsers)}
                                title="Resend Invite Token"
                                className="px-2 py-1 text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors cursor-pointer"
                              >
                                Resend
                              </button>
                            )}

                            {/* Delete User */}
                            <button
                              onClick={() => setUserToDelete(user)}
                              title="Delete User"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
              <h3 className="text-base font-bold text-slate-900">Delete User Account?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete <span className="font-semibold text-slate-800">"{userToDelete.fullName}"</span>? This user will lose access immediately.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}
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
