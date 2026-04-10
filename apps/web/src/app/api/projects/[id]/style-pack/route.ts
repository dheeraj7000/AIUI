import { NextRequest, NextResponse } from 'next/server';
import { createDb, designProfiles, projects } from '@aiui/design-core';
import {
  assignStylePack,
  getProjectStylePack,
  StylePackNotFoundError,
  ProjectNotFoundError,
} from '@aiui/design-core/src/operations/project-style-pack';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { logWebEvent } from '@/lib/audit';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

const assignSchema = z.object({
  stylePackId: z.string().uuid(),
  tokenOverrides: z.record(z.string(), z.string()).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]/style-pack — Get current style pack with merged tokens.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const db = getDb();
    const result = await getProjectStylePack(db, id);

    if (!result) {
      return NextResponse.json(
        { error: 'Project not found or no style pack assigned' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get project style pack:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/projects/[id]/style-pack — Assign a style pack to the project.
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = assignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const result = await assignStylePack(
      db,
      id,
      parsed.data.stylePackId,
      parsed.data.tokenOverrides
    );

    // Mark the project's design profile as stale so MCP read tools surface
    // a warning until sync_design_memory is called. Soft signal — log and
    // continue on failure.
    try {
      await db
        .update(designProfiles)
        .set({ compilationValid: false, updatedAt: new Date() })
        .where(eq(designProfiles.projectId, id));
    } catch (staleErr) {
      console.error('Failed to mark design profile stale:', staleErr);
    }

    // Log the web action to the audit trail. Look up the project's org
    // since the route doesn't have it in scope.
    try {
      const [proj] = await db
        .select({ organizationId: projects.organizationId })
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);
      if (proj) {
        logWebEvent({ organizationId: proj.organizationId, action: 'web.apply_style_pack' });
      }
    } catch (auditErr) {
      console.error('Failed to log audit event:', auditErr);
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof StylePackNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ProjectNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error('Failed to assign style pack:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
