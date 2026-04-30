import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { projects, designProfiles, styleTokens, seedProjectWithDefaults } from '@aiui/design-core';
import { getContext } from '../lib/context';
import { requireScope } from '../lib/auth';
import { NotFoundError, ToolError } from '../lib/errors';
import { generateDesignMemory } from './design-memory';

const CLAUDE_MD_SNIPPET =
  '# Design System\n' +
  'This project uses AIUI for design management.\n' +
  'See `.aiui/design-memory.md` for the active design tokens and rules.\n' +
  'Always follow the design memory before building any UI.\n';

export function registerResetProject(server: AiuiMcpServer) {
  server.registerTool(
    'reset_project_to_starter',
    "Reset a project's tokens back to the default seed set, discarding any token edits made via the studio or `update_tokens`. " +
      "Use this as a safety net when a project's tokens have been mangled and you want a clean slate without deleting the project row itself. " +
      'Deletes all project tokens and the existing design profile, re-seeds with the default token set, and returns fresh .aiui/design-memory.md, .aiui/tokens.json, and .aiui/project.json file contents to write back into the repo. ' +
      'Destructive on tokens — any local token customizations will be lost.',
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

      const [project] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.organizationId, ctx.organizationId), eq(projects.slug, slug)))
        .limit(1);

      if (!project) {
        throw new NotFoundError('Project', slug);
      }

      // Wipe tokens + profile so seedProjectWithDefaults starts from a blank slate
      await db.delete(styleTokens).where(eq(styleTokens.projectId, project.id));
      await db.delete(designProfiles).where(eq(designProfiles.projectId, project.id));

      const seeded = await seedProjectWithDefaults(db, project.id);

      const memory = await generateDesignMemory(slug);

      const projectJson = {
        slug: project.slug,
        name: project.name,
        orgId: project.organizationId,
        framework: project.frameworkTarget,
      };

      return {
        status: 'reset',
        message:
          `Reset project "${project.name}" to default tokens (${seeded.tokenCount} tokens). ` +
          `Previous tokens and design profile have been discarded.`,
        project: {
          id: project.id,
          slug: project.slug,
          name: project.name,
          organizationId: project.organizationId,
          frameworkTarget: project.frameworkTarget,
        },
        tokenCount: seeded.tokenCount,
        files: [
          { path: `${targetDir}/.aiui/design-memory.md`, content: memory.markdown },
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
          'After this, use `update_tokens` to customize tokens and `sync_design_memory` to refresh memory files.',
        meta: memory.meta,
      };
    }
  );
}
