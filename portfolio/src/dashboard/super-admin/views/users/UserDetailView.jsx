import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Shield,
  Building2,
  MapPin,
  Mail,
  Calendar,
  Clock,
  Pencil,
  Power,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { usersService } from '@/services/usersService';
import { organizationsService } from '@/services/organizationsService';
import { clinicsService } from '@/services/clinicsService';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { Button } from '@/dashboard/shared/components/ui/Button';
import { UserModal } from '@/dashboard/super-admin/components/users/UserModal';
import { ROLES } from '@/constants/permissions';
import { ROLE_BADGE_CONFIG } from '@/constants/userConstants';

export default function UserDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmStatusModal, setConfirmStatusModal] = useState(false);

  const loadUserData = () => {
    setIsLoading(true);
    try {
      const found = usersService.getUserById(id);
      setUser(found);
    } catch (err) {
      toast.error('Failed to load user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [id]);

  const handleToggleStatus = () => {
    if (!user) return;
    try {
      const isCurrentlyActive = user.status === 'active';
      const updated = isCurrentlyActive
        ? usersService.deactivateUser(user.id)
        : usersService.activateUser(user.id);

      setUser(updated);
      toast.success(`User "${updated.name}" is now ${updated.status}`);
      setConfirmStatusModal(false);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading User Details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/admin/users')}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </button>
        <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center shadow-2xs space-y-3">
          <User className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
          <h2 className="text-lg font-bold text-slate-900">User Not Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            The user with ID <span className="font-mono font-semibold">{id}</span> does not exist or has been deleted.
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/users')}>
            Return to Users List
          </Button>
        </div>
      </div>
    );
  }

  const roleConfig = ROLE_BADGE_CONFIG[user.role] || {
    label: user.role,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const org = user.organizationId ? organizationsService.getOrganizationById(user.organizationId) : null;
  const clinic = user.clinicId ? clinicsService.getClinicById(user.clinicId) : null;
  const isActive = user.status === 'active';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/users')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Users List
        </button>
      </div>

      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/30 text-primary font-bold text-xl flex items-center justify-center border border-primary/20 shadow-sm shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
                <Badge variant={isActive ? 'success' : user.status === 'invited' ? 'warning' : 'neutral'} dot>
                  {user.status === 'invited' ? 'Invited' : isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user.email}
                </span>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleConfig.color}`}>
                  {roleConfig.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit & Reassign
            </button>
            <button
              onClick={() => setConfirmStatusModal(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {isActive ? 'Deactivate User' : 'Activate User'}
            </button>
          </div>
        </div>
      </div>

      {/* Detail Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scope & Role Assignment */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-primary" /> Role & Scope Assignment
          </h3>

          <div className="space-y-4 pt-1 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Assigned Role</span>
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-900 text-sm">{roleConfig.label}</p>
                <span className="font-mono text-[10px] text-slate-400">{user.role}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Organization</span>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">
                    {user.role === ROLES.SUPER_ADMIN
                      ? 'Global Platform Scope (All Organizations)'
                      : org?.name || user.organizationId || 'Unassigned'}
                  </p>
                  {org?.id && <p className="text-[10px] text-slate-400 font-mono">Org ID: {org.id}</p>}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Branch Clinic</span>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">
                    {clinic ? clinic.name : 'All Clinics / Entire Organization'}
                  </p>
                  {clinic && (
                    <p className="text-[10px] text-slate-400">
                      {clinic.city} — {clinic.address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit & Timestamps */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" /> Activity & Timestamps
          </h3>

          <div className="space-y-4 pt-1 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">User ID</span>
              <p className="font-mono font-semibold text-slate-900">{user.id}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Account Created</span>
              <p className="font-semibold text-slate-800">
                {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'January 2026'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Last Profile Update</span>
              <p className="font-semibold text-slate-800">
                {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'Just now'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Last Login Session</span>
              <p className="font-semibold text-slate-800">
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never logged in'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Activate/Deactivate */}
      {confirmStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setConfirmStatusModal(false)} />
          <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl max-w-sm w-full p-6 z-10 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {isActive ? 'Deactivate User Account?' : 'Activate User Account?'}
            </h3>
            <p className="text-xs text-slate-500">
              {isActive
                ? `Deactivating "${user.name}" will immediately revoke their access to the dental platform.`
                : `Activating "${user.name}" will restore their login credentials and platform permissions.`}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmStatusModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                className={`px-3.5 py-2 text-xs font-semibold text-white rounded-xl cursor-pointer ${
                  isActive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Confirm {isActive ? 'Deactivation' : 'Activation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToEdit={user}
        onSuccess={(updated) => setUser(updated)}
      />
    </div>
  );
}
