import { NextRequest, NextResponse } from 'next/server';
import {
  createDb,
  createToken,
  listTokens,
  exportTokens,
  createTokenSchema,
  listTokensSchema,
  designProfiles,
  projects,
  stylePacks,
} from '@aiui/design-core';
import { eq, inArray } from 'drizzle-orm';
import { logWebEvent } from '@/lib/audit';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/style-packs/[id]/tokens — Create a token.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: stylePackId } = await context.params;
    const body = await req.json();

    const parsed = createTokenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const result = await createToken(db, stylePackId, parsed.data);

    if ('error' in result) {
      if (result.error === 'style_pack_not_found') {
        return NextResponse.json({ error: 'Style pack not found' }, { status: 404 });
      }
      if (result.error === 'duplicate_token_key') {
        return NextResponse.json(
          { error: 'Token key already exists in this style pack' },
          { status: 409 }
        );
      }
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
        logWebEvent({ organizationId: pack.organizationId, action: 'web.create_token' });
      }
    } catch (auditErr) {
      console.error('Failed to log audit event:', auditErr);
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('Failed to create token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/style-packs/[id]/tokens — List or export tokens.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: stylePackId } = await context.params;
    const params = {
      tokenType: req.nextUrl.searchParams.get('tokenType') ?? undefined,
      format: req.nextUrl.searchParams.get('format') ?? undefined,
    };

    const parsed = listTokensSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();

    // Export as structured JSON
    if (parsed.data.format === 'json') {
      const exported = await exportTokens(db, stylePackId);
      return NextResponse.json(exported);
    }

    const result = await listTokens(db, stylePackId, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to list tokens:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
