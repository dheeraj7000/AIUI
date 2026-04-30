import { NextRequest, NextResponse } from 'next/server';
import {
  bulkImportTokens,
  createToken,
  listTokens,
  styleTokens,
  updateToken,
} from '@aiui/design-core';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireProjectAccess } from '@/lib/project-access';

/**
 * Project-scoped style-token CRUD. Used by the Design Studio UI in
 * apps/web/src/app/studio/StudioClient.tsx to read and bulk-edit a
 * project's tokens after the pack/recipe machinery was removed.
 *
 * Authorization is gated by `requireProjectAccess` to keep parity with
 * the other `/api/projects/[id]/*` routes. Never bypass it — that's the
 * patch for the IDOR called out in the recent audit.
 */

const TOKEN_TYPES = ['color', 'radius', 'font', 'spacing', 'shadow', 'elevation'] as const;

const tokenInputSchema = z.object({
  tokenKey: z
    .string()
    .min(1)
    .regex(
      /^[a-z]+\.[a-z][a-zA-Z0-9.-]*$/,
      'Token key must match "type.name" pattern (e.g., color.primary)'
    ),
  tokenType: z.enum(TOKEN_TYPES),
  tokenValue: z.string().min(1),
  description: z.string().max(500).optional(),
});

const putBodySchema = z.object({
  tokens: z.array(tokenInputSchema).min(1).max(500),
});

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]/tokens — List every token for the project.
 * No filtering on the URL: the studio UI groups client-side by `tokenType`.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  try {
    const { data, total } = await listTokens(access.db, id, { tokenType: undefined });
    return NextResponse.json({ data, total });
  } catch (err) {
    console.error('[tokens GET] error', err);
    return NextResponse.json({ error: 'Failed to list tokens' }, { status: 500 });
  }
}

/**
 * PUT /api/projects/[id]/tokens — Bulk upsert tokens.
 *
 * Per token: if a row already exists for `(projectId, tokenKey)` we update
 * its value (and optionally description); otherwise we create it. We don't
 * use `bulkImportTokens` directly because that helper skips existing keys
 * — for the studio we want edit-in-place semantics.
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

  const parsed = putBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    // Pull existing keys once so we don't issue an extra query per token.
    const existing = await access.db
      .select({ id: styleTokens.id, tokenKey: styleTokens.tokenKey })
      .from(styleTokens)
      .where(eq(styleTokens.projectId, id));
    const byKey = new Map(existing.map((t) => [t.tokenKey, t.id]));

    const toCreate = parsed.data.tokens.filter((t) => !byKey.has(t.tokenKey));
    const toUpdate = parsed.data.tokens.filter((t) => byKey.has(t.tokenKey));

    let created = 0;
    let updated = 0;

    for (const t of toUpdate) {
      const tokenId = byKey.get(t.tokenKey)!;
      // updateToken's input only carries value + description — that's
      // exactly what the studio edits, so don't try to mutate type/key.
      const result = await updateToken(access.db, tokenId, id, {
        tokenValue: t.tokenValue,
        description: t.description,
      });
      if (result) updated += 1;
    }

    if (toCreate.length > 0) {
      // Use the bulk helper for inserts — it batches into one INSERT and
      // invalidates compiled profiles in a single sweep.
      const result = await bulkImportTokens(access.db, id, toCreate);
      if ('data' in result && result.data) {
        created = result.data.created;
      }
    }

    // Return the fresh list so the client can re-render without a follow-up GET.
    const fresh = await access.db
      .select()
      .from(styleTokens)
      .where(and(eq(styleTokens.projectId, id)));

    return NextResponse.json({ created, updated, data: fresh });
  } catch (err) {
    console.error('[tokens PUT] error', err);
    return NextResponse.json({ error: 'Failed to save tokens' }, { status: 500 });
  }
}

/**
 * POST /api/projects/[id]/tokens — Create a single token.
 * Convenience for the "add token" inline action in the studio.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = tokenInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const result = await createToken(access.db, id, parsed.data);
  if ('error' in result) {
    const status = result.error === 'duplicate_token_key' ? 409 : 404;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json(result.data, { status: 201 });
}
