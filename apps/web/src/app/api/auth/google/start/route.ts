import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * GET /api/auth/google/start — Initiates the Google OAuth flow.
 *
 * Redirects the browser to Google's consent screen with our client ID and
 * a CSRF state parameter. The state is also set as an HttpOnly cookie so
 * the callback can verify it.
 *
 * Required env vars:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_REDIRECT_URI (e.g. https://aiui.store/api/auth/google/callback)
 */
export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('error', 'google_not_configured');
    return NextResponse.redirect(signInUrl);
  }

  // Generate a CSRF state token
  const state = crypto.randomBytes(32).toString('hex');

  // Optional redirect target after sign-in
  const redirectTo = req.nextUrl.searchParams.get('redirect') ?? '/dashboard';

  // Build Google OAuth URL
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });

  const authorizeUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  const response = NextResponse.redirect(authorizeUrl);

  // Persist state and redirect target as HttpOnly cookies for the callback
  const isSecure = process.env.NODE_ENV === 'production';
  const securePart = isSecure ? '; Secure' : '';
  response.headers.append(
    'Set-Cookie',
    `aiui-oauth-state=${state}; Path=/; SameSite=Lax; HttpOnly${securePart}; Max-Age=600`
  );
  response.headers.append(
    'Set-Cookie',
    `aiui-oauth-redirect=${encodeURIComponent(redirectTo)}; Path=/; SameSite=Lax; HttpOnly${securePart}; Max-Age=600`
  );

  return response;
}
