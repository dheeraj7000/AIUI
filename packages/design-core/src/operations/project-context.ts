import { eq, inArray } from 'drizzle-orm';
import {
  projects,
  stylePacks,
  styleTokens,
  designProfiles,
  componentRecipes,
  assets,
} from '../db/schema';
import type { Database } from '../db';

export interface ProjectContext {
  slug: string;
  name: string;
  frameworkTarget: string;
  stylePack: { id: string; name: string; category: string | null } | null;
  components: Array<{ id: string; name: string; type: string }>;
  assets: Array<{ name: string; type: string; publicUrl: string | null }>;
  tokenCount: number;
}

/**
 * Get public project context by slug for MCP server consumption.
 * Excludes sensitive organization details.
 */
export async function getProjectContext(
  db: Database,
  slug: string
): Promise<ProjectContext | null> {
  const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);

  if (!project) return null;

  // Style pack
  let stylePack: ProjectContext['stylePack'] = null;
  let tokenCount = 0;

  if (project.activeStylePackId) {
    const [pack] = await db
      .select({ id: stylePacks.id, name: stylePacks.name, category: stylePacks.category })
      .from(stylePacks)
      .where(eq(stylePacks.id, project.activeStylePackId))
      .limit(1);

    if (pack) {
      stylePack = pack;

      const tokens = await db
        .select({ id: styleTokens.id })
        .from(styleTokens)
        .where(eq(styleTokens.stylePackId, pack.id));

      tokenCount = tokens.length;
    }
  }

  // Components from design profile
  let components: ProjectContext['components'] = [];
  const [profile] = await db
    .select({ selectedComponents: designProfiles.selectedComponents })
    .from(designProfiles)
    .where(eq(designProfiles.projectId, project.id))
    .limit(1);

  if (profile && Array.isArray(profile.selectedComponents)) {
    const ids = profile.selectedComponents as string[];
    if (ids.length > 0) {
      components = await db
        .select({
          id: componentRecipes.id,
          name: componentRecipes.name,
          type: componentRecipes.type,
        })
        .from(componentRecipes)
        .where(inArray(componentRecipes.id, ids));
    }
  }

  // Assets
  const projectAssets = await db
    .select({
      name: assets.name,
      type: assets.type,
      publicUrl: assets.publicUrl,
    })
    .from(assets)
    .where(eq(assets.projectId, project.id));

  return {
    slug: project.slug,
    name: project.name,
    frameworkTarget: project.frameworkTarget,
    stylePack,
    components,
    assets: projectAssets,
    tokenCount,
  };
}
