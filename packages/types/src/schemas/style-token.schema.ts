import { z } from 'zod';

export const styleTokenSchema = z.object({
  id: z.string().uuid(),
  stylePackId: z.string().uuid(),
  tokenKey: z.string().min(1),
  tokenType: z.enum(['color', 'radius', 'font', 'spacing', 'shadow', 'elevation']),
  tokenValue: z.string().min(1),
  description: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createStyleTokenSchema = styleTokenSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type StyleTokenSchema = z.infer<typeof styleTokenSchema>;
export type CreateStyleTokenSchema = z.infer<typeof createStyleTokenSchema>;
