import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { projects, styleTokens, designProfiles } from '@aiui/design-core';
import { NotFoundError, ValidationError, ToolError } from '../lib/errors';
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

type TokenType = (typeof VALID_TOKEN_TYPES)[number];

export function registerPromotePattern(server: AiuiMcpServer) {
  server.registerTool(
    'promote_pattern',
    'Promote a recurring hardcoded value into a project-scoped design token. ' +
      "This is the EXECUTABLE follow-up to `suggest_pattern_promotion`: when you've used the same hex / spacing / radius value multiple times across components, call this tool to commit it as a real token. " +
      'Inserts the token under the project, marks the design profile stale so the next `sync_design_memory` regenerates `.aiui/design-memory.md` and `.aiui/tokens.json` with the new token included. ' +
      'After promotion, refactor your future code to use the new token name (call `update_tokens` if you need to edit it later). ' +
      'Idempotent on (projectSlug, tokenKey): if the token already exists, returns the existing row without overwriting.',
    {
      projectSlug: z.string().min(1).describe('Slug of the project to add the token to.'),
      tokenKey: z
        .string()
        .min(1)
        .regex(
          /^[a-z]+(?:[.-][a-z0-9]+)*$/i,
          'Token key should be dot- or hyphen-separated (e.g. "color.brand.warm" or "spacing-md")'
        )
        .describe('Semantic name for the new token (e.g. "color.brand.warm", "spacing.card-gap").'),
      tokenType: z
        .enum([...VALID_TOKEN_TYPES])
        .describe('The token category. Must match the value shape (color/spacing/radius/etc.).'),
      tokenValue: z
        .string()
        .min(1)
        .describe('The hardcoded value being promoted (e.g. "#FF5733", "20px", "0.875rem").'),
      description: z
        .string()
        .max(500)
        .optional()
        .describe('Optional one-line context: where you noticed this pattern.'),
    },
    async (args) => {
      const ctx = getContext();
      if (ctx) {
        requireScope(ctx.scopes, 'mcp:write');
      }
      if (!ctx?.organizationId) {
        throw new ToolError(
          'promote_pattern requires an authenticated MCP context with an organizationId.',
          'FORBIDDEN'
        );
      }

      const db = getDb();
      const projectSlug = args.projectSlug as string;
      const tokenKey = args.tokenKey as string;
      const tokenType = args.tokenType as TokenType;
      const tokenValue = args.tokenValue as string;
      const description = args.description as string | undefined;

      // Look up the project, scoped to the caller's organization
      const [project] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.organizationId, ctx.organizationId), eq(projects.slug, projectSlug)))
        .limit(1);

      if (!project) {
        throw new NotFoundError('Project', projectSlug);
      }

      // Idempotency: if the token already exists with this key, return it
      const [existing] = await db
        .select()
        .from(styleTokens)
        .where(and(eq(styleTokens.projectId, project.id), eq(styleTokens.tokenKey, tokenKey)))
        .limit(1);

      if (existing) {
        return {
          status: 'already_promoted',
          message: `Token "${tokenKey}" already exists on project "${projectSlug}". No changes made.`,
          token: {
            id: existing.id,
            key: existing.tokenKey,
            type: existing.tokenType,
            value: existing.tokenValue,
            description: existing.description,
          },
          nextStep:
            'Use `update_tokens` if you need to change the value, or `sync_design_memory` if your local .aiui/ files are stale.',
        };
      }

      // Insert the new token
      let inserted;
      try {
        [inserted] = await db
          .insert(styleTokens)
          .values({
            projectId: project.id,
            tokenKey,
            tokenType,
            tokenValue,
            description,
          })
          .returning();
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('style_tokens_project_key_idx')) {
          throw new ValidationError(`Token key "${tokenKey}" is already taken on this project.`);
        }
        throw err;
      }

      // Mark the project's design profile as needing re-sync so the next
      // `sync_design_memory` call regenerates the .aiui/ files with this token
      await db
        .update(designProfiles)
        .set({ compilationValid: false, updatedAt: new Date() })
        .where(eq(designProfiles.projectId, project.id));

      return {
        status: 'promoted',
        message:
          `Promoted "${tokenValue}" to ${tokenType} token \`${tokenKey}\` on project "${projectSlug}". ` +
          `The design profile has been marked stale.`,
        token: {
          id: inserted.id,
          key: inserted.tokenKey,
          type: inserted.tokenType,
          value: inserted.tokenValue,
          description: inserted.description,
        },
        nextStep:
          'Call `sync_design_memory` to regenerate .aiui/design-memory.md and .aiui/tokens.json so your AI editor sees the new token. Then refactor any remaining hardcoded uses to reference `' +
          tokenKey +
          '`.',
      };
    }
  );
}
