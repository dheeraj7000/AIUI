// ---------------------------------------------------------------------------
// Server-side auth cookie helpers
// ---------------------------------------------------------------------------
// Sets HttpOnly cookies on API responses so the auth middleware can read them
// while preventing client-side JavaScript access (XSS mitigation).
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server';

const ACCESS_TOKEN_COOKIE = 'aiui-access-token';
const ID_TOKEN_COOKIE = 'aiui-id-token';

/**
 * Append HttpOnly Set-Cookie headers for auth tokens to a NextResponse.
 *
 * These cookies mirror the client-side cookies set by `persistTokens` but
 * include the HttpOnly flag, which prevents JavaScript from reading them.
 * The middleware reads cookies server-side via `request.cookies`, so HttpOnly
 * cookies work transparently.
 *
 * @param response  - The NextResponse to attach cookies to.
 * @param accessToken - JWT access token.
 * @param idToken     - JWT ID token.
 * @param maxAge      - Cookie lifetime in seconds (default: 3600 = 1 hour).
 */
export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  idToken: string,
  maxAge = 3600
): NextResponse {
  const isSecure = process.env.NODE_ENV === 'production';
  const securePart = isSecure ? '; Secure' : '';

  response.headers.append(
    'Set-Cookie',
    `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(accessToken)}; Path=/; SameSite=Lax; HttpOnly${securePart}; Max-Age=${maxAge}`
  );
  response.headers.append(
    'Set-Cookie',
    `${ID_TOKEN_COOKIE}=${encodeURIComponent(idToken)}; Path=/; SameSite=Lax; HttpOnly${securePart}; Max-Age=${maxAge}`
  );

  return response;
}

/**
 * Append Set-Cookie headers that expire (clear) the auth cookies.
 *
 * Because the cookies are HttpOnly, they cannot be cleared by client-side
 * JavaScript. This helper sets Max-Age=0 to instruct the browser to remove
 * them.
 */
export function clearAuthCookies(response: NextResponse): NextResponse {
  const isSecure = process.env.NODE_ENV === 'production';
  const securePart = isSecure ? '; Secure' : '';

  response.headers.append(
    'Set-Cookie',
    `${ACCESS_TOKEN_COOKIE}=; Path=/; SameSite=Lax; HttpOnly${securePart}; Max-Age=0`
  );
  response.headers.append(
    'Set-Cookie',
    `${ID_TOKEN_COOKIE}=; Path=/; SameSite=Lax; HttpOnly${securePart}; Max-Age=0`
  );

  return response;
}
