import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { getSession } from '@/lib/auth';
import { Navigation } from '@/components/Navigation';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Issue Tracker',
  description: 'Production-grade issue tracking system with clean architecture',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers session={session}>
          <Navigation />
          <KeyboardShortcuts />
          {children}
        </Providers>
      </body>
    </html>
  );
}
