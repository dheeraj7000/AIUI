import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPersona, updatePersona, deletePersona, updatePersonaSchema } from '@aiui/design-core';
import { requireProjectAccess } from '@/lib/project-access';

type RouteContext = { params: Promise<{ id: string; personaId: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { id, personaId } = await context.params;
  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  const row = await getPersona(access.db, personaId, id);
  if (!row) return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
  return NextResponse.json({ data: row });
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id, personaId } = await context.params;
  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  let body: z.infer<typeof updatePersonaSchema>;
  try {
    body = updatePersonaSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request body' },
      { status: 400 }
    );
  }

  const updated = await updatePersona(access.db, personaId, id, body);
  if (!updated) return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
  return NextResponse.json({ data: updated });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id, personaId } = await context.params;
  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  const deleted = await deletePersona(access.db, personaId, id);
  if (!deleted) return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
  return NextResponse.json({ data: deleted });
}
