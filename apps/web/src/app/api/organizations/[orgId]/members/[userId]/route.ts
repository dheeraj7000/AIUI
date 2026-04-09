import { NextRequest, NextResponse } from 'next/server';
import {
  createDb,
  updateMemberRole,
  removeMember,
  updateRoleSchema,
  organizationMembers,
  type OrgRole,
} from '@aiui/design-core';
import { eq, and } from 'drizzle-orm';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

type RouteContext = { params: Promise<{ orgId: string; userId: string }> };

/**
 * Resolve the acting user's role in the organization from the database.
 */
async function getActorRole(
  db: ReturnType<typeof createDb>,
  orgId: string,
  userId: string
): Promise<OrgRole | null> {
  const [membership] = await db
    .select({ role: organizationMembers.role })
    .from(organizationMembers)
    .where(
      and(eq(organizationMembers.organizationId, orgId), eq(organizationMembers.userId, userId))
    )
    .limit(1);
  return (membership?.role as OrgRole) ?? null;
}

/**
 * PATCH /api/organizations/[orgId]/members/[userId] — Update a member's role.
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  const actorId = req.headers.get('x-user-id');
  if (!actorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimited = checkRateLimit(`members:${actorId}`, RATE_LIMITS.members);
  if (rateLimited) {
    return NextResponse.json(
      { error: rateLimited.error },
      { status: 429, headers: { 'Retry-After': String(rateLimited.retryAfter) } }
    );
  }

  try {
    const { orgId, userId: targetUserId } = await context.params;
    const db = getDb();

    const actorRole = await getActorRole(db, orgId, actorId);
    if (!actorRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await updateMemberRole(
      db,
      orgId,
      targetUserId,
      parsed.data.role as OrgRole,
      actorRole
    );

    if ('error' in result) {
      switch (result.error) {
        case 'insufficient_permissions':
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        case 'member_not_found':
          return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        case 'cannot_modify_owner':
          return NextResponse.json({ error: "Cannot modify the owner's role" }, { status: 403 });
      }
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Failed to update member role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/organizations/[orgId]/members/[userId] — Remove a member.
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const actorId = req.headers.get('x-user-id');
  if (!actorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimited = checkRateLimit(`members:${actorId}`, RATE_LIMITS.members);
  if (rateLimited) {
    return NextResponse.json(
      { error: rateLimited.error },
      { status: 429, headers: { 'Retry-After': String(rateLimited.retryAfter) } }
    );
  }

  try {
    const { orgId, userId: targetUserId } = await context.params;
    const db = getDb();

    const actorRole = await getActorRole(db, orgId, actorId);
    if (!actorRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await removeMember(db, orgId, targetUserId, actorRole);

    if ('error' in result) {
      switch (result.error) {
        case 'insufficient_permissions':
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        case 'member_not_found':
          return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        case 'cannot_remove_owner':
          return NextResponse.json(
            { error: 'Cannot remove the organization owner' },
            { status: 403 }
          );
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to remove member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
