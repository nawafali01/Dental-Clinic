import { Building2, MapPin, Users, Settings } from 'lucide-react';

/**
 * CONSTANTS FOR ORGANIZATION DETAIL VIEW & SUPER ADMIN ORGANIZATIONS
 */

export const TIMEZONE_OPTIONS = [
  'Asia/Riyadh',
  'Asia/Dubai',
  'Asia/Karachi',
  'Europe/London',
  'America/New_York',
];

export const CURRENCY_OPTIONS = ['USD', 'SAR', 'AED', 'PKR', 'GBP'];

export const ORG_STATUS_OPTIONS = [
  { value: 'active', label: 'Active (Operational)' },
  { value: 'inactive', label: 'Inactive (Suspended)' },
];

export const DEFAULT_ORG_SETTINGS_FORM = {
  name: '',
  timezone: 'Asia/Riyadh',
  currency: 'USD',
  brandingColor: '#0F766E',
  status: 'active',
};

export const ORG_DEFAULTS = {
  timezone: 'Asia/Riyadh',
  currency: 'USD',
  brandingColor: '#0F766E',
  status: 'active',
  initials: 'OG',
  fallbackLeadsCount: 34,
  fallbackRevenue: 18400,
  fallbackDate: 'Jan 12, 2026',
  fallbackCity: 'Riyadh',
  fallbackAddress: 'Medical District',
  fallbackPhone: '+1 (555) 020-0000',
  fallbackOperatingHours: '08:00 AM - 08:00 PM',
};

export const ORG_DETAIL_TAB_KEYS = {
  OVERVIEW: 'overview',
  CLINICS: 'clinics',
  USERS: 'users',
  SETTINGS: 'settings',
};

export const getOrgDetailTabs = (clinicsCount = 0, usersCount = 0) => [
  { id: ORG_DETAIL_TAB_KEYS.OVERVIEW, label: 'Overview', icon: Building2 },
  { id: ORG_DETAIL_TAB_KEYS.CLINICS, label: `Clinics (${clinicsCount})`, icon: MapPin },
  { id: ORG_DETAIL_TAB_KEYS.USERS, label: `Users (${usersCount})`, icon: Users },
  { id: ORG_DETAIL_TAB_KEYS.SETTINGS, label: 'Settings', icon: Settings },
];

export const formatOrgCurrency = (val, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export const BRAND_PRESETS = [
  { name: 'Teal', hex: '#0F766E' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Purple', hex: '#7C3AED' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Amber', hex: '#D97706' },
  { name: 'Rose', hex: '#E11D48' },
];

export const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const VALID_LOGO_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
  'image/webp',
];

export const DEFAULT_ORG_MODAL_FORM = {
  name: '',
  logoUrl: null,
  timezone: 'Asia/Karachi',
  currency: 'USD',
  brandColor: '#0F766E',
  status: 'active',
};
