import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { componentRecipes, projects, designProfiles } from '@aiui/design-core';
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

      // Surface a stale-warning if the design profile of any project using
      // the filtered style pack has been marked invalid by a recent write
      // from the dashboard or another MCP session. Without a stylePackId
      // filter we have no project reference to check, so the warning stays
      // null — callers that care about staleness should supply a filter or
      // use get_project_context / get_theme_tokens.
      let staleWarning: string | null = null;
      if (args.stylePackId) {
        const [proj] = await db
          .select({ id: projects.id })
          .from(projects)
          .where(eq(projects.activeStylePackId, args.stylePackId as string))
          .limit(1);
        if (proj) {
          const [profile] = await db
            .select({ compilationValid: designProfiles.compilationValid })
            .from(designProfiles)
            .where(eq(designProfiles.projectId, proj.id))
            .limit(1);
          if (profile && !profile.compilationValid) {
            staleWarning =
              'Design tokens may have changed since the local .aiui/ files were last synced. Call sync_design_memory to refresh.';
          }
        }
      }

      return { components: recipes, total: recipes.length, staleWarning };
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

      // Surface a stale-warning if any project using this recipe's style
      // pack has been marked invalid. A recipe's stylePackId can be null
      // (org-wide recipes) and multiple projects may share the same pack,
      // so this is best-effort: we check the first matching project.
      let staleWarning: string | null = null;
      if (recipe.stylePackId) {
        const [proj] = await db
          .select({ id: projects.id })
          .from(projects)
          .where(eq(projects.activeStylePackId, recipe.stylePackId))
          .limit(1);
        if (proj) {
          const [profile] = await db
            .select({ compilationValid: designProfiles.compilationValid })
            .from(designProfiles)
            .where(eq(designProfiles.projectId, proj.id))
            .limit(1);
          if (profile && !profile.compilationValid) {
            staleWarning =
              'Design tokens may have changed since the local .aiui/ files were last synced. Call sync_design_memory to refresh.';
          }
        }
      }

      return { ...recipe, staleWarning };
    }
  );
}
