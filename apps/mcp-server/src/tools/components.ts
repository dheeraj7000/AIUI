import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { componentRecipes } from '@aiui/design-core';
import { NotFoundError } from '../lib/errors';

export function registerComponentTools(server: AiuiMcpServer) {
  server.registerTool(
    'list_components',
    'List all available component recipes with summary metadata. Optionally filter by style pack compatibility.',
    {
      stylePackId: z.string().uuid().optional().describe('Filter by compatible style pack ID'),
    },
    async (args) => {
      const db = getDb();
      let query = db
        .select({
          id: componentRecipes.id,
          name: componentRecipes.name,
          slug: componentRecipes.slug,
          type: componentRecipes.type,
          stylePackId: componentRecipes.stylePackId,
          previewUrl: componentRecipes.previewUrl,
        })
        .from(componentRecipes);

      if (args.stylePackId) {
        query = query.where(
          eq(componentRecipes.stylePackId, args.stylePackId as string)
        ) as typeof query;
      }

      const recipes = await query;
      return { components: recipes, total: recipes.length };
    }
  );

  server.registerTool(
    'get_component_recipe',
    'Get the full recipe for a component including code template, JSON schema, slots, and AI usage rules.',
    {
      recipeId: z.string().uuid().describe('The component recipe ID'),
    },
    async (args) => {
      const db = getDb();
      const [recipe] = await db
        .select()
        .from(componentRecipes)
        .where(eq(componentRecipes.id, args.recipeId as string))
        .limit(1);

      if (!recipe) {
        throw new NotFoundError('Component recipe', args.recipeId as string);
      }

      return recipe;
    }
  );
}
