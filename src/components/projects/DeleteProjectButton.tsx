'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface DeleteProjectButtonProps {
  projectId: string;
  projectName: string;
}

export function DeleteProjectButton({ projectId, projectName }: DeleteProjectButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        router.push('/projects');
        router.refresh();
      } else {
        alert(data.error || 'Failed to delete project');
        setIsDeleting(false);
        setShowConfirm(false);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete project');
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (!showConfirm) {
    return (
      <Button
        variant="danger"
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
      >
        Delete Project
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Delete Project?
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Are you sure you want to delete <strong>{projectName}</strong>?
        </p>
        <p className="text-sm text-red-600 dark:text-red-400 mb-6">
          This will permanently delete the project and all its issues. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={() => setShowConfirm(false)}
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
  );
}
