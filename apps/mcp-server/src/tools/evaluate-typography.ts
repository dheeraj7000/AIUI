import { z } from 'zod';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { NotFoundError } from '../lib/errors';
import { projects } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import { getContext } from '../lib/context';
import { evaluateTypography } from './evaluators/typography';
import { loadProjectTokens } from './evaluators/core';

export function registerEvaluateTypography(server: AiuiMcpServer) {
  server.registerTool(
    'evaluate_typography',
    "Project-aware typography evaluation. Unlike generic audit tools, this scores type usage against THIS project's defined font tokens, font-size scale, and visual hierarchy expectations. " +
      'Returns a 0–100 score, observed vs expected sizes/fonts, and structured issues with specific fixes. ' +
      "**Use after generating any UI with prose, headings, or rich text content** — it catches inverted hierarchies, off-scale sizes, and font drift that `validate_ui_output` (which is purely token-set membership) doesn't catch.",
    {
      projectId: z.string().uuid().describe('The project ID whose type stack to evaluate against'),
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
      const result = evaluateTypography(code, tokens);

      return result;
    }
  );
}
