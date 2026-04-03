import { eq, and, asc } from 'drizzle-orm';
import { assets } from '../db/schema';
import type { Database } from '../db';

export type AssetRole = 'primary-logo' | 'primary-icon' | 'brand-color-source' | 'general';

export interface ProjectAsset {
  id: string;
  projectId: string;
  type: string;
  name: string;
  fileName: string;
  mimeType: string;
  publicUrl: string | null;
  sizeBytes: number;
  metadataJson: unknown;
  createdAt: Date;
}

/**
 * Get all assets linked to a project, ordered by creation date.
 */
export async function getProjectAssets(db: Database, projectId: string): Promise<ProjectAsset[]> {
  return db
    .select({
      id: assets.id,
      projectId: assets.projectId,
      type: assets.type,
      name: assets.name,
      fileName: assets.fileName,
      mimeType: assets.mimeType,
      publicUrl: assets.publicUrl,
      sizeBytes: assets.sizeBytes,
      metadataJson: assets.metadataJson,
      createdAt: assets.createdAt,
    })
    .from(assets)
    .where(eq(assets.projectId, projectId))
    .orderBy(asc(assets.createdAt));
}

/**
 * Get a specific asset by ID, verifying it belongs to the project.
 */
export async function getProjectAsset(
  db: Database,
  projectId: string,
  assetId: string
): Promise<ProjectAsset | null> {
  const [asset] = await db
    .select({
      id: assets.id,
      projectId: assets.projectId,
      type: assets.type,
      name: assets.name,
      fileName: assets.fileName,
      mimeType: assets.mimeType,
      publicUrl: assets.publicUrl,
      sizeBytes: assets.sizeBytes,
      metadataJson: assets.metadataJson,
      createdAt: assets.createdAt,
    })
    .from(assets)
    .where(and(eq(assets.id, assetId), eq(assets.projectId, projectId)))
    .limit(1);

  return asset ?? null;
}

/**
 * Unlink (delete) an asset from a project.
 */
export async function unlinkProjectAsset(
  db: Database,
  projectId: string,
  assetId: string
): Promise<boolean> {
  const [deleted] = await db
    .delete(assets)
    .where(and(eq(assets.id, assetId), eq(assets.projectId, projectId)))
    .returning({ id: assets.id });

  return !!deleted;
}
