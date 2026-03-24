import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/config';

/**
 * NextAuth API route handler
 * Handles all authentication routes: /api/auth/signin, /api/auth/signout, etc.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
