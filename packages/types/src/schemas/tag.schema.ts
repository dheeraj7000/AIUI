import { z } from 'zod';

export const tagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  category: z.string().min(1),
});

export const createTagSchema = tagSchema.omit({
  id: true,
});

export type TagSchema = z.infer<typeof tagSchema>;
export type CreateTagSchema = z.infer<typeof createTagSchema>;
