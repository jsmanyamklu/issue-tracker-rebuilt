'use client';

import { useState } from 'react';
import { Badge } from './ui/Badge';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';

interface Issue {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'bug' | 'feature' | 'task' | 'improvement';
  assignee?: {
    name: string;
    avatar_url?: string;
  };
  reporter: {
    name: string;
  };
}

interface KanbanBoardProps {
  issues: Issue[];
  onStatusChange?: (issueId: string, newStatus: string) => void;
}

const COLUMNS = [
  { id: 'open', label: 'Open', color: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'resolved', label: 'Resolved', color: 'bg-green-100 dark:bg-green-900/30' },
  { id: 'closed', label: 'Closed', color: 'bg-gray-100 dark:bg-gray-800' },
];

const priorityColors = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  critical: 'danger',
} as const;

const typeColors = {
  bug: 'danger',
  feature: 'success',
  task: 'info',
  improvement: 'default',
} as const;

export function KanbanBoard({ issues, onStatusChange }: KanbanBoardProps) {
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null);
  const toast = useToast();

  const groupedIssues = COLUMNS.reduce((acc, column) => {
    acc[column.id] = issues.filter((issue: any) => issue.status === column.id);
    return acc;
  }, {} as Record<string, Issue[]>);

  const handleDragStart = (issue: Issue) => {
    setDraggedIssue(issue);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();

    if (!draggedIssue) return;

    try {
      const res = await fetch(`/api/issues/${draggedIssue.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error('Failed to update issue');
      }

      onStatusChange?.(draggedIssue.id, status);
      toast.success('Issue status updated');
    } catch (error) {
      toast.error('Failed to update issue status');
    } finally {
      setDraggedIssue(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {COLUMNS.map((column) => (
        <div
          key={column.id}
          className={`rounded-lg p-4 ${column.color} min-h-[500px]`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {column.label}
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {groupedIssues[column.id]?.length || 0}
            </span>
          </div>

          {/* Issues */}
          <div className="space-y-3">
            {groupedIssues[column.id]?.map((issue) => (
              <div
                key={issue.id}
                draggable
                onDragStart={() => handleDragStart(issue)}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 cursor-move hover:shadow-md transition-shadow"
              >
                <Link href={`/issues/${issue.id}`}>
                  <div className="space-y-2">
                    {/* Title */}
                    <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                      {issue.title}
                    </h4>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={priorityColors[issue.priority]} className="text-xs">
                        {issue.priority}
                      </Badge>
                      <Badge variant={typeColors[issue.type]} className="text-xs">
                        {issue.type}
                      </Badge>
                    </div>

                    {/* Assignee */}
                    {issue.assignee && (
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        {issue.assignee.avatar_url ? (
                          <img
                            src={issue.assignee.avatar_url}
                            alt={issue.assignee.name || 'Assignee'}
                            className="w-5 h-5 rounded-full"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium text-xs">
                            {(issue.assignee.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{issue.assignee.name || 'Unknown'}</span>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}

            {groupedIssues[column.id]?.length === 0 && (
              <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">
                No issues
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
