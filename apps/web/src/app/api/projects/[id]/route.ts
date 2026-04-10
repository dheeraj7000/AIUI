import { NextRequest, NextResponse } from 'next/server';
import { updateProject, deleteProject } from '@aiui/design-core';
import { updateProjectSchema } from '@aiui/design-core/src/validation/project';
import { requireProjectAccess } from '@/lib/project-access';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id] — Get project details.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  return NextResponse.json(access.project);
}

/**
 * PUT /api/projects/[id] — Update a project.
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  try {
    const body = await req.json();
    const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const updated = await updateProject(access.db, id, parsed.data);

    if (!updated) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[id] — Delete a project.
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  try {
    const deleted = await deleteProject(access.db, id);

    if (!deleted) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
