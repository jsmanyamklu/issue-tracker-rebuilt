'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/types';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

interface OverdueIssue {
  id: string;
  title: string;
  project: string;
  assignee: string;
  assigneeEmail?: string;
  daysOverdue: number;
  priority: string;
  status: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [overdueIssues, setOverdueIssues] = useState<OverdueIssue[]>([]);
  const [loadingOverdue, setLoadingOverdue] = useState(false);
  const [sendingNotifications, setSendingNotifications] = useState(false);
  const [notificationResult, setNotificationResult] = useState<string>('');

  useEffect(() => {
    loadUsers();
    loadOverdueIssues();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load users');
      }

      setUsers(data.data);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    setUpdatingUserId(userId);
    setError('');

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update role');
      }

      // Update local state
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setUpdatingUserId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
      setUpdatingUserId(null);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'danger';
      case UserRole.MANAGER:
        return 'info';
      case UserRole.DEVELOPER:
        return 'success';
      case UserRole.VIEWER:
        return 'default';
    }
  };

  const getRoleName = (role: UserRole) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const loadOverdueIssues = async () => {
    setLoadingOverdue(true);
    try {
      const res = await fetch('/api/notifications/overdue');
      const data = await res.json();

      if (data.success) {
        setOverdueIssues(data.data);
      }
    } catch (err) {
      console.error('Failed to load overdue issues:', err);
    } finally {
      setLoadingOverdue(false);
    }
  };

  const sendOverdueNotifications = async () => {
    setSendingNotifications(true);
    setNotificationResult('');

    try {
      const res = await fetch('/api/notifications/overdue', {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        setNotificationResult(`✅ ${data.message}`);
        // Reload overdue issues after sending notifications
        await loadOverdueIssues();
      } else {
        setNotificationResult(`❌ ${data.error}`);
      }
    } catch (err: any) {
      setNotificationResult(`❌ Failed to send notifications: ${err.message}`);
    } finally {
      setSendingNotifications(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-300">Loading users...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Manage user roles and permissions</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Overdue Issues Notification */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>📧 Overdue Issue Notifications</CardTitle>
              <Button
                onClick={sendOverdueNotifications}
                isLoading={sendingNotifications}
                disabled={overdueIssues.length === 0}
                size="sm"
              >
                Send Notifications to Assignees
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingOverdue ? (
              <p className="text-gray-500 dark:text-gray-400">Loading overdue issues...</p>
            ) : overdueIssues.length > 0 ? (
              <>
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-300 font-semibold">
                    ⚠️ {overdueIssues.length} issue{overdueIssues.length > 1 ? 's' : ''} overdue
                  </p>
                  <p className="text-red-700 dark:text-red-400 text-sm mt-1">
                    Click the button above to send email notifications to assignees
                  </p>
                </div>

                {notificationResult && (
                  <div className={`mb-4 p-4 border rounded-lg ${
                    notificationResult.startsWith('✅')
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                  }`}>
                    {notificationResult}
                  </div>
                )}

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {overdueIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{issue.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span>📁 {issue.project}</span>
                          <span>👤 {issue.assignee}</span>
                          <Badge variant="danger" className="text-xs">
                            {issue.daysOverdue} day{issue.daysOverdue > 1 ? 's' : ''} overdue
                          </Badge>
                          <Badge variant={issue.priority === 'critical' || issue.priority === 'high' ? 'danger' : 'warning'} className="text-xs">
                            {issue.priority}
                          </Badge>
                        </div>
                      </div>
                      <a
                        href={`/issues/${issue.id}`}
                        className="ml-4 text-primary-600 dark:text-primary-400 hover:underline text-sm"
                      >
                        View →
                      </a>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-green-600 dark:text-green-400 font-semibold">✅ No overdue issues!</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  All issues with due dates are on track
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Badge variant="danger">Admin</Badge>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>• Full system access</li>
                  <li>• Manage user roles</li>
                  <li>• Edit/delete anything</li>
                </ul>
              </div>
              <div>
                <Badge variant="info">Manager</Badge>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>• Manage all issues</li>
                  <li>• Assign tasks</li>
                  <li>• Close any issue</li>
                </ul>
              </div>
              <div>
                <Badge variant="success">Developer</Badge>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>• Work on assigned issues</li>
                  <li>• Create issues/comments</li>
                  <li>• Edit own content</li>
                </ul>
              </div>
              <div>
                <Badge variant="default">Viewer</Badge>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>• Read-only access</li>
                  <li>• View all content</li>
                  <li>• No modifications</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-900"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {user.avatar_url && (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{user.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
                    </div>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleName(user.role)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        updateUserRole(user.id, e.target.value as UserRole)
                      }
                      disabled={updatingUserId === user.id}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value={UserRole.ADMIN}>Admin</option>
                      <option value={UserRole.MANAGER}>Manager</option>
                      <option value={UserRole.DEVELOPER}>Developer</option>
                      <option value={UserRole.VIEWER}>Viewer</option>
                    </select>
                    {updatingUserId === user.id && (
                      <span className="text-sm text-gray-500 dark:text-gray-300">Updating...</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
