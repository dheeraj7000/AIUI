import { NextRequest, NextResponse } from 'next/server';
import { createDb, getUsage } from '@aiui/design-core';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

/**
 * GET /api/usage — current period usage stats for the user's organization.
 */
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orgId = req.nextUrl.searchParams.get('organizationId');
  if (!orgId) {
    return NextResponse.json({ error: 'organizationId query param required' }, { status: 400 });
  }

  try {
    const db = getDb();
    const usage = await getUsage(db, orgId);
    return NextResponse.json(usage);
  } catch (error) {
    console.error('Failed to get usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
