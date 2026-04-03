import { z } from 'zod';

export const promptBundleSchema = z.object({
  id: z.string().uuid(),
  designProfileId: z.string().uuid(),
  projectId: z.string().uuid(),
  bundleJson: z.record(z.string(), z.unknown()),
  version: z.string().min(1),
  checksum: z.string().optional(),
  createdAt: z.coerce.date(),
});

export const createPromptBundleSchema = promptBundleSchema.omit({
  id: true,
  createdAt: true,
});

export type PromptBundleSchema = z.infer<typeof promptBundleSchema>;
export type CreatePromptBundleSchema = z.infer<typeof createPromptBundleSchema>;
