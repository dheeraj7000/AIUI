import { headers } from 'next/headers';
import { createDb, organizationMembers } from '@aiui/design-core';
import { eq } from 'drizzle-orm';

export async function getUserOrg(): Promise<{
  userId: string;
  organizationId: string;
} | null> {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  if (!userId) return null;

  const url = process.env.DATABASE_URL;
  if (!url) return null;

  const db = createDb(url);
  const [membership] = await db
    .select({ organizationId: organizationMembers.organizationId })
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, userId))
    .limit(1);

  return membership ? { userId, organizationId: membership.organizationId } : null;
}
