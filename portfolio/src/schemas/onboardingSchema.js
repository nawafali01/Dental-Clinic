import { z } from "zod";

export const onboardingSchema = z.object({
  phone: z.string().optional(),
  avatar: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  timezone: z.string().min(1, "Timezone is required"),
});
