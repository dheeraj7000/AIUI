import { z } from 'zod';

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

export const designProfileSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1),
  version: z.string().min(1),
  stylePackId: z.string().uuid().optional(),
  overridesJson: z.record(z.string(), z.unknown()).optional(),
  selectedComponents: z.array(z.string()),
  compiledJson: z.record(z.string(), z.unknown()).optional(),
  voiceToneJson: voiceToneSchema.nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createDesignProfileSchema = designProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DesignProfileSchema = z.infer<typeof designProfileSchema>;
export type CreateDesignProfileSchema = z.infer<typeof createDesignProfileSchema>;
export type VoiceToneSchema = z.infer<typeof voiceToneSchema>;
