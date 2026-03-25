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
  const [formData, setFormData] = useState({
    project_id: projectId || '',
    title: '',
    description: '',
    priority: 'medium',
    type: 'bug',
    status: 'open',
    assignee_id: '',
  });

  // Fetch projects and users on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, usersRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/users'),
        ]);

        const projectsData = await projectsRes.json();
        const usersData = await usersRes.json();

        if (projectsData.success) {
          setProjects(projectsData.data);
        }
        if (usersData.success) {
          setUsers(usersData.data);
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
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
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

              <Select
                label="Assignee (Optional)"
                options={[
                  { value: '', label: 'Unassigned' },
                  ...users.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` })),
                ]}
                value={formData.assignee_id}
                onChange={(e) =>
                  setFormData({ ...formData, assignee_id: e.target.value })
                }
              />

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
