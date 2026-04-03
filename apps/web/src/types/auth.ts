export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  sub: string;
}

export interface AuthSession {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isIdleWarning: boolean;
  error: string | null;
}
