import type { AuthUser, AuthSession } from '@/types/auth';

// ---------------------------------------------------------------------------
// Local auth — all operations go through /api/auth/* endpoints.
// ---------------------------------------------------------------------------

// Session stored in memory on the client side
let currentUser: AuthUser | null = null;
let currentSession: AuthSession | null = null;

/**
 * No-op — reserved for future auth provider configuration.
 */
export function configureAuth(): void {
  // intentionally empty
}

/**
 * Authenticate a user with email and password via the local API.
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ isSignedIn: boolean; nextStep: string }> {
  const res = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? 'Sign in failed');
  }

  const data = await res.json();

  currentUser = {
    id: data.user.id,
    email: data.user.email,
    emailVerified: true,
    sub: data.user.id,
  };

  currentSession = {
    accessToken: data.accessToken,
    idToken: data.idToken,
    refreshToken: '',
    expiresAt: data.expiresAt,
  };

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
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? 'Sign up failed');
  }

  // Auto sign-in after signup
  const data = await res.json();

  currentUser = {
    id: data.user.id,
    email: data.user.email,
    emailVerified: true,
    sub: data.user.id,
  };

  currentSession = {
    accessToken: data.accessToken,
    idToken: data.idToken,
    refreshToken: '',
    expiresAt: data.expiresAt,
  };

  return { isSignUpComplete: true, nextStep: 'DONE' };
}

/**
 * No-op for local auth — sign-up is auto-confirmed.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function confirmSignUp(
  email: string,
  code: string
): Promise<{ isSignUpComplete: boolean }> {
  return { isSignUpComplete: true };
}

/**
 * Sign the current user out.
 */
export async function signOut(): Promise<void> {
  currentUser = null;
  currentSession = null;
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  // no-op
}

/**
 * Get the currently authenticated user from memory.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  return currentUser;
}

/**
 * Get the current session from memory.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getSession(forceRefresh = false): Promise<AuthSession | null> {
  return currentSession;
}

/**
 * Return the current session (no real refresh for local auth).
 */
export async function refreshSession(): Promise<AuthSession | null> {
  return currentSession;
}
