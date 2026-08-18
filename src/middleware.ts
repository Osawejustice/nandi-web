import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasToken = request.cookies.has('token');

  const isProtectedRoute = pathname.startsWith('/dashboard')
    || pathname.startsWith('/inbox')
    || pathname.startsWith('/contacts')
    || pathname.startsWith('/campaigns')
    || pathname.startsWith('/analytics')
    || pathname.startsWith('/settings')
    || pathname.startsWith('/create-organization');

  const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/signup';

  if (isProtectedRoute && !hasToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && hasToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
