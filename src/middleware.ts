import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token as any;

    // Protect admin routes
    if (pathname.startsWith('/admin')) {
      if (!token || token.role !== 'admin') {
        // Fetch user role from token (set in jwt callback)
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Admin requires token
        if (pathname.startsWith('/admin')) return !!token;
        // Orders require token
        if (pathname.startsWith('/orders')) return !!token;
        // Checkout requires token
        if (pathname.startsWith('/checkout')) return true; // handled client-side
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/orders/:path*'],
};
