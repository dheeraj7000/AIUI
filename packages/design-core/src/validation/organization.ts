import { z } from 'zod';

/**
 * Schema for creating an organization.
 */
export const createOrgSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be at most 100 characters'),
});

export type CreateOrgInput = z.infer<typeof createOrgSchema>;

/**
 * Schema for updating an organization.
 */
export const updateOrgSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be at most 100 characters')
    .optional(),
  plan: z.enum(['free', 'pro', 'enterprise']).optional(),
});

export type UpdateOrgInput = z.infer<typeof updateOrgSchema>;
