import { eq, sql } from 'drizzle-orm';
import { projects, stylePacks, designProfiles, assets } from '../db/schema';
import type { Database } from '../db';

export type LayoutDensity = 'compact' | 'default' | 'airy';

export interface IntegrationStatus {
  hasStylePack: boolean;
  hasComponents: boolean;
  hasAssets: boolean;
  isComplete: boolean;
}

export interface ProjectSettings {
  projectId: string;
  name: string;
  slug: string;
  frameworkTarget: string;
  stylePack: { id: string; name: string } | null;
  componentCount: number;
  assetCount: number;
  integrationStatus: IntegrationStatus;
}

/**
 * Get aggregated project settings with integration status.
 */
export async function getProjectSettings(
  db: Database,
  projectId: string
): Promise<ProjectSettings | null> {
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);

  if (!project) return null;

  // Get style pack info
  let stylePack: { id: string; name: string } | null = null;
  if (project.activeStylePackId) {
    const [pack] = await db
      .select({ id: stylePacks.id, name: stylePacks.name })
      .from(stylePacks)
      .where(eq(stylePacks.id, project.activeStylePackId))
      .limit(1);
    if (pack) stylePack = pack;
  }

  // Get component count from design profile
  let componentCount = 0;
  const [profile] = await db
    .select({ selectedComponents: designProfiles.selectedComponents })
    .from(designProfiles)
    .where(eq(designProfiles.projectId, projectId))
    .limit(1);

  if (profile && Array.isArray(profile.selectedComponents)) {
    componentCount = (profile.selectedComponents as string[]).length;
  }

  // Get asset count
  const [assetResult] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(assets)
    .where(eq(assets.projectId, projectId));

  const assetCount = assetResult?.count ?? 0;

  const integrationStatus: IntegrationStatus = {
    hasStylePack: !!stylePack,
    hasComponents: componentCount > 0,
    hasAssets: assetCount > 0,
    isComplete: !!stylePack && componentCount > 0 && assetCount > 0,
  };

  return {
    projectId: project.id,
    name: project.name,
    slug: project.slug,
    frameworkTarget: project.frameworkTarget,
    stylePack,
    componentCount,
    assetCount,
    integrationStatus,
  };
}
