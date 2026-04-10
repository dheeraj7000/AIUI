import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createDb, getProjectById, verifyOrgMembership } from '@aiui/design-core';
import type { Database } from '@aiui/design-core';

// Shared authorization helper for every `/api/projects/[id]/*` route. The
// middleware only verifies authentication (valid JWT → real user). Per-route
// authorization — "is this specific user allowed to touch this specific
// project?" — has to be enforced in the handler, and before this helper
// existed several subroutes silently skipped the check, leaving an IDOR.
// Route the project lookup + org membership check through here so the gap
// can't reopen.

export type ProjectAccessOk = {
  ok: true;
  db: Database;
  userId: string;
  project: NonNullable<Awaited<ReturnType<typeof getProjectById>>>;
};

export type ProjectAccessError = {
  ok: false;
  response: NextResponse;
};

export type ProjectAccessResult = ProjectAccessOk | ProjectAccessError;

function getDb(): Database {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

/**
 * Verify the request is authenticated AND the user is a member of the
 * organization that owns the project. Returns either a success tuple with
 * the resolved `db`, `userId`, and `project`, or an error tuple carrying a
 * ready-to-return `NextResponse`.
 *
 * Always return the `.response` directly — never fall through to the success
 * path after receiving an error, otherwise the IDOR reopens.
 */
export async function requireProjectAccess(
  req: NextRequest,
  projectId: string
): Promise<ProjectAccessResult> {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const db = getDb();
  const project = await getProjectById(db, projectId);
  if (!project) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Project not found' }, { status: 404 }),
    };
  }

  if (project.organizationId) {
    const isMember = await verifyOrgMembership(db, userId, project.organizationId);
    if (!isMember) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      };
    }
  }

  return { ok: true, db, userId, project };
}
