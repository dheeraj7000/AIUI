import { eq } from 'drizzle-orm';
import { designProfiles } from '../db/schema';
import type { Database } from '../db';
import type { CreateProfileInput, UpdateProfileInput } from '../validation/design-profile';
import { compileProfile as runCompiler } from '../compiler/profile-compiler';

/**
 * Create a new design profile with version 1.
 */
export async function createProfile(db: Database, data: CreateProfileInput) {
  const [profile] = await db
    .insert(designProfiles)
    .values({
      projectId: data.projectId,
      name: data.name,
      stylePackId: data.stylePackId,
      overridesJson: data.overridesJson ?? {},
      selectedComponents: data.selectedComponents,
      version: 1,
    })
    .returning();

  return profile;
}

/**
 * Fetch a single design profile by ID.
 */
export async function getProfile(db: Database, id: string) {
  const [profile] = await db.select().from(designProfiles).where(eq(designProfiles.id, id));

  return profile ?? null;
}

/**
 * List design profiles for a project.
 */
export async function listProfiles(db: Database, projectId: string) {
  return db.select().from(designProfiles).where(eq(designProfiles.projectId, projectId));
}

/**
 * Update a design profile's selections.
 */
export async function updateProfile(db: Database, id: string, data: UpdateProfileInput) {
  const [updated] = await db
    .update(designProfiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(designProfiles.id, id))
    .returning();

  return updated ?? null;
}

/**
 * Delete a design profile by ID.
 */
export async function deleteProfile(db: Database, id: string) {
  const [deleted] = await db.delete(designProfiles).where(eq(designProfiles.id, id)).returning();

  return deleted ?? null;
}

/**
 * Compile a design profile: run the compiler and store the result.
 * Increments the version number on each compilation.
 */
export async function compileDesignProfile(db: Database, id: string) {
  const profile = await getProfile(db, id);
  if (!profile) return null;

  if (!profile.stylePackId) {
    throw new Error('Profile has no style pack assigned');
  }

  const overrides = (profile.overridesJson ?? {}) as Record<string, string>;
  const componentIds = (profile.selectedComponents ?? []) as string[];

  const compiled = await runCompiler(
    db,
    profile.stylePackId,
    componentIds,
    overrides,
    profile.version
  );

  const [updated] = await db
    .update(designProfiles)
    .set({
      compiledJson: compiled,
      version: compiled.version,
      compiledHash: compiled.compiledHash,
      tokensHash: compiled.tokensHash,
      lastCompiledAt: new Date(),
      compilationValid: true,
      updatedAt: new Date(),
    })
    .where(eq(designProfiles.id, id))
    .returning();

  return updated;
}
