import { storageService } from './storage.service';

const SETTINGS_KEY = storageService.KEYS.SETTINGS || 'dental_crm_settings';
const CATALOGS_KEY = storageService.KEYS.CATALOGS || 'dental_crm_catalogs';

export const DEFAULT_SETTINGS = {
  branding: {
    orgName: 'Apex Dental Group',
    timezone: 'America/New_York',
    defaultCurrency: 'USD ($)',
    brandColor: '#1F8A70',
    logoUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=150&auto=format&fit=crop&q=80',
    supportEmail: 'contact@apexdental.com',
    clinicPhone: '+1 (555) 234-8900',
  },
  notifications: {
    inApp: {
      newLead: true,
      appointmentBooked: true,
      emergencyCancelled: true,
      aiCopilotAlert: true,
      patientCheckIn: true,
    },
    email: {
      dailyBriefing: true,
      highValueInquiry: true,
      weeklyKpiDigest: false,
      systemAlerts: true,
    },
    quietHours: {
      enabled: true,
      startTime: '21:00',
      endTime: '07:30',
      timezone: 'America/New_York',
      emergencyBypass: true,
    },
  },
  security: {
    sessionTimeoutMinutes: '30',
    mfaPolicy: 'enforce_admin', // 'enforce_all' | 'enforce_admin' | 'optional'
    passwordExpirationDays: '90',
    ipWhitelistEnabled: false,
    ipAddresses: '',
  },
};

export const DEFAULT_CATALOGS = {
  leadStatuses: [
    { id: 'st-1', name: 'New Inquiry', color: 'blue', order: 1, leads: '18' },
    { id: 'st-2', name: 'Contacted', color: 'amber', order: 2, leads: '24' },
    { id: 'st-3', name: 'Qualified', color: 'purple', order: 3, leads: '12' },
    { id: 'st-4', name: 'Consultation Booked', color: 'green', order: 4, leads: '31' },
    { id: 'st-5', name: 'Treatment In-Progress', color: 'cyan', order: 5, leads: '15' },
    { id: 'st-6', name: 'Lost / Disqualified', color: 'slate', order: 6, leads: '8' },
  ],
  leadSources: [
    { id: 'src-1', name: 'Website Booking Form', type: 'Organic', active: true, leads: '42', rate: '32%' },
    { id: 'src-2', name: 'Inbound Phone Call', type: 'Direct', active: true, leads: '35', rate: '45%' },
    { id: 'src-3', name: 'Meta Ads (FB/IG)', type: 'Paid', active: true, leads: '28', rate: '22%' },
    { id: 'src-4', name: 'Doctor Referral', type: 'Referral', active: true, leads: '19', rate: '58%' },
    { id: 'src-5', name: 'CSV / Campaign Import', type: 'Import', active: true, leads: '12', rate: '18%' },
    { id: 'src-6', name: 'Google Local Search', type: 'Organic', active: true, leads: '26', rate: '39%' },
  ],
  callOutcomes: [
    { id: 'co-1', name: 'Connected / Booked', type: 'positive', description: 'Patient scheduled appointment' },
    { id: 'co-2', name: 'Connected / Follow-up', type: 'neutral', description: 'Patient requested pricing or time to think' },
    { id: 'co-3', name: 'Voicemail Left', type: 'neutral', description: 'Left voicemail with direct callback link' },
    { id: 'co-4', name: 'Callback Requested', type: 'positive', description: 'Patient asked to be called at specific time' },
    { id: 'co-5', name: 'Busy / No Answer', type: 'negative', description: 'No answer after multiple rings' },
    { id: 'co-6', name: 'Wrong Number / Not Interested', type: 'negative', description: 'Opted out or wrong contact' },
  ],
  appointmentStatuses: [
    { id: 'as-1', name: 'Scheduled', color: 'blue' },
    { id: 'as-2', name: 'Confirmed', color: 'green' },
    { id: 'as-3', name: 'Arrived / Checked In', color: 'purple' },
    { id: 'as-4', name: 'In Chair', color: 'amber' },
    { id: 'as-5', name: 'Completed', color: 'emerald' },
    { id: 'as-6', name: 'Cancelled', color: 'red' },
    { id: 'as-7', name: 'No Show', color: 'slate' },
  ],
  lostReasons: [
    { id: 'lr-1', reason: 'Treatment Cost / Price Too High', active: true },
    { id: 'lr-2', reason: 'Location Too Far / Distance', active: true },
    { id: 'lr-3', reason: 'Selected Another Dental Clinic', active: true },
    { id: 'lr-4', reason: 'Dental Insurance Not Accepted', active: true },
    { id: 'lr-5', reason: 'Medical / Clinical Contraindication', active: true },
    { id: 'lr-6', reason: 'Unresponsive After 3+ Follow-ups', active: true },
  ],
};

export const settingsService = {
  getSettings() {
    const saved = storageService.get(SETTINGS_KEY);
    if (!saved) {
      storageService.set(SETTINGS_KEY, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return {
      branding: { ...DEFAULT_SETTINGS.branding, ...(saved.branding || {}) },
      notifications: {
        inApp: { ...DEFAULT_SETTINGS.notifications.inApp, ...(saved.notifications?.inApp || {}) },
        email: { ...DEFAULT_SETTINGS.notifications.email, ...(saved.notifications?.email || {}) },
        quietHours: { ...DEFAULT_SETTINGS.notifications.quietHours, ...(saved.notifications?.quietHours || {}) },
      },
      security: { ...DEFAULT_SETTINGS.security, ...(saved.security || {}) },
    };
  },

  updateSettings(partialSettings) {
    const current = this.getSettings();
    const updated = {
      branding: { ...current.branding, ...(partialSettings.branding || {}) },
      notifications: {
        inApp: { ...current.notifications.inApp, ...(partialSettings.notifications?.inApp || {}) },
        email: { ...current.notifications.email, ...(partialSettings.notifications?.email || {}) },
        quietHours: { ...current.notifications.quietHours, ...(partialSettings.notifications?.quietHours || {}) },
      },
      security: { ...current.security, ...(partialSettings.security || {}) },
    };
    storageService.set(SETTINGS_KEY, updated);
    return updated;
  },

  resetSettings() {
    storageService.set(SETTINGS_KEY, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  },

  getCatalogs() {
    const saved = storageService.get(CATALOGS_KEY);
    if (!saved) {
      storageService.set(CATALOGS_KEY, DEFAULT_CATALOGS);
      return DEFAULT_CATALOGS;
    }
    return {
      leadStatuses: saved.leadStatuses?.length ? saved.leadStatuses : DEFAULT_CATALOGS.leadStatuses,
      leadSources: saved.leadSources?.length ? saved.leadSources : DEFAULT_CATALOGS.leadSources,
      callOutcomes: saved.callOutcomes?.length ? saved.callOutcomes : DEFAULT_CATALOGS.callOutcomes,
      appointmentStatuses: saved.appointmentStatuses?.length ? saved.appointmentStatuses : DEFAULT_CATALOGS.appointmentStatuses,
      lostReasons: saved.lostReasons?.length ? saved.lostReasons : DEFAULT_CATALOGS.lostReasons,
    };
  },

  updateCatalogs(partialCatalogs) {
    const current = this.getCatalogs();
    const updated = {
      ...current,
      ...partialCatalogs,
    };
    storageService.set(CATALOGS_KEY, updated);
    return updated;
  },

  resetCatalogs() {
    storageService.set(CATALOGS_KEY, DEFAULT_CATALOGS);
    return DEFAULT_CATALOGS;
  },
};
