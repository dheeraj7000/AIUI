import { z } from 'zod';
import { createDesignProfileSchema } from '@aiui/types';

/**
 * Schema for design profile composition input.
 *
 * Extends the base createDesignProfileSchema from @aiui/types
 * with additional fields used during profile composition:
 * - baseStylePackId: the primary style pack to start from
 * - layerStylePackIds: additional packs layered on top (ordered, later wins)
 * - tokenOverrides: ad-hoc token overrides applied last
 */
export const designProfileCompositionSchema = createDesignProfileSchema.extend({
  baseStylePackId: z.string().uuid().optional(),
  layerStylePackIds: z.array(z.string().uuid()).optional(),
  tokenOverrides: z.record(z.string(), z.string()).optional(),
});

export type DesignProfileComposition = z.infer<typeof designProfileCompositionSchema>;
