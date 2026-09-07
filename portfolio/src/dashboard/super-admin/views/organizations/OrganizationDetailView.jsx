import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Users,
  Globe,
  DollarSign,
  Calendar,
  ArrowLeft,
  Power,
  Save,
  Phone,
  Clock,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useOrg } from '@/dashboard/shared/context/OrgContext';
import { organizationsService } from '@/services/organizationsService';
import { clinicsService } from '@/services/clinicsService';
import { storageService } from '@/services/storage.service';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { Button } from '@/dashboard/shared/components/ui/Button';
import { buildRoleUrl } from '@/utils/getRoleBaseUrl';
import {
  TIMEZONE_OPTIONS,
  CURRENCY_OPTIONS,
  ORG_STATUS_OPTIONS,
  DEFAULT_ORG_SETTINGS_FORM,
  ORG_DEFAULTS,
  getOrgDetailTabs,
  formatOrgCurrency,
} from './constants';

export default function OrganizationDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { setSelectedOrgId } = useOrg();

  const [org, setOrg] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'clinics' | 'users' | 'settings'
  const [isLoading, setIsLoading] = useState(true);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(DEFAULT_ORG_SETTINGS_FORM);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const role = currentUser?.role || 'super_admin';
  const listUrl = buildRoleUrl('/organizations', role);

  const loadOrgData = () => {
    setIsLoading(true);
    try {
      const foundOrg = organizationsService.getOrganizationById(id);
      if (foundOrg) {
        setOrg(foundOrg);
        setSettingsForm({
          name: foundOrg.name || '',
          timezone: foundOrg.timezone || ORG_DEFAULTS.timezone,
          currency: foundOrg.currency || ORG_DEFAULTS.currency,
          brandingColor: foundOrg.brandingColor || ORG_DEFAULTS.brandingColor,
          status: foundOrg.status || ORG_DEFAULTS.status,
        });
      }
    } catch (err) {
      console.error('Error loading organization:', err);
      toast.error('Failed to load organization details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrgData();
  }, [id]);

  // Retrieve clinics belonging to this organization
  const orgClinics = useMemo(() => {
    if (!org) return [];
    // Query clinicsService which has all canonical clinics tagged with orgId
    const allClinics = clinicsService.getClinics();
    const matched = allClinics.filter((c) => c.orgId === org.id);
    if (matched.length > 0) return matched;
    // Fallback to embedded org.clinics array if any
    return org.clinics || [];
  }, [org]);

  // Retrieve users belonging to this organization
  const orgUsers = useMemo(() => {
    if (!org) return [];
    const allUsers = storageService.get(storageService.KEYS.USERS) || [];
    const matched = allUsers.filter(
      (u) => u.organizationId === org.id || u.orgId === org.id
    );
    if (matched.length > 0) return matched;
    return org.users || [];
  }, [org]);

  // Toggle active status
  const handleToggleStatus = async () => {
    if (!org) return;
    const newStatus = org.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await organizationsService.updateOrganization(org.id, {
        status: newStatus,
      });
      if (res.success) {
        setOrg((prev) => ({ ...prev, status: newStatus }));
        setSettingsForm((prev) => ({ ...prev, status: newStatus }));
        toast.success(`Organization is now ${newStatus}!`);
      } else {
        toast.error(res.error || 'Failed to update status');
      }
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  // Save settings form
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!settingsForm.name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    setIsSavingSettings(true);
    try {
      const res = await organizationsService.updateOrganization(org.id, {
        name: settingsForm.name.trim(),
        timezone: settingsForm.timezone,
        currency: settingsForm.currency,
        brandingColor: settingsForm.brandingColor,
        status: settingsForm.status,
      });

      if (res.success) {
        setOrg((prev) => ({
          ...prev,
          ...settingsForm,
        }));
        toast.success('Organization settings updated successfully!');
      } else {
        toast.error(res.error || 'Failed to save settings');
      }
    } catch (err) {
      toast.error('Error saving organization settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading Organization Details...</p>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate(listUrl)}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Organizations
        </button>
        <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center shadow-2xs space-y-3">
          <Building2 className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
          <h2 className="text-lg font-bold text-slate-900">Organization Not Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            The organization with ID <span className="font-mono font-semibold">{id}</span> does not exist or has been removed.
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate(listUrl)}>
            Return to Organizations List
          </Button>
        </div>
      </div>
    );
  }

  const isActive = org.status === 'active';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(listUrl)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Organizations
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedOrgId(org.id);
              toast.info(`Switched global scope to ${org.name}`);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Set this organization as the active platform scope"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Switch Active Scope
          </button>
        </div>
      </div>

      {/* Organization Master Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0"
              style={{ backgroundColor: org.brandingColor || ORG_DEFAULTS.brandingColor }}
            >
              {org.name ? org.name.substring(0, 2).toUpperCase() : ORG_DEFAULTS.initials}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{org.name}</h1>
                <Badge variant={isActive ? 'success' : 'warning'} dot>
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                <span className="font-mono">ID: {org.id}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {org.timezone || ORG_DEFAULTS.timezone}
                </span>
                <span>•</span>
                <span className="font-semibold text-slate-700">{org.currency || ORG_DEFAULTS.currency}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleStatus}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {isActive ? 'Deactivate Org' : 'Activate Org'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-100 pt-2">
          {getOrgDetailTabs(orgClinics.length, orgUsers.length).map((tab) => {
            const isTabActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 cursor-pointer -mb-px ${
                  isTabActive
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" /> Total Clinics
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-2">{orgClinics.length}</p>
              <p className="text-[11px] text-slate-500 mt-1">Branch locations</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" /> Total Users
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-2">{orgUsers.length}</p>
              <p className="text-[11px] text-slate-500 mt-1">Staff members</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-primary" /> Active Leads
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-2">{org.newLeadsCount || ORG_DEFAULTS.fallbackLeadsCount}</p>
              <p className="text-[11px] text-slate-500 mt-1">In patient funnel</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-primary" /> Recognized Revenue
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {formatOrgCurrency(org.revenue || ORG_DEFAULTS.fallbackRevenue, org.currency)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Monthly run-rate</p>
            </div>
          </div>

          {/* Org Profile & Metadata Grid */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Organization Metadata & Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" /> Default Timezone
                </span>
                <p className="font-semibold text-slate-800 text-sm">{org.timezone || ORG_DEFAULTS.timezone}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Billing Currency
                </span>
                <p className="font-semibold text-slate-800 text-sm">{org.currency || ORG_DEFAULTS.currency}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date Registered
                </span>
                <p className="font-semibold text-slate-800 text-sm">{org.createdAt || ORG_DEFAULTS.fallbackDate}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" /> Brand Color Code
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                    style={{ backgroundColor: org.brandingColor || ORG_DEFAULTS.brandingColor }}
                  />
                  <span className="font-mono font-semibold text-slate-800 text-sm">
                    {org.brandingColor || ORG_DEFAULTS.brandingColor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Clinics Tab */}
      {activeTab === 'clinics' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Clinic Branches</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Physical dental clinic locations operating under {org.name}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={MapPin}
              onClick={() => navigate(buildRoleUrl('/clinics', role))}
            >
              Open Clinics Module
            </Button>
          </div>

          {orgClinics.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-slate-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-xs font-semibold text-slate-700">No clinic branches registered</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Add clinic branches under this organization from the Clinics module.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {orgClinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{clinic.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{clinic.id}</p>
                      </div>
                    </div>
                    <Badge variant={clinic.status !== 'inactive' ? 'success' : 'warning'}>
                      {clinic.status !== 'inactive' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-600 border-t border-slate-100 pt-2.5">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{clinic.city || ORG_DEFAULTS.fallbackCity} — {clinic.address || ORG_DEFAULTS.fallbackAddress}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{clinic.phone || ORG_DEFAULTS.fallbackPhone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{clinic.operatingHours || ORG_DEFAULTS.fallbackOperatingHours}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Organization Staff & Users</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Staff members and administrators assigned to {org.name}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={Users}
              onClick={() => navigate(buildRoleUrl('/users', role))}
            >
              Open Users Module
            </Button>
          </div>

          {orgUsers.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-slate-500">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-xs font-semibold text-slate-700">No users assigned yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Invite users and assign them to this organization from the Users module.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Staff Member</th>
                    <th className="px-4 py-3">Assigned Role</th>
                    <th className="px-4 py-3">Assigned Clinic</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {orgUsers.map((u, i) => (
                    <tr key={u.id || i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                            {u.fullName ? u.fullName.charAt(0) : u.name ? u.name.charAt(0) : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.fullName || u.name || 'Staff User'}</p>
                            <p className="text-[10px] text-slate-400">{u.email || 'user@example.com'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                          {u.role ? u.role.replace('_', ' ') : 'Agent'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {u.clinicId || 'All Branches (Org-wide)'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={u.status !== 'inactive' ? 'success' : 'warning'} dot>
                          {u.status !== 'inactive' ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-slate-900">Organization Settings</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure profile information, timezone, currency, and branding preferences.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
                Organization Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={settingsForm.name}
                onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
                  Timezone
                </label>
                <select
                  value={settingsForm.timezone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, timezone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium cursor-pointer"
                >
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
                  Billing Currency
                </label>
                <select
                  value={settingsForm.currency}
                  onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium cursor-pointer"
                >
                  {CURRENCY_OPTIONS.map((curr) => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
                  Branding Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settingsForm.brandingColor}
                    onChange={(e) => setSettingsForm({ ...settingsForm, brandingColor: e.target.value })}
                    className="w-9 h-9 rounded-xl border border-slate-200 p-0.5 cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={settingsForm.brandingColor}
                    onChange={(e) => setSettingsForm({ ...settingsForm, brandingColor: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
                  Operational Status
                </label>
                <select
                  value={settingsForm.status}
                  onChange={(e) => setSettingsForm({ ...settingsForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium cursor-pointer"
                >
                  {ORG_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Save}
                disabled={isSavingSettings}
              >
                {isSavingSettings ? 'Saving Changes...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
