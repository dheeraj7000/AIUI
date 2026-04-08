import { NextRequest, NextResponse } from 'next/server';
import { createDb } from '@aiui/design-core';
import { createGraphNode } from '@aiui/design-core/src/operations/graph';
import { z } from 'zod';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

const createNodeSchema = z.object({
  nodeType: z.enum([
    'page',
    'component',
    'token',
    'style-pack',
    'project',
    'route',
    'api-endpoint',
  ]),
  label: z.string().min(1).max(255),
  metadata: z.record(z.string(), z.unknown()).optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  color: z.string().max(20).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/projects/[id]/graph/nodes — Create a graph node.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = createNodeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const node = await createGraphNode(db, {
      projectId: id,
      ...parsed.data,
    });

    return NextResponse.json(node, { status: 201 });
  } catch (error) {
    console.error('Failed to create graph node:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
