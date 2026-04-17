import { NextRequest, NextResponse } from 'next/server';
import {
  createDb,
  bulkImportTokens,
  bulkImportSchema,
  designProfiles,
  projects,
  stylePacks,
  verifyOrgMembership,
} from '@aiui/design-core';
import { eq, inArray } from 'drizzle-orm';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/style-packs/[id]/tokens/bulk — Bulk import tokens.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: stylePackId } = await context.params;
    const body = await req.json();

    const parsed = bulkImportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();

    // Authorize: confirm the user is a member of the style pack's org
    // before mutating tokens. Blocks cross-org bulk-import attacks.
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

    const result = await bulkImportTokens(db, stylePackId, parsed.data.tokens);

    if ('error' in result) {
      return NextResponse.json({ error: 'Style pack not found' }, { status: 404 });
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

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Failed to bulk import tokens:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
