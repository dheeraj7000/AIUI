import { NextRequest, NextResponse } from 'next/server';
import { createDb, users } from '@aiui/design-core';
import { eq } from 'drizzle-orm';
import { createToken } from '@/lib/jwt';
import { setAuthCookies } from '@/lib/auth-cookies';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return createDb(url);
}

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name?: string;
  family_name?: string;
}

/**
 * GET /api/auth/google/callback — Handles the OAuth callback from Google.
 *
 * Verifies the CSRF state, exchanges the authorization code for tokens,
 * fetches the user's profile, creates or finds the user in the database,
 * issues our own JWTs, sets HttpOnly cookies, and redirects to the dashboard.
 */
export async function GET(req: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return errorRedirect(req, 'google_not_configured');
    }

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      return errorRedirect(req, error);
    }

    if (!code || !state) {
      return errorRedirect(req, 'missing_code_or_state');
    }

    // Verify CSRF state
    const expectedState = req.cookies.get('aiui-oauth-state')?.value;
    if (!expectedState || expectedState !== state) {
      return errorRedirect(req, 'invalid_state');
    }

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('Google token exchange failed:', await tokenRes.text());
      return errorRedirect(req, 'token_exchange_failed');
    }

    const tokens = (await tokenRes.json()) as GoogleTokenResponse;

    // Fetch user profile
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) {
      console.error('Google userinfo failed:', await userRes.text());
      return errorRedirect(req, 'userinfo_failed');
    }

    const profile = (await userRes.json()) as GoogleUserInfo;

    if (!profile.email || !profile.email_verified) {
      return errorRedirect(req, 'email_not_verified');
    }

    // Find or create user
    const db = getDb();
    const googleSub = `google-${profile.sub}`;

    // Try by google sub first, then by email
    let [user] = await db.select().from(users).where(eq(users.cognitoSub, googleSub)).limit(1);

    if (!user) {
      const [byEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, profile.email))
        .limit(1);

      if (byEmail) {
        // Existing user signing in with Google for the first time — link the account
        await db
          .update(users)
          .set({
            cognitoSub: googleSub,
            avatarUrl: profile.picture ?? byEmail.avatarUrl,
          })
          .where(eq(users.id, byEmail.id));
        user = {
          ...byEmail,
          cognitoSub: googleSub,
          avatarUrl: profile.picture ?? byEmail.avatarUrl,
        };
      } else {
        // Brand new user
        const [created] = await db
          .insert(users)
          .values({
            email: profile.email,
            name: profile.name || profile.email.split('@')[0],
            avatarUrl: profile.picture ?? null,
            cognitoSub: googleSub,
            // passwordHash is null — Google-only account
          })
          .returning();
        user = created;
      }
    }

    // Issue our own JWTs
    const { accessToken, idToken } = await createToken(user.id, user.email);

    // Determine post-signin redirect
    const redirectTo = req.cookies.get('aiui-oauth-redirect')?.value ?? '/dashboard';
    const safeRedirect = decodeURIComponent(redirectTo).startsWith('/')
      ? decodeURIComponent(redirectTo)
      : '/dashboard';

    const response = NextResponse.redirect(new URL(safeRedirect, req.url));

    // Set auth cookies
    setAuthCookies(response, accessToken, idToken);

    // Clear OAuth state cookies
    const isSecure = process.env.NODE_ENV === 'production';
    const securePart = isSecure ? '; Secure' : '';
    response.headers.append(
      'Set-Cookie',
      `aiui-oauth-state=; Path=/; SameSite=Lax; HttpOnly${securePart}; Max-Age=0`
    );
    response.headers.append(
      'Set-Cookie',
      `aiui-oauth-redirect=; Path=/; SameSite=Lax; HttpOnly${securePart}; Max-Age=0`
    );

    return response;
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return errorRedirect(req, 'internal_error');
  }
}

function errorRedirect(req: NextRequest, reason: string): NextResponse {
  const signInUrl = new URL('/sign-in', req.url);
  signInUrl.searchParams.set('error', reason);
  return NextResponse.redirect(signInUrl);
}
