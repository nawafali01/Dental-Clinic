import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Layers, Bell, ShieldCheck, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';

import { settingsService, DEFAULT_SETTINGS, DEFAULT_CATALOGS } from '@/services/settingsService';
import { brandingSchema } from './schemas/settingsSchema';

import { SettingsHeader } from './components/SettingsHeader';
import { SettingsSkeleton } from './components/SettingsSkeleton';
import { TabOrganizationBranding } from './components/TabOrganizationBranding';
import { TabOperationalCatalogs } from './components/TabOperationalCatalogs';
import { TabNotificationsPreferences } from './components/TabNotificationsPreferences';
import { TabSecurityAccess } from './components/TabSecurityAccess';

const TABS = [
  { id: 'branding', label: 'Organization & Branding', icon: Building2 },
  { id: 'catalogs', label: 'Operational Catalogs', icon: Layers },
  { id: 'notifications', label: 'Notifications & Preferences', icon: Bell },
  { id: 'security', label: 'Security & Access', icon: ShieldCheck },
];

export default function SettingsWorkspace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'branding';

  const [activeTab, setActiveTab] = useState(
    TABS.some((t) => t.id === initialTab) ? initialTab : 'branding'
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Settings & Catalogs state
  const [savedSettings, setSavedSettings] = useState(null);
  const [formData, setFormData] = useState(null);
  const [catalogsData, setCatalogsData] = useState(null);
  const [savedCatalogs, setSavedCatalogs] = useState(null);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Sync tab with URL query parameter
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tabId);
      return next;
    });
  };

  // Load settings on mount
  useEffect(() => {
    try {
      const loadedSettings = settingsService.getSettings();
      const loadedCatalogs = settingsService.getCatalogs();

      setSavedSettings(loadedSettings);
      setFormData(JSON.parse(JSON.stringify(loadedSettings)));

      setSavedCatalogs(loadedCatalogs);
      setCatalogsData(JSON.parse(JSON.stringify(loadedCatalogs)));
    } catch (err) {
      console.error('Failed to load settings:', err);
      toast.error('Failed to load settings. Reverting to factory defaults.');
      setSavedSettings(DEFAULT_SETTINGS);
      setFormData(DEFAULT_SETTINGS);
      setSavedCatalogs(DEFAULT_CATALOGS);
      setCatalogsData(DEFAULT_CATALOGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Dirty state detection
  const isDirty = useMemo(() => {
    if (!formData || !savedSettings || !catalogsData || !savedCatalogs) return false;
    const settingsChanged = JSON.stringify(formData) !== JSON.stringify(savedSettings);
    const catalogsChanged = JSON.stringify(catalogsData) !== JSON.stringify(savedCatalogs);
    return settingsChanged || catalogsChanged;
  }, [formData, savedSettings, catalogsData, savedCatalogs]);

  // Form field updater for Branding
  const handleBrandingChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      branding: {
        ...(prev?.branding || {}),
        [field]: value,
      },
    }));

    // Clear field-specific error if present
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // Form field updater for Notifications
  const handleNotificationChange = useCallback((section, val) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...(prev?.notifications || {}),
        [section]: val,
      },
    }));
  }, []);

  // Form field updater for Security
  const handleSecurityChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      security: {
        ...(prev?.security || {}),
        [field]: value,
      },
    }));
  }, []);

  // Form field updater for Catalogs
  const handleCatalogsChange = useCallback((partialUpdate) => {
    setCatalogsData((prev) => ({
      ...prev,
      ...partialUpdate,
    }));
  }, []);

  // Save changes handler with Zod validation
  const handleSave = () => {
    if (!formData) return;

    // Validate branding with Zod
    const validationResult = brandingSchema.safeParse(formData.branding);
    if (!validationResult.success) {
      const fieldErrors = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      setErrors(fieldErrors);
      setActiveTab('branding');
      toast.error('Please fix validation errors before saving.');
      return;
    }

    setErrors({});
    setIsSaving(true);

    setTimeout(() => {
      try {
        const updatedSettings = settingsService.updateSettings(formData);
        const updatedCatalogs = settingsService.updateCatalogs(catalogsData);

        setSavedSettings(JSON.parse(JSON.stringify(updatedSettings)));
        setSavedCatalogs(JSON.parse(JSON.stringify(updatedCatalogs)));

        toast.success('Settings and catalogs saved successfully!');
      } catch (err) {
        console.error('Error saving settings:', err);
        toast.error('Failed to save settings changes.');
      } finally {
        setIsSaving(false);
      }
    }, 400);
  };

  // Reset to defaults
  const handleReset = () => {
    try {
      const resetSet = settingsService.resetSettings();
      const resetCat = settingsService.resetCatalogs();

      setSavedSettings(resetSet);
      setFormData(JSON.parse(JSON.stringify(resetSet)));

      setSavedCatalogs(resetCat);
      setCatalogsData(JSON.parse(JSON.stringify(resetCat)));

      setErrors({});
      toast.info('Settings and catalogs reverted to default values.');
    } catch (err) {
      console.error('Reset error:', err);
      toast.error('Could not reset settings.');
    }
  };

  // Loading skeleton fallback
  if (isLoading || !formData) {
    return <SettingsSkeleton />;
  }

  const activeTabMeta = TABS.find((t) => t.id === activeTab);

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Breadcrumb, Actions, and Dirty Indicator */}
      <SettingsHeader
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={handleSave}
        onReset={handleReset}
        activeTabTitle={activeTabMeta?.label}
      />

      {/* Main Tab Navigation Bar */}
      <div className="flex overflow-x-auto p-1.5 bg-slate-100/80 border border-slate-200 rounded-2xl gap-1.5 scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content Panels */}
      <div className="transition-all duration-150">
        {activeTab === 'branding' && (
          <TabOrganizationBranding
            formData={formData?.branding}
            errors={errors}
            onChange={handleBrandingChange}
          />
        )}

        {activeTab === 'catalogs' && (
          <TabOperationalCatalogs
            catalogs={catalogsData}
            onCatalogsChange={handleCatalogsChange}
          />
        )}

        {activeTab === 'notifications' && (
          <TabNotificationsPreferences
            formData={formData?.notifications}
            onChange={handleNotificationChange}
          />
        )}

        {activeTab === 'security' && (
          <TabSecurityAccess
            formData={formData?.security}
            onChange={handleSecurityChange}
          />
        )}
      </div>

      {/* Sticky Bottom Save Bar when Dirty */}
      {isDirty && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[90%] bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-medium text-slate-200">You have unsaved changes in settings</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
