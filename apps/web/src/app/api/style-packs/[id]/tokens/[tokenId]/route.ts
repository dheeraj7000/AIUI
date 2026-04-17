import { NextRequest, NextResponse } from 'next/server';
import {
  createDb,
  getToken,
  updateToken,
  deleteToken,
  updateTokenSchema,
  designProfiles,
  projects,
  stylePacks,
  verifyOrgMembership,
} from '@aiui/design-core';

/**
 * Authorize a token-scoped request: confirm the style pack exists and the
 * user belongs to its organization. Returns null on success, or a ready
 * NextResponse to return on failure.
 */
async function authorizeStylePackAccess(
  db: ReturnType<typeof createDb>,
  userId: string,
  stylePackId: string
): Promise<NextResponse | null> {
  const [ownerPack] = await db
    .select({ organizationId: stylePacks.organizationId })
    .from(stylePacks)
    .where(eq(stylePacks.id, stylePackId))
    .limit(1);
  if (!ownerPack) {
    return NextResponse.json({ error: 'Style pack not found' }, { status: 404 });
  }
  if (ownerPack.organizationId) {
    const isMember = await verifyOrgMembership(db, userId, ownerPack.organizationId);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }
  return null;
}
import { eq, inArray } from 'drizzle-orm';
import { logWebEvent } from '@/lib/audit';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

type RouteContext = { params: Promise<{ id: string; tokenId: string }> };

/**
 * GET /api/style-packs/[id]/tokens/[tokenId]
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: stylePackId, tokenId } = await context.params;
    const db = getDb();
    const denied = await authorizeStylePackAccess(db, userId, stylePackId);
    if (denied) return denied;
    const token = await getToken(db, tokenId, stylePackId);

    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    return NextResponse.json(token);
  } catch (error) {
    console.error('Failed to get token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/style-packs/[id]/tokens/[tokenId]
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: stylePackId, tokenId } = await context.params;
    const body = await req.json();

    const parsed = updateTokenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const denied = await authorizeStylePackAccess(db, userId, stylePackId);
    if (denied) return denied;
    const updated = await updateToken(db, tokenId, stylePackId, parsed.data);

    if (!updated) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    // Mark every project using this style pack as stale so MCP read tools
    // surface a warning until sync_design_memory is called. Soft signal —
    // log and continue on failure.
    try {
      const affectedProjects = await db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.activeStylePackId, stylePackId));
      if (affectedProjects.length > 0) {
        await db
          .update(designProfiles)
          .set({ compilationValid: false, updatedAt: new Date() })
          .where(
            inArray(
              designProfiles.projectId,
              affectedProjects.map((p) => p.id)
            )
          );
      }
    } catch (staleErr) {
      console.error('Failed to mark design profile stale:', staleErr);
    }

    try {
      const [pack] = await db
        .select({ organizationId: stylePacks.organizationId })
        .from(stylePacks)
        .where(eq(stylePacks.id, stylePackId))
        .limit(1);
      if (pack?.organizationId) {
        logWebEvent({ organizationId: pack.organizationId, action: 'web.update_token' });
      }
    } catch (auditErr) {
      console.error('Failed to log audit event:', auditErr);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/style-packs/[id]/tokens/[tokenId]
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: stylePackId, tokenId } = await context.params;
    const db = getDb();
    const denied = await authorizeStylePackAccess(db, userId, stylePackId);
    if (denied) return denied;
    const deleted = await deleteToken(db, tokenId, stylePackId);

    if (!deleted) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    // Mark every project using this style pack as stale so MCP read tools
    // surface a warning until sync_design_memory is called. Soft signal —
    // log and continue on failure.
    try {
      const affectedProjects = await db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.activeStylePackId, stylePackId));
      if (affectedProjects.length > 0) {
        await db
          .update(designProfiles)
          .set({ compilationValid: false, updatedAt: new Date() })
          .where(
            inArray(
              designProfiles.projectId,
              affectedProjects.map((p) => p.id)
            )
          );
      }
    } catch (staleErr) {
      console.error('Failed to mark design profile stale:', staleErr);
    }

    try {
      const [pack] = await db
        .select({ organizationId: stylePacks.organizationId })
        .from(stylePacks)
        .where(eq(stylePacks.id, stylePackId))
        .limit(1);
      if (pack?.organizationId) {
        logWebEvent({ organizationId: pack.organizationId, action: 'web.delete_token' });
      }
    } catch (auditErr) {
      console.error('Failed to log audit event:', auditErr);
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
