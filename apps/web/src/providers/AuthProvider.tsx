'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthState, AuthUser, AuthSession } from '@/types/auth';
import {
  configureAuth,
  getCurrentUser,
  getSession,
  refreshSession,
  signIn as authSignIn,
  signUp as authSignUp,
  confirmSignUp as authConfirmSignUp,
  signOut as authSignOut,
  forgotPassword as authForgotPassword,
  confirmForgotPassword as authConfirmForgotPassword,
} from '@/lib/auth';
import { clearSession, setActiveOrgId } from '@/lib/session';
import {
  onSessionMessage,
  broadcastSignOut,
  broadcastSessionUpdate,
  SESSION_CLEARED,
  SESSION_UPDATED,
  ORG_SWITCHED,
} from '@/lib/session-sync';

// ---------------------------------------------------------------------------
// Context types
// ---------------------------------------------------------------------------

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ isSignedIn: boolean; nextStep: string }>;
  signUp: (
    email: string,
    password: string,
    name?: string
  ) => Promise<{ isSignUpComplete: boolean; nextStep: string }>;
  confirmSignUp: (email: string, code: string) => Promise<{ isSignUpComplete: boolean }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ deliveryMedium: string; destination: string }>;
  confirmForgotPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  dismissIdleWarning: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/** How many ms before token expiry we proactively refresh (5 minutes). */
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

/** Idle timeout durations. */
const IDLE_WARNING_MS = 25 * 60 * 1000; // 25 minutes
const IDLE_SIGNOUT_MS = 30 * 60 * 1000; // 30 minutes

/** Throttle interval for activity tracking. */
const ACTIVITY_THROTTLE_MS = 30 * 1000; // 30 seconds

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isIdleWarning, setIsIdleWarning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleWarningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleSignOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // -----------------------------------------------------------------------
  // Token auto-refresh
  // -----------------------------------------------------------------------

  const scheduleRefresh = useCallback((sess: AuthSession | null) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (!sess || !sess.expiresAt) return;

    const msUntilExpiry = sess.expiresAt - Date.now();
    const delay = Math.max(msUntilExpiry - REFRESH_BUFFER_MS, 0);

    refreshTimerRef.current = setTimeout(async () => {
      try {
        const newSession = await refreshSession();
        if (newSession) {
          setSession(newSession);
          broadcastSessionUpdate();
          scheduleRefresh(newSession);
        }
      } catch {
        // refresh failed -- user will be prompted to re-authenticate
      }
    }, delay);
  }, []);

  // -----------------------------------------------------------------------
  // Idle timeout
  // -----------------------------------------------------------------------

  const clearIdleTimers = useCallback(() => {
    if (idleWarningTimerRef.current) {
      clearTimeout(idleWarningTimerRef.current);
      idleWarningTimerRef.current = null;
    }
    if (idleSignOutTimerRef.current) {
      clearTimeout(idleSignOutTimerRef.current);
      idleSignOutTimerRef.current = null;
    }
  }, []);

  const performIdleSignOut = useCallback(async () => {
    clearIdleTimers();
    setIsIdleWarning(false);
    try {
      await authSignOut();
    } catch {
      // Best-effort sign-out
    }
    setUser(null);
    setSession(null);
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    clearSession();
    broadcastSignOut();
    router.push('/sign-in');
  }, [clearIdleTimers, router]);

  const resetIdleTimers = useCallback(() => {
    clearIdleTimers();
    setIsIdleWarning(false);

    idleWarningTimerRef.current = setTimeout(() => {
      setIsIdleWarning(true);
    }, IDLE_WARNING_MS);

    idleSignOutTimerRef.current = setTimeout(() => {
      performIdleSignOut();
    }, IDLE_SIGNOUT_MS);
  }, [clearIdleTimers, performIdleSignOut]);

  // Activity tracking (throttled)
  useEffect(() => {
    // Only track activity when the user is authenticated
    if (!user || !session) return;

    resetIdleTimers();

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityRef.current < ACTIVITY_THROTTLE_MS) return;
      lastActivityRef.current = now;
      resetIdleTimers();
    };

    const events: Array<keyof WindowEventMap> = ['mousemove', 'keydown', 'click'];
    events.forEach((event) => window.addEventListener(event, handleActivity));

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      clearIdleTimers();
    };
  }, [user, session, resetIdleTimers, clearIdleTimers]);

  // -----------------------------------------------------------------------
  // Multi-tab sync
  // -----------------------------------------------------------------------

  useEffect(() => {
    const unsubscribe = onSessionMessage((msg) => {
      switch (msg.type) {
        case SESSION_CLEARED:
          // Another tab signed out -- mirror locally
          setUser(null);
          setSession(null);
          setIsIdleWarning(false);
          clearSession();
          clearIdleTimers();
          if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
          }
          router.push('/sign-in');
          break;
        case SESSION_UPDATED:
          // Another tab refreshed the session — re-read it from cookies via API
          getSession()
            .then((newSession) => {
              if (newSession) {
                setSession(newSession);
                scheduleRefresh(newSession);
              }
            })
            .catch(() => {});
          break;
        case ORG_SWITCHED:
          router.refresh();
          break;
      }
    });

    return unsubscribe;
  }, [router, scheduleRefresh, clearIdleTimers]);

  // -----------------------------------------------------------------------
  // Initialisation -- run once on mount
  // -----------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        configureAuth();

        // Ask the server who we are. The server reads the HttpOnly cookie
        // and returns user info if the token is valid. This is the source
        // of truth on cold start (page refresh) — JavaScript cannot read
        // HttpOnly cookies directly.
        const [currentUser, currentSession] = await Promise.all([getCurrentUser(), getSession()]);
        if (cancelled) return;

        if (currentUser && currentSession) {
          setUser(currentUser);
          setSession(currentSession);
          scheduleRefresh(currentSession);

          // Always re-sync the active org from the server on cold start.
          // The cached value in localStorage can belong to a previous account
          // (e.g. after delete-account + fresh sign-up, or when switching
          // test users), in which case org-scoped requests would 403. The
          // setup endpoint is idempotent, so overwriting is safe.
          try {
            const res = await fetch('/api/auth/setup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'same-origin',
              body: JSON.stringify({}),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.orgId && !cancelled) setActiveOrgId(data.orgId);
            }
          } catch {
            /* non-blocking */
          }
        }
        // If no user, leave state null — middleware will redirect protected routes
      } catch {
        // Network error or similar — leave unauthenticated
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [scheduleRefresh]);

  // -----------------------------------------------------------------------
  // Auth actions
  // -----------------------------------------------------------------------

  const ensureOrg = useCallback(async () => {
    // Always re-sync from the server. A cached orgId in localStorage can
    // belong to a previous account, so we overwrite rather than guarding.
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.orgId) setActiveOrgId(data.orgId);
      }
    } catch {
      /* non-blocking */
    }
  }, []);

  const handleSignIn = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        const result = await authSignIn(email, password);
        if (result.isSignedIn) {
          const [currentUser, currentSession] = await Promise.all([getCurrentUser(), getSession()]);
          setUser(currentUser);
          setSession(currentSession);
          if (currentSession) {
            broadcastSessionUpdate();
            if (currentUser) {
              await ensureOrg();
            }
          }
          scheduleRefresh(currentSession);
        }
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Sign in failed';
        setError(message);
        throw err;
      }
    },
    [scheduleRefresh, ensureOrg]
  );

  const handleSignUp = useCallback(
    async (email: string, password: string, name?: string) => {
      setError(null);
      try {
        const result = await authSignUp(email, password, name);
        if (result.isSignUpComplete) {
          const [currentUser, currentSession] = await Promise.all([getCurrentUser(), getSession()]);
          setUser(currentUser);
          setSession(currentSession);
          if (currentSession) {
            broadcastSessionUpdate();
            if (currentUser) {
              await ensureOrg();
            }
          }
          scheduleRefresh(currentSession);
        }
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Sign up failed';
        setError(message);
        throw err;
      }
    },
    [scheduleRefresh, ensureOrg]
  );

  const handleConfirmSignUp = useCallback(async (email: string, code: string) => {
    setError(null);
    try {
      return await authConfirmSignUp(email, code);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Confirmation failed';
      setError(message);
      throw err;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setError(null);
    try {
      // Sign out
      await authSignOut();
      // Clear local state
      setUser(null);
      setSession(null);
      setIsIdleWarning(false);
      // Clear timers
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      clearIdleTimers();
      // Clear persisted session (cookies + localStorage)
      clearSession();
      // Notify other tabs
      broadcastSignOut();
      // Redirect to sign-in
      router.push('/sign-in');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setError(message);
      throw err;
    }
  }, [clearIdleTimers, router]);

  const handleForgotPassword = useCallback(async (email: string) => {
    setError(null);
    try {
      return await authForgotPassword(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      setError(message);
      throw err;
    }
  }, []);

  const handleConfirmForgotPassword = useCallback(
    async (email: string, code: string, newPassword: string) => {
      setError(null);
      try {
        await authConfirmForgotPassword(email, code, newPassword);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Password reset confirmation failed';
        setError(message);
        throw err;
      }
    },
    []
  );

  const handleRefreshSession = useCallback(async () => {
    setError(null);
    try {
      const newSession = await refreshSession();
      setSession(newSession);
      if (newSession) {
        broadcastSessionUpdate();
      }
      scheduleRefresh(newSession);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Session refresh failed';
      setError(message);
      throw err;
    }
  }, [scheduleRefresh]);

  const clearError = useCallback(() => setError(null), []);

  const dismissIdleWarning = useCallback(() => {
    setIsIdleWarning(false);
    resetIdleTimers();
  }, [resetIdleTimers]);

  // -----------------------------------------------------------------------
  // Memoised context value
  // -----------------------------------------------------------------------

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isAuthenticated: !!user && !!session,
      isLoading,
      isIdleWarning,
      error,
      signIn: handleSignIn,
      signUp: handleSignUp,
      confirmSignUp: handleConfirmSignUp,
      signOut: handleSignOut,
      forgotPassword: handleForgotPassword,
      confirmForgotPassword: handleConfirmForgotPassword,
      refreshSession: handleRefreshSession,
      clearError,
      dismissIdleWarning,
    }),
    [
      user,
      session,
      isLoading,
      isIdleWarning,
      error,
      handleSignIn,
      handleSignUp,
      handleConfirmSignUp,
      handleSignOut,
      handleForgotPassword,
      handleConfirmForgotPassword,
      handleRefreshSession,
      clearError,
      dismissIdleWarning,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Access the authentication state and actions from within the AuthProvider tree.
 *
 * @throws if called outside of an AuthProvider
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
