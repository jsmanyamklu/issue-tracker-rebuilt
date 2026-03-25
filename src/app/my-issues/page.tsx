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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Issues</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Issues assigned to you</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold text-yellow-600">
                {groupedIssues.open.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Open</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold text-blue-600">
                {groupedIssues.inProgress.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold text-green-600">
                {groupedIssues.resolved.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Resolved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                {groupedIssues.closed.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Closed</div>
            </CardContent>
          </Card>
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
              <p className="text-gray-500 dark:text-gray-300">No issues assigned to you</p>
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
      className="block p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-300">{issue.project?.name || 'Unknown Project'}</span>
          </div>
          <h4 className="font-medium text-gray-900 dark:text-white">{issue.title}</h4>
          {issue.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {issue.description}
            </p>
          )}
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
          </div>
        </div>
      </div>
    </Link>
  );
}
