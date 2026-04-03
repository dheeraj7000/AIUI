import { z } from 'zod';

/**
 * Component type enum values matching the Drizzle schema.
 */
const componentTypeValues = [
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
] as const;

/**
 * JSON schema validation — must have at minimum a `type` and `properties` key.
 */
const jsonSchemaObject = z
  .object({
    type: z.string(),
    properties: z.record(z.string(), z.unknown()),
  })
  .passthrough();

/**
 * Schema for creating a component recipe via the API.
 */
export const createRecipeSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  type: z.enum(componentTypeValues, {
    message: `type must be one of: ${componentTypeValues.join(', ')}`,
  }),
  stylePackId: z.string().uuid('stylePackId must be a valid UUID').optional(),
  codeTemplate: z
    .string()
    .min(1, 'codeTemplate must not be empty')
    .max(50000, 'codeTemplate must be at most 50000 characters'),
  jsonSchema: jsonSchemaObject,
  aiUsageRules: z.string().max(5000, 'aiUsageRules must be at most 5000 characters').optional(),
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;

/**
 * Schema for updating a component recipe — all fields optional.
 */
export const updateRecipeSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .optional(),
  type: z
    .enum(componentTypeValues, {
      message: `type must be one of: ${componentTypeValues.join(', ')}`,
    })
    .optional(),
  stylePackId: z.string().uuid('stylePackId must be a valid UUID').nullable().optional(),
  codeTemplate: z
    .string()
    .min(1, 'codeTemplate must not be empty')
    .max(50000, 'codeTemplate must be at most 50000 characters')
    .optional(),
  jsonSchema: jsonSchemaObject.optional(),
  aiUsageRules: z
    .string()
    .max(5000, 'aiUsageRules must be at most 5000 characters')
    .nullable()
    .optional(),
  previewUrl: z.string().url().nullable().optional(),
});

export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;

/**
 * Schema for listing component recipes with filtering and pagination.
 */
export const listRecipesSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  type: z
    .enum(componentTypeValues, {
      message: `type must be one of: ${componentTypeValues.join(', ')}`,
    })
    .optional(),
  stylePackId: z.string().uuid('stylePackId must be a valid UUID').optional(),
  search: z.string().optional(),
});

export type ListRecipesInput = z.infer<typeof listRecipesSchema>;
