/**
 * Simple in-memory rate limiter for auth endpoints.
 * Tracks attempts per key (email or IP) with a sliding window.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_ATTEMPTS = 5; // 5 attempts per minute

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
 * Check rate limit for a given key (email, IP, etc).
 * Returns null if allowed, or an error response object if blocked.
 */
export function checkRateLimit(key: string): {
  error: string;
  retryAfter: number;
} | null {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  entry.count++;

  if (entry.count > MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      error: 'Too many attempts. Please try again later.',
      retryAfter,
    };
  }

  return null;
}
