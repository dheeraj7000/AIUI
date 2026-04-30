import { z } from 'zod';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { NotFoundError } from '../lib/errors';
import { projects } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import { getContext } from '../lib/context';
import { evaluateVisualDensity } from './evaluators/visual-density';
import { loadProjectTokens } from './evaluators/core';

export function registerEvaluateVisualDensity(server: AiuiMcpServer) {
  server.registerTool(
    'evaluate_visual_density',
    "Project-aware visual density / spacing evaluation. Scores spacing discipline against THIS project's spacing tokens: adherence to the project's scale, rhythm consistency (sibling elements using the same gap), density tier (compact / default / airy), arbitrary-value bypass count. " +
      'Returns 0–100 score plus structured issues. ' +
      "**Use after generating any UI where layout matters** — dashboards, forms, multi-section pages. The signal that 'something feels off' usually traces back to spacing rhythm.",
    {
      projectId: z
        .string()
        .uuid()
        .describe('The project ID whose spacing scale to evaluate against'),
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
      return evaluateVisualDensity(code, tokens);
    }
  );
}
