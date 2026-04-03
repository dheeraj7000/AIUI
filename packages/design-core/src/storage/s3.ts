/**
 * S3 storage service — presigned URL generation and object management
 * for direct browser-to-S3 uploads.
 */

import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost, type PresignedPost } from '@aws-sdk/s3-presigned-post';

/** Default presigned URL expiration: 15 minutes */
const DEFAULT_EXPIRES_IN = 15 * 60;

/**
 * Creates an S3 client configured from environment variables.
 * Override the region by passing it explicitly.
 */
export function createS3Client(region?: string): S3Client {
  return new S3Client({
    region: region || process.env.AWS_REGION || 'us-east-1',
  });
}

/**
 * Builds a deterministic, collision-free storage key for an asset upload.
 *
 * Format: `{orgId}/{projectId}/{assetType}/{uuid}-{sanitizedFileName}`
 */
export function buildStorageKey(
  orgId: string,
  projectId: string,
  assetType: string,
  fileName: string
): string {
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uuid = crypto.randomUUID();
  return `${orgId}/${projectId}/${assetType}/${uuid}-${sanitized}`;
}

export interface PresignedUploadParams {
  client: S3Client;
  bucket: string;
  key: string;
  contentType: string;
  maxSizeBytes: number;
  /** Expiration in seconds (default: 900 = 15 minutes) */
  expiresIn?: number;
}

export interface PresignedUploadResult {
  /** The POST URL to upload to */
  url: string;
  /** Form fields to include in the multipart upload */
  fields: PresignedPost['fields'];
  /** The S3 object key */
  key: string;
}

/**
 * Generates a presigned POST URL for direct browser-to-S3 upload.
 *
 * The returned `url` and `fields` should be used to construct a multipart/form-data
 * POST request from the browser.
 */
export async function generatePresignedUploadUrl(
  params: PresignedUploadParams
): Promise<PresignedUploadResult> {
  const { client, bucket, key, contentType, maxSizeBytes, expiresIn } = params;

  const { url, fields } = await createPresignedPost(client, {
    Bucket: bucket,
    Key: key,
    Conditions: [
      ['content-length-range', 0, maxSizeBytes],
      ['eq', '$Content-Type', contentType],
    ],
    Fields: {
      'Content-Type': contentType,
    },
    Expires: expiresIn ?? DEFAULT_EXPIRES_IN,
  });

  return { url, fields, key };
}

/**
 * Deletes an object from S3.
 */
export async function deleteObject(client: S3Client, bucket: string, key: string): Promise<void> {
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}
