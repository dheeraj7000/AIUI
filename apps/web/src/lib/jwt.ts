import { SignJWT, jwtVerify } from 'jose';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface JwtClaims {
  sub: string;
  email?: string;
  token_use: string;
  iss: string;
  exp: number;
}

// ---------------------------------------------------------------------------
// Local secret for signing/verifying JWTs
// ---------------------------------------------------------------------------

const SECRET_KEY = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }
  return secret ?? 'aiui-local-dev-secret-change-in-production';
})();
const secret = new TextEncoder().encode(SECRET_KEY);
const ISSUER = 'aiui-local';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a signed JWT for a local user.
 */
export async function createToken(
  userId: string,
  email: string
): Promise<{ accessToken: string; idToken: string; expiresAt: number }> {
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

  const accessToken = await new SignJWT({
    sub: userId,
    email,
    token_use: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ISSUER)
    .setExpirationTime('1h')
    .sign(secret);

  const idToken = await new SignJWT({
    sub: userId,
    email,
    token_use: 'id',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ISSUER)
    .setExpirationTime('1h')
    .sign(secret);

  return { accessToken, idToken, expiresAt };
}

/**
 * Verify a locally-signed JWT access token.
 *
 * Returns the decoded payload on success, or `null` if verification fails.
 */
export async function verifyToken(token: string): Promise<JwtClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: ISSUER,
    });

    if (payload.token_use !== 'access') {
      return null;
    }

    return {
      sub: payload.sub ?? '',
      email: (payload as Record<string, unknown>).email as string | undefined,
      token_use: payload.token_use as string,
      iss: payload.iss ?? '',
      exp: payload.exp ?? 0,
    };
  } catch {
    return null;
  }
}
