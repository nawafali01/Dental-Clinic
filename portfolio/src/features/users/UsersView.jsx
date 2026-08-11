import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/user.service';
import { RoleGuard } from '../../components/guards/RoleGuard';
import { PERMISSIONS } from '../../constants/permissions';
import { Search, Filter, MoreVertical, Plus, UserPlus, X, Loader2, ShieldAlert } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inviteSchema } from '@/schemas/user.schema';
import { filterUsers, formatRole, getStatusBadgeStyle, formatDate } from '@/utils/userUtils';

export default function UsersView() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);

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
    fetchUsers();
  };

  const handleEnableUser = async (id) => {
    await userService.enableUser(id);
    fetchUsers();
  };

  const filteredUsers = filterUsers(users, searchTerm);


  return (
    <div className="space-y-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage team access and permissions across the platform.</p>
        </div>

        <RoleGuard permission={PERMISSIONS.INVITE_USER}>
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-medium shadow-md shadow-primary/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Invite User
          </button>
        </RoleGuard>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No users found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{user.fullName}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize bg-slate-100 px-2 py-1 rounded-md text-xs font-semibold text-slate-700">
                        {formatRole(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadgeStyle(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {formatDate(user.updatedAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <RoleGuard permission={PERMISSIONS.DISABLE_USER} fallback={<span className="text-slate-300 text-xs">Read Only</span>}>
                        {user.id !== currentUser.id && (
                          <div className="flex justify-end gap-2 text-xs">
                            {user.status === 'active' && (
                              <button onClick={() => handleDisableUser(user.id)} className="text-rose-600 font-medium hover:underline">Disable</button>
                            )}
                            {user.status === 'disabled' && (
                              <button onClick={() => handleEnableUser(user.id)} className="text-emerald-600 font-medium hover:underline">Enable</button>
                            )}
                            {user.status === 'invited' && (
                              <button onClick={() => userService.resendInvite(user.id).then(fetchUsers)} className="text-primary font-medium hover:underline">Resend</button>
                            )}
                          </div>
                        )}
                      </RoleGuard>
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
          onClose={() => { setIsInviteModalOpen(false); setInviteResult(null); }} 
          onSuccess={(res) => { setInviteResult(res); fetchUsers(); }} 
        />
      )}

      {/* Success Result Modal for testing the invite link easily */}
      {inviteResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-2">User Invited!</h2>
            <p className="text-sm text-slate-500 mb-4">In a real app, an email would be sent. For testing purposes, you can use this link to simulate accepting the invite.</p>
            <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono break-all mb-4">
              /accept-invite?token={inviteResult.inviteToken}
            </div>
            <button 
              onClick={() => {
                setInviteResult(null);
                setIsInviteModalOpen(false);
              }}
              className="w-full bg-slate-900 text-white font-medium py-2 rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InviteModal({ onClose, onSuccess }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: { fullName: '', email: '', role: 'agent' }
  });

  const [formError, setFormError] = useState('');

  const onSubmit = async (data) => {
    setFormError('');
    const res = await userService.inviteUser(data);
    if (res.success) {
      onSuccess(res.data);
    } else {
      setFormError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Invite New User</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {formError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm font-medium border border-red-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> {formError}
            </div>
          )}

          <form id="invite-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input 
                {...register('fullName')}
                className={`w-full px-3 py-2 rounded-xl border ${errors.fullName ? 'border-red-500' : 'border-slate-200 focus:border-primary'} outline-none`}
              />
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input 
                {...register('email')}
                type="email"
                className={`w-full px-3 py-2 rounded-xl border ${errors.email ? 'border-red-500' : 'border-slate-200 focus:border-primary'} outline-none`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
              <select 
                {...register('role')}
                className={`w-full px-3 py-2 rounded-xl border ${errors.role ? 'border-red-500' : 'border-slate-200 focus:border-primary'} outline-none`}
              >
                <option value="org_admin">Organization Admin</option>
                <option value="clinic_manager">Clinic Manager</option>
                <option value="agent">Agent</option>
                <option value="receptionist">Receptionist</option>
                <option value="finance">Finance</option>
                <option value="auditor">Auditor</option>
              </select>
              {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>}
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button 
            type="submit" 
            form="invite-form"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-medium shadow-md shadow-primary/20 disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  );
}
