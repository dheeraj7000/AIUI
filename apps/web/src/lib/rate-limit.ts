/**
 * Configurable in-memory rate limiter.
 * Supports per-route limits and composite keys (IP + identifier).
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitConfig {
  /** Window duration in milliseconds (default: 60_000 = 1 minute) */
  windowMs?: number;
  /** Max attempts within the window (default: 5) */
  maxAttempts?: number;
}

/** Preset configurations for different route categories */
export const RATE_LIMITS = {
  /** Auth endpoints: strict (5/min) */
  auth: { windowMs: 60_000, maxAttempts: 5 },
  /** Token refresh: moderate (10/min) */
  refresh: { windowMs: 60_000, maxAttempts: 10 },
  /** API key operations: moderate (10/min) */
  apiKey: { windowMs: 60_000, maxAttempts: 10 },
  /** Member management: moderate (20/min) */
  members: { windowMs: 60_000, maxAttempts: 20 },
  /** Read/list operations: lenient (30/min) */
  read: { windowMs: 60_000, maxAttempts: 30 },
} as const;

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 5 * 60_000);

/**
 * Check rate limit for a given key.
 * @param key - Composite key (e.g., "signin:user@example.com" or "api-keys:userId")
 * @param config - Rate limit configuration (defaults to auth preset)
 * @returns null if allowed, or error object if rate limited
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = RATE_LIMITS.auth
): { error: string; retryAfter: number } | null {
  const windowMs = config.windowMs ?? 60_000;
  const maxAttempts = config.maxAttempts ?? 5;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  entry.count++;

  if (entry.count > maxAttempts) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      error: 'Too many attempts. Please try again later.',
      retryAfter,
    };
  }

  return null;
}
