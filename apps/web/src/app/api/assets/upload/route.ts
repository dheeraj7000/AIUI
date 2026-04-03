import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  validateAssetUpload,
  getAssetTypeConfig,
  createS3Client,
  buildStorageKey,
  generatePresignedUploadUrl,
  type AssetType,
} from '@aiui/design-core';

// ---------------------------------------------------------------------------
// Request schema
// ---------------------------------------------------------------------------

const VALID_ASSET_TYPES = [
  'logo',
  'font',
  'icon',
  'illustration',
  'screenshot',
  'brand-media',
] as const;

const uploadRequestSchema = z.object({
  /** Original file name */
  name: z.string().min(1, 'File name is required'),
  /** Asset category */
  type: z.enum(VALID_ASSET_TYPES),
  /** File size in bytes */
  size: z.number().int().positive('File size must be a positive integer'),
  /** MIME content-type of the file */
  contentType: z.string().min(1, 'Content type is required'),
  /** Project the asset belongs to */
  projectId: z.string().min(1, 'Project ID is required'),
});

export type UploadRequest = z.infer<typeof uploadRequestSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getBucket(): string {
  const bucket = process.env.S3_ASSETS_BUCKET;
  if (!bucket) {
    throw new Error('S3_ASSETS_BUCKET environment variable is not set');
  }
  return bucket;
}

// Lazily-initialised singleton so we don't create a new client per request.
let _s3Client: ReturnType<typeof createS3Client> | null = null;
function getS3Client() {
  if (!_s3Client) {
    _s3Client = createS3Client();
  }
  return _s3Client;
}

// ---------------------------------------------------------------------------
// POST /api/assets/upload
// ---------------------------------------------------------------------------

/**
 * Generate a presigned POST URL for direct browser-to-S3 upload.
 *
 * Request body: `{ name, type, size, contentType, projectId }`
 * Response:     `{ url, fields, storageKey }`
 */
export async function POST(req: Request) {
  // --- Auth ---
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // --- Parse & validate request body ---
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = uploadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { name, type, size, contentType, projectId } = parsed.data;

  // --- Asset-type validation (MIME, extension, size) ---
  const assetValidation = validateAssetUpload({
    assetType: type as AssetType,
    fileName: name,
    contentType,
    fileSize: size,
  });

  if (!assetValidation.valid) {
    return NextResponse.json(
      { error: 'Asset validation failed', details: assetValidation.errors },
      { status: 400 }
    );
  }

  // --- Generate presigned upload URL ---
  try {
    const orgId = req.headers.get('x-org-id') ?? 'default';
    const config = getAssetTypeConfig(type as AssetType);
    const storageKey = buildStorageKey(orgId, projectId, type, name);

    const { url, fields } = await generatePresignedUploadUrl({
      client: getS3Client(),
      bucket: getBucket(),
      key: storageKey,
      contentType,
      maxSizeBytes: config.maxSizeBytes,
    });

    return NextResponse.json({ url, fields, storageKey }, { status: 200 });
  } catch (error) {
    console.error('Failed to generate presigned upload URL:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
