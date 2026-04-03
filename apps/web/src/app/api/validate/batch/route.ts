import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import {
  createDb,
  verifyApiKey,
  checkTokenCompliance,
  projects,
  styleTokens,
} from '@aiui/design-core';
import type { ComplianceViolation, Database } from '@aiui/design-core';

function getDb(): Database {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

/**
 * Authenticate the request via x-user-id header or Authorization Bearer API key.
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
 * Resolve a project ID from a slug.
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

interface FileInput {
  path: string;
  code: string;
}

interface FileResult {
  path: string;
  compliant: boolean;
  score: number;
  violations: ComplianceViolation[];
}

/**
 * POST /api/validate/batch - Validate multiple files against project design tokens.
 */
export async function POST(req: NextRequest) {
  const db = getDb();
  const auth = await authenticate(req, db);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const {
      files,
      projectSlug,
      projectId: bodyProjectId,
    } = body as {
      files?: FileInput[];
      projectSlug?: string;
      projectId?: string;
    };

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'Request body must include a non-empty "files" array' },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (
        !file.path ||
        typeof file.path !== 'string' ||
        !file.code ||
        typeof file.code !== 'string'
      ) {
        return NextResponse.json(
          { error: 'Each file must have a "path" string and a "code" string' },
          { status: 400 }
        );
      }
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

    const results: FileResult[] = [];
    let totalViolations = 0;
    let errorCount = 0;
    let warningCount = 0;

    for (const file of files) {
      const result = checkTokenCompliance(file.code, tokens);
      const fileErrors = result.violations.filter((v) => v.severity === 'error').length;
      const fileWarnings = result.violations.filter((v) => v.severity === 'warning').length;

      totalViolations += result.violations.length;
      errorCount += fileErrors;
      warningCount += fileWarnings;

      results.push({
        path: file.path,
        compliant: result.compliant,
        score: result.score,
        violations: result.violations,
      });
    }

    const averageScore =
      results.length > 0
        ? Math.round((results.reduce((sum, r) => sum + r.score, 0) / results.length) * 100) / 100
        : 100;

    const allCompliant = results.every((r) => r.compliant);

    return NextResponse.json({
      compliant: allCompliant,
      score: averageScore,
      results,
      summary: {
        totalFiles: files.length,
        totalViolations,
        errorCount,
        warningCount,
      },
    });
  } catch (error) {
    console.error('Batch validation failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
