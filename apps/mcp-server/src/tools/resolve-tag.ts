import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { tags, resourceTags, stylePacks, componentRecipes, assets } from '@aiui/design-core';
import { NotFoundError } from '../lib/errors';

export function registerResolveTag(server: AiuiMcpServer) {
  server.registerTool(
    'resolve_tag',
    'Resolve a human-friendly tag name to its associated token values, component recipe IDs, or asset URLs.',
    {
      tagName: z.string().describe('The tag name to resolve (e.g., "soft-card")'),
      projectId: z
        .string()
        .uuid()
        .optional()
        .describe('Optional project ID to scope asset lookups'),
    },
    async (args) => {
      const db = getDb();
      const tagName = args.tagName as string;

      // Find the tag
      const [tag] = await db.select().from(tags).where(eq(tags.name, tagName)).limit(1);

      if (!tag) {
        throw new NotFoundError('Tag', tagName);
      }

      // Find all resource associations
      const associations = await db
        .select()
        .from(resourceTags)
        .where(eq(resourceTags.tagId, tag.id));

      const result: {
        tag: { id: string; name: string; category: string };
        stylePacks: Array<{ id: string; name: string; category: string }>;
        components: Array<{ id: string; name: string; type: string }>;
        assets: Array<{ id: string; name: string; publicUrl: string | null }>;
      } = {
        tag: { id: tag.id, name: tag.name, category: tag.category },
        stylePacks: [],
        components: [],
        assets: [],
      };

      for (const assoc of associations) {
        if (assoc.resourceType === 'style_pack') {
          const [pack] = await db
            .select({ id: stylePacks.id, name: stylePacks.name, category: stylePacks.category })
            .from(stylePacks)
            .where(eq(stylePacks.id, assoc.resourceId))
            .limit(1);
          if (pack) {
            result.stylePacks.push(pack);
          }
        } else if (assoc.resourceType === 'component_recipe') {
          const [recipe] = await db
            .select({
              id: componentRecipes.id,
              name: componentRecipes.name,
              type: componentRecipes.type,
            })
            .from(componentRecipes)
            .where(eq(componentRecipes.id, assoc.resourceId))
            .limit(1);
          if (recipe) {
            result.components.push(recipe);
          }
        } else if (assoc.resourceType === 'asset') {
          const [asset] = await db
            .select({ id: assets.id, name: assets.name, publicUrl: assets.publicUrl })
            .from(assets)
            .where(eq(assets.id, assoc.resourceId))
            .limit(1);
          if (asset) {
            result.assets.push(asset);
          }
        }
      }

      return result;
    }
  );
}
