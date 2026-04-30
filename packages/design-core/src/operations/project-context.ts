import { eq } from 'drizzle-orm';
import { projects, styleTokens, assets } from '../db/schema';
import type { Database } from '../db';

export interface ProjectContext {
  slug: string;
  name: string;
  frameworkTarget: string;
  assets: Array<{ name: string; type: string; publicUrl: string | null }>;
  tokenCount: number;
}

/**
 * Get public project context by slug for MCP server consumption.
 */
export async function getProjectContext(
  db: Database,
  slug: string
): Promise<ProjectContext | null> {
  const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);

  if (!project) return null;

  const tokens = await db
    .select({ id: styleTokens.id })
    .from(styleTokens)
    .where(eq(styleTokens.projectId, project.id));

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
    assets: projectAssets,
    tokenCount: tokens.length,
  };
}
