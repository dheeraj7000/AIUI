import { eq } from 'drizzle-orm';
import { designProfiles } from '../db/schema';
import type { Database } from '../db';
import type { CreateProfileInput, UpdateProfileInput } from '../validation/design-profile';

/**
 * Create a new design profile for a project.
 *
 * After the style-pack/component scope cut, profiles are a thin wrapper
 * over project-scoped tokens — they hold optional voice/tone metadata and
 * arbitrary overrides. Compilation is a no-op (compiledJson is unused).
 */
export async function createProfile(db: Database, data: CreateProfileInput) {
  const [profile] = await db
    .insert(designProfiles)
    .values({
      projectId: data.projectId,
      name: data.name,
      overridesJson: data.overridesJson ?? {},
      version: 1,
    })
    .returning();

  return profile;
}

export async function getProfile(db: Database, id: string) {
  const [profile] = await db.select().from(designProfiles).where(eq(designProfiles.id, id));
  return profile ?? null;
}

export async function listProfiles(db: Database, projectId: string) {
  return db.select().from(designProfiles).where(eq(designProfiles.projectId, projectId));
}

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

export async function deleteProfile(db: Database, id: string) {
  const [deleted] = await db.delete(designProfiles).where(eq(designProfiles.id, id)).returning();
  return deleted ?? null;
}
