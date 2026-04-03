import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

// ---------------------------------------------------------------------------
// Public paths that bypass authentication
// ---------------------------------------------------------------------------

const PUBLIC_PAGE_PREFIXES = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/verify-email',
  '/dashboard',
  '/style-packs',
  '/components',
  '/projects',
  '/studio',
  '/import',
  '/api-keys',
  '/_next',
  '/favicon.ico',
];

const PUBLIC_API_PREFIXES = ['/api/health', '/api/auth/'];

/**
 * Returns true if the request path should bypass authentication entirely.
 */
function isPublicPath(pathname: string): boolean {
  // Root page is public
  if (pathname === '/') return true;

  for (const prefix of PUBLIC_PAGE_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return true;
  }

  return false;
}

/**
 * Returns true if the API route should bypass authentication.
 */
function isPublicApiPath(pathname: string): boolean {
  for (const prefix of PUBLIC_API_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let public pages through without checks
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const isApiRoute = pathname.startsWith('/api/');

  // Let public API routes through
  if (isApiRoute && isPublicApiPath(pathname)) {
    return NextResponse.next();
  }

  // -------------------------------------------------------------------------
  // Protected API routes: check Authorization header
  // -------------------------------------------------------------------------
  if (isApiRoute) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const claims = await verifyToken(token);

    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Forward user info to API route handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', claims.sub);
    requestHeaders.set('x-user-email', claims.email ?? '');

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // -------------------------------------------------------------------------
  // Protected pages: check cookie
  // -------------------------------------------------------------------------
  const token = request.cookies.get('aiui-access-token')?.value;

  if (!token) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  const claims = await verifyToken(token);

  if (!claims) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Forward user info to the page
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', claims.sub);
  requestHeaders.set('x-user-email', claims.email ?? '');

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

// ---------------------------------------------------------------------------
// Matcher -- exclude static assets and Next.js internals
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - Public assets in /public
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
