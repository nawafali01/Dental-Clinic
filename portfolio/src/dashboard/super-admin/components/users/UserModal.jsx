import React, { useState, useEffect, useMemo } from 'react';
import { X, UserPlus, Building2, CheckCircle2, Eye, EyeOff, Phone, Lock, MapPin } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { ROLES } from '@/constants/permissions';
import { organizationsService } from '@/services/organizationsService';
import { clinicsService } from '@/services/clinicsService';
import { usersService } from '@/services/usersService';
import { useRole } from '@/dashboard/shared/context/RoleContext';
import { useAuth } from '@/context/AuthContext';
import { useOrg } from '@/dashboard/shared/context/OrgContext';
import apiClient from '@/lib/api';
import { normalizeRole } from '@/utils/normalizeUser';
import {
  ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
  DEFAULT_USER_FORM_STATE,
} from '@/constants/userConstants';

const userSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().optional(),
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
  assignedClinics: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'invited']),
}).refine(
  (data) => {
    if (data.role !== ROLES.SUPER_ADMIN) {
      return Boolean(data.organizationId && data.organizationId.trim() !== '');
    }
    return true;
  },
  { message: 'Organization is required for this role', path: ['organizationId'] }
);

export function UserModal({ isOpen, onClose, onSuccess, userToEdit = null, lockedOrgId = null, lockedClinicIds = null }) {
  const isEdit = Boolean(userToEdit);
  const { userRole } = useRole();
  const { currentUser } = useAuth();
  const { currentOrg } = useOrg();

  const effectiveRole = normalizeRole(currentUser?.role || userRole);
  const isSuperAdmin =
    effectiveRole === 'super_admin' ||
    normalizeRole(currentUser?.role) === 'super_admin' ||
    normalizeRole(userRole) === 'super_admin';

  const isClinicManager =
    !isSuperAdmin &&
    (effectiveRole === 'clinic_manager' ||
      normalizeRole(userRole) === 'clinic_manager' ||
      normalizeRole(currentUser?.role) === 'clinic_manager' ||
      Boolean(lockedClinicIds && lockedClinicIds.length > 0));

  const isOrgAdmin =
    !isSuperAdmin &&
    !isClinicManager &&
    (effectiveRole === 'org_admin' ||
      normalizeRole(userRole) === 'org_admin' ||
      normalizeRole(currentUser?.role) === 'org_admin' ||
      Boolean(lockedOrgId));

  const activeOrgId =
    lockedOrgId ||
    currentUser?.organizationId ||
    currentUser?.organization_id ||
    currentOrg?.id ||
    'org-001';

  const [organizations, setOrganizations] = useState(() => organizationsService.getOrganizationsSync() || []);
  const [allClinics, setAllClinics] = useState(() => clinicsService.getClinics() || []);

  // On-the-fly creation states
  const [isCreatingNewOrg, setIsCreatingNewOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [isCreatingNewClinic, setIsCreatingNewClinic] = useState(false);
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicCity, setNewClinicCity] = useState('Riyadh');

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_USER_FORM_STATE);
  const isSuperAdminRole = formData.role === ROLES.SUPER_ADMIN;

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load fresh data when modal opens
  useEffect(() => {
    if (isOpen) {
      const orgs = organizationsService.getOrganizationsSync() || [];
      setOrganizations(Array.isArray(orgs) ? orgs : []);
      const cls = clinicsService.getClinics() || [];
      setAllClinics(Array.isArray(cls) ? cls : []);

      // Fetch fresh live data from API
      organizationsService.getOrganizations().then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setOrganizations(res.data);
        }
      });
      clinicsService.fetchClinics().then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setAllClinics(res.data);
        }
      });
    }
  }, [isOpen]);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setIsCreatingNewOrg(false);
      setNewOrgName('');
      setIsCreatingNewClinic(false);
      setNewClinicName('');
      setNewClinicCity('Riyadh');
      setShowPassword(false);

      if (userToEdit) {
        const clinicIds = userToEdit.assignedClinics ||
          (userToEdit.clinicId ? [userToEdit.clinicId] : []) ||
          (userToEdit.clinicIds || []);
        setFormData({
          name: userToEdit.name || userToEdit.fullName || userToEdit.full_name || '',
          email: userToEdit.email || '',
          phone: userToEdit.phone || '',
          password: '',
          role: userToEdit.role || ROLES.AGENT,
          organizationId: userToEdit.organizationId || userToEdit.organization_id || activeOrgId || '',
          assignedClinics: Array.isArray(clinicIds) ? clinicIds : [],
          status: userToEdit.status || 'active',
        });
      } else {
        const defaultRole = isClinicManager
          ? ROLES.AGENT
          : isSuperAdmin && !isOrgAdmin
          ? ROLES.ORG_ADMIN
          : ROLES.AGENT;
        // When locked clinic IDs are provided (Clinic Manager), pre-assign them
        const preAssignedClinics = Array.isArray(lockedClinicIds) && lockedClinicIds.length > 0
          ? lockedClinicIds
          : [];
        setFormData({
          ...DEFAULT_USER_FORM_STATE,
          organizationId: isSuperAdmin && !isOrgAdmin ? '' : activeOrgId,
          role: defaultRole,
          assignedClinics: preAssignedClinics,
        });
      }
      setErrors({});
    }
  }, [isOpen, userToEdit, lockedOrgId, lockedClinicIds, isOrgAdmin, isClinicManager, isSuperAdmin, activeOrgId]);

  const availableRoleOptions = useMemo(() => {
    // Editing an existing Super Admin — keep all options
    if (isEdit && (userToEdit?.role === ROLES.SUPER_ADMIN || normalizeRole(userToEdit?.role) === 'super_admin')) {
      return ROLE_OPTIONS.filter((r) => r.value !== ROLES.AUDITOR);
    }

    if (isSuperAdmin) {
      // Super Admin can create all roles EXCEPT super_admin and auditor
      return ROLE_OPTIONS.filter(
        (r) => r.value !== ROLES.SUPER_ADMIN && r.value !== ROLES.AUDITOR
      );
    }

    if (isOrgAdmin) {
      // Org Admin CANNOT create super_admin and CANNOT create org_admin; can create clinic_manager, agent, receptionist, finance
      return ROLE_OPTIONS.filter(
        (r) =>
          r.value !== ROLES.SUPER_ADMIN &&
          r.value !== ROLES.ORG_ADMIN &&
          r.value !== ROLES.AUDITOR
      );
    }

    if (isClinicManager) {
      // Clinic Manager can only create staff roles: agent, receptionist, finance (cannot create clinic manager or org admin)
      return ROLE_OPTIONS.filter(
        (r) =>
          r.value === ROLES.AGENT ||
          r.value === ROLES.RECEPTIONIST ||
          r.value === ROLES.FINANCE
      );
    }

    // Fallback — roles excluding super_admin, org_admin, and auditor
    return ROLE_OPTIONS.filter(
      (r) =>
        r.value !== ROLES.SUPER_ADMIN &&
        r.value !== ROLES.ORG_ADMIN &&
        r.value !== ROLES.AUDITOR
    );
  }, [isSuperAdmin, isOrgAdmin, isClinicManager, lockedOrgId, isEdit, userToEdit]);

  // Clinics filtered by selected org (or all if super admin with no org filter)
  const availableClinics = useMemo(() => {
    if (!allClinics || allClinics.length === 0) return [];
    if (formData.organizationId) {
      const orgClinics = allClinics.filter((c) => c.orgId === formData.organizationId);
      if (orgClinics.length > 0) return orgClinics;
    }
    return allClinics;
  }, [allClinics, formData.organizationId]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'role' && value === ROLES.SUPER_ADMIN) {
        next.organizationId = '';
        next.assignedClinics = [];
      }
      // Reset clinics when org changes
      if (field === 'organizationId') {
        next.assignedClinics = [];
      }
      return next;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  // Toggle a clinic in/out of assignedClinics array
  const handleClinicToggle = (clinicId) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.assignedClinics) ? prev.assignedClinics : [];
      const next = current.includes(clinicId)
        ? current.filter((id) => id !== clinicId)
        : [...current, clinicId];
      return { ...prev, assignedClinics: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const activeCaller = currentUser || { role: userRole };

    if (!isEdit && (formData.role === ROLES.SUPER_ADMIN || formData.role === 'super_admin')) {
      toast.error('Super Admin accounts cannot be created from User Management.');
      return;
    }
    if (formData.role === ROLES.ORG_ADMIN || formData.role === 'org_admin') {
      if (!isSuperAdmin && (isOrgAdmin || lockedOrgId)) {
        toast.error('An Organization Admin already exists for this branch.');
        return;
      }

      // Check if target organization or branch already has an active Org Admin
      const allUsers = usersService.getUsersSync() || [];
      const targetOrg = formData.organizationId || lockedOrgId || activeOrgId;
      const targetClinics = formData.assignedClinics || [];

      const existingOrgAdmin = allUsers.find((u) => {
        if (isEdit && u.id === userToEdit?.id) return false;
        if (!u.is_active && u.status !== 'active') return false;
        const normRole = normalizeRole(u.role);
        if (normRole !== 'org_admin') return false;

        const userOrg = u.organization_id || u.organizationId;
        if (targetOrg && userOrg && userOrg === targetOrg) return true;

        const uClinics = u.assigned_clinics || u.assignedClinics || [];
        if (targetClinics.length > 0 && uClinics.some((c) => targetClinics.includes(c))) {
          return true;
        }
        return false;
      });

      if (existingOrgAdmin) {
        toast.error('An Organization Admin already exists for this branch.');
        return;
      }
    }
    if (!isSuperAdmin && (isOrgAdmin || lockedOrgId) && (formData.role === ROLES.AUDITOR || formData.role === 'auditor')) {
      toast.error('Organization Admins cannot create Auditor accounts.');
      return;
    }
    if (isClinicManager && (formData.role === ROLES.SUPER_ADMIN || formData.role === ROLES.ORG_ADMIN || formData.role === ROLES.AUDITOR)) {
      toast.error('Clinic Managers cannot create this role.');
      return;
    }
    if (!isSuperAdminRole && isCreatingNewOrg && !newOrgName.trim()) {
      setErrors((prev) => ({ ...prev, newOrgName: 'Organization name is required' }));
      toast.error('Please enter the new organization name.');
      return;
    }
    if (!isSuperAdminRole && isCreatingNewClinic && !newClinicName.trim()) {
      setErrors((prev) => ({ ...prev, newClinicName: 'Clinic branch name is required' }));
      toast.error('Please enter the new clinic branch name.');
      return;
    }
    if (!isEdit && !formData.password.trim()) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      toast.error('Please set a password for the new user.');
      return;
    }

    setIsSubmitting(true);
    let createdOrgRecord = null;
    let createdClinicRecord = null;
    try {
      let effectiveOrgId = formData.organizationId || lockedOrgId;

      // 1. Create Organization on the fly if toggled
      if (!isSuperAdminRole && isCreatingNewOrg) {
        const orgRes = await organizationsService.createOrganization({
          name: newOrgName.trim(),
          status: 'active',
        });
        if (!orgRes.success || !orgRes.data?.id) {
          throw new Error(orgRes.error || orgRes.message || 'Could not create the organization.');
        }
        effectiveOrgId = orgRes.data.id;
        createdOrgRecord = orgRes.data;
        setOrganizations((prev) => [createdOrgRecord, ...(Array.isArray(prev) ? prev : [])]);
      }

      // 2. Create Clinic Branch on the fly if toggled
      let effectiveAssignedClinics = [...(formData.assignedClinics || [])];
      if (!isSuperAdminRole && isCreatingNewClinic) {
        const clinicData = {
          name: newClinicName.trim(),
          city: newClinicCity.trim() || 'Riyadh',
          orgId: effectiveOrgId || activeOrgId,
          status: 'active',
        };
        const createdClinic = clinicsService.addClinic(clinicData, activeCaller);
        createdClinicRecord = createdClinic;
        effectiveAssignedClinics = [...effectiveAssignedClinics, createdClinic.id];
        setAllClinics((prev) => [createdClinic, ...(Array.isArray(prev) ? prev : [])]);
      }

      // Resolve org from clinic if missing
      if (!effectiveOrgId && effectiveAssignedClinics.length > 0) {
        const matched = allClinics.find((c) => c.id === effectiveAssignedClinics[0]);
        if (matched?.orgId) effectiveOrgId = matched.orgId;
      }
      if (!effectiveOrgId && (isOrgAdmin || userRole === 'org_admin')) {
        effectiveOrgId = activeOrgId;
      }

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        password: formData.password,
        role: formData.role,
        organizationId: formData.role === ROLES.SUPER_ADMIN ? null : (effectiveOrgId || activeOrgId),
        assignedClinics: isSuperAdminRole ? [] : effectiveAssignedClinics,
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
        toast.error('Please fix the errors in the form.');
        setIsSubmitting(false);
        return;
      }

      if (isEdit) {
        const putPayload = {
          full_name: payload.name,
          phone: payload.phone || '',
          role: payload.role,
          is_active: payload.status === 'active',
          organization_id: payload.role === ROLES.SUPER_ADMIN ? '' : (payload.organizationId || ''),
          assigned_clinics: Array.isArray(payload.assignedClinics)
            ? payload.assignedClinics.filter((c) => Boolean(c && typeof c === 'string' && c.trim()))
            : [],
        };
        const updated = await usersService.updateUser(userToEdit.id, putPayload, activeCaller);
        toast.success(`User "${updated.name}" updated successfully.`);
        onSuccess?.(updated);
      } else {
        const apiPayload = {
          email: payload.email,
          full_name: payload.name,
          phone: payload.phone || '',
          role: payload.role,
          is_active: payload.status === 'active',
          password: payload.password,
          organization_id: payload.role === ROLES.SUPER_ADMIN ? '' : (payload.organizationId || ''),
          assigned_clinics: Array.isArray(payload.assignedClinics)
            ? payload.assignedClinics.filter((c) => Boolean(c && typeof c === 'string' && c.trim()))
            : [],
        };
        const created = await usersService.createUser(apiPayload, activeCaller);
        let msg = `User "${created.name}" created successfully.`;
        if (createdOrgRecord && createdClinicRecord) {
          msg = `New org "${createdOrgRecord.name}", branch "${createdClinicRecord.name}", and user "${created.name}" created.`;
        } else if (createdOrgRecord) {
          msg = `New org "${createdOrgRecord.name}" and user "${created.name}" created.`;
        } else if (createdClinicRecord) {
          msg = `New branch "${createdClinicRecord.name}" and user "${created.name}" added.`;
        }
        toast.success(msg);
        onSuccess?.(created);
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || '';
      if (
        (formData.role === ROLES.ORG_ADMIN || formData.role === 'org_admin') &&
        (msg.toLowerCase().includes('org_admin') ||
          msg.toLowerCase().includes('already exists') ||
          msg.toLowerCase().includes('organization admin') ||
          msg.toLowerCase().includes('admin'))
      ) {
        toast.error('An Organization Admin already exists for this branch.');
      } else {
        toast.error(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEdit ? 'Edit User' : 'Create New User'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEdit ? 'Update role, org, and clinic assignment' : 'Fill in all required fields to add a new user'}
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

          {/* ── Row: Full Name + Phone ── */}
          <div className="grid grid-cols-2 gap-3">
            {/* Full Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Sarah Ali"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 font-medium ${
                  errors.name
                    ? 'border-rose-300 focus:ring-rose-200'
                    : 'border-slate-200 focus:ring-primary/20 focus:border-primary'
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                Phone
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+966 5XX XXX XXX"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
              Email Address {!isEdit && <span className="text-rose-500">*</span>}
              {isEdit && <span className="text-slate-400 font-normal normal-case ml-1">(cannot be changed)</span>}
            </label>
            <input
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              disabled={isEdit}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 font-medium ${
                isEdit
                  ? 'opacity-60 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-500'
                  : errors.email
                  ? 'border-rose-300 focus:ring-rose-200'
                  : 'border-slate-200 focus:ring-primary/20 focus:border-primary'
              }`}
            />
            {errors.email && !isEdit && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
          </div>

          {/* Password (only on user creation) */}
          {!isEdit && (
            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Set a strong password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`w-full pl-8 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 font-medium ${
                    errors.password
                      ? 'border-rose-300 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-primary/20 focus:border-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-rose-500 mt-1">{errors.password}</p>}
            </div>
          )}

          {/* Role */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
              Platform Role <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium cursor-pointer"
            >
              {availableRoleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Organization (hidden for Super Admin role) */}
          {!isSuperAdminRole && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Organization <span className="text-rose-500">*</span>
                </label>
                {!lockedOrgId && !isEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNewOrg(!isCreatingNewOrg);
                      if (!isCreatingNewOrg) handleChange('organizationId', '');
                    }}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    {isCreatingNewOrg ? '← Select Existing' : '+ New Organization'}
                  </button>
                )}
              </div>

              {(lockedOrgId || isOrgAdmin) ? (
                <div className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>
                    {organizations.find((o) => o.id === (formData.organizationId || activeOrgId))?.name ||
                      currentOrg?.name || 'Smile Care Group'}
                  </span>
                </div>
              ) : isCreatingNewOrg ? (
                <div className="space-y-2 p-3 bg-primary/5 border border-primary/20 rounded-xl animate-in fade-in">
                  <input
                    type="text"
                    placeholder="New organization name (e.g. Apex Health Group)"
                    value={newOrgName}
                    onChange={(e) => {
                      setNewOrgName(e.target.value);
                      if (errors.newOrgName) setErrors((p) => ({ ...p, newOrgName: null }));
                    }}
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 font-medium ${
                      errors.newOrgName ? 'border-rose-300' : 'border-primary/30 focus:ring-primary/20'
                    }`}
                  />
                  {errors.newOrgName && <p className="text-[11px] text-rose-500">{errors.newOrgName}</p>}
                  <p className="text-[10px] text-slate-500">A new organization will be registered and this user assigned as admin.</p>
                </div>
              ) : (
                <select
                  value={formData.organizationId}
                  onChange={(e) => handleChange('organizationId', e.target.value)}
                  className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 font-medium cursor-pointer ${
                    errors.organizationId ? 'border-rose-300' : 'border-slate-200 focus:ring-primary/20 focus:border-primary'
                  }`}
                >
                  <option value="">-- Select Organization --</option>
                  {Array.isArray(organizations) && organizations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              )}
              {errors.organizationId && !isCreatingNewOrg && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.organizationId}</p>
              )}
            </div>
          )}

          {/* Clinic Branches — locked for Clinic Manager, multi-select for others */}
          {!isSuperAdminRole && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Clinic Branch
                  {!Array.isArray(lockedClinicIds) && formData.assignedClinics.length > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary rounded-md font-bold">
                      {formData.assignedClinics.length} selected
                    </span>
                  )}
                </label>
                {!isEdit && !Array.isArray(lockedClinicIds) && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNewClinic(!isCreatingNewClinic);
                    }}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    {isCreatingNewClinic ? '← Select Existing' : '+ New Branch'}
                  </button>
                )}
              </div>

              {/* Locked clinic badge for Clinic Manager */}
              {Array.isArray(lockedClinicIds) && lockedClinicIds.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {lockedClinicIds.map((cid) => {
                    const c = allClinics.find((x) => x.id === cid);
                    return (
                      <span
                        key={cid}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[11px] font-bold"
                      >
                        <MapPin className="w-3 h-3" />
                        {c?.name || cid}
                        <span className="text-[10px] text-primary/60 font-normal">(auto-assigned)</span>
                      </span>
                    );
                  })}
                  <p className="w-full text-[10px] text-slate-400 mt-0.5">
                    This user will be assigned to your clinic automatically.
                  </p>
                </div>
              ) : isCreatingNewClinic ? (
                <div className="space-y-2.5 p-3 bg-primary/5 border border-primary/20 rounded-xl animate-in fade-in">
                  <input
                    type="text"
                    placeholder="New clinic branch name (e.g. Al-Olaya Branch)"
                    value={newClinicName}
                    onChange={(e) => {
                      setNewClinicName(e.target.value);
                      if (errors.newClinicName) setErrors((p) => ({ ...p, newClinicName: null }));
                    }}
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 font-medium ${
                      errors.newClinicName ? 'border-rose-300' : 'border-primary/30 focus:ring-primary/20'
                    }`}
                  />
                  {errors.newClinicName && <p className="text-[11px] text-rose-500">{errors.newClinicName}</p>}
                  <input
                    type="text"
                    placeholder="City (e.g. Riyadh, Dubai)"
                    value={newClinicCity}
                    onChange={(e) => setNewClinicCity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                  <p className="text-[10px] text-slate-500">A new clinic will be created under this organization.</p>
                </div>
              ) : (
                <div className={`border rounded-xl overflow-hidden ${errors.assignedClinics ? 'border-rose-300' : 'border-slate-200'}`}>
                  {availableClinics.length === 0 ? (
                    <div className="px-4 py-3 text-[11px] text-slate-400 italic">
                      {formData.organizationId ? 'No clinics found for this organization.' : 'Select an organization first.'}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
                      {/* All Branches option */}
                      <label className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.assignedClinics.length === 0}
                          onChange={() => handleChange('assignedClinics', [])}
                          className="w-3.5 h-3.5 accent-primary cursor-pointer"
                        />
                        <div>
                          <p className="font-semibold text-slate-700 text-xs">All Branches</p>
                          <p className="text-[10px] text-slate-400">Organization-wide access</p>
                        </div>
                      </label>
                      {availableClinics.map((clinic) => {
                        const isChecked = formData.assignedClinics.includes(clinic.id);
                        const clinicOrg = organizations.find((o) => o.id === clinic.orgId);
                        return (
                          <label key={clinic.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleClinicToggle(clinic.id)}
                              className="w-3.5 h-3.5 accent-primary cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-700 text-xs truncate">{clinic.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {clinic.city || 'Branch'}{clinicOrg ? ` • ${clinicOrg.name}` : ''}
                              </p>
                            </div>
                            {isChecked && <MapPin className="w-3 h-3 text-primary shrink-0" />}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {!Array.isArray(lockedClinicIds) && !isCreatingNewClinic && (
                <p className="text-[10px] text-slate-400 mt-1">
                  Select specific branches or leave unchecked for full org-wide access.
                </p>
              )}
            </div>
          )}

          {/* Account Status */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
              Account Status <span className="text-[10px] text-slate-400 font-normal">(is_active)</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium cursor-pointer"
            >
              {USER_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
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
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
