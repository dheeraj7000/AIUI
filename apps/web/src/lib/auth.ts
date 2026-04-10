import type { AuthUser, AuthSession } from '@/types/auth';

// ---------------------------------------------------------------------------
// Local auth — all operations go through /api/auth/* endpoints.
//
// Architecture:
// - HttpOnly cookies set by the server are the source of truth.
// - This module never tries to read or write tokens directly. The actual
//   access/id tokens never touch JavaScript memory or document.cookie,
//   which mitigates XSS-based token theft.
// - Client state (user info, expiry) is derived from /api/auth/me on every
//   page load and after every auth action.
// ---------------------------------------------------------------------------

/**
 * No-op — reserved for future auth provider configuration.
 */
export function configureAuth(): void {
  // intentionally empty
}

/**
 * Authenticate a user with email and password via the local API.
 * The server sets HttpOnly cookies on success.
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ isSignedIn: boolean; nextStep: string }> {
  const res = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'same-origin',
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Sign in failed');
  }

  return { isSignedIn: true, nextStep: 'DONE' };
}

/**
 * Register a new user via the local API.
 */
export async function signUp(
  email: string,
  password: string,
  name?: string
): Promise<{ isSignUpComplete: boolean; nextStep: string }> {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
    credentials: 'same-origin',
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Sign up failed');
  }

  return { isSignUpComplete: true, nextStep: 'DONE' };
}

/**
 * No-op for local auth — sign-up is auto-confirmed.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export async function confirmSignUp(
  email: string,
  code: string
): Promise<{ isSignUpComplete: boolean }> {
  /* eslint-enable @typescript-eslint/no-unused-vars */
  return { isSignUpComplete: true };
}

/**
 * Sign the current user out by clearing HttpOnly cookies on the server.
 */
export async function signOut(): Promise<void> {
  await fetch('/api/auth/signout', {
    method: 'POST',
    credentials: 'same-origin',
  }).catch(() => {
    // Best-effort: even if the call fails, the client clears local state
  });
}

/**
 * No-op for local auth.
 */
export async function forgotPassword(
  email: string
): Promise<{ deliveryMedium: string; destination: string }> {
  return { deliveryMedium: 'EMAIL', destination: email };
}

/**
 * No-op for local auth.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export async function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  /* eslint-enable @typescript-eslint/no-unused-vars */
  // no-op
}

/**
 * Get the currently authenticated user by asking the server.
 * The server reads the HttpOnly access token cookie and returns the user.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user ?? null;
  } catch {
    return null;
  }
}

/**
 * Get the current session by asking the server.
 * Returns just the metadata (expiry) — actual tokens stay in HttpOnly cookies.
 */
export async function getSession(): Promise<AuthSession | null> {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.session) return null;

    return {
      // Tokens are HttpOnly — JS never sees them. Empty strings serve as a marker.
      accessToken: '',
      idToken: '',
      refreshToken: '',
      expiresAt: data.session.expiresAt ?? 0,
    };
  } catch {
    return null;
  }
}

/**
 * Refresh the current session. The server reads the HttpOnly cookie,
 * validates it, and rotates the tokens (also via HttpOnly cookies).
 */
export async function refreshSession(): Promise<AuthSession | null> {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'same-origin',
    });

    if (!res.ok) return null;

    const data = await res.json();

    return {
      accessToken: '',
      idToken: '',
      refreshToken: '',
      expiresAt: data.expiresAt ?? 0,
    };
  } catch {
    return null;
  }
}
