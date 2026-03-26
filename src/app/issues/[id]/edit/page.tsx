'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export default function EditIssuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [issueId, setIssueId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [originalIssue, setOriginalIssue] = useState<any>(null);
  const [formData, setFormData] = useState({
    project_id: '',
    title: '',
    description: '',
    priority: 'medium',
    type: 'bug',
    status: 'open',
    assignee_id: '',
    due_date: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const resolvedParams = await params;
        setIssueId(resolvedParams.id);

        // Fetch issue, projects, users, and current user in parallel
        const [issueRes, projectsRes, usersRes, sessionRes] = await Promise.all([
          fetch(`/api/issues/${resolvedParams.id}`),
          fetch('/api/projects'),
          fetch('/api/users'),
          fetch('/api/auth/session'),
        ]);

        const issueData = await issueRes.json();
        const projectsData = await projectsRes.json();
        const usersData = await usersRes.json();
        const sessionData = await sessionRes.json();

        if (!issueData.success) {
          throw new Error(issueData.error || 'Failed to load issue');
        }

        if (projectsData.success) {
          setProjects(projectsData.data);
        }

        if (usersData.success) {
          setUsers(usersData.data);
        }

        if (sessionData.success && sessionData.data) {
          setCurrentUser(sessionData.data);
        }

        // Pre-populate form with existing issue data
        const issue = issueData.data;
        setOriginalIssue(issue);
        setFormData({
          project_id: issue.project_id || '',
          title: issue.title || '',
          description: issue.description || '',
          priority: issue.priority || 'medium',
          type: issue.type || 'bug',
          status: issue.status || 'open',
          assignee_id: issue.assignee_id || '',
          due_date: issue.due_date || '',
        });

        setIsFetching(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load issue');
        setIsFetching(false);
      }
    };

    loadData();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.project_id) {
      setError('Please select a project');
      setIsLoading(false);
      return;
    }

    // Validate due date is not in the past
    if (formData.due_date) {
      const selectedDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        setError('Expected closure date cannot be in the past');
        setIsLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update issue');
      }

      router.push(`/issues/${issueId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update issue');
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-300">Loading issue...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/issues/${issueId}`)}
          >
            ← Back to Issue
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Issue</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Select
                label="Project"
                options={[
                  { value: '', label: 'Select a project' },
                  ...projects.map((p) => ({ value: p.id, label: p.name })),
                ]}
                value={formData.project_id}
                onChange={(e) =>
                  setFormData({ ...formData, project_id: e.target.value })
                }
                required
              />

              <Input
                label="Title"
                placeholder="Enter issue title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />

              <Textarea
                label="Description"
                placeholder="Enter issue description (optional)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={6}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Type"
                  options={[
                    { value: 'bug', label: 'Bug' },
                    { value: 'feature', label: 'Feature' },
                    { value: 'task', label: 'Task' },
                    { value: 'improvement', label: 'Improvement' },
                  ]}
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                />

                <Select
                  label="Priority"
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'critical', label: 'Critical' },
                  ]}
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                />
              </div>

              <div>
                <Select
                  label="Assignee"
                  options={
                    currentUser?.role === 'admin' || currentUser?.role === 'manager'
                      ? [
                          { value: '', label: 'Unassigned (Auto-assign to reporter)' },
                          ...users.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` })),
                        ]
                      : [
                          // Developers see limited options
                          { value: '', label: 'Auto-assign to me' },
                          ...(originalIssue?.reporter_id === currentUser?.id && currentUser
                            ? [{ value: currentUser.id, label: `Me (${currentUser.name})` }]
                            : []),
                          // Show current assignee if it's someone else
                          ...(formData.assignee_id && formData.assignee_id !== currentUser?.id
                            ? users
                                .filter((u) => u.id === formData.assignee_id)
                                .map((u) => ({ value: u.id, label: `${u.name} (${u.email}) - Current` }))
                            : []),
                        ]
                  }
                  value={formData.assignee_id}
                  onChange={(e) =>
                    setFormData({ ...formData, assignee_id: e.target.value })
                  }
                  disabled={
                    currentUser?.role === 'developer' &&
                    originalIssue?.reporter_id !== currentUser?.id &&
                    formData.assignee_id !== currentUser?.id
                  }
                />
                {currentUser?.role === 'developer' && originalIssue?.reporter_id !== currentUser?.id && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    ℹ️ Only managers can reassign issues. Contact your manager to change assignee.
                  </p>
                )}
                {currentUser?.role === 'developer' && originalIssue?.reporter_id === currentUser?.id && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    ✅ You can self-assign since you reported this issue
                  </p>
                )}
              </div>

              <Select
                label="Status"
                options={[
                  { value: 'open', label: 'Open' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'resolved', label: 'Resolved' },
                  { value: 'closed', label: 'Closed' },
                ]}
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              />

              <Input
                type="date"
                label="Expected Closure Date (Optional)"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                min={new Date().toISOString().split('T')[0]}
              />

              <div className="flex gap-4">
                <Button type="submit" isLoading={isLoading}>
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push(`/issues/${issueId}`)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
