// ---------------------------------------------------------------------------
// Session persistence utilities
// ---------------------------------------------------------------------------
// Auth tokens live in HttpOnly cookies set by the server (see auth-cookies.ts).
// Client JavaScript never reads or writes those cookies directly.
// This module manages the active organisation ID in localStorage and exposes
// a clearSession helper that calls the server signout endpoint.
// ---------------------------------------------------------------------------

import type { AuthSession } from '@/types/auth';

const ACTIVE_ORG_KEY = 'aiui-active-org';

// ---------------------------------------------------------------------------
// Token persistence (no-ops — server manages HttpOnly cookies)
// ---------------------------------------------------------------------------

/**
 * No-op. Auth tokens live in HttpOnly cookies set by the server endpoints
 * (signin/signup/refresh). The client never persists tokens directly because
 * doing so would defeat the HttpOnly XSS protection.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export function persistSession(_session: AuthSession): void {
  /* eslint-enable @typescript-eslint/no-unused-vars */
  // intentionally empty
}

/**
 * @deprecated Cookies are HttpOnly — JS cannot read them. Use getCurrentUser()
 * from @/lib/auth instead, which calls /api/auth/me to ask the server.
 */
export function getPersistedSession(): AuthSession | null {
  return null;
}

/**
 * Clear all client-side session state and ask the server to expire the
 * HttpOnly auth cookies via /api/auth/signout.
 */
export function clearSession(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(ACTIVE_ORG_KEY);
  }

  // Clear HttpOnly cookies via server endpoint (fire-and-forget)
  if (typeof fetch !== 'undefined') {
    fetch('/api/auth/signout', { method: 'POST', credentials: 'same-origin' }).catch(() => {
      // Best-effort — if this fails the cookies will expire naturally
    });
  }
}

// ---------------------------------------------------------------------------
// Active organisation (localStorage)
// ---------------------------------------------------------------------------

/**
 * Store the user's active organisation ID in localStorage.
 */
export function setActiveOrgId(orgId: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ACTIVE_ORG_KEY, orgId);
}

/**
 * Read the active organisation ID from localStorage, or null if unset.
 */
export function getActiveOrgId(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(ACTIVE_ORG_KEY);
}
