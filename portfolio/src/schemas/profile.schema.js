import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required"),
  password: z.string().optional().refine(val => !val || val.length >= 8, {
    message: "Password must be at least 8 characters if provided",
  }),
  avatar: z.any().optional()
});
