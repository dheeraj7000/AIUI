import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createDb, createAsset, listAssets } from '@aiui/design-core';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

const ASSET_TYPES = ['logo', 'font', 'icon', 'illustration', 'screenshot', 'brand-media'] as const;

const createAssetBodySchema = z.object({
  projectId: z.string().uuid(),
  organizationId: z.string().uuid().optional(),
  type: z.enum(ASSET_TYPES),
  name: z.string().min(1).max(255),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  storageKey: z.string().min(1),
  publicUrl: z.string().url().optional(),
  sizeBytes: z.number().int().nonnegative(),
  metadataJson: z.record(z.string(), z.unknown()).optional(),
});

const listAssetsQuerySchema = z.object({
  projectId: z.string().uuid(),
  type: z.enum(ASSET_TYPES).optional(),
  tagIds: z.string().optional(), // comma-separated UUIDs
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

/**
 * POST /api/assets — Create an asset record after S3 upload confirmation.
 */
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createAssetBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const asset = await createAsset(db, parsed.data);
    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error('Failed to create asset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/assets — List assets filtered by project, type, and tags.
 */
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const params = {
      projectId: req.nextUrl.searchParams.get('projectId') ?? '',
      type: req.nextUrl.searchParams.get('type') ?? undefined,
      tagIds: req.nextUrl.searchParams.get('tagIds') ?? undefined,
      limit: req.nextUrl.searchParams.get('limit') ?? undefined,
      offset: req.nextUrl.searchParams.get('offset') ?? undefined,
    };

    const parsed = listAssetsQuerySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const tagIds = parsed.data.tagIds ? parsed.data.tagIds.split(',').filter(Boolean) : undefined;

    const db = getDb();
    const result = await listAssets(db, {
      projectId: parsed.data.projectId,
      type: parsed.data.type,
      tagIds,
      limit: parsed.data.limit,
      offset: parsed.data.offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to list assets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
