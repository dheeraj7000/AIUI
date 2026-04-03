import { z } from 'zod';

export const organizationMemberSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(['owner', 'admin', 'member']),
  joinedAt: z.coerce.date(),
});

export const createOrganizationMemberSchema = organizationMemberSchema.omit({
  id: true,
  joinedAt: true,
});

export type OrganizationMemberSchema = z.infer<typeof organizationMemberSchema>;
export type CreateOrganizationMemberSchema = z.infer<typeof createOrganizationMemberSchema>;
