import { NextRequest, NextResponse } from 'next/server';
import { designProfiles } from '@aiui/design-core';
import {
  assignStylePack,
  getProjectStylePack,
  StylePackNotFoundError,
  ProjectNotFoundError,
} from '@aiui/design-core/src/operations/project-style-pack';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { logWebEvent } from '@/lib/audit';
import { requireProjectAccess } from '@/lib/project-access';

const assignSchema = z.object({
  stylePackId: z.string().uuid(),
  tokenOverrides: z.record(z.string(), z.string()).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]/style-pack — Get current style pack with merged tokens.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  try {
    const result = await getProjectStylePack(access.db, id);

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
  const { id } = await context.params;

  const access = await requireProjectAccess(req, id);
  if (!access.ok) return access.response;

  try {
    const body = await req.json();
    const parsed = assignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await assignStylePack(
      access.db,
      id,
      parsed.data.stylePackId,
      parsed.data.tokenOverrides
    );

    // Mark the project's design profile as stale so MCP read tools surface
    // a warning until sync_design_memory is called. Soft signal — log and
    // continue on failure.
    try {
      await access.db
        .update(designProfiles)
        .set({ compilationValid: false, updatedAt: new Date() })
        .where(eq(designProfiles.projectId, id));
    } catch (staleErr) {
      console.error('Failed to mark design profile stale:', staleErr);
    }

    // Log the web action to the audit trail. We already have the project
    // from requireProjectAccess, so no extra lookup is needed.
    if (access.project.organizationId) {
      logWebEvent({
        organizationId: access.project.organizationId,
        action: 'web.apply_style_pack',
      });
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
