import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'hse_session';

// Paths that don't require authentication
const publicPaths = ['/login', '/api/auth/login'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip static files, images, icons
  if (pathname.includes('.') || pathname.startsWith('/_next') || pathname.startsWith('/images/')) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const isPublicPath = publicPaths.includes(pathname);

  // If trying to access protected route without session -> redirect to login
  if (!sessionToken && !isPublicPath) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // If trying to access login page with session -> redirect to dashboard
  if (sessionToken && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
