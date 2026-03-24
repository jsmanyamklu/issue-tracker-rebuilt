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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <h1 className="text-3xl font-bold text-gray-900">{issue.title}</h1>
            </div>
            <div className="flex gap-2">
              {(isReporter || isAssignee) && (
                <Link href={`/issues/${issue.id}/edit`}>
                  <Button variant="secondary">Edit Issue</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Project:</span>{' '}
              <Link href={`/projects/${issue.project.id}`} className="text-blue-600 hover:underline">
                {issue.project.name}
              </Link>
            </div>
            <div>
              <span className="font-medium">Reporter:</span> {issue.reporter.name}
            </div>
            {issue.assignee && (
              <div>
                <span className="font-medium">Assignee:</span> {issue.assignee.name}
              </div>
            )}
            <div>
              <span className="font-medium">Created:</span>{' '}
              {new Date(issue.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Description */}
        {issue.description && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
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
                  <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-0">
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
                          <span className="font-medium text-gray-900">{comment.user.name}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No comments yet</p>
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
