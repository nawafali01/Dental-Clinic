import React, { useState, useEffect } from 'react';
import { X, User, Shield, Building2, Mail, Phone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';
import { storageService } from '@/services/storage.service';

export function EditUserModal({ isOpen, onClose, onSuccess, user }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'agent',
    status: 'active',
    clinicId: '',
    phone: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const clinics = storageService.get(storageService.KEYS.CLINICS) || [];

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        role: user.role || 'agent',
        status: user.status || 'active',
        clinicId: user.clinicId || (user.clinicIds && user.clinicIds[0]) || '',
        phone: user.phone || '',
      });
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const updates = {
        fullName: formData.fullName.trim(),
        role: formData.role,
        status: formData.status,
        clinicId: formData.clinicId || null,
        clinicIds: formData.clinicId ? [formData.clinicId] : [],
        phone: formData.phone || null,
      };

      const res = await userService.updateUser(user.id, updates);
      if (res.success) {
        toast.success(`User "${updates.fullName}" updated successfully!`);
        onSuccess?.(res.data);
        onClose();
      } else {
        toast.error(res.message || 'Failed to update user');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Edit User Account</h2>
              <p className="text-xs text-slate-500">Update team credentials, role & branch permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-medium cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">System Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium cursor-pointer"
              >
                <option value="super_admin">Super Admin (All Access)</option>
                <option value="org_admin">Organization Admin</option>
                <option value="clinic_manager">Clinic Manager</option>
                <option value="agent">Sales / Call Agent</option>
                <option value="receptionist">Front Desk Receptionist</option>
                <option value="finance">Finance Controller</option>
                <option value="auditor">Auditor (Read-Only)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Account Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled / Suspended</option>
                <option value="invited">Pending Invite</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Assigned Clinic Branch Scope
            </label>
            <select
              value={formData.clinicId}
              onChange={(e) => setFormData({ ...formData, clinicId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium cursor-pointer"
            >
              <option value="">🌟 All Branches (Enterprise / Organization Scope)</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  🏥 {c.name} ({c.city})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Limits dashboard operations and lead assignment to this specific branch.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save User Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditUserModal;
