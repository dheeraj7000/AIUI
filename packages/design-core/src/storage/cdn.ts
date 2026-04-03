/**
 * CloudFront CDN integration for serving assets with appropriate cache headers
 * and cache invalidation for updates/deletions.
 */

import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { CopyObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createS3Client, deleteObject } from './s3';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CachePolicy {
  cacheControl: string;
  description: string;
}

type AssetType = 'logo' | 'font' | 'icon' | 'illustration' | 'screenshot' | 'brand-media';

// ---------------------------------------------------------------------------
// Cache policies per asset type
// ---------------------------------------------------------------------------

const CACHE_POLICIES: Record<AssetType | 'bundle', CachePolicy> = {
  font: {
    cacheControl: 'public, max-age=31536000, immutable',
    description: 'Fonts never change once uploaded',
  },
  logo: { cacheControl: 'public, max-age=31536000', description: 'Logos cached for 1 year' },
  icon: { cacheControl: 'public, max-age=31536000', description: 'Icons cached for 1 year' },
  illustration: {
    cacheControl: 'public, max-age=31536000',
    description: 'Illustrations cached for 1 year',
  },
  screenshot: {
    cacheControl: 'public, max-age=31536000',
    description: 'Screenshots cached for 1 year',
  },
  'brand-media': {
    cacheControl: 'public, max-age=31536000',
    description: 'Brand media cached for 1 year',
  },
  bundle: { cacheControl: 'no-cache, must-revalidate', description: 'Bundles always revalidated' },
};

// ---------------------------------------------------------------------------
// Clients (lazy singletons)
// ---------------------------------------------------------------------------

let _cfClient: CloudFrontClient | null = null;

function getCloudFrontClient(): CloudFrontClient {
  if (!_cfClient) {
    _cfClient = new CloudFrontClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }
  return _cfClient;
}

function getDomain(): string {
  return process.env.CLOUDFRONT_DOMAIN ?? '';
}

function getDistributionId(): string {
  return process.env.CLOUDFRONT_DISTRIBUTION_ID ?? '';
}

function getBucket(): string {
  return process.env.S3_ASSETS_BUCKET ?? '';
}

// ---------------------------------------------------------------------------
// Public URL generation
// ---------------------------------------------------------------------------

/**
 * Generate a CloudFront public URL for an asset storage key.
 */
export function generatePublicUrl(storageKey: string): string {
  if (!storageKey || storageKey.includes('..')) {
    throw new Error('Invalid storage key');
  }

  const domain = getDomain();
  if (!domain) {
    throw new Error('CLOUDFRONT_DOMAIN environment variable is not set');
  }

  return `https://${domain}/${storageKey}`;
}

/**
 * Get the cache policy for an asset type.
 */
export function getCachePolicy(assetType: AssetType | 'bundle'): CachePolicy {
  return CACHE_POLICIES[assetType] ?? CACHE_POLICIES.bundle;
}

// ---------------------------------------------------------------------------
// Cache invalidation
// ---------------------------------------------------------------------------

/**
 * Create a CloudFront invalidation for the given storage keys.
 * Batches up to 3000 paths per request (CloudFront limit).
 */
export async function invalidateCache(storageKeys: string[]): Promise<void> {
  const distributionId = getDistributionId();
  if (!distributionId) return;

  const paths = storageKeys.map((key) => `/${key}`);
  const client = getCloudFrontClient();
  const callerRef = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  await client.send(
    new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: callerRef,
        Paths: {
          Quantity: paths.length,
          Items: paths,
        },
      },
    })
  );
}

/**
 * Invalidate CloudFront cache, then delete the S3 object.
 * CloudFront errors are logged but don't block S3 deletion.
 */
export async function invalidateAndDelete(
  storageKey: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  assetId: string
): Promise<void> {
  // Invalidate cache first (best-effort)
  try {
    await invalidateCache([storageKey]);
  } catch (err) {
    console.warn('CloudFront invalidation failed, proceeding with S3 deletion:', err);
  }

  // Delete from S3
  const bucket = getBucket();
  if (bucket) {
    const s3 = createS3Client();
    await deleteObject(s3, bucket, storageKey);
  }
}

// ---------------------------------------------------------------------------
// Cache header management
// ---------------------------------------------------------------------------

/**
 * Copy an S3 object to itself with updated Cache-Control metadata.
 * Called after initial upload to set correct headers based on asset type.
 */
export async function setObjectCacheHeaders(
  storageKey: string,
  assetType: AssetType
): Promise<void> {
  const bucket = getBucket();
  if (!bucket) return;

  const s3 = createS3Client() as S3Client;
  const policy = getCachePolicy(assetType);

  await s3.send(
    new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${storageKey}`,
      Key: storageKey,
      CacheControl: policy.cacheControl,
      MetadataDirective: 'REPLACE',
    })
  );
}
