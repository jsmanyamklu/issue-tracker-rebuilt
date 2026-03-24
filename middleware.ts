import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/**
 * Middleware to protect routes that require authentication
 * Automatically redirects unauthenticated users to sign-in page
 */
export default withAuth(
  function middleware(req) {
    // You can add additional logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
);

/**
 * Configure which routes require authentication
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/projects/:path*',
    '/issues/:path*',
    '/my-issues/:path*',
    '/api/projects/:path*',
    '/api/issues/:path*',
    '/api/comments/:path*',
  ],
};
