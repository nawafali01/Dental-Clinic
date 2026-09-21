import { z } from 'zod';

export const APPOINTMENT_STATUSES = [
  'scheduled',
  'confirmed',
  'reminded',
  'checked_in',
  'in_progress',
  'completed',
  'no_show',
  'cancelled',
  'rescheduled',
];

export const APPOINTMENT_TYPES = [
  'consultation',
  'treatment',
  'follow_up',
  'cleaning',
  'emergency',
  'other',
];

export const PHONE_REGEX = /^\+?[0-9\-()\s]{7,20}$/;

/**
 * Normalizes legacy or UI status strings to valid backend AppointmentStatus
 */
export function normalizeAppointmentStatus(status = '') {
  if (!status) return 'scheduled';
  const s = status.toLowerCase().trim().replace(/-/g, '_');
  if (s === 'booked' || s === 'pending') return 'scheduled';
  if (s === 'attended') return 'completed';
  if (APPOINTMENT_STATUSES.includes(s)) return s;
  return 'scheduled';
}

/**
 * Maps backend AppointmentStatus to UI friendly status
 */
export function denormalizeAppointmentStatus(status = '') {
  if (!status) return 'scheduled';
  const s = status.toLowerCase().trim();
  if (s === 'checked_in') return 'checked-in';
  if (s === 'no_show') return 'no-show';
  return s;
}

/**
 * Payload Schema for POST /api/v1/appointments/
 */
export const appointmentCreateSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200),
  appointment_type: z.enum(APPOINTMENT_TYPES).default('consultation'),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be HH:MM or HH:MM:SS format'),
  duration_minutes: z.coerce.number().int().min(5).max(480).default(30),
  notes: z.string().optional().nullable().default(null),
  status: z.enum(APPOINTMENT_STATUSES).default('scheduled'),
  patient_name: z.string().trim().min(1, 'Patient name is required'),
  patient_email: z.string().trim().email('Invalid email format').optional().nullable().or(z.literal('')),
  patient_phone: z.string().trim().regex(PHONE_REGEX, 'Phone must be between 7 and 20 digits'),
  reminder_sent: z.boolean().default(false),
  clinic_id: z.string().min(1, 'Clinic ID is required'),
  lead_id: z.string().optional().nullable().default(null),
  assigned_to: z.string().optional().nullable().default(null),
});

/**
 * Payload Schema for PUT /api/v1/appointments/{appointment_id}
 */
export const appointmentUpdateSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  appointment_type: z.enum(APPOINTMENT_TYPES).optional(),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  duration_minutes: z.coerce.number().int().min(5).max(480).optional(),
  notes: z.string().optional().nullable(),
  status: z.enum(APPOINTMENT_STATUSES).optional(),
  patient_name: z.string().trim().min(1).optional(),
  patient_email: z.string().trim().email().optional().nullable().or(z.literal('')),
  patient_phone: z.string().trim().regex(PHONE_REGEX).optional(),
  reminder_sent: z.boolean().optional(),
  assigned_to: z.string().optional().nullable(),
});
