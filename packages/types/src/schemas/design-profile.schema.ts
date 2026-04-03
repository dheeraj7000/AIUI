import { z } from 'zod';

export const designProfileSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1),
  version: z.string().min(1),
  stylePackId: z.string().uuid().optional(),
  overridesJson: z.record(z.string(), z.unknown()).optional(),
  selectedComponents: z.array(z.string()),
  compiledJson: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createDesignProfileSchema = designProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DesignProfileSchema = z.infer<typeof designProfileSchema>;
export type CreateDesignProfileSchema = z.infer<typeof createDesignProfileSchema>;
