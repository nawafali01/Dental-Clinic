import { z } from 'zod';

export const orgSchema = z.object({
  name: z.string().trim().min(2, 'Organization Name must be at least 2 characters'),
  timezone: z.string().min(1, 'Please select a timezone'),
  currency: z.string().min(1, 'Please select a currency'),
  brandingColor: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});
