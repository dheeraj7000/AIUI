import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import {
  createDb,
  verifyApiKey,
  checkTokenCompliance,
  projects,
  styleTokens,
} from '@aiui/design-core';
import type { Database } from '@aiui/design-core';

function getDb(): Database {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

/**
 * Authenticate the request via x-user-id header or Authorization Bearer API key.
 * Returns { userId, projectId } on success or a NextResponse error.
 */
async function authenticate(
  req: NextRequest,
  db: Database
): Promise<
  { userId: string; projectId: string | null; error?: undefined } | { error: NextResponse }
> {
  const userId = req.headers.get('x-user-id');
  if (userId) {
    return { userId, projectId: null };
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const rawKey = authHeader.slice(7);
    const ctx = await verifyApiKey(db, rawKey);
    if (ctx) {
      return { userId: ctx.userId, projectId: ctx.projectId };
    }
  }

  return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
}

/**
 * Resolve a project ID from either a slug or a direct ID.
 */
async function resolveProjectId(
  db: Database,
  projectSlug?: string,
  projectId?: string
): Promise<string | null> {
  if (projectId) return projectId;

  if (projectSlug) {
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.slug, projectSlug))
      .limit(1);
    return project?.id ?? null;
  }

  return null;
}

/**
 * Fetch the approved tokens for a project's active style pack.
 */
async function getProjectTokens(
  db: Database,
  projectId: string
): Promise<Array<{ tokenKey: string; tokenValue: string; tokenType: string }> | null> {
  const [project] = await db
    .select({ activeStylePackId: projects.activeStylePackId })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project?.activeStylePackId) return null;

  const tokens = await db
    .select({
      tokenKey: styleTokens.tokenKey,
      tokenValue: styleTokens.tokenValue,
      tokenType: styleTokens.tokenType,
    })
    .from(styleTokens)
    .where(eq(styleTokens.stylePackId, project.activeStylePackId));

  return tokens;
}

/**
 * POST /api/validate - Validate a single code snippet against project design tokens.
 */
export async function POST(req: NextRequest) {
  const db = getDb();
  const auth = await authenticate(req, db);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const {
      code,
      projectSlug,
      projectId: bodyProjectId,
    } = body as {
      code?: string;
      projectSlug?: string;
      projectId?: string;
    };

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Request body must include a "code" string' },
        { status: 400 }
      );
    }

    const resolvedProjectId = await resolveProjectId(
      db,
      projectSlug,
      bodyProjectId ?? auth.projectId ?? undefined
    );

    if (!resolvedProjectId) {
      return NextResponse.json(
        { error: 'Project not found. Provide projectSlug or projectId.' },
        { status: 404 }
      );
    }

    const tokens = await getProjectTokens(db, resolvedProjectId);
    if (!tokens) {
      return NextResponse.json(
        { error: 'Project has no active style pack with tokens' },
        { status: 404 }
      );
    }

    const result = checkTokenCompliance(code, tokens);

    return NextResponse.json({
      compliant: result.compliant,
      score: result.score,
      violations: result.violations,
      tokenCount: tokens.length,
      checkedAt: result.checkedAt,
    });
  } catch (error) {
    console.error('Validation failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
