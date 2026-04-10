import { eq, and } from 'drizzle-orm';
import { projects, stylePacks, styleTokens, componentRecipes, designProfiles } from '../db/schema';
import type { Database } from '../db';
import { generateProjectSlug } from './projects';
import { autoGenerateGraph } from './graph';
import type { CreateProjectInput } from '../validation/project';

// The pack a fresh scratch project is seeded with when the caller doesn't
// specify one. Lives in seed data (shadcn-essentials.ts) and is loaded by
// the seed script on every environment.
export const DEFAULT_STARTER_PACK_SLUG = 'shadcn-essentials-v4';

function titleCase(slug: string): string {
  return slug
    .split('-')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

interface SeedResult {
  pack: { id: string; slug: string; name: string };
  designProfileId: string;
  tokenCount: number;
  componentCount: number;
}

/**
 * Attach a starter style pack + design profile + graph to an already-inserted
 * project row. Used by both `initProjectWithStarter` (explicit slug, idempotent)
 * and `createProjectWithStarter` (name-based, collision-safe slug).
 */
async function seedProjectWithStarterPack(
  db: Database,
  projectId: string,
  starterPackSlug: string
): Promise<SeedResult> {
  const [pack] = await db
    .select({ id: stylePacks.id, slug: stylePacks.slug, name: stylePacks.name })
    .from(stylePacks)
    .where(eq(stylePacks.slug, starterPackSlug))
    .limit(1);

  if (!pack) {
    throw new Error(
      `Starter style pack "${starterPackSlug}" not found. ` +
        `Run the seed script (pnpm db:seed) or pass a different starterPackSlug.`
    );
  }

  // Set the project's active style pack
  await db
    .update(projects)
    .set({ activeStylePackId: pack.id, updatedAt: new Date() })
    .where(eq(projects.id, projectId));

  // Pull recipes + tokens that belong to this pack so we can:
  //   (a) populate selectedComponents on the design profile
  //   (b) return counts for the caller's response
  const recipes = await db
    .select({ id: componentRecipes.id })
    .from(componentRecipes)
    .where(eq(componentRecipes.stylePackId, pack.id));

  const tokens = await db
    .select({ id: styleTokens.id })
    .from(styleTokens)
    .where(eq(styleTokens.stylePackId, pack.id));

  const selectedComponentIds = recipes.map((r) => r.id);

  // Look up project name for the profile name
  const [proj] = await db
    .select({ name: projects.name })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  const profileName = `${proj?.name ?? 'Project'} Design Profile`;

  const [profile] = await db
    .insert(designProfiles)
    .values({
      projectId,
      name: profileName,
      version: 1,
      stylePackId: pack.id,
      selectedComponents: selectedComponentIds,
      compilationValid: true,
      compiledJson: {
        tokens: {},
        components: [],
        _changelog: [
          {
            version: 1,
            date: new Date().toISOString().split('T')[0],
            summary: `Initialized from starter pack "${pack.slug}"`,
          },
        ],
      },
    })
    .returning({ id: designProfiles.id });

  await autoGenerateGraph(db, projectId);

  return {
    pack,
    designProfileId: profile.id,
    tokenCount: tokens.length,
    componentCount: recipes.length,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type StarterFrameworkTarget = 'nextjs-tailwind' | 'react-tailwind';

export interface InitProjectWithStarterInput {
  organizationId: string;
  slug: string;
  name?: string;
  starterPackSlug?: string;
  framework?: StarterFrameworkTarget;
}

export interface InitProjectWithStarterResult {
  project: {
    id: string;
    slug: string;
    name: string;
    organizationId: string;
    frameworkTarget: string;
    activeStylePackId: string | null;
  };
  stylePack: { id: string; slug: string; name: string };
  designProfileId: string;
  tokenCount: number;
  componentCount: number;
  created: boolean;
}

/**
 * Create a scratch project with an explicit slug and seed it with a starter
 * style pack, design profile, and graph. Idempotent on (organizationId, slug):
 * if a project with that pair already exists, returns it without touching it.
 *
 * Use from the MCP `init_project` tool and from the `get_project_context`
 * auto-create fallback.
 */
export async function initProjectWithStarter(
  db: Database,
  input: InitProjectWithStarterInput
): Promise<InitProjectWithStarterResult> {
  const starterPackSlug = input.starterPackSlug ?? DEFAULT_STARTER_PACK_SLUG;
  const framework = input.framework ?? 'nextjs-tailwind';
  const name = input.name ?? titleCase(input.slug);

  // Idempotency: if a project with this (org, slug) already exists, return it.
  const [existing] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.organizationId, input.organizationId), eq(projects.slug, input.slug)))
    .limit(1);

  if (existing) {
    // Fetch the pack it's already pointing at (or fall back to the starter)
    let pack: { id: string; slug: string; name: string } | null = null;
    if (existing.activeStylePackId) {
      const [p] = await db
        .select({ id: stylePacks.id, slug: stylePacks.slug, name: stylePacks.name })
        .from(stylePacks)
        .where(eq(stylePacks.id, existing.activeStylePackId))
        .limit(1);
      pack = p ?? null;
    }
    if (!pack) {
      const [p] = await db
        .select({ id: stylePacks.id, slug: stylePacks.slug, name: stylePacks.name })
        .from(stylePacks)
        .where(eq(stylePacks.slug, starterPackSlug))
        .limit(1);
      pack = p ?? { id: '', slug: starterPackSlug, name: starterPackSlug };
    }

    const [profile] = await db
      .select({ id: designProfiles.id })
      .from(designProfiles)
      .where(eq(designProfiles.projectId, existing.id))
      .limit(1);

    const tokens = pack.id
      ? await db
          .select({ id: styleTokens.id })
          .from(styleTokens)
          .where(eq(styleTokens.stylePackId, pack.id))
      : [];
    const recipes = pack.id
      ? await db
          .select({ id: componentRecipes.id })
          .from(componentRecipes)
          .where(eq(componentRecipes.stylePackId, pack.id))
      : [];

    return {
      project: {
        id: existing.id,
        slug: existing.slug,
        name: existing.name,
        organizationId: existing.organizationId,
        frameworkTarget: existing.frameworkTarget,
        activeStylePackId: existing.activeStylePackId,
      },
      stylePack: pack,
      designProfileId: profile?.id ?? '',
      tokenCount: tokens.length,
      componentCount: recipes.length,
      created: false,
    };
  }

  // Fresh insert
  const [project] = await db
    .insert(projects)
    .values({
      organizationId: input.organizationId,
      slug: input.slug,
      name,
      frameworkTarget: framework,
    })
    .returning();

  const seeded = await seedProjectWithStarterPack(db, project.id, starterPackSlug);

  return {
    project: {
      id: project.id,
      slug: project.slug,
      name: project.name,
      organizationId: project.organizationId,
      frameworkTarget: project.frameworkTarget,
      activeStylePackId: seeded.pack.id,
    },
    stylePack: seeded.pack,
    designProfileId: seeded.designProfileId,
    tokenCount: seeded.tokenCount,
    componentCount: seeded.componentCount,
    created: true,
  };
}

/**
 * Name-based counterpart for the web dashboard's "new project" flow.
 * Generates a collision-safe slug from the given name and then seeds with
 * the starter pack. Never idempotent — each call creates a new project.
 */
export async function createProjectWithStarter(
  db: Database,
  input: CreateProjectInput & { starterPackSlug?: string }
): Promise<InitProjectWithStarterResult> {
  const starterPackSlug = input.starterPackSlug ?? DEFAULT_STARTER_PACK_SLUG;

  const baseSlug = generateProjectSlug(input.name);
  // Simple collision handling: append -2, -3, ... scoped to the org.
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const [hit] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.organizationId, input.orgId), eq(projects.slug, slug)))
      .limit(1);
    if (!hit) break;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const [project] = await db
    .insert(projects)
    .values({
      organizationId: input.orgId,
      slug,
      name: input.name,
      description: input.description,
      frameworkTarget: input.frameworkTarget,
    })
    .returning();

  const seeded = await seedProjectWithStarterPack(db, project.id, starterPackSlug);

  return {
    project: {
      id: project.id,
      slug: project.slug,
      name: project.name,
      organizationId: project.organizationId,
      frameworkTarget: project.frameworkTarget,
      activeStylePackId: seeded.pack.id,
    },
    stylePack: seeded.pack,
    designProfileId: seeded.designProfileId,
    tokenCount: seeded.tokenCount,
    componentCount: seeded.componentCount,
    created: true,
  };
}
