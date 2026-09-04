import { z } from 'zod';

export const brandingSchema = z.object({
  orgName: z.string().min(2, 'Organization name must be at least 2 characters'),
  timezone: z.string().min(1, 'Please select a timezone'),
  defaultCurrency: z.string().min(1, 'Please select a default currency'),
  brandColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color (e.g. #1F8A70)'),
  supportEmail: z.string().email('Invalid support email address').optional().or(z.literal('')),
  clinicPhone: z.string().min(6, 'Valid phone number required').optional().or(z.literal('')),
  logoUrl: z.string().optional(),
});

export const notificationsSchema = z.object({
  inApp: z.object({
    newLead: z.boolean(),
    appointmentBooked: z.boolean(),
    emergencyCancelled: z.boolean(),
    aiCopilotAlert: z.boolean(),
    patientCheckIn: z.boolean(),
  }),
  email: z.object({
    dailyBriefing: z.boolean(),
    highValueInquiry: z.boolean(),
    weeklyKpiDigest: z.boolean(),
    systemAlerts: z.boolean(),
  }),
  quietHours: z.object({
    enabled: z.boolean(),
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    timezone: z.string().min(1, 'Timezone required'),
    emergencyBypass: z.boolean(),
  }),
});

export const securitySchema = z.object({
  sessionTimeoutMinutes: z.string().min(1, 'Please select a timeout duration'),
  mfaPolicy: z.enum(['enforce_all', 'enforce_admin', 'optional']),
  passwordExpirationDays: z.string().optional(),
  ipWhitelistEnabled: z.boolean().optional(),
  ipAddresses: z.string().optional(),
});
