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

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
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
