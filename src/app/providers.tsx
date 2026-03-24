'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
  session?: any;
}

/**
 * Client-side providers wrapper
 * Wraps the app with NextAuth SessionProvider
 */
export function Providers({ children, session }: ProvidersProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
