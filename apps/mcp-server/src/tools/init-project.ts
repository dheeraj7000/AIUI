import { z } from 'zod';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { initProject } from '@aiui/design-core';
import { getContext } from '../lib/context';
import { requireScope } from '../lib/auth';
import { ToolError } from '../lib/errors';
import { generateDesignMemory } from './design-memory';

const CLAUDE_MD_SNIPPET =
  '# Design System\n' +
  'This project uses AIUI for design management.\n' +
  'See `.aiui/design-memory.md` for the active design tokens and rules.\n' +
  'Always follow the design memory before building any UI.\n';

export function registerInitProject(server: AiuiMcpServer) {
  server.registerTool(
    'init_project',
    'Bootstrap a brand-new project from scratch with a default token set, design profile, and complete design memory files. ' +
      'Use this as the FIRST call on any fresh or empty repo — there is no need to import tokens or pre-create anything in the dashboard. ' +
      'Creates a dashboard-visible project in your active organization, seeds it with a small default token set (color, typography, spacing, radius), and writes .aiui/design-memory.md, .aiui/tokens.json, and .aiui/project.json into the target directory. ' +
      'Idempotent: calling it twice with the same slug returns the existing project untouched.',
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
        .describe('Display name shown in the dashboard. Defaults to a title-cased slug.'),
      framework: z
        .enum(['nextjs-tailwind', 'react-tailwind'])
        .optional()
        .describe('Target framework for generated code. Defaults to "nextjs-tailwind".'),
    },
    async (args) => {
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
      const framework = args.framework as 'nextjs-tailwind' | 'react-tailwind' | undefined;

      const result = await initProject(db, {
        organizationId: ctx.organizationId,
        slug,
        name,
        framework,
      });

      const memory = await generateDesignMemory(slug);

      const projectJson = {
        slug: result.project.slug,
        name: result.project.name,
        orgId: result.project.organizationId,
        framework: result.project.frameworkTarget,
      };

      return {
        status: result.created ? 'initialized' : 'already_exists',
        message: result.created
          ? `Created project "${result.project.name}" seeded with ${result.tokenCount} default tokens.`
          : `Project "${result.project.slug}" already exists in this organization — returning existing state without any changes.`,
        project: result.project,
        tokenCount: result.tokenCount,
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
          'Write every file in the "files" array to the specified absolute path. ' +
          'Then append "claudeMdSnippet" content to the project\'s CLAUDE.md (creating it if needed). ' +
          'After this, use `update_tokens` to edit design tokens and `sync_design_memory` to refresh memory files after edits.',
        meta: memory.meta,
      };
    }
  );
}
