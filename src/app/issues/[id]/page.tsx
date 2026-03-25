import { getCurrentUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { notFound } from 'next/navigation';
import { issueService, commentService } from '@/services';

async function getIssue(id: string) {
  try {
    const issue = await issueService.getById(id);
    return issue;
  } catch (error) {
    console.error('Failed to fetch issue:', error);
    return null;
  }
}

async function getComments(issueId: string) {
  try {
    const comments = await commentService.getByIssueId(issueId);
    return comments;
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return [];
  }
}

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const { id } = await params;
  const [issue, comments] = await Promise.all([
    getIssue(id),
    getComments(id),
  ]);

  if (!issue) {
    notFound();
  }

  const isReporter = issue.reporter_id === user.id;
  const isAssignee = issue.assignee_id === user.id;

  const statusColor = {
    open: 'warning',
    in_progress: 'info',
    resolved: 'success',
    closed: 'default',
  } as const;

  const priorityColor = {
    low: 'default',
    medium: 'info',
    high: 'warning',
    critical: 'danger',
  } as const;

  const typeColor = {
    bug: 'danger',
    feature: 'success',
    task: 'info',
    improvement: 'default',
  } as const;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-4">
          <Link href={`/projects/${issue.project.id}`}>
            <Button variant="secondary" size="sm">
              ← Back to Project
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant={statusColor[issue.status]}>
                  {issue.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge variant={priorityColor[issue.priority]}>
                  {issue.priority.toUpperCase()}
                </Badge>
                <Badge variant={typeColor[issue.type]}>
                  {issue.type.toUpperCase()}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{issue.title}</h1>
            </div>
            <div className="flex gap-2">
              {(isReporter || isAssignee) && (
                <Link href={`/issues/${issue.id}/edit`}>
                  <Button variant="secondary">Edit Issue</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Issue Info Card */}
          <Card>
            <CardContent className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Reporter */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {issue.reporter.avatar_url ? (
                      <img
                        src={issue.reporter.avatar_url}
                        alt={issue.reporter.name}
                        className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold text-lg">
                        {issue.reporter.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Reporter</div>
                    <div className="font-medium text-gray-900 dark:text-white truncate">{issue.reporter.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 truncate">{issue.reporter.email}</div>
                  </div>
                </div>

                {/* Assignee */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {issue.assignee ? (
                      issue.assignee.avatar_url ? (
                        <img
                          src={issue.assignee.avatar_url}
                          alt={issue.assignee.name}
                          className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold text-lg">
                          {issue.assignee.name.charAt(0).toUpperCase()}
                        </div>
                      )
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Assignee</div>
                    {issue.assignee ? (
                      <>
                        <div className="font-medium text-gray-900 dark:text-white truncate">{issue.assignee.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 truncate">{issue.assignee.email}</div>
                      </>
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400 italic">Unassigned</div>
                    )}
                  </div>
                </div>

                {/* Project & Status */}
                <div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mb-1">Project</div>
                      <Link href={`/projects/${issue.project.id}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
                        {issue.project.name}
                      </Link>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mb-1">Created</div>
                      <div className="text-gray-900 dark:text-white">{new Date(issue.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {issue.description && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{issue.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Comments */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Comments ({comments.length})</CardTitle>
              <Link href={`/issues/${issue.id}/comments/new`}>
                <Button size="sm">Add Comment</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                    <div className="flex items-start gap-3">
                      {comment.user.avatar_url && (
                        <img
                          src={comment.user.avatar_url}
                          alt={comment.user.name}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">{comment.user.name}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-300">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No comments yet</p>
                <Link href={`/issues/${issue.id}/comments/new`}>
                  <Button>Add First Comment</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
