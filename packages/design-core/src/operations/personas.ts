import { eq, and, asc } from 'drizzle-orm';
import { personas } from '../db/schema';
import type { Database } from '../db';
import type { CreatePersonaInput, UpdatePersonaInput } from '../validation/persona';

/**
 * Reusable persona CRUD. Each project can carry multiple personas
 * (e.g. "free user", "paid admin", "novice", "power user"); one is
 * marked `isDefault = true` and used as the fallback for
 * `critique_for_persona` calls that don't pass an explicit personaId.
 */

export async function createPersona(db: Database, projectId: string, data: CreatePersonaInput) {
  // If this persona is being marked default, clear any previous default
  // for the project so there's only one.
  if (data.isDefault) {
    await db
      .update(personas)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(and(eq(personas.projectId, projectId), eq(personas.isDefault, true)));
  }

  try {
    const [created] = await db
      .insert(personas)
      .values({
        projectId,
        name: data.name,
        audience: data.audience,
        jobToBeDone: data.jobToBeDone,
        emotionalState: data.emotionalState,
        emotionAfterUse: data.emotionAfterUse,
        brandPersonality: data.brandPersonality,
        antiReferences: data.antiReferences,
        constraints: data.constraints,
        isDefault: data.isDefault ?? false,
      })
      .returning();
    return { data: created };
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('personas_project_name_idx')) {
      return { error: 'duplicate_persona_name' as const };
    }
    throw err;
  }
}

export async function listPersonas(db: Database, projectId: string) {
  const rows = await db
    .select()
    .from(personas)
    .where(eq(personas.projectId, projectId))
    .orderBy(asc(personas.name));
  return rows;
}

export async function getPersona(db: Database, personaId: string, projectId: string) {
  const [row] = await db
    .select()
    .from(personas)
    .where(and(eq(personas.id, personaId), eq(personas.projectId, projectId)))
    .limit(1);
  return row ?? null;
}

export async function getDefaultPersona(db: Database, projectId: string) {
  const [row] = await db
    .select()
    .from(personas)
    .where(and(eq(personas.projectId, projectId), eq(personas.isDefault, true)))
    .limit(1);
  return row ?? null;
}

export async function updatePersona(
  db: Database,
  personaId: string,
  projectId: string,
  data: UpdatePersonaInput
) {
  if (data.isDefault) {
    await db
      .update(personas)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(and(eq(personas.projectId, projectId), eq(personas.isDefault, true)));
  }

  const [updated] = await db
    .update(personas)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(personas.id, personaId), eq(personas.projectId, projectId)))
    .returning();
  return updated ?? null;
}

export async function deletePersona(db: Database, personaId: string, projectId: string) {
  const [deleted] = await db
    .delete(personas)
    .where(and(eq(personas.id, personaId), eq(personas.projectId, projectId)))
    .returning();
  return deleted ?? null;
}
