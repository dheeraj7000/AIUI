// ---------------------------------------------------------------------------
// Session persistence utilities
// ---------------------------------------------------------------------------
// Manages auth tokens in cookies and org selection in localStorage.
// Cookies use secure flags in production; localStorage is used for
// non-sensitive preferences like the active organisation ID.
// ---------------------------------------------------------------------------

import type { AuthSession } from '@/types/auth';

const ACCESS_TOKEN_COOKIE = 'aiui-access-token';
const ID_TOKEN_COOKIE = 'aiui-id-token';
const ACTIVE_ORG_KEY = 'aiui-active-org';

/**
 * Build a cookie string with consistent flags.
 */
function buildCookie(name: string, value: string, maxAgeSec?: number): string {
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';

  const parts = [`${name}=${encodeURIComponent(value)}`, 'path=/', 'SameSite=Lax'];

  if (isSecure) {
    parts.push('Secure');
  }

  if (maxAgeSec !== undefined) {
    parts.push(`max-age=${maxAgeSec}`);
  }

  return parts.join('; ');
}

// ---------------------------------------------------------------------------
// Token persistence (cookies)
// ---------------------------------------------------------------------------

/**
 * Store access and ID tokens as cookies so the auth middleware can read them
 * on subsequent page loads.
 *
 * @param accessToken - Access token (JWT)
 * @param idToken     - ID token (JWT)
 * @param maxAgeSec   - Cookie lifetime in seconds (default: 1 hour)
 */
export function persistTokens(accessToken: string, idToken: string, maxAgeSec = 3600): void {
  if (typeof document === 'undefined') return;

  document.cookie = buildCookie(ACCESS_TOKEN_COOKIE, accessToken, maxAgeSec);
  document.cookie = buildCookie(ID_TOKEN_COOKIE, idToken, maxAgeSec);
}

/**
 * Read the persisted access token from cookies.
 */
export function getPersistedAccessToken(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${ACCESS_TOKEN_COOKIE}=`));

  if (!match) return null;

  return decodeURIComponent(match.split('=')[1] ?? '');
}

/**
 * Read the persisted ID token from cookies.
 */
export function getPersistedIdToken(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.split('; ').find((row) => row.startsWith(`${ID_TOKEN_COOKIE}=`));

  if (!match) return null;

  return decodeURIComponent(match.split('=')[1] ?? '');
}

/**
 * Persist a full session (access + ID tokens) to cookies.
 */
export function persistSession(session: AuthSession): void {
  const maxAgeSec = session.expiresAt
    ? Math.max(Math.floor((session.expiresAt - Date.now()) / 1000), 0)
    : 3600;
  persistTokens(session.accessToken, session.idToken, maxAgeSec);
}

/**
 * Reconstruct a persisted session from cookies. Returns null if tokens
 * are missing. The expiresAt is decoded from the access token JWT payload.
 */
export function getPersistedSession(): AuthSession | null {
  const accessToken = getPersistedAccessToken();
  const idToken = getPersistedIdToken();

  if (!accessToken || !idToken) return null;

  // Decode the exp claim from the access token (JWT middle segment)
  let expiresAt = 0;
  try {
    const parts = accessToken.split('.');
    const payload = JSON.parse(atob(parts[1] ?? ''));
    if (typeof payload.exp === 'number') {
      expiresAt = payload.exp * 1000;
    }
  } catch {
    // If we cannot decode, leave expiresAt as 0
  }

  return {
    accessToken,
    idToken,
    refreshToken: '',
    expiresAt,
  };
}

/**
 * Remove all auth cookies and localStorage entries to fully clear the session.
 */
export function clearSession(): void {
  if (typeof document !== 'undefined') {
    // Expire cookies by setting max-age=0
    document.cookie = buildCookie(ACCESS_TOKEN_COOKIE, '', 0);
    document.cookie = buildCookie(ID_TOKEN_COOKIE, '', 0);
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(ACTIVE_ORG_KEY);
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
