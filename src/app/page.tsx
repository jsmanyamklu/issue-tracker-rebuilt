import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

/**
 * Home page
 * Redirects authenticated users to dashboard
 * Shows landing page for unauthenticated users
 */
export default async function HomePage() {
  const session = await getSession();

  // Redirect authenticated users to dashboard
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">
                TaskForge
              </h1>
            </div>
            <div>
              <Link
                href="/auth/signin"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl md:text-7xl">
            Track Issues,
            <span className="text-primary-600"> Ship Faster</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            A production-grade task and issue management platform with clean architecture,
            AI-powered insights, and zero vendor lock-in.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/auth/signin"
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium text-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="px-8 py-3 bg-white text-primary-600 rounded-lg font-medium text-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="mt-32 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Keyboard-First UX
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Navigate faster with keyboard shortcuts. Press{' '}
              <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-gray-100 border rounded">?</kbd>{' '}
              to see all shortcuts. 10x faster than mouse.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Project Management
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Organize issues into projects. Track progress, assign tasks, and
              collaborate with your team.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              AI-Powered Insights
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Automatic issue classification, root cause analysis, and similar
              issue detection using AI.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Clean Architecture
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Built with clean architecture principles. No vendor lock-in, full
              control over your code.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-32 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Built with Modern Technologies
          </h2>
          <p className="text-gray-600 mb-8">
            Next.js 15, React 19, TypeScript, PostgreSQL, NextAuth
          </p>
          <div className="flex justify-center gap-8 text-gray-400 dark:text-gray-300">
            <span className="text-4xl font-bold">Next.js</span>
            <span className="text-4xl font-bold">React</span>
            <span className="text-4xl font-bold">PostgreSQL</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-32 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-300">
          <p>© 2026 TaskForge. Built with clean architecture principles.</p>
        </div>
      </footer>
    </div>
  );
}
