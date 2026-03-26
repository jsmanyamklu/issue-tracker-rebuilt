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
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">
                TaskForge
              </span>
            </Link>

            {/* Navigation links */}
            {session && (
              <div className="hidden md:flex ml-10 space-x-4">
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/projects"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/projects') || pathname.startsWith('/projects/')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Projects
                </Link>
                <Link
                  href="/my-issues"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/my-issues')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  My Issues
                </Link>
                {(session.user.role === 'admin' || session.user.role === 'manager') && (
                  <Link
                    href="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/admin') || pathname.startsWith('/admin/')
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10'
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
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
              title="Keyboard shortcuts (?)"
              aria-label="Show keyboard shortcuts"
            >
              <span className="text-gray-500 group-hover:text-gray-700 dark:text-gray-200 text-lg font-medium">
                ?
              </span>
            </button>

            {session ? (
              <>
                <div className="flex items-center gap-2">
                  <UserAvatar size={32} />
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {session.user.name}
                    </div>
                    {session.user.role && (
                      <div className="text-xs text-gray-500 capitalize">
                        {session.user.role}
                      </div>
                    )}
                  </div>
                </div>
                <SignOutButton className="text-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:text-gray-300">
                  Sign Out
                </SignOutButton>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
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
