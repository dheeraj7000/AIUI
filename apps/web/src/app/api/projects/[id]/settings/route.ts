import { NextRequest, NextResponse } from 'next/server';
import { getProjectSettings } from '@aiui/design-core/src/operations/project-settings';
import { requireProjectAccess } from '@/lib/project-access';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]/settings — Get aggregated project settings.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  try {
    const settings = await getProjectSettings(access.db, id);

    if (!settings) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to get project settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
