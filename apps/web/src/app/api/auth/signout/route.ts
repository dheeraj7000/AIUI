import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth-cookies';

/**
 * POST /api/auth/signout — Clear HttpOnly auth cookies.
 *
 * Because the auth cookies are HttpOnly, client-side JavaScript cannot remove
 * them via `document.cookie`. This endpoint sets Max-Age=0 on each cookie so
 * the browser expires them.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
