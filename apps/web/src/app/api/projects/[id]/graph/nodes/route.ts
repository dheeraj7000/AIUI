import { NextRequest, NextResponse } from 'next/server';
import { createGraphNode } from '@aiui/design-core/src/operations/graph';
import { z } from 'zod';
import { requireProjectAccess } from '@/lib/project-access';

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
  const { id } = await context.params;

  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  try {
    const body = await req.json();
    const parsed = createNodeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const node = await createGraphNode(access.db, {
      projectId: id,
      ...parsed.data,
    });

    return NextResponse.json(node, { status: 201 });
  } catch (error) {
    console.error('Failed to create graph node:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
