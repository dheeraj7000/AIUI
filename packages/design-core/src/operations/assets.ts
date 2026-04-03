import { eq, and, count, inArray, asc } from 'drizzle-orm';
import { assets, resourceTags } from '../db/schema';
import type { Database } from '../db';

export interface CreateAssetInput {
  projectId: string;
  organizationId?: string;
  type: 'logo' | 'font' | 'icon' | 'illustration' | 'screenshot' | 'brand-media';
  name: string;
  fileName: string;
  mimeType: string;
  storageKey: string;
  publicUrl?: string;
  sizeBytes: number;
  metadataJson?: Record<string, unknown>;
}

export interface ListAssetsParams {
  projectId: string;
  type?: string;
  tagIds?: string[];
  limit: number;
  offset: number;
}

/**
 * Create a new asset record.
 */
export async function createAsset(db: Database, data: CreateAssetInput) {
  const [asset] = await db
    .insert(assets)
    .values({
      projectId: data.projectId,
      organizationId: data.organizationId,
      type: data.type,
      name: data.name,
      fileName: data.fileName,
      mimeType: data.mimeType,
      storageKey: data.storageKey,
      publicUrl: data.publicUrl,
      sizeBytes: data.sizeBytes,
      metadataJson: data.metadataJson,
    })
    .returning();

  return asset;
}

/**
 * Fetch a single asset by ID.
 */
export async function getAssetById(db: Database, id: string) {
  const [asset] = await db.select().from(assets).where(eq(assets.id, id));

  return asset ?? null;
}

/**
 * List assets for a project with optional type and tag filters, plus pagination.
 */
export async function listAssets(db: Database, params: ListAssetsParams) {
  const { projectId, type, tagIds, limit = 50, offset = 0 } = params;

  const conditions = [eq(assets.projectId, projectId)];

  if (type) {
    conditions.push(eq(assets.type, type as (typeof assets.type.enumValues)[number]));
  }

  // If filtering by tags, find matching resource IDs first
  if (tagIds && tagIds.length > 0) {
    const taggedResources = await db
      .select({ resourceId: resourceTags.resourceId })
      .from(resourceTags)
      .where(and(inArray(resourceTags.tagId, tagIds), eq(resourceTags.resourceType, 'asset')));

    const resourceIds = taggedResources.map((r) => r.resourceId);
    if (resourceIds.length === 0) {
      return { data: [], total: 0, limit, offset };
    }
    conditions.push(inArray(assets.id, resourceIds));
  }

  const whereClause = and(...conditions);

  const [data, totalResult] = await Promise.all([
    db
      .select()
      .from(assets)
      .where(whereClause)
      .orderBy(asc(assets.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(assets).where(whereClause),
  ]);

  const total = totalResult[0]?.total ?? 0;

  return { data, total, limit, offset };
}

/**
 * Delete an asset record and return its storageKey for S3 cleanup.
 */
export async function deleteAsset(db: Database, id: string) {
  const [deleted] = await db.delete(assets).where(eq(assets.id, id)).returning();

  if (!deleted) return null;

  return { storageKey: deleted.storageKey };
}

/**
 * Update an asset's metadata_json (e.g., after metadata extraction).
 */
export async function updateAssetMetadata(
  db: Database,
  id: string,
  metadataJson: Record<string, unknown>
) {
  const [updated] = await db
    .update(assets)
    .set({ metadataJson, updatedAt: new Date() })
    .where(eq(assets.id, id))
    .returning();

  return updated ?? null;
}
