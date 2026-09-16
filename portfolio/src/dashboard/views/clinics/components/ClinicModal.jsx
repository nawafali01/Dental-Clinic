import React, { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { clinicsService } from '@/services/clinicsService';
import { organizationsService } from '@/services/organizationsService';
import { useOrg } from '@/dashboard/shared/context/OrgContext';

const COMMON_TIMEZONES = [
  'UTC',
  'Asia/Karachi',
  'Asia/Riyadh',
  'Asia/Dubai',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
];

export function ClinicModal({ isOpen, onClose, onSuccess, currentUser, clinicToEdit = null }) {
  const isEdit = Boolean(clinicToEdit);
  const { selectedOrgId, refreshOrganizations } = useOrg();

  const [orgsList, setOrgsList] = useState([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);

  const getInitialWorkingHoursProp = (data) => {
    if (data?.working_hours && typeof data.working_hours === 'object' && data.working_hours.additionalProperty !== undefined) {
      return data.working_hours.additionalProperty;
    }
    if (data?.operatingHours) {
      return data.operatingHours;
    }
    return 'anything';
  };

  const getInitialIsActive = (data) => {
    if (data?.is_active !== undefined) return Boolean(data.is_active);
    if (data?.status !== undefined) return data.status !== 'inactive';
    return true;
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    timezone: 'UTC',
    workingHoursProp: 'anything',
    organization_id: '',
    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real organizations directly from backend whenever modal opens in Create mode
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchBackendOrgs = async () => {
      setIsLoadingOrgs(true);
      try {
        const res = await organizationsService.getOrganizations();
        if (isMounted && res?.data) {
          const validOrgs = res.data.filter((o) => !o.isGlobal);
          setOrgsList(validOrgs);

          if (!isEdit) {
            if (selectedOrgId && selectedOrgId !== 'all' && validOrgs.some((o) => o.id === selectedOrgId)) {
              setFormData((prev) => ({ ...prev, organization_id: selectedOrgId }));
            } else if (validOrgs.length > 0) {
              setFormData((prev) => ({ ...prev, organization_id: validOrgs[0].id }));
            }
          }
        }
      } catch (err) {
        console.error('[ClinicModal] Error fetching backend organizations:', err);
      } finally {
        if (isMounted) setIsLoadingOrgs(false);
      }
    };

    fetchBackendOrgs();

    return () => {
      isMounted = false;
    };
  }, [isOpen, isEdit, selectedOrgId]);

  useEffect(() => {
    if (clinicToEdit) {
      setFormData({
        name: clinicToEdit.name || '',
        description: clinicToEdit.description || '',
        contact_email: clinicToEdit.contact_email || clinicToEdit.email || '',
        contact_phone: clinicToEdit.contact_phone || clinicToEdit.phone || '',
        address: clinicToEdit.address || '',
        timezone: clinicToEdit.timezone || 'UTC',
        workingHoursProp: getInitialWorkingHoursProp(clinicToEdit),
        organization_id: clinicToEdit.organization_id || clinicToEdit.orgId || '',
        is_active: getInitialIsActive(clinicToEdit),
      });
    } else {
      setFormData((prev) => ({
        name: '',
        description: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        timezone: 'UTC',
        workingHoursProp: 'anything',
        organization_id: prev.organization_id,
        is_active: true,
      }));
    }
  }, [clinicToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Clinic branch name is required');
      return;
    }

    if (!formData.contact_email.trim()) {
      toast.error('Contact Email is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit) {
        // PUT /api/v1/clinics/{clinic_id}
        const putPayload = {
          name: formData.name.trim(),
          description: formData.description.trim() || '',
          contact_email: formData.contact_email.trim(),
          contact_phone: formData.contact_phone.trim() || '',
          address: formData.address.trim() || '',
          timezone: formData.timezone.trim() || 'UTC',
          working_hours: {
            additionalProperty: formData.workingHoursProp || 'anything',
          },
          is_active: Boolean(formData.is_active),
        };

        const res = await clinicsService.updateClinic(clinicToEdit.id, putPayload);
        if (res.success) {
          toast.success(`Clinic "${putPayload.name}" updated successfully!`);
          refreshOrganizations?.();
          onSuccess?.(res.data);
          onClose();
        } else {
          toast.error(res.error || 'Failed to update clinic');
        }
      } else {
        // POST /api/v1/clinics/
        if (!formData.organization_id) {
          toast.error('Parent organization is required. Please select an organization.');
          setIsSubmitting(false);
          return;
        }

        const postPayload = {
          name: formData.name.trim(),
          description: formData.description.trim() || '',
          contact_email: formData.contact_email.trim(),
          contact_phone: formData.contact_phone.trim() || '',
          address: formData.address.trim() || '',
          timezone: formData.timezone.trim() || 'UTC',
          working_hours: {
            additionalProperty: formData.workingHoursProp || 'anything',
          },
          organization_id: formData.organization_id,
        };

        const res = await clinicsService.createClinic(postPayload, currentUser);
        if (res.success) {
          toast.success(`Clinic branch "${postPayload.name}" added successfully!`);
          refreshOrganizations?.();
          onSuccess?.(res.data);
          onClose();
        } else {
          toast.error(res.error || 'Failed to add clinic');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(isEdit ? 'Failed to update clinic' : 'Failed to add clinic');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5 text-primary">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEdit ? 'Edit Clinic Branch' : 'Add New Clinic Branch'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEdit ? 'Update clinic details and operational status' : 'Register a new branch to the multi-clinic system'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body - Strictly matching payload fields */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1 text-xs">
          {/* 1. Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
              Clinic Branch Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Northgate Aesthetic & Family Dental"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
            />
          </div>

          {/* 2. Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief description of the clinic branch..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium resize-none"
            />
          </div>

          {/* 3 & 4. Contact Email & Contact Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                Contact Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="e.g. branch@aureadental.com"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                Contact Phone
              </label>
              <input
                type="tel"
                placeholder="e.g. +1 (555) 020-1122"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* 5. Address */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
              Address
            </label>
            <input
              type="text"
              placeholder="e.g. King Fahd Road, Suite 402"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
            />
          </div>

          {/* 6 & 7. Timezone & Working Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium cursor-pointer"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                Working Hours (additionalProperty)
              </label>
              <input
                type="text"
                placeholder="anything"
                value={formData.workingHoursProp}
                onChange={(e) => setFormData({ ...formData, workingHoursProp: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium font-mono"
              />
            </div>
          </div>

          {/* If Editing (PUT mode): Show is_active toggle */}
          {isEdit && (
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                Operational Status (is_active)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: true })}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    formData.is_active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Active (true)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: false })}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    !formData.is_active
                      ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-2xs font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Inactive (false)
                </button>
              </div>
            </div>
          )}

          {/* If Creating (POST mode): Show Parent Organization selector */}
          {!isEdit && (
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                Parent Organization <span className="text-rose-500">*</span>
              </label>
              {isLoadingOrgs ? (
                <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2 font-medium">
                  <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                  Fetching organizations from backend...
                </div>
              ) : orgsList.length === 0 ? (
                <div className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  Backend par koi organization nahi mili. Pehle Super Admin panel se organization create karein.
                </div>
              ) : (
                <select
                  value={formData.organization_id}
                  onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium cursor-pointer"
                >
                  {orgsList.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!isEdit && (isLoadingOrgs || orgsList.length === 0))}
              className="px-5 py-2 text-xs font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Clinic Branch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
