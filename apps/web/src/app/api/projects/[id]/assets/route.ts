import { NextRequest, NextResponse } from 'next/server';
import { createDb } from '@aiui/design-core';
import {
  getProjectAssets,
  unlinkProjectAsset,
} from '@aiui/design-core/src/operations/project-assets';
import { z } from 'zod';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

const deleteSchema = z.object({
  assetId: z.string().uuid(),
});

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]/assets — List all assets linked to the project.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const db = getDb();
    const projectAssets = await getProjectAssets(db, id);
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
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = deleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const deleted = await unlinkProjectAsset(db, id, parsed.data.assetId);

    if (!deleted) {
      return NextResponse.json({ error: 'Asset not found in project' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to unlink asset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
