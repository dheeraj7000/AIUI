import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { getProjectContext, initProjectWithStarter } from '@aiui/design-core';
import { projects, designProfiles } from '@aiui/design-core';
import { NotFoundError } from '../lib/errors';
import { getContext } from '../lib/context';

export function registerGetProjectContext(server: AiuiMcpServer) {
  server.registerTool(
    'get_project_context',
    'Fetch the complete design profile for a project by slug. Returns framework target, active style pack, components, assets, and token count. Also checks for stale design memory.',
    { slug: z.string().describe('The project slug (URL-safe identifier)') },
    async (args) => {
      const db = getDb();
      const slug = args.slug as string;
      let context = await getProjectContext(db, slug);
      let autoCreated = false;

      if (!context) {
        // Attempt to auto-create the project if we have auth context.
        // Routes through initProjectWithStarter so the new project is seeded
        // with a real starter style pack + component selection + graph,
        // matching the init_project MCP tool. This closes the "empty state"
        // gap where slug-first callers used to land on {tokens:{}}.
        const authCtx = getContext();
        if (!authCtx?.organizationId) {
          throw new NotFoundError('Project', slug);
        }

        await initProjectWithStarter(db, {
          organizationId: authCtx.organizationId,
          slug,
        });

        context = await getProjectContext(db, slug);
        if (!context) {
          throw new NotFoundError('Project', slug);
        }

        autoCreated = true;
      }

      // Verify the project belongs to the authenticated org
      const authCtx2 = getContext();
      if (authCtx2?.organizationId) {
        const [projRecord] = await db
          .select({ organizationId: projects.organizationId })
          .from(projects)
          .where(eq(projects.slug, slug))
          .limit(1);
        if (projRecord && projRecord.organizationId !== authCtx2.organizationId) {
          throw new NotFoundError('Project', slug);
        }
      }

      // Check if the design profile's compilationValid is false (stale memory)
      const [project] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.slug, slug))
        .limit(1);

      let staleMemory = false;
      let staleMessage: string | null = null;

      if (project) {
        const [profile] = await db
          .select({ compilationValid: designProfiles.compilationValid })
          .from(designProfiles)
          .where(eq(designProfiles.projectId, project.id))
          .limit(1);

        if (profile && !profile.compilationValid) {
          staleMemory = true;
          staleMessage =
            'Design tokens have changed since last sync. Call sync_design_memory to update.';
        }
      }

      return {
        ...context,
        staleMemory,
        ...(staleMessage ? { staleMessage } : {}),
        ...(autoCreated ? { _created: true } : {}),
      };
    }
  );
}
