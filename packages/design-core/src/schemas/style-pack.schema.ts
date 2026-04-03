import { z } from 'zod';
import { createStylePackSchema, createStyleTokenSchema } from '@aiui/types';

/**
 * Schema for validating a style pack input from the API,
 * including its embedded tokens array.
 *
 * Extends the base createStylePackSchema from @aiui/types
 * with an inline tokens array.
 */
export const stylePackInputSchema = createStylePackSchema.extend({
  tokens: z.array(createStyleTokenSchema.omit({ stylePackId: true })).optional(),
});

export type StylePackInput = z.infer<typeof stylePackInputSchema>;
