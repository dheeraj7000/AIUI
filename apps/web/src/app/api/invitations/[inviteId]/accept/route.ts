import { NextRequest, NextResponse } from 'next/server';
import { createDb, acceptInvitation } from '@aiui/design-core';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

type RouteContext = { params: Promise<{ inviteId: string }> };

/**
 * POST /api/invitations/[inviteId]/accept — Accept an invitation by token.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { inviteId: token } = await context.params;
    const db = getDb();
    const result = await acceptInvitation(db, token, userId);

    if ('error' in result) {
      switch (result.error) {
        case 'not_found':
          return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
        case 'already_used':
          return NextResponse.json({ error: 'Invitation already used' }, { status: 400 });
        case 'expired':
          return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 });
      }
    }

    return NextResponse.json({ success: true, invitation: result.data });
  } catch (error) {
    console.error('Failed to accept invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
