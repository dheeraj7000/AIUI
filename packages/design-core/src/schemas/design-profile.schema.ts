import { z } from 'zod';

/**
 * Schema for design profile composition input.
 *
 * Previously imported createDesignProfileSchema from @aiui/types; after the
 * monorepo collapse the base shape is inlined here.
 *
 * Fields layered on top of the base:
 * - baseStylePackId: primary style pack to start from
 * - layerStylePackIds: additional packs stacked on top (ordered, later wins)
 * - tokenOverrides: ad-hoc token overrides applied last
 */

const toneGuidelinesSchema = z.record(z.string(), z.string());

const terminologySchema = z.object({
  preferred: z.record(z.string(), z.string()).optional(),
  avoided: z.array(z.string()).optional(),
});

const voiceToneSchema = z.object({
  voiceAttributes: z.array(z.string()).optional(),
  toneGuidelines: toneGuidelinesSchema.optional(),
  writingRules: z.array(z.string()).optional(),
  terminology: terminologySchema.optional(),
});

const createDesignProfileInputSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1),
  version: z.string().min(1),
  stylePackId: z.string().uuid().optional(),
  overridesJson: z.record(z.string(), z.unknown()).optional(),
  selectedComponents: z.array(z.string()),
  compiledJson: z.record(z.string(), z.unknown()).optional(),
  voiceToneJson: voiceToneSchema.nullable().optional(),
});

export const designProfileCompositionSchema = createDesignProfileInputSchema.extend({
  baseStylePackId: z.string().uuid().optional(),
  layerStylePackIds: z.array(z.string().uuid()).optional(),
  tokenOverrides: z.record(z.string(), z.string()).optional(),
});

export type DesignProfileComposition = z.infer<typeof designProfileCompositionSchema>;
