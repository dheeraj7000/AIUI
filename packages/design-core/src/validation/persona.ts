import { z } from 'zod';

export const createPersonaSchema = z.object({
  name: z.string().min(1).max(120),
  audience: z.string().max(500).optional(),
  jobToBeDone: z.string().max(500).optional(),
  emotionalState: z.string().max(200).optional(),
  emotionAfterUse: z.array(z.string().max(80)).max(10).optional(),
  brandPersonality: z.array(z.string().max(80)).max(10).optional(),
  antiReferences: z.array(z.string().max(120)).max(10).optional(),
  constraints: z.array(z.string().max(200)).max(10).optional(),
  isDefault: z.boolean().optional(),
});

export type CreatePersonaInput = z.infer<typeof createPersonaSchema>;

export const updatePersonaSchema = createPersonaSchema.partial();
export type UpdatePersonaInput = z.infer<typeof updatePersonaSchema>;
