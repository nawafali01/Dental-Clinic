/**
 * CANONICAL ORGANIZATION CONSTANTS
 * Centralized constant definitions for Super Admin Organization modules.
 */

export const TIMEZONE_OPTIONS = [
  'Asia/Karachi',
  'Asia/Dubai',
  'Asia/Riyadh',
  'Europe/London',
  'America/New_York',
];

export const CURRENCY_OPTIONS = ['USD', 'PKR', 'AED', 'SAR', 'GBP'];

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
