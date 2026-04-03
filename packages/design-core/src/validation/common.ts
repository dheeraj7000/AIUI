import { z } from 'zod';

/**
 * Common validation primitives shared across all validation schemas.
 */

export const uuidSchema = z.string().uuid('Must be a valid UUID');

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export function sortSchema<T extends readonly [string, ...string[]]>(allowedFields: T) {
  return z.object({
    sortBy: z.enum(allowedFields).default(allowedFields[0]),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  });
}

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be a lowercase slug (e.g., "my-item")');

/**
 * Strip HTML tags, trim whitespace, collapse multiple spaces.
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/<[^>]*>/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * A Zod string transform that sanitizes input.
 */
export const sanitizedString = z.string().transform(sanitizeString);
