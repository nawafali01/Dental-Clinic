import React, { useState } from 'react';
import { ChevronRight, Save, RotateCcw, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { useRole } from '@/dashboard/shared/context/RoleContext';

export const SettingsHeader = ({
  isDirty,
  isSaving,
  onSave,
  onReset,
  activeTabTitle,
}) => {
  const { currentRole } = useRole();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const roleLabel = currentRole?.label || 'Admin';

  const handleConfirmReset = () => {
    onReset();
    setShowResetConfirm(false);
  };

  return (
    <div className="flex flex-col gap-4 pb-6 border-b border-slate-200">
      {/* Breadcrumb & Scope Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="hover:text-slate-800 transition-colors cursor-pointer">{roleLabel}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">Settings</span>
          {activeTabTitle && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-primary font-medium">{activeTabTitle}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Unsaved changes
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <Shield className="w-3 h-3 text-slate-500" />
            Workspace v3.2
          </span>
        </div>
      </div>

      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Settings & Operations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage organization branding, operational catalogs, alerts, and platform security policies.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className={`px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isDirty ? 'ring-2 ring-primary/30 ring-offset-1' : ''
            }`}
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Reset to Default Settings?</h3>
                <p className="text-xs text-slate-500 mt-0.5">This will restore original system presets.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              All branding colors, operational catalogs, notification preferences, and security policies will be reverted to factory defaults. Any customized lead stages or notification rules will be reset.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-semibold text-white bg-destructive hover:bg-destructive/90 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Yes, Reset Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
