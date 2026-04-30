import { eq, and } from 'drizzle-orm';
import { projects, styleTokens, designProfiles } from '../db/schema';
import type { Database } from '../db';
import { generateProjectSlug } from './projects';
import { autoGenerateGraph } from './graph';
import { DEFAULT_PROJECT_TOKENS } from '../db/seed-data/default-tokens';
import type { CreateProjectInput } from '../validation/project';

function titleCase(slug: string): string {
  return slug
    .split('-')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

interface SeedResult {
  designProfileId: string;
  tokenCount: number;
}

/**
 * Seed a freshly created project with the default token set + an empty
 * design profile. Replaces the old "starter style pack" flow that the
 * pre-scope-cut codebase used.
 */
export async function seedProjectWithDefaults(
  db: Database,
  projectId: string
): Promise<SeedResult> {
  const [proj] = await db
    .select({ name: projects.name })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  await db.insert(styleTokens).values(
    DEFAULT_PROJECT_TOKENS.map((t) => ({
      projectId,
      tokenKey: t.tokenKey,
      tokenType: t.tokenType,
      tokenValue: t.tokenValue,
      description: t.description,
    }))
  );

  const profileName = `${proj?.name ?? 'Project'} Design Profile`;

  const [profile] = await db
    .insert(designProfiles)
    .values({
      projectId,
      name: profileName,
      version: 1,
      compilationValid: true,
    })
    .returning({ id: designProfiles.id });

  await autoGenerateGraph(db, projectId);

  return {
    designProfileId: profile.id,
    tokenCount: DEFAULT_PROJECT_TOKENS.length,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type StarterFrameworkTarget = 'nextjs-tailwind' | 'react-tailwind';

export interface InitProjectInput {
  organizationId: string;
  slug: string;
  name?: string;
  framework?: StarterFrameworkTarget;
}

export interface InitProjectResult {
  project: {
    id: string;
    slug: string;
    name: string;
    organizationId: string;
    frameworkTarget: string;
  };
  designProfileId: string;
  tokenCount: number;
  created: boolean;
}

/**
 * Create a scratch project with an explicit slug and seed it with default
 * tokens. Idempotent on (organizationId, slug): if a project already exists,
 * returns it without re-seeding.
 */
export async function initProject(
  db: Database,
  input: InitProjectInput
): Promise<InitProjectResult> {
  const framework = input.framework ?? 'nextjs-tailwind';
  const name = input.name ?? titleCase(input.slug);

  const [existing] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.organizationId, input.organizationId), eq(projects.slug, input.slug)))
    .limit(1);

  if (existing) {
    const [profile] = await db
      .select({ id: designProfiles.id })
      .from(designProfiles)
      .where(eq(designProfiles.projectId, existing.id))
      .limit(1);

    const tokens = await db
      .select({ id: styleTokens.id })
      .from(styleTokens)
      .where(eq(styleTokens.projectId, existing.id));

    return {
      project: {
        id: existing.id,
        slug: existing.slug,
        name: existing.name,
        organizationId: existing.organizationId,
        frameworkTarget: existing.frameworkTarget,
      },
      designProfileId: profile?.id ?? '',
      tokenCount: tokens.length,
      created: false,
    };
  }

  const [project] = await db
    .insert(projects)
    .values({
      organizationId: input.organizationId,
      slug: input.slug,
      name,
      frameworkTarget: framework,
    })
    .returning();

  const seeded = await seedProjectWithDefaults(db, project.id);

  return {
    project: {
      id: project.id,
      slug: project.slug,
      name: project.name,
      organizationId: project.organizationId,
      frameworkTarget: project.frameworkTarget,
    },
    designProfileId: seeded.designProfileId,
    tokenCount: seeded.tokenCount,
    created: true,
  };
}

/**
 * Name-based counterpart for the web dashboard's "new project" flow.
 * Generates a collision-safe slug from the given name.
 */
export async function createProjectWithDefaults(
  db: Database,
  input: CreateProjectInput
): Promise<InitProjectResult> {
  const baseSlug = generateProjectSlug(input.name);
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

  const seeded = await seedProjectWithDefaults(db, project.id);

  return {
    project: {
      id: project.id,
      slug: project.slug,
      name: project.name,
      organizationId: project.organizationId,
      frameworkTarget: project.frameworkTarget,
    },
    designProfileId: seeded.designProfileId,
    tokenCount: seeded.tokenCount,
    created: true,
  };
}
