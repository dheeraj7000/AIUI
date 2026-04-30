import { z } from 'zod';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { NotFoundError } from '../lib/errors';
import { projects } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import { getContext } from '../lib/context';
import { evaluateColorPalette } from './evaluators/color-palette';
import { loadProjectTokens } from './evaluators/core';

export function registerEvaluateColorPalette(server: AiuiMcpServer) {
  server.registerTool(
    'evaluate_color_palette',
    "Project-aware color palette evaluation. Scores how well a snippet's color usage aligns with THIS project's color tokens — flags hardcoded literals, raw Tailwind-palette utilities (`bg-red-500`) when semantic tokens exist, palette explosion (too many distinct colors), missing brand presence, and semantic-role mis-use (using a destructive token outside an error context). " +
      "Returns 0–100 score, the project's expected tokens, what was observed, and structured issues. " +
      '**Use after generating any UI with significant color decisions** — marketing pages, dashboards, branded components.',
    {
      projectId: z
        .string()
        .uuid()
        .describe('The project ID whose color palette to evaluate against'),
      code: z.string().describe('The UI code (JSX, HTML, or CSS) to evaluate'),
    },
    async (args) => {
      const db = getDb();
      const projectId = args.projectId as string;
      const code = args.code as string;

      const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
      if (!project) throw new NotFoundError('Project', projectId);

      const authCtx = getContext();
      if (authCtx?.organizationId && project.organizationId !== authCtx.organizationId) {
        throw new NotFoundError('Project', projectId);
      }

      const tokens = await loadProjectTokens(db, projectId);
      return evaluateColorPalette(code, tokens);
    }
  );
}
