import { NextRequest, NextResponse } from 'next/server';
import { createDb } from '@aiui/design-core';
import { createGraphEdge } from '@aiui/design-core/src/operations/graph';
import { z } from 'zod';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

const createEdgeSchema = z.object({
  sourceNodeId: z.string().uuid(),
  targetNodeId: z.string().uuid(),
  edgeType: z.enum([
    'uses',
    'contains',
    'links-to',
    'derives-from',
    'overrides',
    'imports',
    'styled-by',
  ]),
  label: z.string().max(255).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/projects/[id]/graph/edges — Create a graph edge.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = createEdgeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const edge = await createGraphEdge(db, {
      projectId: id,
      ...parsed.data,
    });

    return NextResponse.json(edge, { status: 201 });
  } catch (error) {
    console.error('Failed to create graph edge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
