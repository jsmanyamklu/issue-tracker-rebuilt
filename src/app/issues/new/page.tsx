'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export default function NewIssuePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project_id');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [workloads, setWorkloads] = useState<Record<string, { total_issues: number; workload_score: number }>>({});
  const [bestAvailable, setBestAvailable] = useState<{ id: string; name: string } | null>(null);
  const [formData, setFormData] = useState({
    project_id: projectId || '',
    title: '',
    description: '',
    priority: 'medium',
    type: 'bug',
    status: 'open',
    assignee_id: '',
    due_date: '',
  });

  // Fetch projects, users, current user session, and workload data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, usersRes, sessionRes, workloadRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/users'),
          fetch('/api/auth/session'),
          fetch('/api/workload'),
        ]);

        const projectsData = await projectsRes.json();
        const usersData = await usersRes.json();
        const sessionData = await sessionRes.json();
        const workloadData = await workloadRes.json();

        if (projectsData.success) {
          setProjects(projectsData.data);
        }
        if (usersData.success) {
          setUsers(usersData.data);
        }
        if (sessionData.success && sessionData.data) {
          setCurrentUser(sessionData.data);
          // Auto-select current user as assignee
          setFormData(prev => ({
            ...prev,
            assignee_id: sessionData.data.id,
          }));
        }
        if (workloadData.success && Array.isArray(workloadData.data)) {
          // Build workload map
          const workloadMap: Record<string, { total_issues: number; workload_score: number }> = {};
          workloadData.data.forEach((w: any) => {
            workloadMap[w.user_id] = {
              total_issues: w.total_issues,
              workload_score: w.workload_score,
            };
          });
          setWorkloads(workloadMap);
        }

        // Fetch best available user
        const bestAvailRes = await fetch('/api/workload?action=best-available');
        const bestAvailData = await bestAvailRes.json();
        if (bestAvailData.success && bestAvailData.data) {
          setBestAvailable({
            id: bestAvailData.data.user_id,
            name: bestAvailData.data.user_name,
          });
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    }
    fetchData();
  }, []);

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
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create issue');
      }

      router.push(`/issues/${data.data.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create issue');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Issue</CardTitle>
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
                  options={[
                    { value: '', label: '✨ Assign to Me (Auto)' },
                    ...(currentUser?.role === 'admin' || currentUser?.role === 'manager'
                      ? bestAvailable
                        ? [{
                            value: 'best-available',
                            label: `🎯 Best Available: ${bestAvailable.name} (Recommended)`,
                          }]
                        : []
                      : []),
                    ...users.map((u) => {
                      const workload = workloads[u.id];
                      const workloadText = workload
                        ? ` [${workload.total_issues} issues${workload.workload_score > 15 ? ', busy' : workload.workload_score > 5 ? '' : ', available'}]`
                        : '';
                      const indicator = workload
                        ? workload.workload_score <= 5
                          ? '🟢'
                          : workload.workload_score <= 15
                          ? '🟡'
                          : '🔴'
                        : '⚪';
                      return {
                        value: u.id,
                        label: `${indicator} ${u.name}${workloadText}`,
                      };
                    }),
                  ]}
                  value={formData.assignee_id === bestAvailable?.id ? 'best-available' : formData.assignee_id}
                  onChange={(e) => {
                    const value = e.target.value === 'best-available' ? bestAvailable?.id || '' : e.target.value;
                    setFormData({ ...formData, assignee_id: value });
                  }}
                />
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.assignee_id === ''
                      ? '✨ Issue will be auto-assigned to you'
                      : formData.assignee_id === bestAvailable?.id
                      ? '🎯 Assigned to user with lowest workload'
                      : formData.priority === 'high' || formData.priority === 'critical'
                      ? '⚠️ High/Critical priority - ensure assignee can handle this'
                      : 'Issue assigned to selected user'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    🟢 Available (≤5 issues) • 🟡 Balanced (6-15) • 🔴 Busy (&gt;15)
                  </p>
                </div>
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
                  Create Issue
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
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
