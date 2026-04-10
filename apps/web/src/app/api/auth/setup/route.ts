import { NextRequest, NextResponse } from 'next/server';
import { createDb, organizations, organizationMembers, projects } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

/**
 * POST /api/auth/setup — Ensure the user has a default org.
 * Returns the org and its projects.
 *
 * Authenticates via the HttpOnly access token cookie. The userId/email
 * fields in the request body are ignored — they were a leftover from the
 * pre-cookie design where the client passed user info explicitly.
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate from the HttpOnly cookie
    const token = req.cookies.get('aiui-access-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const claims = await verifyToken(token);
    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = claims.sub;
    const email = claims.email ?? '';

    const db = getDb();

    // Check if user already has an org membership
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, userId))
      .limit(1);

    let orgId: string;

    if (membership) {
      orgId = membership.organizationId;
    } else {
      // Create a personal org
      const name = email ? `${email.split('@')[0]}'s Workspace` : 'My Workspace';
      const slug = `workspace-${userId.slice(0, 8)}`;

      const [org] = await db
        .insert(organizations)
        .values({ name, slug })
        .returning({ id: organizations.id });

      orgId = org.id;

      // Add user as owner
      await db.insert(organizationMembers).values({
        organizationId: orgId,
        userId,
        role: 'owner',
      });
    }

    // Get projects for this org
    const orgProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.organizationId, orgId))
      .orderBy(projects.createdAt);

    return NextResponse.json({ orgId, projects: orgProjects });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
