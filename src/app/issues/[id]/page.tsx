import { getCurrentUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { notFound } from 'next/navigation';
import { issueService, commentService } from '@/services';
import ReassignIssueButton from '@/components/issues/ReassignIssueButton';
import InlineAssigneeChanger from '@/components/issues/InlineAssigneeChanger';
import IssueActivityLog from '@/components/issues/IssueActivityLog';

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
              {(user.role === 'admin' || user.role === 'manager') && (
                <ReassignIssueButton
                  issueId={issue.id}
                  currentAssigneeId={issue.assignee_id}
                  currentAssigneeName={issue.assignee?.name}
                  reporterId={issue.reporter_id}
                  userRole={user.role}
                  issueStatus={issue.status}
                />
              )}
              {(isReporter || isAssignee) && (
                <Link href={`/issues/${issue.id}/edit`}>
                  <Button variant="secondary">Edit Issue</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Issue Info Card */}
          <Card>
            <CardContent className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Reporter - Who Created */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {issue.reporter.avatar_url ? (
                      <img
                        src={issue.reporter.avatar_url}
                        alt={issue.reporter.name || 'Reporter'}
                        className="w-14 h-14 rounded-full border-2 border-blue-300 dark:border-blue-700"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold text-lg">
                        {(issue.reporter.name || 'R').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide mb-1">
                      👤 Created By
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white truncate">{issue.reporter.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{issue.reporter.email}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Assignee - Who is Working */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {issue.assignee ? (
                      issue.assignee.avatar_url ? (
                        <img
                          src={issue.assignee.avatar_url}
                          alt={issue.assignee.name || 'Assignee'}
                          className="w-14 h-14 rounded-full border-2 border-green-300 dark:border-green-700"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center text-green-700 dark:text-green-300 font-semibold text-lg">
                          {(issue.assignee.name || 'U').charAt(0).toUpperCase()}
                        </div>
                      )
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide mb-2">
                      🎯 Assigned To
                    </div>
                    <InlineAssigneeChanger
                      issueId={issue.id}
                      currentAssigneeId={issue.assignee_id}
                      currentAssigneeName={issue.assignee?.name}
                      currentAssigneeAvatar={issue.assignee?.avatar_url}
                      reporterId={issue.reporter_id}
                      userRole={user.role}
                      issueStatus={issue.status}
                    />
                  </div>
                </div>

                {/* Current Stage/Status */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      issue.status === 'open' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      issue.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      issue.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/30' :
                      'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {issue.status === 'open' && (
                        <svg className="w-7 h-7 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {issue.status === 'in_progress' && (
                        <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                      {issue.status === 'resolved' && (
                        <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {issue.status === 'closed' && (
                        <svg className="w-7 h-7 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide mb-1">
                      📊 Current Stage
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white capitalize">
                      {issue.status.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Project: <Link href={`/projects/${issue.project.id}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
                        {issue.project.name}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Expected Closure Date */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      issue.due_date ?
                        (new Date(issue.due_date) < new Date() && issue.status !== 'closed' && issue.status !== 'resolved'
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : 'bg-purple-100 dark:bg-purple-900/30')
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <svg className={`w-7 h-7 ${
                        issue.due_date ?
                          (new Date(issue.due_date) < new Date() && issue.status !== 'closed' && issue.status !== 'resolved'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-purple-600 dark:text-purple-400')
                          : 'text-gray-400 dark:text-gray-500'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide mb-1">
                      📅 Expected Closure
                    </div>
                    {issue.due_date ? (
                      <>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {new Date(issue.due_date).toLocaleDateString()}
                        </div>
                        {new Date(issue.due_date) < new Date() && issue.status !== 'closed' && issue.status !== 'resolved' && (
                          <div className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                            ⚠️ Overdue
                          </div>
                        )}
                        {new Date(issue.due_date) >= new Date() && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {Math.ceil((new Date(issue.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400 italic">No due date set</div>
                    )}
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
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">{comment.user.name}</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400" title={new Date(comment.created_at).toLocaleString()}>
                              {(() => {
                                const now = new Date();
                                const commentDate = new Date(comment.created_at);
                                const diffMs = now.getTime() - commentDate.getTime();
                                const diffMins = Math.floor(diffMs / 60000);
                                const diffHours = Math.floor(diffMs / 3600000);
                                const diffDays = Math.floor(diffMs / 86400000);

                                if (diffMins < 1) return 'just now';
                                if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
                                if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                                if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                                return commentDate.toLocaleDateString();
                              })()}
                            </span>
                          </div>
                          <time className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                            {new Date(comment.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </time>
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

        {/* Activity Log */}
        <IssueActivityLog issueId={issue.id} />
      </div>
    </div>
  );
}
