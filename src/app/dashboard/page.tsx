import { getSession } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { issueService, projectService } from '@/services';
import { redirect } from 'next/navigation';

async function getDashboardData(userId: string) {
  try {
    const [summary, recentIssues, projects] = await Promise.all([
      issueService.getDashboardSummary(userId),
      issueService.getByAssigneeId(userId),
      projectService.getAll(),
    ]);

    return {
      summary,
      recentIssues: recentIssues.slice(0, 5),
      projects,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return {
      summary: {
        assignedToMe: 0,
        reportedByMe: 0,
        openIssues: 0,
        closedIssues: 0,
      },
      recentIssues: [],
      projects: [],
    };
  }
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const user = session.user;
  const { summary, recentIssues, projects } = await getDashboardData(user.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Welcome back, {user.name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-primary-600">
                {summary.assignedToMe || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Assigned to Me</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {summary.reportedByMe || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Reported by Me</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {summary.openIssues || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Open Issues</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-gray-600 dark:text-gray-300">
                {summary.closedIssues || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Closed Issues</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Issues Assigned to You</CardTitle>
            </CardHeader>
            <CardContent>
              {recentIssues.length > 0 ? (
                <div className="space-y-3">
                  {recentIssues.map((issue: any) => (
                    <Link
                      key={issue.id}
                      href={`/issues/${issue.id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {/* Reporter Avatar */}
                        <div className="flex-shrink-0">
                          {issue.reporter?.avatar_url ? (
                            <img
                              src={issue.reporter.avatar_url}
                              alt={issue.reporter.name}
                              title={`Reporter: ${issue.reporter.name}`}
                              className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700"
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold"
                              title={issue.reporter ? `Reporter: ${issue.reporter.name}` : 'Unknown'}
                            >
                              {issue.reporter?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">{issue.title}</h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant={issue.priority === 'critical' || issue.priority === 'high' ? 'danger' : 'default'}>
                              {issue.priority}
                            </Badge>
                            <Badge variant="info">{issue.type}</Badge>
                            <Badge variant={issue.status === 'open' ? 'warning' : issue.status === 'in_progress' ? 'info' : 'success'}>
                              {issue.status.replace('_', ' ')}
                            </Badge>
                            {(() => {
                              const dueDate = issue.due_date ? new Date(issue.due_date) : null;
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const isOverdue = dueDate && dueDate < today && issue.status !== 'closed' && issue.status !== 'resolved';
                              if (isOverdue) {
                                const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                                return (
                                  <Badge variant="danger" className="animate-pulse text-xs">
                                    🚨 {daysOverdue}d overdue
                                  </Badge>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No issues assigned to you</p>
              )}
              <div className="mt-4">
                <Link
                  href="/my-issues"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View all your issues →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Projects</CardTitle>
                <Link
                  href="/projects/new"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  + New Project
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.slice(0, 5).map((project: any) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white">{project.name}</h4>
                      {project.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">
                          {project.description}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No projects yet</p>
              )}
              <div className="mt-4">
                <Link
                  href="/projects"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View all projects →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
