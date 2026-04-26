import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token as any;

    // Protege /admin — exige role admin
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
        if (pathname.startsWith('/admin'))    return !!token;
        if (pathname.startsWith('/orders'))   return !!token;
        // /cart agora é LIVRE — só /checkout exige login
        if (pathname.startsWith('/checkout')) return !!token;
        return true;
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/orders/:path*',
    '/checkout',
    '/checkout/:path*',
  ],
};