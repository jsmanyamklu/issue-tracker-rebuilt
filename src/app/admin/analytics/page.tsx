import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Link from 'next/link';

// This will be a client component for interactivity
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

export const metadata = {
  title: 'Analytics - TaskForge Admin',
  description: 'AI-powered analytics and insights',
};

export default async function AnalyticsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/signin');
  }

  // Only admin and manager can access analytics
  if (session.user.role !== 'admin' && session.user.role !== 'manager') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
              Access Denied
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-4">
              You don&apos;t have permission to access this page. Only Admins and Managers can view analytics.
            </p>
            <Link
              href="/dashboard"
              className="text-red-700 dark:text-red-300 underline hover:text-red-900 dark:hover:text-red-100"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Analytics & Insights
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                AI-powered analysis of your team&apos;s activity and performance
              </p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Back to Admin
            </Link>
          </div>
        </div>

        {/* Dashboard Component */}
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
