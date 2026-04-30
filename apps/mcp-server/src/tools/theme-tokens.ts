import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { projects, styleTokens, designProfiles } from '@aiui/design-core';
import { exportTailwindConfig, exportCSSVariables, mergeTokens } from '@aiui/prompt-compiler';
import { NotFoundError } from '../lib/errors';

export function registerThemeTokens(server: AiuiMcpServer) {
  server.registerTool(
    'get_theme_tokens',
    'Export the project token map in tailwind config, CSS custom properties, or raw JSON format.',
    {
      projectId: z.string().uuid().describe('The project ID'),
      format: z.enum(['tailwind', 'css', 'json']).default('json').describe('Output format'),
    },
    async (args) => {
      const db = getDb();
      const projectId = args.projectId as string;
      const format = (args.format as string) || 'json';

      const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);

      if (!project) {
        throw new NotFoundError('Project', projectId);
      }

      const tokens = await db
        .select({ tokenKey: styleTokens.tokenKey, tokenValue: styleTokens.tokenValue })
        .from(styleTokens)
        .where(eq(styleTokens.projectId, project.id));

      const tokenMap: Record<string, string> = {};
      for (const t of tokens) {
        tokenMap[t.tokenKey] = t.tokenValue;
      }

      const { tokens: merged } = mergeTokens(tokenMap, {}, { applyDefaults: true });

      let staleWarning: string | null = null;
      const [profile] = await db
        .select({ compilationValid: designProfiles.compilationValid })
        .from(designProfiles)
        .where(eq(designProfiles.projectId, project.id))
        .limit(1);
      if (profile && !profile.compilationValid) {
        staleWarning =
          'Design tokens may have changed since the local .aiui/ files were last synced. Call sync_design_memory to refresh.';
      }

      if (format === 'tailwind') {
        return { ...exportTailwindConfig(merged), staleWarning };
      } else if (format === 'css') {
        return { ...exportCSSVariables(merged), staleWarning };
      } else {
        return { tokens: merged, staleWarning };
      }
    }
  );
}
