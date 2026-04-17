import { NextRequest, NextResponse } from 'next/server';
import { projects } from '@aiui/design-core';
import type { StudioDraft } from '@aiui/design-core/src/db/schema/projects';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireProjectAccess } from '@/lib/project-access';

/**
 * Server-side persistence for the Design Studio wizard. See
 * apps/web/src/app/studio/StudioClient.tsx for the client that reads/writes
 * this draft. Draft is project-scoped — keep auth gated by
 * requireProjectAccess so the IDOR fixed in the recent audit does not
 * reopen here. Never return or accept the raw row — only the draft payload.
 */

const draftSchema = z.object({
  packId: z.string().uuid().optional().nullable(),
  selectedComponentIds: z.array(z.string().uuid()).max(500).optional(),
  tokenOverrides: z.record(z.string(), z.string()).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]/studio-draft — Return the saved draft or 404.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  try {
    const [row] = await access.db
      .select({ studioDraft: projects.studioDraft })
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!row || !row.studioDraft) {
      return NextResponse.json({ error: 'No draft' }, { status: 404 });
    }

    return NextResponse.json(row.studioDraft);
  } catch (err) {
    console.error('[studio-draft GET] error', err);
    return NextResponse.json({ error: 'Failed to read draft' }, { status: 500 });
  }
}

/**
 * PUT /api/projects/[id]/studio-draft — Upsert the draft. Replaces whatever
 * is stored; the server stamps `updatedAt` so clients cannot forge it.
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = draftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const draft: StudioDraft = {
    // `packId: null` from the client means "cleared" — drop the key.
    ...(parsed.data.packId ? { packId: parsed.data.packId } : {}),
    ...(parsed.data.selectedComponentIds
      ? { selectedComponentIds: parsed.data.selectedComponentIds }
      : {}),
    ...(parsed.data.tokenOverrides ? { tokenOverrides: parsed.data.tokenOverrides } : {}),
    updatedAt: new Date().toISOString(),
  };

  try {
    await access.db.update(projects).set({ studioDraft: draft }).where(eq(projects.id, id));
    return NextResponse.json(draft);
  } catch (err) {
    console.error('[studio-draft PUT] error', err);
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[id]/studio-draft — Clear the saved draft.
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  try {
    await access.db.update(projects).set({ studioDraft: null }).where(eq(projects.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[studio-draft DELETE] error', err);
    return NextResponse.json({ error: 'Failed to clear draft' }, { status: 500 });
  }
}
