import { getCurrentUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

async function getUserIssues(userId: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${baseUrl}/api/issues?assignee_id=${userId}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch user issues:', error);
    return [];
  }
}

export default async function MyIssuesPage() {
  const user = await getCurrentUser();
  const issues = await getUserIssues(user.id);

  const groupedIssues = {
    open: issues.filter((i: any) => i.status === 'open'),
    inProgress: issues.filter((i: any) => i.status === 'in_progress'),
    resolved: issues.filter((i: any) => i.status === 'resolved'),
    closed: issues.filter((i: any) => i.status === 'closed'),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Issues</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Issues assigned to you</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Link href="/issues?scope=assigned&status=open">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="text-center py-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {groupedIssues.open.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Open</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/issues?scope=assigned&status=in_progress">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="text-center py-4">
                <div className="text-2xl font-bold text-blue-600">
                  {groupedIssues.inProgress.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">In Progress</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/issues?scope=assigned&status=resolved">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="text-center py-4">
                <div className="text-2xl font-bold text-green-600">
                  {groupedIssues.resolved.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Resolved</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/issues?scope=assigned&status=closed">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="text-center py-4">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                  {groupedIssues.closed.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Closed</div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Issues by Status */}
        {issues.length > 0 ? (
          <div className="space-y-8">
            {/* Open Issues */}
            {groupedIssues.open.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Open Issues ({groupedIssues.open.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {groupedIssues.open.map((issue: any) => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* In Progress Issues */}
            {groupedIssues.inProgress.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>In Progress ({groupedIssues.inProgress.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {groupedIssues.inProgress.map((issue: any) => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resolved Issues */}
            {groupedIssues.resolved.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Resolved ({groupedIssues.resolved.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {groupedIssues.resolved.map((issue: any) => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No issues assigned to you</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function IssueCard({ issue }: { issue: any }) {
  return (
    <Link
      href={`/issues/${issue.id}`}
      className="block p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start gap-4">
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

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{issue.project?.name || 'Unknown Project'}</span>
          </div>
          <h4 className="font-medium text-gray-900 dark:text-white">{issue.title}</h4>
          {issue.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
              {issue.description}
            </p>
          )}

          {/* Timestamps */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2">
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Created:</span>
              <time className="font-mono">
                {new Date(issue.created_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </time>
            </div>
            {issue.due_date && (
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Due:</span>
                <time className="font-mono">
                  {new Date(issue.due_date).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </time>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant={
                issue.priority === 'critical' || issue.priority === 'high'
                  ? 'danger'
                  : 'default'
              }
            >
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
                  <Badge variant="danger" className="animate-pulse font-semibold">
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
  );
}
