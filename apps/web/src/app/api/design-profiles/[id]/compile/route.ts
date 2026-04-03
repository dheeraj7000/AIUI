import { NextRequest, NextResponse } from 'next/server';
import { createDb } from '@aiui/design-core';
import { compileDesignProfile } from '@aiui/design-core/src/operations/design-profiles';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return createDb(url);
}

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/design-profiles/[id]/compile — Trigger compilation of a design profile.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const db = getDb();
    const compiled = await compileDesignProfile(db, id);

    if (!compiled) {
      return NextResponse.json({ error: 'Design profile not found' }, { status: 404 });
    }

    return NextResponse.json(compiled);
  } catch (error) {
    console.error('Failed to compile design profile:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
