import React, { useState, useRef, useEffect } from 'react';
import { Upload, Trash2, Sparkles, Save } from 'lucide-react';
import { organizationsService } from '@/services/organizationsService';
import { orgSchema } from '@/schemas/org.schema';
import { toast } from 'sonner';
import {
  TIMEZONE_OPTIONS,
  CURRENCY_OPTIONS,
  BRAND_PRESETS,
  MAX_LOGO_SIZE_BYTES,
  VALID_LOGO_TYPES,
  DEFAULT_ORG_MODAL_FORM,
} from '@/constants/organizationConstants';

/**
 * REUSABLE ORGANIZATION BRANDING & IDENTITY FORM
 *
 * Used identically in:
 * 1. Super Admin OrgModal (dialog popup)
 * 2. Super Admin OrganizationDetailView (Settings tab)
 * 3. Org Admin Settings page (/admin/org-settings)
 */
export function OrgBrandingForm({
  initialData = null,
  onSave,
  onCancel,
  showCancel = false,
  submitButtonText,
  disableStatusToggle = false,
}) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || DEFAULT_ORG_MODAL_FORM.name,
    logoUrl: initialData?.logoUrl || DEFAULT_ORG_MODAL_FORM.logoUrl,
    timezone: initialData?.timezone || DEFAULT_ORG_MODAL_FORM.timezone,
    currency: initialData?.currency || DEFAULT_ORG_MODAL_FORM.currency,
    brandColor: initialData?.brandColor || initialData?.brandingColor || DEFAULT_ORG_MODAL_FORM.brandColor,
    status: initialData?.status || DEFAULT_ORG_MODAL_FORM.status,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if initialData changes externally
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || DEFAULT_ORG_MODAL_FORM.name,
        logoUrl: initialData.logoUrl || DEFAULT_ORG_MODAL_FORM.logoUrl,
        timezone: initialData.timezone || DEFAULT_ORG_MODAL_FORM.timezone,
        currency: initialData.currency || DEFAULT_ORG_MODAL_FORM.currency,
        brandColor: initialData.brandColor || initialData.brandingColor || DEFAULT_ORG_MODAL_FORM.brandColor,
        status: initialData.status || DEFAULT_ORG_MODAL_FORM.status,
      });
      setErrors({});
    }
  }, [initialData]);

  const handleFileUpload = (file) => {
    if (!file) return;

    if (!VALID_LOGO_TYPES.includes(file.type)) {
      toast.error('Invalid file format. Please upload PNG, JPG, SVG, or WebP.');
      return;
    }

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({ ...prev, logoUrl: e.target?.result }));
      toast.success('Logo uploaded successfully.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      ...formData,
      brandColor: formData.brandColor,
      brandingColor: formData.brandColor,
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
          toast.success(`Organization "${formData.name}" updated successfully.`);
          if (onSave) onSave(res.data);
        } else {
          toast.error(res.error || 'Failed to update organization.');
        }
      } else {
        const res = await organizationsService.createOrganization(payload);
        if (res.success) {
          toast.success(`Organization "${formData.name}" created successfully.`);
          if (onSave) onSave(res.data);
        } else {
          toast.error(res.error || 'Failed to create organization.');
        }
      }
    } catch (err) {
      console.error('Failed to save organization branding:', err);
      setErrors({ submit: 'Failed to save organization branding. Please try again.' });
      toast.error('Failed to save organization settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.submit && (
        <div className="p-3.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
          {errors.submit}
        </div>
      )}

      {/* Live Preview Card */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Live Brand Preview
          </span>
          <span
            className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
              formData.status === 'active'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {formData.status}
          </span>
        </div>
        <div className="flex items-center gap-3.5 p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          {formData.logoUrl ? (
            <img
              src={formData.logoUrl}
              alt="Preview"
              className="w-12 h-12 rounded-xl object-contain border border-slate-200 bg-white p-1 shrink-0"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs"
              style={{ backgroundColor: formData.brandColor }}
            >
              {formData.name ? formData.name.substring(0, 2).toUpperCase() : 'OG'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-slate-900 text-sm truncate">
              {formData.name || 'Organization Name'}
            </h4>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              {formData.timezone} • Currency: {formData.currency}
            </p>
          </div>
        </div>
      </div>

      {/* Organization Name */}
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

      {/* Logo Upload */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
          Organization Logo
        </label>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        />

        {formData.logoUrl ? (
          <div className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl bg-slate-50">
            <div className="flex items-center gap-3">
              <img
                src={formData.logoUrl}
                alt="Logo"
                className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-200 p-1"
              />
              <div>
                <p className="text-xs font-semibold text-slate-900">Custom Logo Active</p>
                <p className="text-[11px] text-slate-500">PNG, JPG, SVG or WebP (Max 5MB)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, logoUrl: null }))}
              className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Remove logo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-700">Click or drag logo here</p>
            <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, SVG, WebP up to 5MB</p>
          </div>
        )}
      </div>

      {/* Brand Color & Presets */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
          Brand Color
        </label>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {BRAND_PRESETS.map((p) => (
              <button
                key={p.hex}
                type="button"
                onClick={() => setFormData({ ...formData, brandColor: p.hex })}
                className={`w-8 h-8 rounded-xl transition-transform cursor-pointer ${
                  formData.brandColor === p.hex
                    ? 'scale-110 ring-2 ring-offset-2 ring-primary'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: p.hex }}
                title={p.name}
              />
            ))}
            <div className="flex items-center gap-2 ml-1">
              <input
                type="color"
                value={formData.brandColor}
                onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                className="w-8 h-8 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
              />
              <input
                type="text"
                value={formData.brandColor}
                onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                className="w-24 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-700 uppercase"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Timezone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        {/* Currency */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
            Billing Currency
          </label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
          >
            {CURRENCY_OPTIONS.map((curr) => (
              <option key={curr} value={curr}>
                {curr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status (Optional for Org Admin, editable or static) */}
      {!disableStatusToggle && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
            Operational Status
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: 'active' })}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                formData.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs font-bold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: 'inactive' })}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                formData.status === 'inactive'
                  ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-2xs font-bold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Inactive
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
