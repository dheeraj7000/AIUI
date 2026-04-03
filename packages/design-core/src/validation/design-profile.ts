import { z } from 'zod';

export const createProfileSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(2).max(100),
  stylePackId: z.string().uuid(),
  overridesJson: z.record(z.string(), z.string()).optional(),
  selectedComponents: z.array(z.string().uuid()).default([]),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  stylePackId: z.string().uuid().optional(),
  overridesJson: z.record(z.string(), z.string()).optional(),
  selectedComponents: z.array(z.string().uuid()).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const listProfilesSchema = z.object({
  projectId: z.string().uuid(),
});

export type ListProfilesInput = z.infer<typeof listProfilesSchema>;
