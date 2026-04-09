import { NextRequest, NextResponse } from 'next/server';
import {
  createDb,
  createStylePack,
  listStylePacks,
  createStylePackValidation,
  listStylePacksSchema,
  verifyOrgMembership,
} from '@aiui/design-core';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return createDb(url);
}

/**
 * GET /api/style-packs — List style packs with filtering and pagination.
 */
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimited = checkRateLimit(`style-packs:${userId}`, RATE_LIMITS.read);
  if (rateLimited) {
    return NextResponse.json(
      { error: rateLimited.error },
      { status: 429, headers: { 'Retry-After': String(rateLimited.retryAfter) } }
    );
  }

  const orgId = req.nextUrl.searchParams.get('organizationId');
  if (!orgId) {
    return NextResponse.json(
      { error: 'organizationId query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const params = {
      limit: req.nextUrl.searchParams.get('limit') ?? undefined,
      offset: req.nextUrl.searchParams.get('offset') ?? undefined,
      category: req.nextUrl.searchParams.get('category') ?? undefined,
      search: req.nextUrl.searchParams.get('search') ?? undefined,
      sortBy: req.nextUrl.searchParams.get('sortBy') ?? undefined,
      sortOrder: req.nextUrl.searchParams.get('sortOrder') ?? undefined,
    };

    const parsed = listStylePacksSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const isMember = await verifyOrgMembership(db, userId, orgId);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const result = await listStylePacks(db, orgId, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to list style packs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/style-packs — Create a new style pack.
 */
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const organizationId = body.organizationId as string | undefined;
    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
    }

    const parsed = createStylePackValidation.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const db = getDb();
    const isMember = await verifyOrgMembership(db, userId, organizationId);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const stylePack = await createStylePack(db, parsed.data, organizationId);
    return NextResponse.json(stylePack, { status: 201 });
  } catch (error) {
    console.error('Failed to create style pack:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
