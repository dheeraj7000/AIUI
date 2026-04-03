import { z } from 'zod';

/**
 * Allowed resource types for polymorphic tagging.
 */
const resourceTypeValues = ['style_pack', 'component_recipe', 'asset'] as const;

/**
 * Schema for creating a new tag.
 * Name is normalized to lowercase and must contain only lowercase alphanumeric characters and hyphens.
 */
export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tag name must be at least 1 character')
    .max(50, 'Tag name must be at most 50 characters')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Tag name must be lowercase alphanumeric with hyphens (e.g. "my-tag")'
    ),
  category: z
    .string()
    .min(1, 'Category must be at least 1 character')
    .max(50, 'Category must be at most 50 characters'),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;

/**
 * Schema for assigning a tag to a resource.
 */
export const assignTagSchema = z.object({
  tagId: z.string().uuid('tagId must be a valid UUID'),
  resourceId: z.string().uuid('resourceId must be a valid UUID'),
  resourceType: z.enum(resourceTypeValues, {
    message: `resourceType must be one of: ${resourceTypeValues.join(', ')}`,
  }),
});

export type AssignTagInput = z.infer<typeof assignTagSchema>;

/**
 * Schema for listing/filtering tags.
 */
export const listTagsSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
});

export type ListTagsInput = z.infer<typeof listTagsSchema>;
