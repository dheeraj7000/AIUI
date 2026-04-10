import { NextRequest, NextResponse } from 'next/server';
import {
  createDb,
  createProjectWithStarter,
  listProjects,
  verifyOrgMembership,
} from '@aiui/design-core';
import { createProjectSchema, listProjectsSchema } from '@aiui/design-core/src/validation/project';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return createDb(url);
}

/**
 * GET /api/projects — List projects for an organization.
 */
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimited = checkRateLimit(`projects:${userId}`, RATE_LIMITS.read);
  if (rateLimited) {
    return NextResponse.json(
      { error: rateLimited.error },
      { status: 429, headers: { 'Retry-After': String(rateLimited.retryAfter) } }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const parsed = listProjectsSchema.safeParse({
      orgId: searchParams.get('orgId'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const isMember = await verifyOrgMembership(db, userId, parsed.data.orgId);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const result = await listProjects(db, parsed.data);

    return NextResponse.json({
      data: result.projects,
      total: result.total,
      limit: parsed.data.limit,
      offset: parsed.data.offset,
    });
  } catch (error) {
    console.error('Failed to list projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/projects — Create a new project.
 */
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const isMember = await verifyOrgMembership(db, userId, parsed.data.orgId);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create the project AND seed it with the shadcn/ui Essentials starter
    // pack, a design profile, and an initial graph. This mirrors the MCP
    // init_project tool so web-created and MCP-created projects arrive in
    // the same populated state instead of an empty one.
    const result = await createProjectWithStarter(db, parsed.data);

    // Return the project row shape the client already expects, augmented
    // with the seeded starter metadata for the dashboard to display.
    return NextResponse.json(
      {
        ...result.project,
        stylePack: result.stylePack,
        tokenCount: result.tokenCount,
        componentCount: result.componentCount,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}
