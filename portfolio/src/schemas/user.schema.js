import { z } from "zod";

/**
 * Schema for inviting a new user
 */
export const inviteSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  role: z.string().min(1, "Role is required"),
  organization: z.string().optional(),
  organizationId: z.string().optional(),
  clinic: z.string().optional(),
  clinicIds: z.array(z.string()).default([])
});

/**
 * Schema for filtering user list
 */
export const userFilterSchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  clinic: z.string().optional(),
});

/**
 * Schema for updating user data
 */
export const updateUserSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email format").optional(),
  role: z.string().optional(),
  status: z.enum(["active", "invited", "disabled"]).optional(),
});
