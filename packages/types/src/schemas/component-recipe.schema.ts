import { z } from 'zod';

export const componentRecipeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  type: z.enum([
    'hero',
    'pricing',
    'faq',
    'footer',
    'header',
    'cta',
    'testimonial',
    'feature',
    'contact',
    'card',
    'navigation',
  ]),
  stylePackId: z.string().uuid().optional(),
  previewUrl: z.string().url().optional(),
  codeTemplate: z.string().min(1),
  jsonSchema: z.record(z.string(), z.unknown()),
  aiUsageRules: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createComponentRecipeSchema = componentRecipeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ComponentRecipeSchema = z.infer<typeof componentRecipeSchema>;
export type CreateComponentRecipeSchema = z.infer<typeof createComponentRecipeSchema>;
