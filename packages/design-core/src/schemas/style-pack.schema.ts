import { z } from 'zod';

/**
 * Schema for validating a style pack input from the API, including its
 * embedded tokens array. Previously imported the base shapes from
 * @aiui/types; after the monorepo collapse the schemas live inline here.
 */

const TOKEN_TYPE_VALUES = [
  'color',
  'radius',
  'font',
  'spacing',
  'shadow',
  'elevation',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'breakpoint',
  'z-index',
  'opacity',
  'border-width',
  'animation',
  'transition',
] as const;

const createStyleTokenInputSchema = z.object({
  tokenKey: z.string().min(1),
  tokenType: z.enum(TOKEN_TYPE_VALUES),
  tokenValue: z.string().min(1),
  description: z.string().optional(),
});

const createStylePackInputSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  version: z.string().min(1),
  previewUrl: z.string().url().optional(),
  isPublic: z.boolean(),
});

export const stylePackInputSchema = createStylePackInputSchema.extend({
  tokens: z.array(createStyleTokenInputSchema).optional(),
});

export type StylePackInput = z.infer<typeof stylePackInputSchema>;
