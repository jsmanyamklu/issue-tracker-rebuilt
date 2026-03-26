'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface ActivityLog {
  id: string;
  action_type: string;
  details: any;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  } | null;
}

interface IssueActivityLogProps {
  issueId: string;
}

export default function IssueActivityLog({ issueId }: IssueActivityLogProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadActivityLogs();
  }, [issueId]);

  async function loadActivityLogs() {
    try {
      const res = await fetch(`/api/activity-logs?resource_type=issue&resource_id=${issueId}`);
      const data = await res.json();

      if (data.success) {
        setLogs(data.data.logs || []);
      } else {
        setError(data.error || 'Failed to load activity logs');
      }
    } catch (err) {
      console.error('Error loading activity logs:', err);
      setError('Failed to load activity logs');
    } finally {
      setIsLoading(false);
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'issue_created':
        return '✨';
      case 'issue_updated':
        return '✏️';
      case 'issue_status_changed':
        return '🔄';
      case 'issue_assigned':
        return '👤';
      case 'comment_created':
        return '💬';
      case 'issue_deleted':
        return '🗑️';
      default:
        return '📝';
    }
  };

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'issue_created':
        return 'Created';
      case 'issue_updated':
        return 'Updated';
      case 'issue_status_changed':
        return 'Status Changed';
      case 'issue_assigned':
        return 'Assigned';
      case 'comment_created':
        return 'Commented';
      case 'issue_deleted':
        return 'Deleted';
      default:
        return actionType.replace('_', ' ');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderActivityDetails = (log: ActivityLog) => {
    const details = log.details || {};

    switch (log.action_type) {
      case 'issue_created':
        return (
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Created issue in project <strong>{details.title}</strong>
            {details.priority && (
              <Badge variant="default" className="ml-2 text-xs">
                {details.priority}
              </Badge>
            )}
          </div>
        );

      case 'issue_status_changed':
        return (
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Changed status from{' '}
            <Badge variant="default" className="mx-1 text-xs">
              {details.old_status}
            </Badge>
            to{' '}
            <Badge
              variant={
                details.new_status === 'closed'
                  ? 'default'
                  : details.new_status === 'resolved'
                  ? 'success'
                  : 'info'
              }
              className="ml-1 text-xs"
            >
              {details.new_status}
            </Badge>
          </div>
        );

      case 'issue_assigned':
        return (
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Assigned to <strong>{details.assignee_name}</strong>
            {details.reason && <span className="ml-2 italic">({details.reason})</span>}
          </div>
        );

      case 'issue_updated':
        return (
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {details.changes && Object.keys(details.changes).length > 0 ? (
              <div className="space-y-1">
                Updated:{' '}
                {Object.keys(details.changes)
                  .map((key) => key.replace('_', ' '))
                  .join(', ')}
              </div>
            ) : (
              <span>Updated issue</span>
            )}
          </div>
        );

      case 'comment_created':
        return (
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Added a comment
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading activity...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600 dark:text-red-400">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📜 Activity Log ({logs.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No activity recorded yet
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
              >
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  {log.user?.avatar_url ? (
                    <img
                      src={log.user.avatar_url}
                      alt={log.user.name}
                      className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold text-lg">
                      {getActionIcon(log.action_type)}
                    </div>
                  )}
                </div>

                {/* Activity Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {log.user?.name || 'System'}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {getActionLabel(log.action_type)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                  {renderActivityDetails(log)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
