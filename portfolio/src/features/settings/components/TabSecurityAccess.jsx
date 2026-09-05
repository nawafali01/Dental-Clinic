import React from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Users,
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
  HelpCircle,
  Check,
} from 'lucide-react';
import { useRole } from '@/dashboard/shared/context/RoleContext';
import { TIMEOUT_OPTIONS, MFA_POLICIES, PERMISSION_MATRIX } from '@/constants/settingsConstants';

export const TabSecurityAccess = ({
  formData,
  onChange,
}) => {
  const { currentRole } = useRole();
  const isAdmin = currentRole?.id === 'super_admin' || currentRole?.id === 'org_admin';

  const {
    sessionTimeoutMinutes = '30',
    mfaPolicy = 'enforce_admin',
    passwordExpirationDays = '90',
  } = formData || {};

  return (
    <div className="space-y-6">
      {/* Role Elevation Banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between ${
        isAdmin
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          : 'bg-amber-50/70 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isAdmin ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold">
                {isAdmin ? 'Administrative Security Clearance Active' : 'Limited Role Permissions'}
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isAdmin ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
              }`}>
                {currentRole?.label || 'Staff'}
              </span>
            </div>
            <p className="text-[11px] opacity-80 mt-0.5">
              {isAdmin
                ? 'You have permission to configure platform session lifetimes, multi-factor policies, and role access.'
                : 'Security controls are managed by Super Admin and Org Admin accounts.'}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Session & Authentication Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Session Management & HIPAA Timeouts</h3>
            <p className="text-xs text-slate-500">Enforce automatic patient record screen-locking during inactive terminal periods.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Timeout selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Idle Session Expiration
            </label>
            <select
              disabled={!isAdmin}
              value={sessionTimeoutMinutes}
              onChange={(e) => onChange('sessionTimeoutMinutes', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {TIMEOUT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">Terminates JWT sessions if no keyboard/mouse interaction is detected.</p>
          </div>

          {/* Password Expiry */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Mandatory Password Rotation
            </label>
            <select
              disabled={!isAdmin}
              value={passwordExpirationDays}
              onChange={(e) => onChange('passwordExpirationDays', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="30">Every 30 Days (Strict)</option>
              <option value="60">Every 60 Days</option>
              <option value="90">Every 90 Days (Recommended)</option>
              <option value="180">Every 180 Days</option>
              <option value="never">Never Expire</option>
            </select>
            <p className="text-[11px] text-slate-400">Prompts staff to cycle passwords upon next dashboard sign-in.</p>
          </div>
        </div>
      </div>

      {/* 2. Multi-Factor Authentication Policy */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Multi-Factor Authentication (MFA / 2FA) Policy</h3>
            <p className="text-xs text-slate-500">Select security enforcement tier for two-factor authentication.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {MFA_POLICIES.map((policy) => {
            const isSelected = mfaPolicy === policy.id;
            return (
              <div
                key={policy.id}
                onClick={() => isAdmin && onChange('mfaPolicy', policy.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
                    : 'border-slate-200 bg-slate-50/40 hover:bg-white'
                } ${!isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-900">{policy.title}</h4>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{policy.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Role-Level Permission Matrix Preview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Role-Level Access Control Matrix</h3>
            <p className="text-xs text-slate-500">Live preview of resource permissions across dental clinic staffing tiers.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Resource Area</th>
                <th className="py-2.5 px-3 font-semibold text-center">Super Admin</th>
                <th className="py-2.5 px-3 font-semibold text-center">Org Admin</th>
                <th className="py-2.5 px-3 font-semibold text-center">Clinic Manager</th>
                <th className="py-2.5 px-3 font-semibold text-center">Front Desk</th>
                <th className="py-2.5 px-3 font-semibold text-center">Call Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERMISSION_MATRIX.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-medium text-slate-900">{row.resource}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {row.superAdmin}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {row.orgAdmin}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                      {row.clinicManager}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                      {row.receptionist}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {row.agent}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
