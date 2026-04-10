import { NextRequest, NextResponse } from 'next/server';
import { createDb, usageEvents, apiKeys, verifyOrgMembership } from '@aiui/design-core';
import { desc, eq, sql } from 'drizzle-orm';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return createDb(url);
}

/**
 * GET /api/audit-logs — list recent audit events for an organization.
 *
 * Currently reads from `usage_events` joined with `api_keys` so each row
 * shows which API key (actor) triggered which MCP tool (action). Web UI
 * edits are not yet tracked — only MCP tool calls produce rows here.
 *
 * Query params:
 *   orgId  (required)
 *   limit  (optional, default 100, max 500)
 *   offset (optional, default 0)
 */
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimited = checkRateLimit(`audit-logs:${userId}`, RATE_LIMITS.read);
  if (rateLimited) {
    return NextResponse.json(
      { error: rateLimited.error },
      { status: 429, headers: { 'Retry-After': String(rateLimited.retryAfter) } }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('orgId');
    if (!orgId) {
      return NextResponse.json({ error: 'orgId query param is required' }, { status: 400 });
    }

    // Parse limit / offset with sensible clamping.
    const rawLimit = Number(searchParams.get('limit') ?? '100');
    const rawOffset = Number(searchParams.get('offset') ?? '0');
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(Math.trunc(rawLimit), 1), 500)
      : 100;
    const offset = Number.isFinite(rawOffset) ? Math.max(Math.trunc(rawOffset), 0) : 0;

    const db = getDb();
    const isMember = await verifyOrgMembership(db, userId, orgId);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Left-join because usage_events.api_key_id is nullable — it may be
    // null if the source key was revoked/deleted or if the event was
    // recorded without a key attribution.
    const rows = await db
      .select({
        id: usageEvents.id,
        createdAt: usageEvents.createdAt,
        toolName: usageEvents.toolName,
        eventType: usageEvents.eventType,
        creditsCost: usageEvents.creditsCost,
        actorName: apiKeys.name,
        actorPrefix: apiKeys.keyPrefix,
      })
      .from(usageEvents)
      .leftJoin(apiKeys, eq(usageEvents.apiKeyId, apiKeys.id))
      .where(eq(usageEvents.organizationId, orgId))
      .orderBy(desc(usageEvents.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total } = { total: 0 }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(usageEvents)
      .where(eq(usageEvents.organizationId, orgId));

    const data = rows.map((row) => ({
      id: row.id,
      createdAt: row.createdAt,
      toolName: row.toolName,
      eventType: row.eventType,
      creditsCost: row.creditsCost,
      actorName: row.actorName ?? '—',
      actorPrefix: row.actorPrefix ?? null,
    }));

    return NextResponse.json({ data, total, limit, offset });
  } catch (error) {
    console.error('Failed to list audit logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
