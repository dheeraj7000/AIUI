import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { getProjectContext, initProject } from '@aiui/design-core';
import { projects, designProfiles } from '@aiui/design-core';
import { NotFoundError } from '../lib/errors';
import { getContext } from '../lib/context';

export function registerGetProjectContext(server: AiuiMcpServer) {
  server.registerTool(
    'get_project_context',
    '**Call this FIRST when starting work on a project.** ' +
      'Fetches the project context for a slug: framework target, asset list, token count, and a stale-memory warning. ' +
      'If `staleMemory` is true, call `sync_design_memory` before generating any UI so your output uses the latest tokens. ' +
      "Auto-creates the project (with default tokens) if it doesn't exist yet and you have an authenticated MCP context.",
    { slug: z.string().describe('The project slug (URL-safe identifier)') },
    async (args) => {
      const db = getDb();
      const slug = args.slug as string;
      let context = await getProjectContext(db, slug);
      let autoCreated = false;

      if (!context) {
        // If we have an authed org context, auto-create the project so
        // slug-first callers don't crash on a missing row.
        const authCtx = getContext();
        if (!authCtx?.organizationId) {
          throw new NotFoundError('Project', slug);
        }

        await initProject(db, {
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

      // Surface stale memory warning if the project's design profile has been
      // invalidated by a write since last sync.
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
