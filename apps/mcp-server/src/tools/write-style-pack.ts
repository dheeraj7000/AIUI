import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { stylePacks, styleTokens } from '@aiui/design-core';
import { ValidationError } from '../lib/errors';
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

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function registerWriteStylePack(server: AiuiMcpServer) {
  server.registerTool(
    'create_style_pack',
    'Create a new style pack with design tokens. Returns the pack ID and slug.',
    {
      name: z.string().min(1).describe('Name for the style pack'),
      description: z.string().optional().describe('Description of the style pack'),
      category: z.string().optional().describe('Category (e.g., saas, fintech, startup)'),
      tokens: z
        .array(
          z.object({
            key: z.string().describe('Token key (e.g., color-primary)'),
            type: z.string().describe('Token type (color, font, spacing, radius, shadow, etc.)'),
            value: z.string().describe('Token value (e.g., #3b82f6, 16px, 0.5rem)'),
          })
        )
        .describe('Array of design tokens'),
    },
    async (args) => {
      // Enforce write scope if running in authenticated context
      const ctx = getContext();
      if (ctx) {
        requireScope(ctx.scopes, 'mcp:write');
      }

      const db = getDb();
      const name = args.name as string;
      const description = (args.description as string) || '';
      const category = (args.category as string) || 'custom';
      const tokens = args.tokens as Array<{ key: string; type: string; value: string }>;

      // Validate token types
      for (const token of tokens) {
        if (!VALID_TOKEN_TYPES.includes(token.type as (typeof VALID_TOKEN_TYPES)[number])) {
          throw new ValidationError(
            `Invalid token type '${token.type}' for key '${token.key}'. ` +
              `Valid types: ${VALID_TOKEN_TYPES.join(', ')}`
          );
        }
      }

      const slug = generateSlug(name);

      // Check for slug uniqueness
      const [existing] = await db
        .select({ id: stylePacks.id })
        .from(stylePacks)
        .where(eq(stylePacks.slug, slug))
        .limit(1);

      if (existing) {
        throw new ValidationError(`A style pack with slug '${slug}' already exists`);
      }

      // Create pack + tokens in a transaction
      const result = await db.transaction(async (tx) => {
        const [pack] = await tx
          .insert(stylePacks)
          .values({
            name,
            slug,
            description,
            category,
            version: '1.0.0',
            isPublic: false,
          })
          .returning({ id: stylePacks.id, slug: stylePacks.slug });

        if (tokens.length > 0) {
          await tx.insert(styleTokens).values(
            tokens.map((t) => ({
              stylePackId: pack.id,
              tokenKey: t.key,
              tokenType: t.type as TokenType,
              tokenValue: t.value,
            }))
          );
        }

        return pack;
      });

      return {
        id: result.id,
        slug: result.slug,
        tokenCount: tokens.length,
      };
    }
  );
}
