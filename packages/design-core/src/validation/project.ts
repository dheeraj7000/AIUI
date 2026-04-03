import { z } from 'zod';
import { uuidSchema } from './common';

export const createProjectSchema = z.object({
  orgId: uuidSchema,
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be at most 100 characters'),
  frameworkTarget: z.enum(['nextjs-tailwind', 'react-tailwind']).default('nextjs-tailwind'),
  description: z.string().max(1000).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be at most 100 characters')
    .optional(),
  frameworkTarget: z.enum(['nextjs-tailwind', 'react-tailwind']).optional(),
  description: z.string().max(1000).optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const listProjectsSchema = z.object({
  orgId: uuidSchema,
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListProjectsInput = z.infer<typeof listProjectsSchema>;
