/**
 * Type helpers for extracting authenticated user information from requests
 * that have been processed by the auth middleware.
 */

export interface AuthenticatedContext {
  userId: string;
  userEmail: string;
}

/**
 * Extract the authenticated user from a request that has passed through
 * the auth middleware. Returns `null` if the required headers are missing.
 */
export function getUserFromRequest(req: Request): AuthenticatedContext | null {
  const userId = req.headers.get('x-user-id');
  const userEmail = req.headers.get('x-user-email');

  if (!userId) {
    return null;
  }

  return {
    userId,
    userEmail: userEmail ?? '',
  };
}
