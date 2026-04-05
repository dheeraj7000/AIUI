import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { AiuiMcpServer } from '../server';
import { getDb } from '../lib/db';
import { projects, stylePacks, styleTokens, designProfiles } from '@aiui/design-core';
import { NotFoundError } from '../lib/errors';
import { getContext } from '../lib/context';
import { requireScope } from '../lib/auth';

export function registerWriteProject(server: AiuiMcpServer) {
  server.registerTool(
    'apply_style_pack',
    'Apply a style pack to a project by slug. Updates the project active style pack and returns confirmation.',
    {
      projectSlug: z.string().min(1).describe('The project slug'),
      stylePackSlug: z.string().min(1).describe('The style pack slug to apply'),
    },
    async (args) => {
      // Enforce write scope if running in authenticated context
      const ctx = getContext();
      if (ctx) {
        requireScope(ctx.scopes, 'mcp:write');
      }

      const db = getDb();
      const projectSlug = args.projectSlug as string;
      const stylePackSlug = args.stylePackSlug as string;

      // Find project by slug
      const [project] = await db
        .select({
          id: projects.id,
          slug: projects.slug,
          organizationId: projects.organizationId,
          activeStylePackId: projects.activeStylePackId,
        })
        .from(projects)
        .where(eq(projects.slug, projectSlug))
        .limit(1);

      if (!project) {
        throw new NotFoundError('Project', projectSlug);
      }

      // Find style pack by slug
      const [pack] = await db
        .select({
          id: stylePacks.id,
          slug: stylePacks.slug,
          name: stylePacks.name,
        })
        .from(stylePacks)
        .where(eq(stylePacks.slug, stylePackSlug))
        .limit(1);

      if (!pack) {
        throw new NotFoundError('Style pack', stylePackSlug);
      }

      // Update project's active style pack
      await db
        .update(projects)
        .set({
          activeStylePackId: pack.id,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, project.id));

      // Check if a design profile exists for this project + pack
      const [existingProfile] = await db
        .select({ id: designProfiles.id })
        .from(designProfiles)
        .where(eq(designProfiles.projectId, project.id))
        .limit(1);

      // If a design profile exists, update its stylePackId
      if (existingProfile) {
        await db
          .update(designProfiles)
          .set({
            stylePackId: pack.id,
            updatedAt: new Date(),
          })
          .where(eq(designProfiles.id, existingProfile.id));
      }

      // Count tokens in the applied style pack
      const tokens = await db
        .select({ id: styleTokens.id })
        .from(styleTokens)
        .where(eq(styleTokens.stylePackId, pack.id));

      return {
        projectId: project.id,
        projectSlug: project.slug,
        stylePackId: pack.id,
        stylePackSlug: pack.slug,
        stylePackName: pack.name,
        tokenCount: tokens.length,
        profileUpdated: !!existingProfile,
      };
    }
  );
}
