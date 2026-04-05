import { z } from 'zod';

/**
 * Registry item schema — defines the shape of a style pack served
 * from the registry API (following shadcn/ui's registry-as-JSON pattern).
 */
export const registryTokenSchema = z.object({
  key: z.string(),
  type: z.string(),
  value: z.string(),
  description: z.string().optional(),
});

export const registryItemSchema = z.object({
  name: z.string(),
  slug: z.string(),
  version: z.string(),
  category: z.string(),
  description: z.string(),
  tokenCount: z.number().int(),
  componentCount: z.number().int(),
  tokens: z.array(registryTokenSchema),
  componentSlugs: z.array(z.string()),
  author: z.string().optional(),
});

export type RegistryToken = z.infer<typeof registryTokenSchema>;
export type RegistryItem = z.infer<typeof registryItemSchema>;

/**
 * Registry index item — lightweight metadata for pack listing (no tokens).
 */
export const registryIndexItemSchema = z.object({
  name: z.string(),
  slug: z.string(),
  version: z.string(),
  category: z.string(),
  description: z.string(),
  tokenCount: z.number().int(),
  componentCount: z.number().int(),
});

export type RegistryIndexItem = z.infer<typeof registryIndexItemSchema>;
