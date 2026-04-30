import { NextRequest, NextResponse } from 'next/server';
import {
  createDb,
  bulkImportTokens,
  parseTokens,
  verifyOrgMembership,
  designProfiles,
  projects,
} from '@aiui/design-core';
import { eq, and } from 'drizzle-orm';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

/**
 * POST /api/imports/tokens — Import tokens from CSS variables, Tokens Studio
 * JSON, or Tailwind config content directly into a project.
 *
 * After the scope cut, tokens are project-scoped: callers must provide a
 * `projectId` (membership-checked via the org). The old "create a style pack"
 * indirection is gone.
 */
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const { content, format, projectId, organizationId } = body as {
      content: string;
      format?: 'css' | 'tokens-studio' | 'tailwind' | 'auto';
      projectId: string;
      organizationId: string;
    };

    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
    }

    const result = parseTokens(content, format);

    if (result.tokens.length === 0) {
      return NextResponse.json(
        { error: 'No tokens could be parsed from the provided content' },
        { status: 400 }
      );
    }

    const db = getDb();
    const isMember = await verifyOrgMembership(db, userId, organizationId);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Confirm project belongs to the org before writing tokens to it.
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.organizationId, organizationId)))
      .limit(1);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found in this organization' },
        { status: 404 }
      );
    }

    await bulkImportTokens(db, project.id, result.tokens);

    // Mark the project's design profile as stale so MCP read tools surface
    // a warning until sync_design_memory is called. Soft signal — log and
    // continue on failure.
    try {
      await db
        .update(designProfiles)
        .set({ compilationValid: false, updatedAt: new Date() })
        .where(eq(designProfiles.projectId, project.id));
    } catch (staleErr) {
      console.error('Failed to mark design profile stale:', staleErr);
    }

    return NextResponse.json(
      { projectId: project.id, stats: result.stats, warnings: result.warnings },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to import tokens:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
