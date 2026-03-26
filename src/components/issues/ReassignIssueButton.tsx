'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

interface ReassignIssueButtonProps {
  issueId: string;
  currentAssigneeId?: string;
  currentAssigneeName?: string;
  reporterId: string;
  userRole: string;
  issueStatus: string;
  onSuccess?: () => void;
}

export default function ReassignIssueButton({
  issueId,
  currentAssigneeId,
  currentAssigneeName,
  reporterId,
  userRole,
  issueStatus,
  onSuccess,
}: ReassignIssueButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState('');

  // Only show for managers and admins, and only if issue is not closed
  if (userRole !== 'admin' && userRole !== 'manager') {
    return null;
  }

  // Don't show button if issue is closed
  if (issueStatus === 'closed') {
    return null;
  }

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
        // Pre-select current assignee or reporter
        setSelectedUserId(currentAssigneeId || reporterId);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleReassign = async () => {
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    if (selectedUserId === currentAssigneeId) {
      setError('Issue is already assigned to this user');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/issues/${issueId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignee_id: selectedUserId }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to reassign issue');
      }

      setIsOpen(false);
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

  if (!isOpen) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        🔄 Reassign Issue
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Reassign Issue
        </h3>

        {currentAssigneeName && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Currently assigned to: <span className="font-medium">{currentAssigneeName}</span>
          </p>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <Select
            label="Assign to"
            options={[
              { value: '', label: 'Select a user' },
              ...users.map((u) => ({
                value: u.id,
                label: `${u.name} (${u.email})${u.id === currentAssigneeId ? ' - Current' : ''}${u.id === reporterId ? ' - Reporter' : ''}`,
              })),
            ]}
            value={selectedUserId}
            onChange={(e) => {
              setSelectedUserId(e.target.value);
              setError('');
            }}
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleReassign}
            isLoading={isLoading}
            disabled={!selectedUserId}
          >
            Reassign
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setIsOpen(false);
              setError('');
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
