import { z } from 'zod';

export const stylePackSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  version: z.string().min(1),
  previewUrl: z.string().url().optional(),
  isPublic: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createStylePackSchema = stylePackSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type StylePackSchema = z.infer<typeof stylePackSchema>;
export type CreateStylePackSchema = z.infer<typeof createStylePackSchema>;
