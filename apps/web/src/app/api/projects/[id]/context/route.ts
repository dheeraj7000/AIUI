import { NextRequest, NextResponse } from 'next/server';
import { createDb } from '@aiui/design-core';
import { getProjectContext } from '@aiui/design-core/src/operations/project-context';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]/context — Public project context for MCP server.
 * Accepts a project slug as the id parameter.
 * No authentication required.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  const { id: slug } = await context.params;

  try {
    const db = getDb();
    const projectContext = await getProjectContext(db, slug);

    if (!projectContext) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(projectContext, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Failed to get project context:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
