import React, { useState, useEffect, useMemo } from 'react';
import { X, UserPlus, Shield, Building2, MapPin, Mail, User, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { ROLES } from '@/constants/permissions';
import { organizationsService } from '@/services/organizationsService';
import { clinicsService } from '@/services/clinicsService';
import { usersService } from '@/services/usersService';
import {
  ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
  DEFAULT_USER_FORM_STATE,
} from '@/constants/userConstants';

const userSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address format'),
  role: z.enum([
    ROLES.SUPER_ADMIN,
    ROLES.ORG_ADMIN,
    ROLES.CLINIC_MANAGER,
    ROLES.AGENT,
    ROLES.RECEPTIONIST,
    ROLES.FINANCE,
    ROLES.AUDITOR,
  ]),
  organizationId: z.string().nullable().optional(),
  clinicId: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive', 'invited']),
}).refine(
  (data) => {
    // If role is not super_admin, organization is required
    if (data.role !== ROLES.SUPER_ADMIN) {
      return Boolean(data.organizationId && data.organizationId.trim() !== '');
    }
    return true;
  },
  {
    message: 'Organization is required for this role',
    path: ['organizationId'],
  }
);

export function UserModal({ isOpen, onClose, onSuccess, userToEdit = null, lockedOrgId = null }) {
  const isEdit = Boolean(userToEdit);

  const [organizations, setOrganizations] = useState(() => organizationsService.getOrganizationsSync() || []);
  const [allClinics, setAllClinics] = useState([]);

  const [formData, setFormData] = useState(DEFAULT_USER_FORM_STATE);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const orgs = organizationsService.getOrganizationsSync() || [];
      setOrganizations(Array.isArray(orgs) ? orgs : []);
      
      clinicsService.getClinicsAsync?.().then((cls) => {
        setAllClinics(Array.isArray(cls) ? cls : []);
      }).catch(() => {
        setAllClinics(clinicsService.getClinics() || []);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setFormData({
          name: userToEdit.name || userToEdit.fullName || '',
          email: userToEdit.email || '',
          role: userToEdit.role || ROLES.AGENT,
          organizationId: userToEdit.organizationId || lockedOrgId || '',
          clinicId: userToEdit.clinicId || (userToEdit.clinicIds && userToEdit.clinicIds[0]) || '',
          status: userToEdit.status || 'active',
        });
      } else {
        setFormData({
          ...DEFAULT_USER_FORM_STATE,
          organizationId: lockedOrgId || '',
          role: lockedOrgId ? ROLES.AGENT : DEFAULT_USER_FORM_STATE.role,
        });
      }
      setErrors({});
    }
  }, [isOpen, userToEdit, lockedOrgId]);

  const availableRoleOptions = useMemo(() => {
    if (lockedOrgId) {
      return ROLE_OPTIONS.filter((r) => r.value !== ROLES.SUPER_ADMIN);
    }
    return ROLE_OPTIONS;
  }, [lockedOrgId]);

  // Clinics filtered by currently chosen organization
  const availableClinics = useMemo(() => {
    if (!formData.organizationId) return allClinics;
    return allClinics.filter((c) => c.orgId === formData.organizationId);
  }, [allClinics, formData.organizationId]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // When changing organization, reset clinic if it no longer belongs to that org
      if (field === 'organizationId') {
        const clinicStillValid = allClinics.some(
          (c) => c.id === prev.clinicId && c.orgId === value
        );
        if (!clinicStillValid) {
          next.clinicId = '';
        }
      }
      // If role changed to super_admin, clear org and clinic
      if (field === 'role' && value === ROLES.SUPER_ADMIN) {
        next.organizationId = '';
        next.clinicId = '';
      }
      return next;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      organizationId: formData.role === ROLES.SUPER_ADMIN ? null : (formData.organizationId || null),
      clinicId: formData.clinicId ? formData.clinicId : null,
      status: formData.status,
    };

    const validation = userSchema.safeParse(payload);
    if (!validation.success) {
      const fieldErrors = {};
      validation.error.errors.forEach((err) => {
        const key = err.path[0] || 'general';
        fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      toast.error('Please resolve the form errors');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit) {
        const updated = usersService.updateUser(userToEdit.id, payload);
        toast.success(`User "${updated.name}" updated successfully!`);
        onSuccess?.(updated);
      } else {
        const created = usersService.createUser(payload);
        toast.success(`Invitation simulated for "${created.name}" (${created.email})`);
        onSuccess?.(created);
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSuperAdminRole = formData.role === ROLES.SUPER_ADMIN;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEdit ? 'Edit User & Reassign Role' : 'Invite New Team Member'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEdit
                  ? 'Update user role, organization, and clinic branch assignment'
                  : 'Add a new user with dedicated role-based access control'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1 text-xs">
          {/* Full Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Dr. Sarah Jenkins"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 font-medium ${
                  errors.name
                    ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400'
                    : 'border-slate-200 focus:ring-primary/20 focus:border-primary'
                }`}
              />
            </div>
            {errors.name && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.name}</p>}
          </div>

          {/* Email Address */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 font-medium ${
                  errors.email
                    ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400'
                    : 'border-slate-200 focus:ring-primary/20 focus:border-primary'
                }`}
              />
            </div>
            {errors.email && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.email}</p>}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
              Platform Role (7-Role RBAC) <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium cursor-pointer"
            >
              {availableRoleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Organization Selection (Hidden/Disabled for Super Admin, Locked for Org Admin) */}
          {!isSuperAdminRole && (
            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                Organization Assignment <span className="text-rose-500">*</span>
              </label>
              {lockedOrgId ? (
                <div className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span>{organizations.find((o) => o.id === lockedOrgId)?.name || 'Smile Care Group'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">({lockedOrgId})</span>
                </div>
              ) : (
                <select
                  value={formData.organizationId}
                  onChange={(e) => handleChange('organizationId', e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 font-medium cursor-pointer ${
                    errors.organizationId
                      ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400'
                      : 'border-slate-200 focus:ring-primary/20 focus:border-primary'
                  }`}
                >
                  <option value="">-- Select Organization --</option>
                  {Array.isArray(organizations) &&
                    organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.id})
                      </option>
                    ))}
                </select>
              )}
              {errors.organizationId && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.organizationId}</p>
              )}
            </div>
          )}

          {/* Clinic Assignment (filtered by selected organization) */}
          {!isSuperAdminRole && (
            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                Primary Clinic Branch Assignment
              </label>
              <select
                value={formData.clinicId}
                onChange={(e) => handleChange('clinicId', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium cursor-pointer"
              >
                <option value="">All Branches / Organization-wide Scope</option>
                {availableClinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.name} ({clinic.city || 'Branch'})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Leave unselected if user has access to all branches under the organization.
              </p>
            </div>
          )}

          {/* Operational Status */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
              Account Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium cursor-pointer"
            >
              {USER_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isSubmitting
                ? 'Saving...'
                : isEdit
                ? 'Save Changes'
                : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
