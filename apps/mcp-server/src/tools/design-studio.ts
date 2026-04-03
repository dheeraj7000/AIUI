import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { projects } from '@aiui/design-core';

export function registerDesignStudio(server: AiuiMcpServer) {
  server.registerTool(
    'open_design_studio',
    'Open the AIUI Design Studio in the browser. ' +
      'Returns a URL where the user can visually select style packs, pick components, ' +
      'and configure their design system. After the user is done, call sync_design_memory ' +
      'to pull the updated design into the project.',
    {
      slug: z
        .string()
        .optional()
        .describe('Project slug. If omitted, the studio opens with a project creation step.'),
      targetDir: z
        .string()
        .optional()
        .describe(
          'Project directory path — remembered for sync_design_memory after the user finishes.'
        ),
    },
    async (args) => {
      const slug = args.slug as string | undefined;
      const targetDir = args.targetDir as string | undefined;
      // In HTTP mode, AIUI_WEB_URL is validated on startup (see index.ts).
      // The localhost fallback only applies to local stdio usage.
      const baseUrl = process.env.AIUI_WEB_URL ?? 'http://localhost:3000';

      // If slug provided, verify project exists
      if (slug) {
        const db = getDb();
        const [project] = await db
          .select({ id: projects.id })
          .from(projects)
          .where(eq(projects.slug, slug))
          .limit(1);

        const url = project
          ? `${baseUrl}/studio?project=${slug}`
          : `${baseUrl}/studio?name=${encodeURIComponent(slug)}`;

        return {
          url,
          message: project
            ? `Open this URL to configure the design system for "${slug}":`
            : `No project "${slug}" found. Open this URL to create it and configure the design:`,
          nextStep: targetDir
            ? `After the user finishes in the browser, run: sync_design_memory with slug "${slug ?? 'the-new-project-slug'}" and targetDir "${targetDir}"`
            : `After the user finishes in the browser, run: sync_design_memory to pull the design into the project.`,
        };
      }

      return {
        url: `${baseUrl}/studio`,
        message: 'Open this URL to create a project and configure your design system:',
        nextStep:
          'After the user finishes, ask them for the project slug, then run sync_design_memory.',
      };
    }
  );
}
