import { z } from 'zod';

export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  plan: z.enum(['free', 'pro', 'enterprise']),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createOrganizationSchema = organizationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type OrganizationSchema = z.infer<typeof organizationSchema>;
export type CreateOrganizationSchema = z.infer<typeof createOrganizationSchema>;
