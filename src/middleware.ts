import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token as any;

    // Protege /admin
    if (pathname.startsWith('/admin')) {
      if (!token || token.role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        if (pathname.startsWith('/admin'))   return !!token;
        if (pathname.startsWith('/orders'))  return !!token;
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/', '/admin/:path*', '/orders/:path*'],
};