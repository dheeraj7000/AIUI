import { NextRequest, NextResponse } from 'next/server';
import { getProjectGraph, autoGenerateGraph } from '@aiui/design-core/src/operations/graph';
import { requireProjectAccess } from '@/lib/project-access';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]/graph — Get full graph (nodes + edges) for a project.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  try {
    const graph = await getProjectGraph(access.db, id);
    return NextResponse.json(graph);
  } catch (error) {
    console.error('Failed to get project graph:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/projects/[id]/graph — Auto-generate graph from project data.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  try {
    const graph = await autoGenerateGraph(access.db, id);
    return NextResponse.json(graph, { status: 201 });
  } catch (error) {
    console.error('Failed to auto-generate graph:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
