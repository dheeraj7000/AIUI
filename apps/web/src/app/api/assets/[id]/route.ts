import { NextRequest, NextResponse } from 'next/server';
import {
  createDb,
  getAssetById,
  deleteAsset,
  verifyOrgMembership,
  projects,
} from '@aiui/design-core';
import { eq } from 'drizzle-orm';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/assets/[id] — Fetch a single asset.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const db = getDb();
    const asset = await getAssetById(db, id);

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    if (asset.projectId) {
      const [project] = await db
        .select({ organizationId: projects.organizationId })
        .from(projects)
        .where(eq(projects.id, asset.projectId))
        .limit(1);
      if (project?.organizationId) {
        const isMember = await verifyOrgMembership(db, userId, project.organizationId);
        if (!isMember) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Failed to get asset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/assets/[id] — Delete asset record.
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const db = getDb();
    const asset = await getAssetById(db, id);

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    if (asset.projectId) {
      const [project] = await db
        .select({ organizationId: projects.organizationId })
        .from(projects)
        .where(eq(projects.id, asset.projectId))
        .limit(1);
      if (project?.organizationId) {
        const isMember = await verifyOrgMembership(db, userId, project.organizationId);
        if (!isMember) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }
    }

    const result = await deleteAsset(db, id);

    if (!result) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete asset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
