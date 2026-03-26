'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { useRouter } from 'next/navigation';

interface ExtendProjectDueDateButtonProps {
  projectId: string;
  projectName: string;
  currentDueDate: string | null;
  userRole: string;
  openIssuesCount: number;
}

export default function ExtendProjectDueDateButton({
  projectId,
  projectName,
  currentDueDate,
  userRole,
  openIssuesCount,
}: ExtendProjectDueDateButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [newDueDate, setNewDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Only show to admin and manager
  if (userRole !== 'admin' && userRole !== 'manager') {
    return null;
  }

  // Only show if there's a current due date
  if (!currentDueDate) {
    return null;
  }

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setError('');
        setWarnings([]);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleExtendDueDate = async () => {
    setIsLoading(true);
    setError('');
    setWarnings([]);

    if (!newDueDate) {
      setError('Please select a new due date');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/extend-due-date`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_due_date: newDueDate }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to extend project due date');
      }

      // Show warnings if any issues exceed the new date
      if (data.warnings && data.warnings.length > 0) {
        setWarnings(data.warnings);
        setTimeout(() => {
          setIsOpen(false);
          setWarnings([]);
          router.refresh();
        }, 5000);
      } else {
        setIsOpen(false);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to extend project due date');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if project is overdue
  const isOverdue =
    currentDueDate &&
    new Date(currentDueDate) < new Date() &&
    openIssuesCount > 0;

  return (
    <div className="relative">
      <Button
        variant={isOverdue ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        {isOverdue ? '⚠️ Extend Due Date' : '📅 Extend Due Date'}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            ref={containerRef}
            className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-lg w-full p-6 animate-scale-in"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Extend Project Due Date
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  {projectName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setError('');
                  setWarnings([]);
                }}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {warnings.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                  ⚠️ Warnings:
                </p>
                {warnings.map((warning, index) => (
                  <p key={index} className="text-sm text-yellow-700 dark:text-yellow-400">
                    • {warning}
                  </p>
                ))}
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                  Redirecting in 5 seconds...
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Current Due Date:
                  </span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    {new Date(currentDueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Open Issues:
                  </span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    {openIssuesCount}
                  </span>
                </div>
              </div>

              <DatePicker
                label="New Due Date"
                value={newDueDate}
                onChange={setNewDueDate}
                minDate={
                  currentDueDate
                    ? new Date(new Date(currentDueDate).getTime() + 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split('T')[0]
                    : new Date().toISOString().split('T')[0]
                }
                placeholder="Select new due date"
                required
              />

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  ℹ️ <strong>Note:</strong> The new due date must be after the current due date.
                  Any issues with due dates exceeding the new project due date will need to be
                  updated separately.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleExtendDueDate} isLoading={isLoading} className="flex-1">
                {isLoading ? 'Extending...' : 'Extend Due Date'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsOpen(false);
                  setError('');
                  setWarnings([]);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
