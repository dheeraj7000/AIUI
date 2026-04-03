import { NextRequest, NextResponse } from 'next/server';
import { createDb, revokeInvitation } from '@aiui/design-core';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

type RouteContext = { params: Promise<{ orgId: string; inviteId: string }> };

/**
 * DELETE /api/organizations/[orgId]/invitations/[inviteId] — Revoke an invitation.
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { inviteId } = await context.params;
    const db = getDb();
    const revoked = await revokeInvitation(db, inviteId);

    if (!revoked) {
      return NextResponse.json(
        { error: 'Invitation not found or already processed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to revoke invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
