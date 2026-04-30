import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { projects, styleTokens, designProfiles } from '@aiui/design-core';
import { NotFoundError, ToolError } from '../lib/errors';
import { getContext } from '../lib/context';
import { requireScope } from '../lib/auth';

const VALID_TOKEN_TYPES = [
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

export function registerAdoptCodebase(server: AiuiMcpServer) {
  server.registerTool(
    'adopt_codebase',
    'Bring an EXISTING codebase under AIUI management in a single call. ' +
      "When the user is starting from a real app (not a fresh repo), use this instead of `init_project` + per-pattern `promote_pattern` calls — pass the design tokens you've already extracted from their code (via your own scan, or by asking them to run `aiui audit`) and this tool inserts them in bulk. " +
      'Modes: `merge` (default — skip token keys that already exist) or `replace` (overwrite values). Returns counts and marks the design profile stale so the next `sync_design_memory` regenerates `.aiui/design-memory.md` with the new tokens. ' +
      'After calling: tell the user to run `sync_design_memory` and then `validate_ui_output` on a recent file to confirm coverage. If a lot of tokens were promoted, also suggest `aiui validate` in their terminal to see the codebase-wide compliance score.',
    {
      projectSlug: z.string().min(1).describe('Slug of the project to ingest tokens into.'),
      tokens: z
        .array(
          z.object({
            tokenKey: z
              .string()
              .min(1)
              .regex(
                /^[a-z]+(?:[.-][a-z0-9]+)*$/i,
                'Token key must be dot- or hyphen-separated lowercase'
              ),
            tokenType: z.enum([...VALID_TOKEN_TYPES]),
            tokenValue: z.string().min(1),
            description: z.string().max(500).optional(),
          })
        )
        .min(1)
        .max(500)
        .describe('Tokens to ingest. Each one becomes a project-scoped style_token row.'),
      mode: z
        .enum(['merge', 'replace'])
        .optional()
        .describe('"merge" (default) skips existing keys. "replace" overwrites their values.'),
    },
    async (args) => {
      const ctx = getContext();
      if (ctx) {
        requireScope(ctx.scopes, 'mcp:write');
      }
      if (!ctx?.organizationId) {
        throw new ToolError(
          'adopt_codebase requires an authenticated MCP context with an organizationId.',
          'FORBIDDEN'
        );
      }

      const db = getDb();
      const projectSlug = args.projectSlug as string;
      const tokens = args.tokens as Array<{
        tokenKey: string;
        tokenType: (typeof VALID_TOKEN_TYPES)[number];
        tokenValue: string;
        description?: string;
      }>;
      const mode = (args.mode as 'merge' | 'replace' | undefined) ?? 'merge';

      const [project] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.organizationId, ctx.organizationId), eq(projects.slug, projectSlug)))
        .limit(1);

      if (!project) {
        throw new NotFoundError('Project', projectSlug);
      }

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
        for (const t of tokens) {
          const existingId = existingByKey.get(t.tokenKey);

          if (existingId) {
            if (mode === 'merge') {
              skipped++;
              continue;
            }
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

      return {
        status: 'adopted',
        message:
          `Adopted ${promoted} new token(s) onto project "${projectSlug}". ` +
          (updated > 0 ? `Updated ${updated} existing. ` : '') +
          (skipped > 0 ? `Skipped ${skipped} already-present. ` : '') +
          'Design profile marked stale.',
        promoted,
        updated,
        skipped,
        errors,
        nextStep:
          'Call `sync_design_memory` so .aiui/design-memory.md and .aiui/tokens.json reflect the new tokens. ' +
          'Then call `validate_ui_output` on a recent file to confirm coverage went up.',
      };
    }
  );
}
