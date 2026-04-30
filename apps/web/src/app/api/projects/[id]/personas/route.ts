import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPersona, listPersonas, createPersonaSchema } from '@aiui/design-core';
import { requireProjectAccess } from '@/lib/project-access';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]/personas — list personas for the project.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  try {
    const rows = await listPersonas(access.db, id);
    return NextResponse.json({ data: rows, total: rows.length });
  } catch (err) {
    console.error('[personas GET] error', err);
    return NextResponse.json({ error: 'Failed to list personas' }, { status: 500 });
  }
}

/**
 * POST /api/projects/[id]/personas — create a persona for the project.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  let body: z.infer<typeof createPersonaSchema>;
  try {
    body = createPersonaSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request body' },
      { status: 400 }
    );
  }

  try {
    const result = await createPersona(access.db, id, body);
    if ('error' in result) {
      return NextResponse.json(
        { error: 'A persona with that name already exists for this project.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ data: result.data }, { status: 201 });
  } catch (err) {
    console.error('[personas POST] error', err);
    return NextResponse.json({ error: 'Failed to create persona' }, { status: 500 });
  }
}
