import { z } from 'zod';

export const orgSchema = z.object({
  name: z.string().trim().min(2, 'Organization Name must be at least 2 characters'),
  description: z.string().optional().or(z.literal('')),
  contact_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  contact_phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  branding: z.record(z.any()).optional(),
  is_active: z.boolean().optional().default(true),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});
