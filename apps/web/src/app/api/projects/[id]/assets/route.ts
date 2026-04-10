import { NextRequest, NextResponse } from 'next/server';
import {
  getProjectAssets,
  unlinkProjectAsset,
} from '@aiui/design-core/src/operations/project-assets';
import { z } from 'zod';
import { requireProjectAccess } from '@/lib/project-access';

const deleteSchema = z.object({
  assetId: z.string().uuid(),
});

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]/assets — List all assets linked to the project.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  try {
    const projectAssets = await getProjectAssets(access.db, id);
    return NextResponse.json(projectAssets);
  } catch (error) {
    console.error('Failed to get project assets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[id]/assets — Unlink an asset from the project.
 * Accepts { assetId } in the request body.
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  try {
    const body = await req.json();
    const parsed = deleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const deleted = await unlinkProjectAsset(access.db, id, parsed.data.assetId);

    if (!deleted) {
      return NextResponse.json({ error: 'Asset not found in project' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to unlink asset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
