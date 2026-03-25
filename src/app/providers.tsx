'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/ui/Toast';
import { ThemeProvider } from '@/contexts/ThemeContext';

interface ProvidersProps {
  children: ReactNode;
  session?: any;
}

/**
 * Client-side providers wrapper
 * Wraps the app with NextAuth SessionProvider, ToastProvider, and ThemeProvider
 */
export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <ToastProvider>
          {children}
          <ToastContainer />
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
