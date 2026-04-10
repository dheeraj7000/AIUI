import { NextRequest, NextResponse } from 'next/server';
import {
  createDb,
  getToken,
  updateToken,
  deleteToken,
  updateTokenSchema,
  designProfiles,
  projects,
} from '@aiui/design-core';
import { eq, inArray } from 'drizzle-orm';

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

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
