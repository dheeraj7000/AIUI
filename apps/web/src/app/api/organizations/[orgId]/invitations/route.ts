import { NextRequest, NextResponse } from 'next/server';
import {
  createDb,
  createInvitation,
  listPendingInvitations,
  createInvitationSchema,
} from '@aiui/design-core';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

type RouteContext = { params: Promise<{ orgId: string }> };

/**
 * POST /api/organizations/[orgId]/invitations — Create an invitation.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orgId } = await context.params;
    const body = await req.json();

    const parsed = createInvitationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const result = await createInvitation(db, orgId, parsed.data.email, parsed.data.role, userId);

    if ('error' in result) {
      if (result.error === 'duplicate_invitation') {
        return NextResponse.json(
          { error: 'An invitation for this email already exists in this organization' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('Failed to create invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/organizations/[orgId]/invitations — List pending invitations.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orgId } = await context.params;
    const db = getDb();
    const invitations = await listPendingInvitations(db, orgId);
    return NextResponse.json({ data: invitations });
  } catch (error) {
    console.error('Failed to list invitations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
