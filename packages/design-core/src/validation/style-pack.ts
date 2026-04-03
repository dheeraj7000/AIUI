import { z } from 'zod';

/**
 * Schema for creating a style pack via the API.
 */
export const createStylePackSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  category: z.string().max(255).optional(),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  version: z.string().min(1).optional(),
  previewUrl: z.string().url().optional(),
  isPublic: z.boolean().optional(),
});

export type CreateStylePackInput = z.infer<typeof createStylePackSchema>;

/**
 * Schema for updating a style pack — all fields optional.
 */
export const updateStylePackSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .optional(),
  category: z.string().max(255).optional(),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  version: z.string().min(1).optional(),
  previewUrl: z.string().url().optional(),
  isPublic: z.boolean().optional(),
});

export type UpdateStylePackInput = z.infer<typeof updateStylePackSchema>;

/**
 * Schema for listing style packs with filtering and pagination.
 */
export const listStylePacksSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  category: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListStylePacksInput = z.infer<typeof listStylePacksSchema>;
