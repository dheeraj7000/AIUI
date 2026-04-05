import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { stylePacks, styleTokens } from '@aiui/design-core';
import { NotFoundError, ValidationError } from '../lib/errors';
import { getContext } from '../lib/context';
import { requireScope } from '../lib/auth';

type TokenType =
  | 'color'
  | 'radius'
  | 'font'
  | 'spacing'
  | 'shadow'
  | 'elevation'
  | 'font-size'
  | 'font-weight'
  | 'line-height'
  | 'letter-spacing'
  | 'breakpoint'
  | 'z-index'
  | 'opacity'
  | 'border-width'
  | 'animation'
  | 'transition';

const VALID_TOKEN_TYPES: TokenType[] = [
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
];

export function registerWriteTokens(server: AiuiMcpServer) {
  server.registerTool(
    'update_tokens',
    'Add, update, or delete design tokens in a style pack. Returns counts of added, modified, and deleted tokens.',
    {
      stylePackId: z.string().uuid().describe('The style pack ID to update tokens in'),
      updates: z
        .array(
          z.object({
            key: z.string().describe('Token key (e.g., color-primary)'),
            value: z.string().optional().describe('New token value'),
            type: z.string().optional().describe('Token type (color, font, spacing, etc.)'),
            delete: z.boolean().optional().describe('Set true to delete this token'),
          })
        )
        .describe('Array of token updates'),
    },
    async (args) => {
      // Enforce write scope if running in authenticated context
      const ctx = getContext();
      if (ctx) {
        requireScope(ctx.scopes, 'mcp:write');
      }

      const db = getDb();
      const stylePackId = args.stylePackId as string;
      const updates = args.updates as Array<{
        key: string;
        value?: string;
        type?: string;
        delete?: boolean;
      }>;

      // Verify the style pack exists
      const [pack] = await db
        .select({ id: stylePacks.id })
        .from(stylePacks)
        .where(eq(stylePacks.id, stylePackId))
        .limit(1);

      if (!pack) {
        throw new NotFoundError('Style pack', stylePackId);
      }

      // Validate token types where provided
      for (const update of updates) {
        if (
          update.type &&
          !VALID_TOKEN_TYPES.includes(update.type as (typeof VALID_TOKEN_TYPES)[number])
        ) {
          throw new ValidationError(
            `Invalid token type '${update.type}' for key '${update.key}'. ` +
              `Valid types: ${VALID_TOKEN_TYPES.join(', ')}`
          );
        }
      }

      // Fetch existing tokens for this pack
      const existingTokens = await db
        .select({
          id: styleTokens.id,
          tokenKey: styleTokens.tokenKey,
          tokenType: styleTokens.tokenType,
          tokenValue: styleTokens.tokenValue,
        })
        .from(styleTokens)
        .where(eq(styleTokens.stylePackId, stylePackId));

      const existingMap = new Map(existingTokens.map((t) => [t.tokenKey, t]));

      let added = 0;
      let modified = 0;
      let deleted = 0;

      await db.transaction(async (tx) => {
        for (const update of updates) {
          const existing = existingMap.get(update.key);

          if (update.delete) {
            // Delete the token
            if (existing) {
              await tx
                .delete(styleTokens)
                .where(
                  and(
                    eq(styleTokens.stylePackId, stylePackId),
                    eq(styleTokens.tokenKey, update.key)
                  )
                );
              deleted++;
            }
          } else if (existing) {
            // Update existing token
            const setValues: Record<string, unknown> = {};
            if (update.value !== undefined) {
              setValues.tokenValue = update.value;
            }
            if (update.type !== undefined) {
              setValues.tokenType = update.type;
            }
            if (Object.keys(setValues).length > 0) {
              setValues.updatedAt = new Date();
              await tx
                .update(styleTokens)
                .set(setValues)
                .where(
                  and(
                    eq(styleTokens.stylePackId, stylePackId),
                    eq(styleTokens.tokenKey, update.key)
                  )
                );
              modified++;
            }
          } else {
            // Insert new token
            if (!update.value) {
              throw new ValidationError(
                `Token '${update.key}' does not exist and no value was provided for creation`
              );
            }
            if (!update.type) {
              throw new ValidationError(
                `Token '${update.key}' does not exist and no type was provided for creation`
              );
            }
            await tx.insert(styleTokens).values({
              stylePackId,
              tokenKey: update.key,
              tokenType: update.type as TokenType,
              tokenValue: update.value,
            });
            added++;
          }
        }
      });

      // Get final token count
      const finalTokens = await db
        .select({ id: styleTokens.id })
        .from(styleTokens)
        .where(eq(styleTokens.stylePackId, stylePackId));

      return {
        added,
        modified,
        deleted,
        total: finalTokens.length,
      };
    }
  );
}
