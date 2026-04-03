import { z } from 'zod';

const INVITE_ROLES = ['admin', 'member'] as const;
const ALL_ROLES = ['owner', 'admin', 'member'] as const;

export const createInvitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(INVITE_ROLES),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

export const updateRoleSchema = z.object({
  role: z.enum(ALL_ROLES),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
