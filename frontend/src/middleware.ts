import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAMES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

function hasSession(req: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some((name) => !!req.cookies.get(name)?.value);
}

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const isLoggedIn = hasSession(req);

  const isProtected = pathname === '/' || pathname.startsWith('/ranking');
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/ranking/:path*', '/login'],
};
