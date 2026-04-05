import { NextRequest, NextResponse } from 'next/server';
import {
  createDb,
  publishPack,
  publishPackSchema,
  stylePacks,
  organizationMembers,
} from '@aiui/design-core';
import { eq, and } from 'drizzle-orm';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

/**
 * POST /api/registry/publish — publish a style pack to the marketplace.
 */
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = publishPackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const db = getDb();

  // Verify ownership: user must be owner/admin of the pack's organization
  const [pack] = await db
    .select({ organizationId: stylePacks.organizationId })
    .from(stylePacks)
    .where(eq(stylePacks.id, parsed.data.stylePackId))
    .limit(1);

  if (!pack) {
    return NextResponse.json({ error: 'Style pack not found' }, { status: 404 });
  }

  if (pack.organizationId) {
    const [membership] = await db
      .select({ role: organizationMembers.role })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, pack.organizationId),
          eq(organizationMembers.userId, userId)
        )
      )
      .limit(1);

    if (!membership || membership.role === 'member') {
      return NextResponse.json(
        { error: 'You must be an owner or admin to publish this pack' },
        { status: 403 }
      );
    }
  }

  try {
    const entry = await publishPack(db, userId, parsed.data);
    return NextResponse.json(
      {
        ...entry,
        url: `/api/registry/${entry.slug}`,
        installCommand: `npx @aiui/cli add @${entry.namespace}/${entry.slug}`,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'A pack with this namespace/slug already exists' },
        { status: 409 }
      );
    }
    console.error('Failed to publish pack:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
