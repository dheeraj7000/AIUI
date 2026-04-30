import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, and, count } from 'drizzle-orm';
import { styleTokens, designProfiles } from '@aiui/design-core';
import { authenticateLlmRequest, isAuthError, getDb } from '../lib/auth';

const TOKEN_TYPES = [
  'color',
  'radius',
  'font',
  'spacing',
  'shadow',
  'elevation',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'breakpoint',
  'z-index',
  'opacity',
  'border-width',
  'animation',
  'transition',
] as const;

const tokenInputSchema = z.object({
  tokenKey: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z]+(?:[.-][a-z0-9]+)*$/i, 'Token key must be dot-/hyphen-separated lowercase'),
  tokenType: z.enum(TOKEN_TYPES),
  tokenValue: z.string().min(1).max(2000),
  description: z.string().max(500).optional(),
});

const bodySchema = z.object({
  tokens: z.array(tokenInputSchema).min(1).max(500),
  mode: z.enum(['merge', 'replace']).optional(),
  source: z
    .object({
      scannedAt: z.string(),
      filesScanned: z.number().optional(),
      coverageEstimate: z.number().optional(),
    })
    .optional(),
});

/**
 * POST /llm/adopt?project=<slug>
 *
 * Bulk-import design tokens detected by `aiui adopt` (or any external
 * pipeline). Takes the same auth as the rest of `/llm/*` — Bearer API key.
 *
 * Modes:
 *   merge   — skip token keys that already exist (default)
 *   replace — overwrite values for existing keys
 *
 * Always marks the project's design profile stale so the next
 * `sync_design_memory` call regenerates `.aiui/design-memory.md` with the
 * new tokens included.
 */
export async function POST(req: NextRequest) {
  const projectSlug = req.nextUrl.searchParams.get('project');
  if (!projectSlug) {
    return NextResponse.json({ error: 'project query parameter is required' }, { status: 400 });
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request body' },
      { status: 400 }
    );
  }

  const db = getDb();
  const auth = await authenticateLlmRequest(req, db, projectSlug);
  if (isAuthError(auth)) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { project } = auth;
  const mode = parsed.mode ?? 'merge';

  // Read existing keys once
  const existing = await db
    .select({ id: styleTokens.id, tokenKey: styleTokens.tokenKey })
    .from(styleTokens)
    .where(eq(styleTokens.projectId, project.id));
  const existingByKey = new Map(existing.map((t) => [t.tokenKey, t.id]));

  let promoted = 0;
  let skipped = 0;
  let updated = 0;
  const errors: Array<{ key: string; reason: string }> = [];

  await db.transaction(async (tx) => {
    for (const t of parsed.tokens) {
      const existingId = existingByKey.get(t.tokenKey);

      if (existingId) {
        if (mode === 'merge') {
          skipped++;
          continue;
        }
        // mode === 'replace'
        try {
          await tx
            .update(styleTokens)
            .set({
              tokenType: t.tokenType,
              tokenValue: t.tokenValue,
              description: t.description,
              updatedAt: new Date(),
            })
            .where(
              and(eq(styleTokens.projectId, project.id), eq(styleTokens.tokenKey, t.tokenKey))
            );
          updated++;
        } catch (err) {
          errors.push({
            key: t.tokenKey,
            reason: err instanceof Error ? err.message : 'update failed',
          });
        }
        continue;
      }

      try {
        await tx.insert(styleTokens).values({
          projectId: project.id,
          tokenKey: t.tokenKey,
          tokenType: t.tokenType,
          tokenValue: t.tokenValue,
          description: t.description,
        });
        promoted++;
      } catch (err) {
        errors.push({
          key: t.tokenKey,
          reason: err instanceof Error ? err.message : 'insert failed',
        });
      }
    }

    if (promoted > 0 || updated > 0) {
      await tx
        .update(designProfiles)
        .set({ compilationValid: false, updatedAt: new Date() })
        .where(eq(designProfiles.projectId, project.id));
    }
  });

  const [{ total } = { total: 0 }] = await db
    .select({ total: count() })
    .from(styleTokens)
    .where(eq(styleTokens.projectId, project.id));

  return NextResponse.json({
    promoted,
    skipped,
    updated,
    errors,
    totalTokens: total,
  });
}
