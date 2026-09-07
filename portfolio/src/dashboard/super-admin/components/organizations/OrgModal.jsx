import React from 'react';
import { X, Building2 } from 'lucide-react';
import { OrgBrandingForm } from './OrgBrandingForm';

/**
 * Super Admin Organization Modal (Create & Edit Dialog)
 * Uses the canonical OrgBrandingForm internally.
 */
export function OrgModal({ isOpen, onClose, onSave, initialData = null }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10 my-8">
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
                  ? 'Update organization branding, timezone, and settings'
                  : 'Add a new organization to the platform'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <div className="p-5 max-h-[80vh] overflow-y-auto">
          <OrgBrandingForm
            initialData={initialData}
            onSave={(data) => {
              if (onSave) onSave(data);
              onClose();
            }}
            onCancel={onClose}
            showCancel={true}
            submitButtonText={initialData ? 'Update Organization' : 'Create Organization'}
          />
        </div>
      </div>
    </div>
  );
}
