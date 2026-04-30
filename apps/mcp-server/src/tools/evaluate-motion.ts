import { z } from 'zod';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { NotFoundError } from '../lib/errors';
import { projects } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import { getContext } from '../lib/context';
import { evaluateMotion } from './evaluators/motion';
import { loadProjectTokens } from './evaluators/core';

export function registerEvaluateMotion(server: AiuiMcpServer) {
  server.registerTool(
    'evaluate_motion',
    "Project-aware motion evaluation. Scores animation + transition discipline against THIS project's animation / transition tokens. " +
      "Catches arbitrary `duration-[123ms]` values bypassing the project's timing scale, wide diversity (more than 3 distinct durations or 2 timing functions), missing `prefers-reduced-motion` safeguards, and motion-without-tokens. " +
      'Returns 0–100 score plus structured issues. ' +
      '**Use after generating any UI with hover effects, transitions, animations, or scroll-driven motion** — landing heroes, expandable cards, modals, anything that animates.',
    {
      projectId: z
        .string()
        .uuid()
        .describe('The project ID whose motion scale to evaluate against'),
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
      return evaluateMotion(code, tokens);
    }
  );
}
