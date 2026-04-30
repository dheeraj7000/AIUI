import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

/**
 * Build a sign-in redirect URL using the public-facing origin from the
 * load balancer headers (x-forwarded-host / x-forwarded-proto), NOT the
 * internal container hostname that request.url contains.
 */
function publicSignInUrl(request: NextRequest, pathname: string): URL {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const host = forwardedHost ?? request.headers.get('host');
  const proto = forwardedProto ?? 'https';

  let url: URL;
  if (host && !host.includes(':3000')) {
    url = new URL('/sign-in', `${proto}://${host}`);
  } else {
    url = new URL('/sign-in', request.url);
  }
  url.searchParams.set('redirect', pathname);
  return url;
}

// ---------------------------------------------------------------------------
// Public paths that bypass authentication
// ---------------------------------------------------------------------------

const PUBLIC_PAGE_PREFIXES = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/verify-email',
  '/docs',
  '/status',
  '/privacy',
  '/terms',
  '/_next',
  '/favicon.ico',
];

const PUBLIC_API_PREFIXES = ['/api/health', '/api/auth/', '/llm/'];

function isPublicPath(pathname: string): boolean {
  if (pathname === '/') return true;
  for (const prefix of PUBLIC_PAGE_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return true;
  }
  return false;
}

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

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const isApiRoute = pathname.startsWith('/api/') || pathname.startsWith('/llm/');

  if (isApiRoute && isPublicApiPath(pathname)) {
    return NextResponse.next();
  }

  // Protected API routes: accept Authorization header (for external clients
  // like MCP) OR HttpOnly cookie (for browser-originated requests).
  if (isApiRoute) {
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const cookieToken = request.cookies.get('aiui-access-token')?.value ?? null;
    // Use || (not ??) so empty Bearer headers fall through to the cookie.
    const token = headerToken || cookieToken;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const claims = await verifyToken(token);
    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', claims.sub);
    requestHeaders.set('x-user-email', claims.email ?? '');

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Protected pages: check cookie
  const token = request.cookies.get('aiui-access-token')?.value;

  if (!token) {
    return NextResponse.redirect(publicSignInUrl(request, pathname));
  }

  const claims = await verifyToken(token);
  if (!claims) {
    return NextResponse.redirect(publicSignInUrl(request, pathname));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', claims.sub);
  requestHeaders.set('x-user-email', claims.email ?? '');

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
