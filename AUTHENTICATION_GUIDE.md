# Authentication Guide

## Overview

This application uses **NextAuth.js** for authentication with Google and GitHub OAuth providers. The implementation follows clean architecture principles with proper separation of concerns.

## Architecture

```
User → Sign In Page → OAuth Provider → NextAuth Callback → Database → JWT Token → Session
```

## Setup Instructions

### 1. Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/issue_tracker

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 2. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

### 3. Configure OAuth Providers

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. Copy Client ID and Client Secret to `.env`

#### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in application details:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env`

## File Structure

```
src/
├── lib/auth/
│   ├── config.ts          # NextAuth configuration
│   ├── session.ts         # Session utilities
│   └── index.ts           # Exports
├── components/auth/
│   ├── SignInButton.tsx   # OAuth sign-in buttons
│   ├── SignOutButton.tsx  # Sign-out button
│   ├── UserAvatar.tsx     # User avatar display
│   └── AuthGuard.tsx      # Client-side auth guard
├── app/
│   ├── api/auth/
│   │   └── [...nextauth]/
│   │       └── route.ts   # NextAuth API route
│   ├── auth/
│   │   ├── signin/        # Sign-in page
│   │   └── error/         # Error page
│   ├── layout.tsx         # Root layout with SessionProvider
│   └── providers.tsx      # Client providers wrapper
└── middleware.ts          # Route protection middleware
```

## Core Components

### 1. NextAuth Configuration (`src/lib/auth/config.ts`)

Handles:
- OAuth provider configuration
- User creation/update in database
- JWT token generation with user ID
- Session management

### 2. Middleware (`middleware.ts`)

Protects routes that require authentication:
- `/dashboard/*`
- `/projects/*`
- `/issues/*`
- `/my-issues/*`
- API routes: `/api/projects/*`, `/api/issues/*`, `/api/comments/*`

### 3. Session Utilities (`src/lib/auth/session.ts`)

Server-side helpers:
- `getSession()` - Get current session
- `getCurrentUser()` - Get user or throw error
- `isAuthenticated()` - Check auth status

## Usage Examples

### Server Components

```typescript
import { getCurrentUser } from '@/lib/auth';

export default async function Page() {
  const user = await getCurrentUser();

  return <div>Welcome, {user.name}!</div>;
}
```

### Client Components

```typescript
'use client';

import { useSession } from 'next-auth/react';

export default function Component() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return <div>Not signed in</div>;

  return <div>Welcome, {session.user.name}!</div>;
}
```

### API Routes

```typescript
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    // User is authenticated
    return Response.json({ userId: user.id });
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
```

### Using Auth Components

```typescript
import { SignInButton } from '@/components/auth/SignInButton';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { UserAvatar } from '@/components/auth/UserAvatar';

// Sign in with Google
<SignInButton provider="google" />

// Sign in with GitHub
<SignInButton provider="github" />

// Sign out
<SignOutButton />

// Display user avatar
<UserAvatar size={40} />
```

## Authentication Flow

1. **User clicks "Sign In"** → Redirected to `/auth/signin`
2. **Selects OAuth provider** → Redirected to Google/GitHub
3. **Authorizes application** → Redirected back to callback URL
4. **NextAuth processes callback**:
   - Checks if user exists in database
   - Creates new user or updates existing
   - Generates JWT token with user ID
5. **User is signed in** → Redirected to `/dashboard`

## Database Integration

When a user signs in:

1. NextAuth receives OAuth profile
2. Checks database for existing user (by provider + provider_id)
3. If new user:
   - Creates record in `users` table
   - Stores: email, name, avatar_url, provider, provider_id
4. If existing user:
   - Updates name and avatar_url
5. Returns user ID in JWT token

## Session Management

- **Strategy**: JWT (no database sessions)
- **Max Age**: 30 days
- **Token Contents**: User ID, email, name, avatar
- **Storage**: HTTP-only cookies

## Security Features

- JWT tokens stored in HTTP-only cookies
- CSRF protection built into NextAuth
- Secure session handling
- No sensitive data in JWT
- Automatic token refresh

## Protected Routes

Routes requiring authentication are configured in `middleware.ts`:

```typescript
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
```

Unauthenticated users are automatically redirected to `/auth/signin`.

## Error Handling

Authentication errors are handled by the error page at `/auth/error`.

Common errors:
- `Configuration` - Server configuration issue
- `AccessDenied` - User denied access
- `OAuthAccountNotLinked` - Email already associated with another provider
- `SessionRequired` - Authentication required

## TypeScript Types

Custom NextAuth types are defined in `src/types/next-auth.d.ts`:

```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
  };
}
```

## Testing

To test authentication:

1. Start the development server: `npm run dev`
2. Navigate to `/auth/signin`
3. Click "Continue with Google" or "Continue with GitHub"
4. Authorize the application
5. You should be redirected to `/dashboard` after successful sign-in

## Production Deployment

1. Update `NEXTAUTH_URL` to your production URL
2. Update OAuth redirect URIs in provider settings
3. Generate a new `NEXTAUTH_SECRET` for production
4. Never commit `.env` file to version control
5. Use environment variables in your hosting platform

---

**Next Steps**: After authentication is working, you can implement the Repository, Service, and Controller layers for your business logic.
