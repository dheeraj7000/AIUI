import { eq, and, sql } from 'drizzle-orm';
import { usageEvents, creditLedger } from '../db/schema';
import type { Database } from '../db';

/** Tier credit limits per month. */
export const TIER_LIMITS: Record<string, number> = {
  free: 100,
  pro: 1000,
  team: 10000,
  enterprise: Infinity,
};

function getCurrentPeriod(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

/**
 * Ensure a ledger row exists for the current month.
 * Creates one with the org's tier limit if missing.
 */
export async function ensureLedger(
  db: Database,
  organizationId: string,
  tier: string = 'free'
): Promise<{ creditsUsed: number; creditsLimit: number; tier: string }> {
  const { start, end } = getCurrentPeriod();

  const [existing] = await db
    .select()
    .from(creditLedger)
    .where(
      and(eq(creditLedger.organizationId, organizationId), eq(creditLedger.periodStart, start))
    )
    .limit(1);

  if (existing) {
    return {
      creditsUsed: existing.creditsUsed,
      creditsLimit: existing.creditsLimit,
      tier: existing.tier,
    };
  }

  const limit = TIER_LIMITS[tier] ?? TIER_LIMITS.free;
  const [created] = await db
    .insert(creditLedger)
    .values({
      organizationId,
      periodStart: start,
      periodEnd: end,
      creditsUsed: 0,
      creditsLimit: limit === Infinity ? 999999999 : limit,
      tier,
    })
    .returning();

  return {
    creditsUsed: created.creditsUsed,
    creditsLimit: created.creditsLimit,
    tier: created.tier,
  };
}

/**
 * Track a usage event and increment the ledger.
 */
export async function trackUsage(
  db: Database,
  params: {
    apiKeyId?: string;
    organizationId: string;
    toolName: string;
    eventType: string;
    creditsCost?: number;
    userId?: string | null;
    projectId?: string | null;
    status?: 'ok' | 'error' | null;
    durationMs?: number | null;
    argsSummary?: unknown;
  }
): Promise<void> {
  const { start } = getCurrentPeriod();
  const cost = params.creditsCost ?? 1;

  // Insert event
  await db.insert(usageEvents).values({
    apiKeyId: params.apiKeyId ?? null,
    organizationId: params.organizationId,
    toolName: params.toolName,
    eventType: params.eventType,
    creditsCost: cost,
    userId: params.userId ?? null,
    projectId: params.projectId ?? null,
    status: params.status ?? null,
    durationMs: params.durationMs ?? null,
    argsSummary: params.argsSummary ?? null,
  });

  // Increment ledger
  await db
    .update(creditLedger)
    .set({
      creditsUsed: sql`${creditLedger.creditsUsed} + ${cost}`,
    })
    .where(
      and(
        eq(creditLedger.organizationId, params.organizationId),
        eq(creditLedger.periodStart, start)
      )
    );
}

/**
 * Check if the organization has credits remaining.
 */
export async function checkLimit(
  db: Database,
  organizationId: string,
  tier: string = 'free'
): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}> {
  const ledger = await ensureLedger(db, organizationId, tier);
  const remaining = Math.max(0, ledger.creditsLimit - ledger.creditsUsed);

  return {
    allowed: ledger.creditsUsed < ledger.creditsLimit,
    used: ledger.creditsUsed,
    limit: ledger.creditsLimit,
    remaining,
  };
}

/**
 * Get usage stats for the current period.
 */
export async function getUsage(
  db: Database,
  organizationId: string,
  tier: string = 'free'
): Promise<{
  used: number;
  limit: number;
  remaining: number;
  tier: string;
  periodStart: string;
  periodEnd: string;
  resetsAt: string;
}> {
  const { start, end } = getCurrentPeriod();
  const ledger = await ensureLedger(db, organizationId, tier);

  // Reset date = first day of next month
  const now = new Date();
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return {
    used: ledger.creditsUsed,
    limit: ledger.creditsLimit,
    remaining: Math.max(0, ledger.creditsLimit - ledger.creditsUsed),
    tier: ledger.tier,
    periodStart: start,
    periodEnd: end,
    resetsAt: resetDate.toISOString(),
  };
}

/**
 * Get usage history for past N months.
 */
export async function getUsageHistory(
  db: Database,
  organizationId: string,
  months: number = 6
): Promise<Array<{ period: string; used: number; limit: number }>> {
  const rows = await db
    .select({
      periodStart: creditLedger.periodStart,
      creditsUsed: creditLedger.creditsUsed,
      creditsLimit: creditLedger.creditsLimit,
    })
    .from(creditLedger)
    .where(eq(creditLedger.organizationId, organizationId))
    .orderBy(creditLedger.periodStart)
    .limit(months);

  return rows.map((r) => ({
    period: r.periodStart,
    used: r.creditsUsed,
    limit: r.creditsLimit,
  }));
}
