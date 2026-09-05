import React, { useState, useRef } from 'react';
import { Building2, Globe, DollarSign, Palette, Upload, Image as ImageIcon, Check, Trash2, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

import { TIMEZONES, CURRENCIES, PRESET_COLORS } from '@/constants/settingsConstants';

export const TabOrganizationBranding = ({
  formData,
  errors,
  onChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const {
    orgName = '',
    timezone = 'America/New_York',
    defaultCurrency = 'USD ($)',
    brandColor = '#1F8A70',
    logoUrl = '',
    supportEmail = '',
    clinicPhone = '',
  } = formData || {};

  const handleColorPreset = (hex) => {
    onChange('brandColor', hex);
  };

  const simulateSupabaseUpload = (file) => {
    if (!file) return;

    // Validation
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file format. Please upload PNG, JPG, SVG, or WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File exceeds 5MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    // Mock progress simulating Supabase Storage bucket upload
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);

      // Create blob object URL or base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const generatedUrl = e.target?.result || '';
        onChange('logoUrl', generatedUrl);
        setIsUploading(false);
        setUploadProgress(0);
        toast.success(`Clinic logo "${file.name}" uploaded to Supabase Storage!`);
      };
      reader.readAsDataURL(file);
    }, 850);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateSupabaseUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      simulateSupabaseUpload(e.target.files[0]);
    }
  };

  const handleRemoveLogo = () => {
    onChange('logoUrl', '');
    toast.info('Logo removed. Default system badge will be used.');
  };

  return (
    <div className="space-y-6">
      {/* Section 1: General Organization Info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Organization & Regional Profile</h2>
            <p className="text-xs text-slate-500">Essential clinic details used across patient communications and receipts.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Org Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Organization Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={orgName}
                onChange={(e) => onChange('orgName', e.target.value)}
                placeholder="e.g. Apex Dental Group"
                className={`w-full px-3.5 py-2.5 bg-slate-50/50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                  errors?.orgName ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-primary'
                }`}
              />
            </div>
            {errors?.orgName && (
              <p className="text-xs text-rose-500 font-medium">{errors.orgName}</p>
            )}
          </div>

          {/* Timezone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Clinic Timezone <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={timezone}
                onChange={(e) => onChange('timezone', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400">Controls AI appointment scheduling and automated patient SMS timing.</p>
          </div>

          {/* Default Currency */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Default Billing Currency <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={defaultCurrency}
                onChange={(e) => onChange('defaultCurrency', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400">Used for treatment quotes, financial invoices, and pipeline revenue calculations.</p>
          </div>

          {/* Clinic Phone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Primary Clinic Phone
            </label>
            <input
              type="text"
              value={clinicPhone}
              onChange={(e) => onChange('clinicPhone', e.target.value)}
              placeholder="+1 (555) 234-8900"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Support Email */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Billing & Inbound Support Email
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => onChange('supportEmail', e.target.value)}
              placeholder="contact@apexdental.com"
              className={`w-full px-3.5 py-2.5 bg-slate-50/50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                errors?.supportEmail ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-primary'
              }`}
            />
            {errors?.supportEmail && (
              <p className="text-xs text-rose-500 font-medium">{errors.supportEmail}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Branding & Visual Identity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Color Picker */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Brand Color Accent</h3>
              <p className="text-xs text-slate-500">Custom theme color applied to UI highlights, buttons, and booking badges.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              {/* Color swatch input */}
              <div className="relative shrink-0">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => onChange('brandColor', e.target.value)}
                  className="w-12 h-12 rounded-xl border border-slate-300 cursor-pointer overflow-hidden p-0.5"
                  title="Choose brand color"
                />
              </div>

              {/* Hex Text input */}
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Color Hex Code</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-xs font-mono text-slate-400">#</span>
                  <input
                    type="text"
                    value={brandColor.replace('#', '')}
                    onChange={(e) => onChange('brandColor', `#${e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6)}`)}
                    maxLength={6}
                    placeholder="1F8A70"
                    className="w-full pl-7 pr-3.5 py-2 font-mono uppercase bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-500">Preset Dental Palettes</span>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((preset) => {
                  const isSelected = brandColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => handleColorPreset(preset.hex)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'border-slate-800 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span>{preset.name.split(' ')[0]}</span>
                      {isSelected && <Check className="w-3 h-3 ml-0.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Visual Preview */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Interactive Live Preview</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  style={{ backgroundColor: brandColor }}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs transition-transform active:scale-95"
                >
                  Confirm Booking
                </button>
                <span
                  style={{ backgroundColor: `${brandColor}15`, color: brandColor, borderColor: `${brandColor}40` }}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold border"
                >
                  AI Copilot Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clinic Logo Upload Zone (Supabase Storage mock) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Clinic Brand Logo</h3>
                <p className="text-xs text-slate-500">Supabase Storage bucket: <code className="text-[11px] font-mono bg-slate-100 px-1 py-0.5 rounded">clinic-assets/logos</code></p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {logoUrl ? (
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center overflow-hidden shadow-2xs">
                    <img
                      src={logoUrl}
                      alt="Clinic Logo Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/100x100?text=Clinic+Logo';
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Active Logo</h4>
                    <p className="text-xs text-slate-500 mt-0.5">High-resolution brand asset ready.</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-1">
                      <Check className="w-3 h-3" /> Synced to CDN
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    title="Replace Logo"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer"
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
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-primary bg-primary/5 scale-[1.01]'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-900">
                  Click to upload or drag and drop logo here
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  PNG, JPG, SVG, or WebP (max. 5MB)
                </p>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    Uploading to Supabase bucket...
                  </span>
                  <span className="font-mono">{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-200 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
