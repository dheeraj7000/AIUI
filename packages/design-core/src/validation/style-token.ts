import { z } from 'zod';

const TOKEN_TYPES = ['color', 'radius', 'font', 'spacing', 'shadow', 'elevation'] as const;

export const createTokenSchema = z.object({
  tokenKey: z
    .string()
    .min(1)
    .regex(
      /^[a-z]+\.[a-z][a-zA-Z0-9.-]*$/,
      'Token key must match "type.name" pattern (e.g., color.primary)'
    ),
  tokenType: z.enum(TOKEN_TYPES),
  tokenValue: z.string().min(1, 'Token value is required'),
  description: z.string().max(500).optional(),
});

export type CreateTokenInput = z.infer<typeof createTokenSchema>;

export const updateTokenSchema = z.object({
  tokenValue: z.string().min(1).optional(),
  description: z.string().max(500).optional(),
});

export type UpdateTokenInput = z.infer<typeof updateTokenSchema>;

export const bulkImportSchema = z.object({
  tokens: z.array(createTokenSchema).min(1).max(500),
});

export type BulkImportInput = z.infer<typeof bulkImportSchema>;

export const listTokensSchema = z.object({
  tokenType: z.enum(TOKEN_TYPES).optional(),
  format: z.enum(['json']).optional(),
});

export type ListTokensInput = z.infer<typeof listTokensSchema>;
