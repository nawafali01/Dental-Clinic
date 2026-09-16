import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Building2,
  Sparkles,
  Upload,
  Trash2,
  Save,
  Check,
  RefreshCw,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  Sliders,
  Tag,
  PhoneCall,
  Lock,
  AlertCircle,
  Eye,
  Palette,
  Briefcase,
  Receipt,
  CheckCircle2,
  Stethoscope,
  ChevronRight,
  Globe2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/dashboard/shared/context/RoleContext';
import { useOrg } from '@/dashboard/shared/context/OrgContext';
import { organizationsService } from '@/services/organizationsService';
import { clinicsService } from '@/services/clinicsService';
import { settingsService } from '@/services/settingsService';
import {
  TIMEZONE_OPTIONS,
  CURRENCY_OPTIONS,
  BRAND_PRESETS,
  MAX_LOGO_SIZE_BYTES,
  VALID_LOGO_TYPES,
} from '@/constants/organizationConstants';

const TABS = [
  { id: 'brand', label: 'Brand & Identity', icon: Palette },
  { id: 'branches', label: 'Clinic Branches', icon: Building2 },
  { id: 'clinical', label: 'Clinical Operations', icon: Stethoscope },
  { id: 'billing', label: 'Invoicing & Regional', icon: Receipt },
  { id: 'governance', label: 'Platform Standards', icon: Lock },
];

export const OrgAdminSettingsView = () => {
  const { currentUser } = useAuth();
  const { userRole } = useRole();
  const { currentOrg, selectedOrgId } = useOrg();

  const isSuperAdmin = userRole === 'super_admin' || currentUser?.role === 'super_admin';
  const isOrgAdmin = userRole === 'org_admin' || currentUser?.role === 'org_admin';

  // Resolved organization ID strictly scoped to Org Admin's organization
  const resolvedOrgId = useMemo(() => {
    if (isOrgAdmin) {
      return currentUser?.organizationId || 'org-001';
    }
    if (isSuperAdmin) {
      return (selectedOrgId && selectedOrgId !== 'all')
        ? selectedOrgId
        : (currentUser?.organizationId || 'org-001');
    }
    return currentUser?.organizationId || 'org-001';
  }, [currentUser, isOrgAdmin, isSuperAdmin, selectedOrgId]);

  const [activeTab, setActiveTab] = useState('brand');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Core organization data
  const [savedOrg, setSavedOrg] = useState(null);
  const [formData, setFormData] = useState(null);

  // Attached organization branches and users
  const [orgClinics, setOrgClinics] = useState([]);
  const [catalogs, setCatalogs] = useState(null);

  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const loadData = () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!resolvedOrgId) {
        setError('Unable to resolve organization from your current session.');
        setIsLoading(false);
        return;
      }

      const org = organizationsService.getOrganizationByIdSync(resolvedOrgId);
      const allOrgs = organizationsService.getOrganizationsSync();
      const current = org || allOrgs.find((o) => o.id === resolvedOrgId) || allOrgs[0];

      if (!current) {
        setError(`Organization "${resolvedOrgId}" not found.`);
        setIsLoading(false);
        return;
      }

      const defaultData = {
        name: current.name || 'Smile Care Group',
        legalName: current.legalName || `${current.name || 'Smile Care Group'} Healthcare Ltd.`,
        tagline: current.tagline || 'Excellence in Comprehensive Dental Care & Orthodontics',
        logoUrl: current.logoUrl || null,
        brandColor: current.brandColor || current.brandingColor || '#0F766E',
        timezone: current.timezone || 'Asia/Karachi',
        currency: current.currency || 'PKR',
        supportEmail: current.supportEmail || 'care@smilecaregroup.com',
        phone: current.phone || '+966 11 456 7890',
        emergencyPhone: current.emergencyPhone || '+966 50 123 4567',
        taxNumber: current.taxNumber || 'TRN-9842041924',
        invoicePrefix: current.invoicePrefix || 'SCG-2026-',
        taxPercentage: current.taxPercentage !== undefined ? current.taxPercentage : 15,
        defaultApptDuration: current.defaultApptDuration || '45',
        bookingWindowDays: current.bookingWindowDays || '60',
        cancellationCutoffHours: current.cancellationCutoffHours || '24',
        emergencyBufferMinutes: current.emergencyBufferMinutes || '30',
        status: current.status || 'active',
      };

      setSavedOrg(defaultData);
      setFormData(JSON.parse(JSON.stringify(defaultData)));

      // Load branches scoped to this organization
      const allClinics = clinicsService.getClinics();
      const matchedClinics = allClinics.filter((c) => c.orgId === current.id);
      setOrgClinics(matchedClinics);

      // Load platform catalogs
      const cats = settingsService.getCatalogs();
      setCatalogs(cats);
    } catch (err) {
      console.error('Failed to load organization settings:', err);
      setError('An unexpected error occurred while loading organization data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedOrgId]);

  // Dirty state tracker
  const isDirty = useMemo(() => {
    if (!formData || !savedOrg) return false;
    return JSON.stringify(formData) !== JSON.stringify(savedOrg);
  }, [formData, savedOrg]);

  const handleFileUpload = (file) => {
    if (!file) return;

    if (!VALID_LOGO_TYPES.includes(file.type)) {
      toast.error('Invalid format. Please upload PNG, JPG, SVG, or WebP.');
      return;
    }

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({ ...prev, logoUrl: e.target?.result }));
      toast.success('Organization logo uploaded.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    if (!formData) return;

    if (!formData.name?.trim()) {
      toast.error('Organization Name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        brandingColor: formData.brandColor,
      };

      const res = await organizationsService.updateOrganization(resolvedOrgId, payload);
      if (res.success) {
        setSavedOrg(JSON.parse(JSON.stringify(formData)));
        toast.success(`Organization settings for "${formData.name}" saved successfully!`);
      } else {
        toast.error(res.error || 'Failed to save settings.');
      }
    } catch (err) {
      console.error('Error saving organization settings:', err);
      toast.error('Failed to save organization settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (savedOrg) {
      setFormData(JSON.parse(JSON.stringify(savedOrg)));
      toast.info('Changes reset to last saved state.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl">
        <div className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
        <div className="h-12 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-96 bg-slate-100 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="p-12 max-w-lg mx-auto text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Settings Unavailable</h2>
        <p className="text-xs text-slate-500">{error || 'Could not load organization profile.'}</p>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ── Top Hero Card / Identity Banner ─────────────────────────────── */}
      <div className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        {/* Subtle decorative gradient background */}
        <div
          className="absolute -right-16 -top-16 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ backgroundColor: formData.brandColor }}
        />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Org Avatar and Details */}
          <div className="flex items-start sm:items-center gap-5">
            <div
              className="relative w-20 h-20 rounded-2xl p-1 bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden"
              style={{ borderColor: formData.brandColor }}
            >
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt={formData.name}
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div
                  className="w-full h-full rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-inner"
                  style={{ backgroundColor: formData.brandColor }}
                >
                  {formData.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  {formData.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Active Org Scope
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 font-mono">
                  {resolvedOrgId}
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-2xl font-medium">
                {formData.tagline}
              </p>

              {/* Quick Specs Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <strong>{orgClinics.length}</strong> Branches
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                  {formData.timezone}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  Currency: <strong>{formData.currency}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Multi-Branch Tenant
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-center">
            {isDirty && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving || !isDirty}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isDirty
                  ? 'bg-primary text-white hover:opacity-95 shadow-primary/20 scale-[1.02]'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving Changes...' : isDirty ? 'Save Organization Changes' : 'All Changes Saved'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 text-xs font-semibold scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-primary text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.id === 'branches' && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {orgClinics.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: Brand & Identity ──────────────────────────────────────── */}
      {activeTab === 'brand' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Form Fields (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Brand Identity & Visual Profile</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure your dental practice group name, official logo, and brand theme colors.
              </p>
            </div>

            {/* Organization Name & Legal Name */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                  Organization Display Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Smile Care Group"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                  Legal Entity / Practice Name
                </label>
                <input
                  type="text"
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  placeholder="e.g. Smile Care Group Healthcare LLC"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                  Tagline / Clinical Mission
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Advanced Aesthetic & Restorative Dental Excellence"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Logo Upload Section */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                Practice Logo
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />

              {formData.logoUrl ? (
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl bg-slate-50/70">
                  <div className="flex items-center gap-4">
                    <img
                      src={formData.logoUrl}
                      alt="Uploaded Logo"
                      className="w-14 h-14 rounded-xl object-contain bg-white border border-slate-200 p-1 shadow-2xs"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Custom Brand Logo Active</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        High-resolution asset rendered on digital prescriptions & invoices
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer shadow-2xs"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, logoUrl: null }))}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Remove Logo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-primary bg-primary/5 scale-[1.01]'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">Click to upload or drag & drop logo</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    SVG, PNG, JPG or WebP (max 5MB • Recommended 512×512px)
                  </p>
                </div>
              )}
            </div>

            {/* Brand Color Theme Palette */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                Brand Primary Accent Color
              </label>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  {BRAND_PRESETS.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setFormData({ ...formData, brandColor: preset.hex })}
                      className={`group relative w-9 h-9 rounded-xl transition-transform cursor-pointer shadow-2xs ${
                        formData.brandColor === preset.hex
                          ? 'scale-110 ring-2 ring-offset-2 ring-primary'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: preset.hex }}
                      title={preset.name}
                    >
                      {formData.brandColor === preset.hex && (
                        <Check className="w-4 h-4 text-white mx-auto drop-shadow-xs" />
                      )}
                    </button>
                  ))}
                  <div className="flex items-center gap-2 ml-1">
                    <input
                      type="color"
                      value={formData.brandColor}
                      onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                      className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white shadow-2xs"
                    />
                    <input
                      type="text"
                      value={formData.brandColor}
                      onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                      className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase text-center"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Applied as the primary clinical theme across booking portals, notifications, and patient invoices.
                </p>
              </div>
            </div>

            {/* Direct Contact Channels */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                  Central Support Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={formData.supportEmail}
                    onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs border border-slate-200 font-medium"
                    placeholder="contact@smilecare.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                  Central Helpline Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs border border-slate-200 font-medium"
                    placeholder="+966 11 000 0000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Live Previews (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Live Brand Header Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Live Digital Card Preview
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {formData.status}
                </span>
              </div>

              <div
                className="p-5 rounded-2xl text-white shadow-md relative overflow-hidden transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${formData.brandColor} 0%, #1e293b 100%)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md p-1.5 flex items-center justify-center border border-white/30">
                    {formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt="Logo"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <span className="font-black text-white text-lg">
                        {formData.name.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-white/80 bg-white/10 px-2 py-1 rounded-full uppercase">
                    Dental Group
                  </span>
                </div>

                <div className="mt-6 space-y-1">
                  <h4 className="text-lg font-black tracking-tight text-white">{formData.name}</h4>
                  <p className="text-xs text-white/80 line-clamp-1">{formData.tagline}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-white/90">
                  <span>{formData.timezone}</span>
                  <span className="font-mono font-bold">{formData.currency} Standard</span>
                </div>
              </div>
            </div>

            {/* 2. Patient Invoice & Letterhead Preview */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-slate-400" />
                  Prescription & Bill Letterhead
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Auto-Generated</span>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div>
                    <h5
                      className="font-bold text-sm tracking-tight"
                      style={{ color: formData.brandColor }}
                    >
                      {formData.name}
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono">Tax ID: {formData.taxNumber}</p>
                  </div>
                  <div className="text-right text-[10px] text-slate-500">
                    <p className="font-bold text-slate-700">INVOICE: {formData.invoicePrefix}0042</p>
                    <p>{new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Clinical Hygiene & Digital Scan</span>
                    <span className="font-mono font-bold">250.00 {formData.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax / VAT ({formData.taxPercentage}%)</span>
                    <span className="font-mono font-bold">
                      {(250 * (Number(formData.taxPercentage) / 100)).toFixed(2)} {formData.currency}
                    </span>
                  </div>
                  <div
                    className="flex justify-between font-bold pt-2 border-t border-slate-200 text-slate-900"
                    style={{ color: formData.brandColor }}
                  >
                    <span>Total Billable</span>
                    <span className="font-mono text-xs">
                      {(250 * (1 + Number(formData.taxPercentage) / 100)).toFixed(2)} {formData.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: Clinic Branches Network ───────────────────────────────── */}
      {activeTab === 'branches' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Active Clinical Network ({orgClinics.length} Branches)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  All healthcare facilities and specialized dental clinics operating under {formData.name}.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-xl">
                Restricted to {formData.name} only
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {orgClinics.map((clinic, idx) => (
                <div
                  key={clinic.id || idx}
                  className="p-5 border border-slate-200 rounded-2xl hover:border-primary/40 hover:shadow-sm transition-all bg-white space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{clinic.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {clinic.city || 'Central'}, Medical District
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        clinic.status !== 'inactive'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {clinic.status || 'Active'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Operating Hours
                      </span>
                      <span className="font-medium">{clinic.operatingHours || '08:00 AM - 08:00 PM'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Dental Chairs
                      </span>
                      <span className="font-medium font-mono">{clinic.chairsCount || 5} Operatories</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Branch Manager
                      </span>
                      <span className="font-medium">{clinic.manager || 'Dr. Assigned'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Contact Line
                      </span>
                      <span className="font-medium font-mono text-[10px]">{clinic.phone || '+1 (555) 020-001'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: Clinical & Practice Operations ───────────────────────── */}
      {activeTab === 'clinical' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Clinical Scheduling & Patient Intake Rules</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standardize appointment pacing, emergency buffer windows, and booking lead times across your branches.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Appointment Default Duration */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                Default Appointment Slot Duration
              </label>
              <select
                value={formData.defaultApptDuration}
                onChange={(e) => setFormData({ ...formData, defaultApptDuration: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white font-medium cursor-pointer"
              >
                <option value="15">15 Minutes (Rapid Consult / Suture Removal)</option>
                <option value="30">30 Minutes (Routine Cleaning / Exam)</option>
                <option value="45">45 Minutes (Standard Restorative / Filling)</option>
                <option value="60">60 Minutes (Root Canal / Extraction)</option>
                <option value="90">90 Minutes (Surgical Implant / Complex Prep)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Sets the baseline calendar block size when patients or agents book slots.
              </p>
            </div>

            {/* Advance Booking Window */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                Maximum Advance Booking Window
              </label>
              <select
                value={formData.bookingWindowDays}
                onChange={(e) => setFormData({ ...formData, bookingWindowDays: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white font-medium cursor-pointer"
              >
                <option value="30">30 Days in advance</option>
                <option value="60">60 Days in advance (Standard)</option>
                <option value="90">90 Days in advance</option>
                <option value="180">6 Months in advance (Orthodontic Plans)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Patients cannot schedule appointments beyond this horizon.
              </p>
            </div>

            {/* Cancellation Cutoff Notice */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                Minimum Cancellation Notice Window
              </label>
              <select
                value={formData.cancellationCutoffHours}
                onChange={(e) => setFormData({ ...formData, cancellationCutoffHours: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white font-medium cursor-pointer"
              >
                <option value="12">12 Hours Notice</option>
                <option value="24">24 Hours Notice (Recommended)</option>
                <option value="48">48 Hours Notice</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Prevents last-minute schedule gaps by locking patient self-cancellation.
              </p>
            </div>

            {/* Emergency Slot Buffer */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                Emergency Patient Daily Reserve Buffer
              </label>
              <select
                value={formData.emergencyBufferMinutes}
                onChange={(e) => setFormData({ ...formData, emergencyBufferMinutes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white font-medium cursor-pointer"
              >
                <option value="0">No Reserved Buffer</option>
                <option value="30">30 Minutes per Doctor Shift</option>
                <option value="60">60 Minutes per Doctor Shift</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Protects calendar slots for walk-in acute toothache or trauma cases.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: Invoicing, Tax & Regional ─────────────────────────────── */}
      {activeTab === 'billing' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Regional & Financial Defaults</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set standard invoicing prefixes, tax registration, and billing currencies for clinical receipts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Timezone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                Operational Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white font-medium cursor-pointer"
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
                Primary Practice Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white font-medium cursor-pointer"
              >
                {CURRENCY_OPTIONS.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>

            {/* Invoice Prefix */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                Invoice Number Prefix
              </label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                placeholder="e.g. SCG-2026-"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 font-mono font-semibold"
              />
              <p className="text-[11px] text-slate-400 mt-1">Generated invoices will be numbered e.g. {formData.invoicePrefix}00124</p>
            </div>

            {/* Tax / VAT Percentage */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                Default Tax / VAT Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={formData.taxPercentage}
                  onChange={(e) => setFormData({ ...formData, taxPercentage: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 font-mono font-semibold"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  %
                </span>
              </div>
            </div>

            {/* Tax Registration Number */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                Official Tax / VAT Registration Number (TRN)
              </label>
              <input
                type="text"
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                placeholder="e.g. TRN-30049281900003"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Printed on patient payment receipts and tax compliance filings.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: Platform Governance (Read-Only) ───────────────────────── */}
      {activeTab === 'governance' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <h3 className="text-base font-bold text-slate-900">Platform-Wide Governance & Clinical Catalogs</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Standardized pipeline stages and classification standards enforced across all enterprise dental organizations.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Read-Only
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Lead Statuses */}
            <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-primary" />
                  Lead Pipeline Stages
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-bold">
                  {catalogs?.leadStatuses?.length || 6}
                </span>
              </div>
              <div className="space-y-1.5">
                {catalogs?.leadStatuses?.map((st) => (
                  <div
                    key={st.id || st.name}
                    className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700"
                  >
                    <span className="font-semibold">{st.name}</span>
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                ))}
              </div>
            </div>

            {/* Lead Sources */}
            <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  Acquisition Sources
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-bold">
                  {catalogs?.leadSources?.length || 6}
                </span>
              </div>
              <div className="space-y-1.5">
                {catalogs?.leadSources?.map((src) => (
                  <div
                    key={src.id || src.name}
                    className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700"
                  >
                    <span className="font-semibold">{src.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">Tracked</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Call Outcomes */}
            <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-primary" />
                  Call Log Outcomes
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-bold">
                  {catalogs?.callOutcomes?.length || 5}
                </span>
              </div>
              <div className="space-y-1.5">
                {catalogs?.callOutcomes?.map((co) => (
                  <div
                    key={co.id || co.name}
                    className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700"
                  >
                    <span className="font-semibold">{co.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">Standard</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
            <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              These categories standardize AI performance scores, call conversion analytics, and patient outcome reporting across all clinics in {formData.name}. To request modifications, contact the System Administrator.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgAdminSettingsView;
