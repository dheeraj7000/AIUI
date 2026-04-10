import { NextRequest, NextResponse } from 'next/server';
import { createGraphEdge } from '@aiui/design-core/src/operations/graph';
import { z } from 'zod';
import { requireProjectAccess } from '@/lib/project-access';

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
  const { id } = await context.params;

  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  try {
    const body = await req.json();
    const parsed = createEdgeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const edge = await createGraphEdge(access.db, {
      projectId: id,
      ...parsed.data,
    });

    return NextResponse.json(edge, { status: 201 });
  } catch (error) {
    console.error('Failed to create graph edge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
