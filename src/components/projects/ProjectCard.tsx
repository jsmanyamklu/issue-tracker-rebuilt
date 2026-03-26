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
      <Card className="h-full card-interactive relative group overflow-hidden">
        <Link href={`/projects/${project.id}`} className="block">
          {/* Gradient accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600" />

          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="flex-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {project.name}
              </CardTitle>
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
              <p className="text-neutral-600 dark:text-neutral-300 mb-4 line-clamp-2 leading-relaxed">
                {project.description}
              </p>
            )}

            {/* Issue Statistics */}
            {project.issueStats && (
              <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700 space-y-3">
                {/* Progress Bar */}
                {total > 0 && (
                  <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-3">
                    <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                      <span className="font-semibold">Progress</span>
                      <span className="font-bold text-primary-600 dark:text-primary-400">{completed}/{total} completed</span>
                    </div>
                    <ProgressBar value={progress} showLabel={false} size="sm" />
                  </div>
                )}

                {/* Issue Status Badges */}
                <div>
                  <div className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-2 uppercase tracking-wide">Issue Status</div>
                  <div className="flex flex-wrap gap-2">
                    {project.issueStats.open > 0 && (
                      <Badge variant="warning" className="text-xs">
                        Open {project.issueStats.open}
                      </Badge>
                    )}
                    {project.issueStats.in_progress > 0 && (
                      <Badge variant="info" className="text-xs">
                        In Progress {project.issueStats.in_progress}
                      </Badge>
                    )}
                    {project.issueStats.resolved > 0 && (
                      <Badge variant="success" className="text-xs">
                        Resolved {project.issueStats.resolved}
                      </Badge>
                    )}
                    {project.issueStats.closed > 0 && (
                      <Badge variant="default" className="text-xs">
                        Closed {project.issueStats.closed}
                      </Badge>
                    )}
                    {project.overdueCount > 0 && (
                      <Badge variant="danger" className="text-xs font-bold animate-pulse">
                        🚨 {project.overdueCount} Overdue
                      </Badge>
                    )}
                    {total === 0 && (
                      <span className="text-xs text-neutral-400 dark:text-neutral-500 italic">No issues yet</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm bg-neutral-50 dark:bg-neutral-800/50 px-3 py-2 rounded-lg">
              <span className="text-neutral-600 dark:text-neutral-400 font-medium">Owner:</span>
              <span className="text-neutral-800 dark:text-neutral-200 font-semibold">{project.owner?.name || 'Unknown'}</span>
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
                <div className={`mt-3 px-3 py-2 rounded-lg text-sm font-semibold ${
                  statusColor === 'red' ? 'bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300 border border-danger-200 dark:border-danger-800' :
                  statusColor === 'orange' ? 'bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 border border-warning-200 dark:border-warning-800' :
                  'bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300 border border-success-200 dark:border-success-800'
                }`}>
                  {statusEmoji} Deadline: {dueDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                  {!isOverdue && daysUntil <= 30 && (
                    <span className="text-xs ml-1 font-bold">({daysUntil}d left)</span>
                  )}
                  {isOverdue && (
                    <span className="text-xs ml-1 font-bold animate-pulse">
                      (OVERDUE)
                    </span>
                  )}
                </div>
              );
            })()}

            <div className="mt-3 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              Created {new Date(project.created_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Link>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-soft-lg border border-neutral-200 dark:border-neutral-700 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                Delete Project?
              </h3>
            </div>
            <p className="text-neutral-700 dark:text-neutral-300 mb-2">
              Are you sure you want to delete <strong className="text-neutral-900 dark:text-white">{project.name}</strong>?
            </p>
            <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-3 mb-6">
              <p className="text-sm text-danger-700 dark:text-danger-300 font-medium">
                ⚠️ This will permanently delete the project and all its issues. This action cannot be undone.
              </p>
            </div>
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
