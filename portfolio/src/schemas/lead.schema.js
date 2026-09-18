import { z } from 'zod';

export const LEAD_SOURCES = [
  'website',
  'google_ads',
  'instagram',
  'whatsapp',
  'referral',
  'walk-in',
  'phone',
  'facebook',
  'other',
];

export const LEAD_STATUSES = [
  'new',
  'contacted',
  'qualified',
  'proposal',
  'converted',
  'lost',
];

export const LEAD_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

/**
 * Payload Schema for POST /api/v1/leads/
 */
export const leadSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required'),
  last_name: z.string().trim().optional().default(''),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().trim().optional().default(''),
  source: z.string().default('other'),
  status: z.string().default('new'),
  notes: z.string().optional().default(''),
  treatment_interest: z.string().optional().default(''),
  expected_revenue: z.coerce.number().min(0, 'Revenue cannot be negative').default(1),
  assigned_to: z.string().optional().default(''),
  priority: z.string().default('medium'),
  clinic_id: z.string().optional().default(''),
  organization_id: z.string().optional().default(''),
});

/**
 * Payload Schema for PUT /api/v1/leads/{lead_id}
 */
export const updateLeadSchema = z.object({
  first_name: z.string().trim().optional().default(''),
  last_name: z.string().trim().optional().default(''),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().trim().optional().default(''),
  source: z.string().default('website'),
  status: z.string().default('new'),
  notes: z.string().optional().default(''),
  treatment_interest: z.string().optional().default(''),
  expected_revenue: z.coerce.number().min(0, 'Revenue cannot be negative').default(1),
  assigned_to: z.string().optional().default(''),
  priority: z.string().optional().default(''),
  clinic_id: z.string().optional().default(''),
});
