import { NextRequest, NextResponse } from 'next/server';
import { createDb } from '@aiui/design-core';
import { getProjectGraph, autoGenerateGraph } from '@aiui/design-core/src/operations/graph';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]/graph — Get full graph (nodes + edges) for a project.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const db = getDb();
    const graph = await getProjectGraph(db, id);
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
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const db = getDb();
    const graph = await autoGenerateGraph(db, id);
    return NextResponse.json(graph, { status: 201 });
  } catch (error) {
    console.error('Failed to auto-generate graph:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
