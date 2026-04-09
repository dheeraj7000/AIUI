import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { getProjectContext, autoGenerateGraph } from '@aiui/design-core';
import { projects, designProfiles } from '@aiui/design-core';
import { NotFoundError } from '../lib/errors';
import { getContext } from '../lib/context';

/**
 * Convert a slug to title case: "my-app" -> "My App", "marketplace" -> "Marketplace"
 */
function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

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
        // Attempt to auto-create the project if we have auth context
        const authCtx = getContext();
        if (!authCtx?.organizationId) {
          throw new NotFoundError('Project', slug);
        }

        // Insert the new project
        await db.insert(projects).values({
          name: slugToTitle(slug),
          slug,
          organizationId: authCtx.organizationId,
          frameworkTarget: 'nextjs-tailwind',
        });

        // Retry fetching the context after creation
        context = await getProjectContext(db, slug);
        if (!context) {
          throw new NotFoundError('Project', slug);
        }

        // Auto-generate an initial graph for the new project
        const [newProject] = await db
          .select({ id: projects.id })
          .from(projects)
          .where(eq(projects.slug, slug))
          .limit(1);

        if (newProject) {
          await autoGenerateGraph(db, newProject.id);
        }

        autoCreated = true;
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
