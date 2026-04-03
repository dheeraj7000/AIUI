import { NextRequest, NextResponse } from 'next/server';
import {
  createDb,
  createS3Client,
  deleteObject,
  getAssetById,
  deleteAsset,
} from '@aiui/design-core';

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

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Failed to get asset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/assets/[id] — Delete asset record and S3 object.
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const db = getDb();
    const result = await deleteAsset(db, id);

    if (!result) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Clean up S3 object — log but don't fail if already missing
    try {
      const bucket = process.env.S3_ASSETS_BUCKET;
      if (bucket) {
        const s3 = createS3Client();
        await deleteObject(s3, bucket, result.storageKey);
      }
    } catch (s3Error) {
      console.warn('Failed to delete S3 object (may already be removed):', s3Error);
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete asset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
