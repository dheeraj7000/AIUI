import { eq, sql } from 'drizzle-orm';
import { projects, styleTokens, assets } from '../db/schema';
import type { Database } from '../db';

export type LayoutDensity = 'compact' | 'default' | 'airy';

export interface IntegrationStatus {
  hasTokens: boolean;
  hasAssets: boolean;
  isComplete: boolean;
}

export interface ProjectSettings {
  projectId: string;
  name: string;
  slug: string;
  frameworkTarget: string;
  tokenCount: number;
  assetCount: number;
  integrationStatus: IntegrationStatus;
}

export async function getProjectSettings(
  db: Database,
  projectId: string
): Promise<ProjectSettings | null> {
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);

  if (!project) return null;

  const [tokenResult] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(styleTokens)
    .where(eq(styleTokens.projectId, projectId));

  const tokenCount = tokenResult?.count ?? 0;

  const [assetResult] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(assets)
    .where(eq(assets.projectId, projectId));

  const assetCount = assetResult?.count ?? 0;

  const integrationStatus: IntegrationStatus = {
    hasTokens: tokenCount > 0,
    hasAssets: assetCount > 0,
    isComplete: tokenCount > 0 && assetCount > 0,
  };

  return {
    projectId: project.id,
    name: project.name,
    slug: project.slug,
    frameworkTarget: project.frameworkTarget,
    tokenCount,
    assetCount,
    integrationStatus,
  };
}
