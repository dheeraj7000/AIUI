import { NextResponse } from 'next/server';

/**
 * POST /api/design-profiles/[id]/compile — Removed in the post-2026-04 scope cut.
 *
 * Profile compilation depended on the deleted style-pack/component-recipe
 * surface; tokens are now project-scoped and there is nothing to compile.
 * Kept as a 410 endpoint so any stale clients receive a clear signal instead
 * of a 404. Safe to delete the file once no consumers remain.
 *
 * TODO: rebuild without style packs once a new memory-compile pipeline lands.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint has been removed. Use sync_design_memory via MCP instead.' },
    { status: 410 }
  );
}
