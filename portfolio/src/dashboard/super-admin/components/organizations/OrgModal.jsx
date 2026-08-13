import { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import { organizationsService } from '@/services/organizationsService';
import { orgSchema } from '@/schemas/org.schema';

const TIMEZONE_OPTIONS = [
  'Asia/Karachi',
  'Asia/Dubai',
  'Asia/Riyadh',
  'Europe/London',
  'America/New_York',
];

const CURRENCY_OPTIONS = ['USD', 'PKR', 'AED', 'SAR', 'GBP'];

export function OrgModal({ isOpen, onClose, onSave, initialData = null }) {
  const [prevInitialData, setPrevInitialData] = useState(initialData);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    timezone: initialData?.timezone || 'Asia/Karachi',
    currency: initialData?.currency || 'USD',
    brandingColor: initialData?.brandingColor || '#0F766E',
    status: initialData?.status || 'active',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (initialData !== prevInitialData || isOpen !== prevIsOpen) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
    setFormData({
      name: initialData?.name || '',
      timezone: initialData?.timezone || 'Asia/Karachi',
      currency: initialData?.currency || 'USD',
      brandingColor: initialData?.brandingColor || '#0F766E',
      status: initialData?.status || 'active',
    });
    setErrors({});
  }

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validation = orgSchema.safeParse(formData);
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
        // Edit Organization mutation
        // TODO: replace with Supabase call when backend is ready
        const res = await organizationsService.updateOrganization(initialData.id, formData);
        if (res.success && onSave) {
          onSave(res.data);
        }
      } else {
        // Create Organization mutation
        // TODO: replace with Supabase call when backend is ready
        const res = await organizationsService.createOrganization(formData);
        if (res.success && onSave) {
          onSave(res.data);
        }
      }
      onClose();
    } catch (err) {
      console.error('Failed to save organization:', err);
      setErrors({ submit: 'Failed to save organization. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {initialData ? 'Edit Organization' : 'Create New Organization'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {initialData
                  ? 'Update organization details and configuration'
                  : 'Add a new organization to the platform'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errors.submit && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
              {errors.submit}
            </div>
          )}

          {/* Organization Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Organization Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Smile Care Group"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl text-sm border bg-white focus:outline-none transition-colors ${
                errors.name
                  ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Timezone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              >
                {CURRENCY_OPTIONS.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Branding Color */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Branding Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.brandingColor}
                  onChange={(e) => setFormData({ ...formData, brandingColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                />
                <span className="text-xs font-mono text-slate-600 uppercase">
                  {formData.brandingColor}
                </span>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'active' })}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    formData.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'inactive' })}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    formData.status === 'inactive'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-2xs transition-colors disabled:opacity-50"
            >
              {isSubmitting
                ? 'Saving...'
                : initialData
                ? 'Update Organization'
                : 'Create Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
