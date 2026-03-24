import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { query } from '@/lib/db';
import { User } from '@/types';

/**
 * NextAuth configuration
 * Handles Google and GitHub OAuth authentication
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    /**
     * Called when user signs in
     * Creates or updates user in database
     */
    async signIn({ user, account, profile }) {
      if (!account || !user.email) {
        return false;
      }

      try {
        const provider = account.provider as 'google' | 'github';
        const providerId = account.providerAccountId;

        // Check if user exists
        const existingUser = await query<User>(
          'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
          [provider, providerId]
        );

        if (existingUser.rows.length === 0) {
          // Create new user
          await query(
            `INSERT INTO users (email, name, avatar_url, provider, provider_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              user.email,
              user.name || user.email.split('@')[0],
              user.image,
              provider,
              providerId,
            ]
          );
        } else {
          // Update existing user info
          await query(
            `UPDATE users
             SET name = $1, avatar_url = $2, email = $3, updated_at = CURRENT_TIMESTAMP
             WHERE provider = $4 AND provider_id = $5`,
            [
              user.name || existingUser.rows[0].name,
              user.image,
              user.email,
              provider,
              providerId,
            ]
          );
        }

        return true;
      } catch (error) {
        console.error('Error during sign in:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          provider: account?.provider,
          providerId: account?.providerAccountId,
          userEmail: user?.email,
        });
        return false;
      }
    },

    /**
     * Called whenever a JWT is created or updated
     * Adds user ID from database to the token
     */
    async jwt({ token, account, profile }) {
      // Only fetch from database on initial sign-in (when account is present)
      if (account) {
        const provider = account.provider as 'google' | 'github';
        const providerId = account.providerAccountId;

        // Fetch user from database
        const result = await query<User>(
          'SELECT id, email, name, avatar_url, role FROM users WHERE provider = $1 AND provider_id = $2',
          [provider, providerId]
        );

        if (result.rows.length > 0) {
          const dbUser = result.rows[0];
          token.id = dbUser.id;
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.picture = dbUser.avatar_url;
          token.role = dbUser.role;
        }
      }
      // On subsequent calls, token already has the user data persisted

      return token;
    },

    /**
     * Called whenever session is checked
     * Adds user info to the session object
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        session.user.role = token.role as string;
      }

      return session;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};
