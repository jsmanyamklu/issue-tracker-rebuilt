'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ProjectCardProps {
  project: any;
  canDelete: boolean;
}

export function ProjectCard({ project, canDelete }: ProjectCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        router.refresh();
      } else {
        alert(data.error || 'Failed to delete project');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete project');
      setIsDeleting(false);
    }
  };

  const total = project.issueStats.open + project.issueStats.in_progress +
                project.issueStats.resolved + project.issueStats.closed;
  const completed = project.issueStats.resolved + project.issueStats.closed;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <>
      <Card className="h-full hover:shadow-lg transition-shadow relative group">
        <Link href={`/projects/${project.id}`} className="block">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="flex-1">{project.name}</CardTitle>
              {canDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  disabled={isDeleting}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                >
                  Delete
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {project.description && (
              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                {project.description}
              </p>
            )}

            {/* Issue Statistics */}
            {project.issueStats && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
                {/* Progress Bar */}
                {total > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span className="font-medium">Progress</span>
                      <span>{completed}/{total} completed</span>
                    </div>
                    <ProgressBar value={progress} showLabel={false} size="sm" />
                  </div>
                )}

                {/* Issue Status Badges */}
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Issues</div>
                <div className="flex flex-wrap gap-2">
                  {project.issueStats.open > 0 && (
                    <Badge variant="warning" className="text-xs">
                      🟡 {project.issueStats.open}
                    </Badge>
                  )}
                  {project.issueStats.in_progress > 0 && (
                    <Badge variant="info" className="text-xs">
                      🔵 {project.issueStats.in_progress}
                    </Badge>
                  )}
                  {project.issueStats.resolved > 0 && (
                    <Badge variant="success" className="text-xs">
                      🟢 {project.issueStats.resolved}
                    </Badge>
                  )}
                  {project.issueStats.closed > 0 && (
                    <Badge variant="default" className="text-xs">
                      ⚪ {project.issueStats.closed}
                    </Badge>
                  )}
                  {project.overdueCount > 0 && (
                    <Badge variant="danger" className="text-xs font-semibold animate-pulse">
                      🚨 {project.overdueCount} Overdue
                    </Badge>
                  )}
                  {total === 0 && (
                    <span className="text-xs text-gray-400 dark:text-gray-300">No issues yet</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300">
              <span>Owner: {project.owner?.name || 'Unknown'}</span>
            </div>

            {/* Project Deadline */}
            {project.due_date && (() => {
              const dueDate = new Date(project.due_date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isOverdue = dueDate < today;
              const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

              let statusColor = 'green';
              let statusEmoji = '🟢';

              if (isOverdue) {
                statusColor = 'red';
                statusEmoji = '🔴';
              } else if (daysUntil <= 7) {
                statusColor = 'orange';
                statusEmoji = '🟠';
              }

              return (
                <div className={`mt-2 text-sm font-medium ${
                  statusColor === 'red' ? 'text-red-600 dark:text-red-400' :
                  statusColor === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                  'text-green-600 dark:text-green-400'
                }`}>
                  {statusEmoji} Deadline: {dueDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                  {!isOverdue && daysUntil <= 30 && (
                    <span className="text-xs ml-1">({daysUntil}d)</span>
                  )}
                  {isOverdue && (
                    <span className="text-xs ml-1 font-semibold animate-pulse">
                      (OVERDUE)
                    </span>
                  )}
                </div>
              );
            })()}

            <div className="mt-2 text-xs text-gray-400 dark:text-gray-300">
              Created {new Date(project.created_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Link>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Delete Project?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Are you sure you want to delete <strong>{project.name}</strong>?
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mb-6">
              This will permanently delete the project and all its issues. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
