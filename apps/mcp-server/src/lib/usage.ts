import { checkLimit, trackUsage } from '@aiui/design-core';
import { getDb } from './db';

/**
 * In-memory credit cache to avoid DB queries on every tool call.
 * TTL: 60 seconds.
 */
const creditCache = new Map<string, { used: number; limit: number; cachedAt: number }>();

const CACHE_TTL_MS = 60_000;

/**
 * Check if an organization has credits remaining.
 * Uses in-memory cache with 60-second TTL.
 * Returns null if allowed, or an error object if limit exceeded.
 */
export async function checkCredits(
  organizationId: string,
  tier: string = 'free'
): Promise<null | {
  error: string;
  used: number;
  limit: number;
  resetsAt: string;
}> {
  // Check cache first
  const cached = creditCache.get(organizationId);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    if (cached.used < cached.limit) return null;
    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return {
      error: 'credit_limit_exceeded',
      used: cached.used,
      limit: cached.limit,
      resetsAt: resetDate.toISOString(),
    };
  }

  // Cache miss — query DB
  const db = getDb();
  const result = await checkLimit(db, organizationId, tier);

  // Update cache
  creditCache.set(organizationId, {
    used: result.used,
    limit: result.limit,
    cachedAt: Date.now(),
  });

  if (!result.allowed) {
    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return {
      error: 'credit_limit_exceeded',
      used: result.used,
      limit: result.limit,
      resetsAt: resetDate.toISOString(),
    };
  }

  return null;
}

/**
 * Track a usage event asynchronously (fire-and-forget).
 * Increments the in-memory cache immediately.
 */
export function trackUsageAsync(params: {
  apiKeyId?: string;
  organizationId: string;
  toolName: string;
  eventType: string;
}): void {
  // Optimistically increment cache
  const cached = creditCache.get(params.organizationId);
  if (cached) {
    cached.used += 1;
  }

  // Fire-and-forget DB write
  const db = getDb();
  trackUsage(db, {
    apiKeyId: params.apiKeyId,
    organizationId: params.organizationId,
    toolName: params.toolName,
    eventType: params.eventType,
  }).catch((err) => {
    process.stderr.write(`[usage] Failed to track: ${err}\n`);
  });
}

/**
 * Get remaining credits from cache (for response headers).
 */
export function getCachedCredits(
  organizationId: string
): { remaining: number; limit: number } | null {
  const cached = creditCache.get(organizationId);
  if (!cached) return null;
  return {
    remaining: Math.max(0, cached.limit - cached.used),
    limit: cached.limit,
  };
}
