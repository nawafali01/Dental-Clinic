import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { organizationsService } from '@/services/organizationsService';
import { orgSchema } from '@/schemas/org.schema';
import { toast } from 'sonner';

/**
 * REUSABLE ORGANIZATION FORM
 * Strictly contains the 7 fields matching backend payload:
 * - name
 * - description
 * - contact_email
 * - contact_phone
 * - address
 * - branding: { additionalProperty }
 * - is_active (boolean)
 */
export function OrgBrandingForm({
  initialData = null,
  onSave,
  onCancel,
  showCancel = false,
  submitButtonText,
  disableStatusToggle = false,
}) {
  const getInitialBrandingProp = (data) => {
    if (data?.branding && typeof data.branding === 'object' && data.branding.additionalProperty !== undefined) {
      return data.branding.additionalProperty;
    }
    return 'anything';
  };

  const getInitialIsActive = (data) => {
    if (data?.is_active !== undefined) {
      return Boolean(data.is_active);
    }
    if (data?.status !== undefined) {
      return data.status === 'active';
    }
    return true;
  };

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    contact_email: initialData?.contact_email || initialData?.contactEmail || '',
    contact_phone: initialData?.contact_phone || initialData?.contactPhone || '',
    address: initialData?.address || '',
    brandingProperty: getInitialBrandingProp(initialData),
    is_active: getInitialIsActive(initialData),
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        contact_email: initialData.contact_email || initialData.contactEmail || '',
        contact_phone: initialData.contact_phone || initialData.contactPhone || '',
        address: initialData.address || '',
        brandingProperty: getInitialBrandingProp(initialData),
        is_active: getInitialIsActive(initialData),
      });
      setErrors({});
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      name: (formData.name || '').trim(),
      description: (formData.description || '').trim(),
      contact_email: (formData.contact_email || '').trim(),
      contact_phone: (formData.contact_phone || '').trim(),
      address: (formData.address || '').trim(),
      branding: {
        additionalProperty: formData.brandingProperty || 'anything',
      },
      is_active: Boolean(formData.is_active),
    };

    const validation = orgSchema.safeParse(payload);
    if (!validation.success) {
      const fieldErrors = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0]] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      if (initialData?.id) {
        const res = await organizationsService.updateOrganization(initialData.id, payload);
        if (res.success) {
          toast.success(`Organization "${payload.name}" updated successfully.`);
          if (onSave) onSave(res.data);
        } else {
          toast.error(res.error || 'Failed to update organization.');
        }
      } else {
        const res = await organizationsService.createOrganization(payload);
        if (res.success) {
          toast.success(`Organization "${payload.name}" created successfully.`);
          if (onSave) onSave(res.data);
        } else {
          toast.error(res.error || 'Failed to create organization.');
        }
      }
    } catch (err) {
      console.error('Failed to save organization:', err);
      setErrors({ submit: 'Failed to save organization. Please try again.' });
      toast.error('Failed to save organization settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <div className="p-3.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
          {errors.submit}
        </div>
      )}

      {/* 1. Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
          Organization Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Smile Care Group"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border bg-white focus:outline-none transition-colors ${
            errors.name
              ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
              : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
          }`}
        />
        {errors.name && (
          <p className="text-xs text-rose-500 font-medium mt-1">{errors.name}</p>
        )}
      </div>

      {/* 2. Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
          Description
        </label>
        <textarea
          rows={3}
          placeholder="Brief description of the organization..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
        />
      </div>

      {/* 3 & 4. Contact Email & Contact Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
            Contact Email
          </label>
          <input
            type="email"
            placeholder="e.g. info@agakhanhealth.org"
            value={formData.contact_email}
            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border bg-white focus:outline-none transition-colors ${
              errors.contact_email
                ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
            }`}
          />
          {errors.contact_email && (
            <p className="text-xs text-rose-500 font-medium mt-1">{errors.contact_email}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
            Contact Phone
          </label>
          <input
            type="tel"
            placeholder="e.g. +1-800-555-0199"
            value={formData.contact_phone}
            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
      </div>

      {/* 5. Address */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
          Headquarters Address
        </label>
        <input
          type="text"
          placeholder="e.g. 123 Health Avenue, Medical District"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
      </div>

      {/* 6. Branding (additionalProperty) */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
          Branding (additionalProperty)
        </label>
        <input
          type="text"
          placeholder="anything"
          value={formData.brandingProperty}
          onChange={(e) => setFormData({ ...formData, brandingProperty: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          Sets branding payload property: <code className="text-slate-600 font-mono">branding: &#123; additionalProperty: "{formData.brandingProperty || 'anything'}" &#125;</code>
        </p>
      </div>

      {/* 7. Operational Status (is_active) */}
      {!disableStatusToggle && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
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

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
        {showCancel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          {isSubmitting
            ? 'Saving...'
            : submitButtonText || (initialData?.id ? 'Save Changes' : 'Create Organization')}
        </button>
      </div>
    </form>
  );
}
