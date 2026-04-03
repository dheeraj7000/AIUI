import { NextRequest, NextResponse } from 'next/server';
import { createDb } from '@aiui/design-core';
import { getProjectSettings } from '@aiui/design-core/src/operations/project-settings';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]/settings — Get aggregated project settings.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const db = getDb();
    const settings = await getProjectSettings(db, id);

    if (!settings) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to get project settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
