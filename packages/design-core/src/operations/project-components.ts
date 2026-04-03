import { eq, inArray } from 'drizzle-orm';
import { projects, componentRecipes, designProfiles } from '../db/schema';
import type { Database } from '../db';

export interface ComponentSelectionItem {
  id: string;
  name: string;
  type: string;
  slug: string;
  stylePackId: string | null;
  previewUrl: string | null;
}

/**
 * Update the selected component recipes for a project.
 * Validates that all IDs exist and stores in the design profile's selectedComponents.
 */
export async function updateComponentSelection(
  db: Database,
  projectId: string,
  recipeIds: string[]
): Promise<ComponentSelectionItem[]> {
  // Verify project exists
  const [project] = await db
    .select({ id: projects.id, activeStylePackId: projects.activeStylePackId })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  // Validate all recipe IDs exist
  if (recipeIds.length > 0) {
    const existing = await db
      .select({ id: componentRecipes.id })
      .from(componentRecipes)
      .where(inArray(componentRecipes.id, recipeIds));

    const existingIds = new Set(existing.map((r) => r.id));
    const invalid = recipeIds.filter((id) => !existingIds.has(id));

    if (invalid.length > 0) {
      throw new InvalidComponentIdsError(invalid);
    }
  }

  // Find or create design profile for the project
  const [profile] = await db
    .select({ id: designProfiles.id })
    .from(designProfiles)
    .where(eq(designProfiles.projectId, projectId))
    .limit(1);

  if (profile) {
    await db
      .update(designProfiles)
      .set({
        selectedComponents: recipeIds,
        updatedAt: new Date(),
      })
      .where(eq(designProfiles.id, profile.id));
  } else {
    await db.insert(designProfiles).values({
      projectId,
      name: 'Default',
      stylePackId: project.activeStylePackId,
      selectedComponents: recipeIds,
    });
  }

  // Return full recipe details
  if (recipeIds.length === 0) return [];

  return db
    .select({
      id: componentRecipes.id,
      name: componentRecipes.name,
      type: componentRecipes.type,
      slug: componentRecipes.slug,
      stylePackId: componentRecipes.stylePackId,
      previewUrl: componentRecipes.previewUrl,
    })
    .from(componentRecipes)
    .where(inArray(componentRecipes.id, recipeIds));
}

/**
 * Get the currently selected component recipes for a project.
 */
export async function getComponentSelection(
  db: Database,
  projectId: string
): Promise<ComponentSelectionItem[]> {
  const [profile] = await db
    .select({ selectedComponents: designProfiles.selectedComponents })
    .from(designProfiles)
    .where(eq(designProfiles.projectId, projectId))
    .limit(1);

  if (!profile) return [];

  const recipeIds = profile.selectedComponents as string[];
  if (!recipeIds || recipeIds.length === 0) return [];

  return db
    .select({
      id: componentRecipes.id,
      name: componentRecipes.name,
      type: componentRecipes.type,
      slug: componentRecipes.slug,
      stylePackId: componentRecipes.stylePackId,
      previewUrl: componentRecipes.previewUrl,
    })
    .from(componentRecipes)
    .where(inArray(componentRecipes.id, recipeIds));
}

export class InvalidComponentIdsError extends Error {
  public invalidIds: string[];
  constructor(ids: string[]) {
    super(`Component recipes not found: ${ids.join(', ')}`);
    this.name = 'InvalidComponentIdsError';
    this.invalidIds = ids;
  }
}
