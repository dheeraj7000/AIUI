import { z } from 'zod';

export const createProfileSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(2).max(100),
  overridesJson: z.record(z.string(), z.string()).optional(),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  overridesJson: z.record(z.string(), z.string()).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const listProfilesSchema = z.object({
  projectId: z.string().uuid(),
});

export type ListProfilesInput = z.infer<typeof listProfilesSchema>;
