import { z } from 'zod';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { initProjectWithStarter, DEFAULT_STARTER_PACK_SLUG } from '@aiui/design-core';
import { getContext } from '../lib/context';
import { requireScope } from '../lib/auth';
import { ToolError } from '../lib/errors';
import { generateDesignMemory } from './design-memory';

const CLAUDE_MD_SNIPPET =
  '# Design System\n' +
  'This project uses AIUI for design management.\n' +
  'See `.aiui/design-memory.md` for the active design system — tokens, components, and rules.\n' +
  'Always follow the design rules defined there before building any UI.\n';

export function registerInitProject(server: AiuiMcpServer) {
  server.registerTool(
    'init_project',
    'Bootstrap a brand-new project from scratch with a starter style pack, design profile, and complete design memory files. ' +
      'Use this as the FIRST call on any fresh or empty repo — there is no need to import tokens, pick a style pack, or pre-create anything in the dashboard beforehand. ' +
      'Creates a dashboard-visible project in your active organization, seeds it with the shadcn/ui Essentials starter pack (or whichever pack you pass), and writes .aiui/design-memory.md, .aiui/tokens.json, and .aiui/project.json into the target directory. ' +
      'Idempotent: calling it twice with the same slug in the same org returns the existing project untouched — no overwrite.',
    {
      slug: z
        .string()
        .min(1)
        .regex(
          /^[a-z0-9][a-z0-9-]*$/,
          'Slug must be lowercase alphanumeric with hyphens (e.g. "my-app")'
        )
        .describe('URL-safe project slug. Must be unique within your organization.'),
      targetDir: z
        .string()
        .describe(
          'Absolute path to the project root directory where the .aiui/ folder will be created.'
        ),
      name: z
        .string()
        .optional()
        .describe(
          'Display name shown in the dashboard. Defaults to a title-cased version of the slug.'
        ),
      starterPack: z
        .string()
        .optional()
        .describe(
          `Starter style pack slug to seed the project with. Defaults to "${DEFAULT_STARTER_PACK_SLUG}".`
        ),
      framework: z
        .enum(['nextjs-tailwind', 'react-tailwind'])
        .optional()
        .describe('Target framework for generated code. Defaults to "nextjs-tailwind".'),
    },
    async (args) => {
      // Require write scope and an authenticated org context
      const ctx = getContext();
      if (ctx) {
        requireScope(ctx.scopes, 'mcp:write');
      }
      if (!ctx?.organizationId) {
        throw new ToolError(
          'init_project requires an authenticated MCP context with an organizationId. ' +
            'Sign in and configure your MCP client with an API key that has mcp:write scope.',
          'FORBIDDEN'
        );
      }

      const db = getDb();
      const slug = args.slug as string;
      const targetDir = args.targetDir as string;
      const name = args.name as string | undefined;
      const starterPack = (args.starterPack as string | undefined) ?? DEFAULT_STARTER_PACK_SLUG;
      const framework = args.framework as 'nextjs-tailwind' | 'react-tailwind' | undefined;

      const result = await initProjectWithStarter(db, {
        organizationId: ctx.organizationId,
        slug,
        name,
        starterPackSlug: starterPack,
        framework,
      });

      // Generate the memory files from the freshly-seeded DB state
      const memory = await generateDesignMemory(slug);

      const projectJson = {
        slug: result.project.slug,
        name: result.project.name,
        orgId: result.project.organizationId,
        stylePack: result.stylePack.slug,
        framework: result.project.frameworkTarget,
      };

      return {
        status: result.created ? 'initialized' : 'already_exists',
        message: result.created
          ? `Created project "${result.project.name}" seeded with ${result.stylePack.name} (${result.tokenCount} tokens, ${result.componentCount} components).`
          : `Project "${result.project.slug}" already exists in this organization — returning existing state without any changes.`,
        project: result.project,
        stylePack: result.stylePack,
        tokenCount: result.tokenCount,
        componentCount: result.componentCount,
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
          'Write every file in the "files" array to the specified absolute path. ' +
          'Then append the "claudeMdSnippet" content to the project\'s CLAUDE.md (creating it if needed). ' +
          'After this, use `sync_design_memory` to re-sync after any token or component changes, ' +
          '`update_tokens` to edit design tokens, and `apply_style_pack` to switch to a different pack later.',
        meta: memory.meta,
      };
    }
  );
}
