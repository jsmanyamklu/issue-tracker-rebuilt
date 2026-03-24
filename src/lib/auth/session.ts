import { getServerSession } from 'next-auth';
import { authOptions } from './config';
import { UnauthorizedError } from '@/lib/errors';

/**
 * Get the current user session on the server side
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Get the current user or throw an error if not authenticated
 */
export async function getCurrentUser() {
  const session = await getSession();

  if (!session || !session.user) {
    throw new UnauthorizedError('You must be signed in to access this resource');
  }

  return session.user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}
