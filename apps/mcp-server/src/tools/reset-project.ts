import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import {
  projects,
  designProfiles,
  seedProjectWithStarterPack,
  DEFAULT_STARTER_PACK_SLUG,
} from '@aiui/design-core';
import { getContext } from '../lib/context';
import { requireScope } from '../lib/auth';
import { NotFoundError, ToolError } from '../lib/errors';
import { generateDesignMemory } from './design-memory';

const CLAUDE_MD_SNIPPET =
  '# Design System\n' +
  'This project uses AIUI for design management.\n' +
  'See `.aiui/design-memory.md` for the active design system — tokens, components, and rules.\n' +
  'Always follow the design rules defined there before building any UI.\n';

export function registerResetProject(server: AiuiMcpServer) {
  server.registerTool(
    'reset_project_to_starter',
    'Reset a project back to a freshly-seeded starter pack state, discarding the active-pack selection and selected-component customizations on its design profile. ' +
      "Use this as a safety net when a project's design configuration has been mangled and you want a clean slate without deleting the project row or its private style packs. " +
      'Deletes the existing design profile, re-runs the starter seed (defaults to shadcn-essentials-v4), and returns fresh .aiui/design-memory.md, .aiui/tokens.json, and .aiui/project.json file contents to write back into the repo. ' +
      'Destructive on the design profile — any unsaved profile customizations will be lost.',
    {
      slug: z
        .string()
        .min(1)
        .describe('Project slug to reset. Must exist in your active organization.'),
      targetDir: z
        .string()
        .describe(
          'Absolute path to the project root directory where the refreshed .aiui/ files will be written.'
        ),
      starterPack: z
        .string()
        .optional()
        .describe(
          `Starter style pack slug to re-seed the project with. Defaults to "${DEFAULT_STARTER_PACK_SLUG}".`
        ),
    },
    async (args) => {
      const ctx = getContext();
      if (ctx) {
        requireScope(ctx.scopes, 'mcp:write');
      }
      if (!ctx?.organizationId) {
        throw new ToolError(
          'reset_project_to_starter requires an authenticated MCP context with an organizationId. ' +
            'Sign in and configure your MCP client with an API key that has mcp:write scope.',
          'FORBIDDEN'
        );
      }

      const db = getDb();
      const slug = args.slug as string;
      const targetDir = args.targetDir as string;
      const starterPackSlug = (args.starterPack as string | undefined) ?? DEFAULT_STARTER_PACK_SLUG;

      // Look up the project scoped to the caller's organization
      const [project] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.organizationId, ctx.organizationId), eq(projects.slug, slug)))
        .limit(1);

      if (!project) {
        throw new NotFoundError('Project', slug);
      }

      // Nuke the existing design profile row(s) for this project
      await db.delete(designProfiles).where(eq(designProfiles.projectId, project.id));

      // Clear activeStylePackId so seedProjectWithStarterPack starts from a blank slate
      await db
        .update(projects)
        .set({ activeStylePackId: null, updatedAt: new Date() })
        .where(eq(projects.id, project.id));

      // Re-seed with the starter pack (sets activeStylePackId, inserts a fresh profile,
      // and regenerates the graph)
      const seeded = await seedProjectWithStarterPack(db, project.id, starterPackSlug);

      // Fetch the refreshed project row so the response carries the new activeStylePackId
      const [refreshed] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, project.id))
        .limit(1);

      // Generate fresh memory files from the re-seeded DB state
      const memory = await generateDesignMemory(slug);

      const projectJson = {
        slug: refreshed.slug,
        name: refreshed.name,
        orgId: refreshed.organizationId,
        stylePack: seeded.pack.slug,
        framework: refreshed.frameworkTarget,
      };

      return {
        status: 'reset',
        message:
          `Reset project "${refreshed.name}" to starter pack "${seeded.pack.name}" ` +
          `(${seeded.tokenCount} tokens, ${seeded.componentCount} components). ` +
          `Previous design profile and component selections have been discarded.`,
        project: {
          id: refreshed.id,
          slug: refreshed.slug,
          name: refreshed.name,
          organizationId: refreshed.organizationId,
          frameworkTarget: refreshed.frameworkTarget,
          activeStylePackId: refreshed.activeStylePackId,
        },
        stylePack: seeded.pack,
        tokenCount: seeded.tokenCount,
        componentCount: seeded.componentCount,
        files: [
          {
            path: `${targetDir}/.aiui/design-memory.md`,
            content: memory.markdown,
          },
          {
            path: `${targetDir}/.aiui/tokens.json`,
            content: JSON.stringify(memory.tokensJson, null, 2),
          },
          {
            path: `${targetDir}/.aiui/project.json`,
            content: JSON.stringify(projectJson, null, 2),
          },
        ],
        claudeMdSnippet: CLAUDE_MD_SNIPPET,
        instructions:
          'Overwrite every file in the "files" array at the specified absolute path. ' +
          'If CLAUDE.md lacks the design system snippet, append "claudeMdSnippet" to it. ' +
          'After this, use `sync_design_memory` to keep memory files fresh, ' +
          '`update_tokens` to edit design tokens, and `apply_style_pack` to switch packs again.',
        meta: memory.meta,
      };
    }
  );
}
