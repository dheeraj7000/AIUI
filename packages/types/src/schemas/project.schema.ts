import { z } from 'zod';

export const projectSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  frameworkTarget: z.enum(['nextjs-tailwind', 'react-tailwind']),
  activeStylePackId: z.string().uuid().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createProjectSchema = projectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ProjectSchema = z.infer<typeof projectSchema>;
export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
