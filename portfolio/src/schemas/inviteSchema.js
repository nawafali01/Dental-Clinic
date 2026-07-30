import { z } from "zod";

export const inviteSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  role: z.string().min(1, "Role is required"),
  clinic: z.string().optional(), // Depending on role, might be optional or required. We can refine later.
  organization: z.string().min(1, "Organization is required"),
});
