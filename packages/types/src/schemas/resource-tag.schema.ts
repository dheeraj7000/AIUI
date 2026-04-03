import { z } from 'zod';

export const resourceTagSchema = z.object({
  id: z.string().uuid(),
  tagId: z.string().uuid(),
  resourceId: z.string().uuid(),
  resourceType: z.enum(['style_pack', 'component_recipe', 'asset']),
});

export const createResourceTagSchema = resourceTagSchema.omit({
  id: true,
});

export type ResourceTagSchema = z.infer<typeof resourceTagSchema>;
export type CreateResourceTagSchema = z.infer<typeof createResourceTagSchema>;
