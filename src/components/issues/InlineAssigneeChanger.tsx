'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';

interface InlineAssigneeChangerProps {
  issueId: string;
  currentAssigneeId?: string;
  currentAssigneeName?: string;
  currentAssigneeAvatar?: string;
  reporterId: string;
  userRole: string;
  issueStatus: string;
  onSuccess?: () => void;
}

interface UserWithWorkload {
  id: string;
  name: string;
  email: string;
  total_issues: number;
  workload_score: number;
}

export default function InlineAssigneeChanger({
  issueId,
  currentAssigneeId,
  currentAssigneeName,
  currentAssigneeAvatar,
  reporterId,
  userRole,
  issueStatus,
  onSuccess,
}: InlineAssigneeChangerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserWithWorkload[]>([]);
  const [selectedUserId, setSelectedUserId] = useState(currentAssigneeId || '');
  const [error, setError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Only show edit capability for managers and admins, and only if issue is not closed
  const canEdit = (userRole === 'admin' || userRole === 'manager') && issueStatus !== 'closed';

  useEffect(() => {
    if (isEditing) {
      fetchUsersWithWorkload();
    }
  }, [isEditing]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsEditing(false);
        setError('');
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  const fetchUsersWithWorkload = async () => {
    try {
      const [usersRes, workloadRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/workload'),
      ]);

      const usersData = await usersRes.json();
      const workloadData = await workloadRes.json();

      if (usersData.success && workloadData.success) {
        const workloadMap = new Map(
          workloadData.data.map((w: any) => [w.user_id, w])
        );

        const usersWithWorkload = usersData.data.map((u: any) => {
          const workload = workloadMap.get(u.id) as { total_issues: number; workload_score: number } | undefined;
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            total_issues: workload?.total_issues || 0,
            workload_score: workload?.workload_score || 0,
          };
        });

        // Sort by workload (best available first)
        usersWithWorkload.sort((a: UserWithWorkload, b: UserWithWorkload) =>
          a.workload_score - b.workload_score
        );

        setUsers(usersWithWorkload);
        setSelectedUserId(currentAssigneeId || reporterId);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    }
  };

  const handleAssign = async (userId: string) => {
    if (userId === currentAssigneeId) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/issues/${issueId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignee_id: userId }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to reassign issue');
      }

      setIsEditing(false);
      if (onSuccess) {
        onSuccess();
      }
      // Reload page to show updated assignment
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to reassign issue');
    } finally {
      setIsLoading(false);
    }
  };

  const getWorkloadIndicator = (score: number) => {
    if (score <= 5) return { emoji: '🟢', text: 'Available' };
    if (score <= 15) return { emoji: '🟡', text: 'Balanced' };
    return { emoji: '🔴', text: 'Busy' };
  };

  if (!canEdit) {
    // Read-only view for non-managers or closed issues
    const isClosed = issueStatus === 'closed';
    const isNonManager = userRole !== 'admin' && userRole !== 'manager';

    return (
      <div>
        <div className="flex items-center gap-3">
          {currentAssigneeAvatar && (
            <img
              src={currentAssigneeAvatar}
              alt={currentAssigneeName}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {currentAssigneeName || 'Unassigned'}
            </div>
            {isClosed && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                🔒 Issue is closed - cannot reassign
              </div>
            )}
            {!isClosed && isNonManager && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Only managers can reassign
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {!isEditing ? (
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
        >
          {currentAssigneeAvatar && (
            <img
              src={currentAssigneeAvatar}
              alt={currentAssigneeName}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {currentAssigneeName || 'Unassigned'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Click to reassign
            </div>
          </div>
          <svg
            className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      ) : (
        <div className="absolute top-0 left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 min-w-[320px]">
          <div className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              Reassign to
            </div>
            {error && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                {error}
              </div>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1">
            {users.map((user) => {
              const indicator = getWorkloadIndicator(user.workload_score);
              const isCurrent = user.id === currentAssigneeId;
              const isReporter = user.id === reporterId;

              return (
                <button
                  key={user.id}
                  onClick={() => handleAssign(user.id)}
                  disabled={isLoading}
                  className={`w-full text-left p-2 rounded-md transition-colors ${
                    isCurrent
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.name}
                        </span>
                        {isCurrent && (
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            Current
                          </span>
                        )}
                        {isReporter && (
                          <span className="text-xs text-purple-600 dark:text-purple-400">
                            Reporter
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs whitespace-nowrap">
                      <span>{indicator.emoji}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {user.total_issues}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setIsEditing(false);
                setError('');
              }}
              disabled={isLoading}
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
