'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SignOutButton } from './auth/SignOutButton';
import { UserAvatar } from './auth/UserAvatar';
import { GlobalSearch } from './GlobalSearch';
import { ThemeToggle } from './ui/ThemeToggle';

export function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="glass sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
                TaskForge
              </span>
            </Link>

            {/* Navigation links */}
            {session && (
              <div className="hidden md:flex ml-10 space-x-2">
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive('/dashboard')
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/30'
                      : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/projects"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive('/projects') || pathname.startsWith('/projects/')
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/30'
                      : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  Projects
                </Link>
                <Link
                  href="/my-issues"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive('/my-issues')
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/30'
                      : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  My Issues
                </Link>
                {(session.user.role === 'admin' || session.user.role === 'manager') && (
                  <Link
                    href="/admin"
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive('/admin') || pathname.startsWith('/admin/')
                        ? 'bg-gradient-to-r from-danger-500 to-danger-600 text-white shadow-md shadow-danger-500/30'
                        : 'text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/10'
                    }`}
                  >
                    {session.user.role === 'admin' ? 'Admin' : 'Admin'}
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="flex items-center gap-4">
            {/* Global Search */}
            {session && <GlobalSearch />}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Keyboard shortcuts hint */}
            <button
              onClick={() => {
                // Trigger keyboard shortcut help by dispatching ? key event
                const event = new KeyboardEvent('keydown', { key: '?' });
                window.dispatchEvent(event);
              }}
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 group shadow-sm"
              title="Keyboard shortcuts (?)"
              aria-label="Show keyboard shortcuts"
            >
              <span className="text-neutral-600 group-hover:text-primary-600 dark:text-neutral-300 dark:group-hover:text-primary-400 text-lg font-bold transition-colors">
                ?
              </span>
            </button>

            {session ? (
              <>
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200">
                  <UserAvatar size={36} />
                  <div className="hidden sm:block">
                    <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                      {session.user.name}
                    </div>
                    {session.user.role && (
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 capitalize font-medium">
                        {session.user.role}
                      </div>
                    )}
                  </div>
                </div>
                <SignOutButton className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:text-danger-600 dark:hover:text-danger-400 transition-colors">
                  Sign Out
                </SignOutButton>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
