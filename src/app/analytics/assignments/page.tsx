import { getCurrentUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { workloadService } from '@/services';
import { notificationService } from '@/services/NotificationService';

export default async function AssignmentAnalyticsPage() {
  const user = await getCurrentUser();

  // Only allow managers and admins
  if (user.role !== 'admin' && user.role !== 'manager') {
    redirect('/dashboard');
  }

  const [workloadSummary, workloadDistribution, overdueSummary, allWorkloads] = await Promise.all([
    workloadService.getWorkloadSummary(),
    workloadService.getWorkloadDistribution(),
    notificationService.getOverdueSummary(),
    workloadService.getAllUserWorkloads(),
  ]);

  // Sort workloads by score (descending)
  const sortedWorkloads = [...allWorkloads].sort((a, b) => b.workload_score - a.workload_score);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Assignment Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Team workload distribution and assignment insights
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Team Size
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {workloadSummary.total_users}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {workloadSummary.users_with_issues} with assignments
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Avg. Workload
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {workloadSummary.average_workload.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                score per person
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Overdue Issues
              </div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {overdueSummary.total_overdue}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {overdueSummary.needs_escalation} need escalation
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Best Available
              </div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400 truncate">
                {workloadSummary.best_available_user?.user_name || 'N/A'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {workloadSummary.best_available_user?.total_issues || 0} issues
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workload Distribution */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Team Workload Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Visual Bar */}
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                {workloadDistribution.underutilized.length > 0 && (
                  <div
                    className="bg-green-500 flex items-center justify-center text-sm text-white font-medium"
                    style={{
                      width: `${
                        (workloadDistribution.underutilized.length / workloadSummary.total_users) * 100
                      }%`,
                    }}
                  >
                    {workloadDistribution.underutilized.length}
                  </div>
                )}
                {workloadDistribution.balanced.length > 0 && (
                  <div
                    className="bg-yellow-500 flex items-center justify-center text-sm text-white font-medium"
                    style={{
                      width: `${
                        (workloadDistribution.balanced.length / workloadSummary.total_users) * 100
                      }%`,
                    }}
                  >
                    {workloadDistribution.balanced.length}
                  </div>
                )}
                {workloadDistribution.busy.length > 0 && (
                  <div
                    className="bg-orange-500 flex items-center justify-center text-sm text-white font-medium"
                    style={{
                      width: `${
                        (workloadDistribution.busy.length / workloadSummary.total_users) * 100
                      }%`,
                    }}
                  >
                    {workloadDistribution.busy.length}
                  </div>
                )}
                {workloadDistribution.overloaded.length > 0 && (
                  <div
                    className="bg-red-500 flex items-center justify-center text-sm text-white font-medium"
                    style={{
                      width: `${
                        (workloadDistribution.overloaded.length / workloadSummary.total_users) * 100
                      }%`,
                    }}
                  >
                    {workloadDistribution.overloaded.length}
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-4 h-4 bg-green-500 rounded"></span>
                    <span className="font-medium text-gray-900 dark:text-white">Available</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    ≤5 issues ({workloadDistribution.underutilized.length})
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-4 h-4 bg-yellow-500 rounded"></span>
                    <span className="font-medium text-gray-900 dark:text-white">Balanced</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    6-15 issues ({workloadDistribution.balanced.length})
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-4 h-4 bg-orange-500 rounded"></span>
                    <span className="font-medium text-gray-900 dark:text-white">Busy</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    16-25 issues ({workloadDistribution.busy.length})
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-4 h-4 bg-red-500 rounded"></span>
                    <span className="font-medium text-gray-900 dark:text-white">Overloaded</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    &gt;25 issues ({workloadDistribution.overloaded.length})
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Workload Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Individual Workloads</CardTitle>
              <Badge variant={workloadDistribution.overloaded.length > 0 ? 'danger' : 'success'}>
                {workloadDistribution.overloaded.length > 0
                  ? 'Rebalancing Needed'
                  : 'Well Balanced'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Team Member
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Total Issues
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Open
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      In Progress
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Overdue
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Workload Score
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedWorkloads.map((workload) => {
                    const statusInfo =
                      workload.workload_score <= 5
                        ? { label: 'Available', color: 'success' as const }
                        : workload.workload_score <= 15
                        ? { label: 'Balanced', color: 'warning' as const }
                        : workload.workload_score <= 25
                        ? { label: 'Busy', color: 'info' as const }
                        : { label: 'Overloaded', color: 'danger' as const };

                    return (
                      <tr
                        key={workload.user_id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {workload.user_name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {workload.user_email}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-gray-900 dark:text-white">
                          {workload.total_issues}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                          {workload.open_issues}
                        </td>
                        <td className="py-3 px-4 text-center text-blue-600 dark:text-blue-400">
                          {workload.in_progress_issues}
                        </td>
                        <td className="py-3 px-4 text-center text-red-600 dark:text-red-400">
                          {workload.overdue_issues}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-gray-900 dark:text-white">
                          {workload.workload_score}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={statusInfo.color}>{statusInfo.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <Link href="/dashboard">
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              ← Back to Dashboard
            </button>
          </Link>
          <Link href="/issues?status=open">
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              View Open Issues
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
