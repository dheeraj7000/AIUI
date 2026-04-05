import { z } from 'zod';

export const publishPackSchema = z.object({
  stylePackId: z.string().uuid(),
  namespace: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9][a-z0-9-]*$/, 'Lowercase alphanumeric and hyphens only'),
  description: z.string().max(500).optional(),
});

export type PublishPackInput = z.infer<typeof publishPackSchema>;

export const searchPacksSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(['downloads', 'rating', 'newest']).default('downloads'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type SearchPacksInput = z.infer<typeof searchPacksSchema>;

export const ratePackSchema = z.object({
  score: z.number().int().min(1).max(5),
});

export type RatePackInput = z.infer<typeof ratePackSchema>;
