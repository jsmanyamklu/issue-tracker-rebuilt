'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    due_date: '',
  });

  useEffect(() => {
    const loadProject = async () => {
      try {
        const resolvedParams = await params;
        setProjectId(resolvedParams.id);

        const res = await fetch(`/api/projects/${resolvedParams.id}?includeOwner=true`);
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to load project');
        }

        setFormData({
          name: data.data.name || '',
          description: data.data.description || '',
          due_date: data.data.due_date ? new Date(data.data.due_date).toISOString().slice(0, 16) : '',
        });
        setIsFetching(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load project');
        setIsFetching(false);
      }
    };

    loadProject();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update project');
      }

      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update project');
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-300">Loading project...</p>
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
        <Card>
          <CardHeader>
            <CardTitle>Edit Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Project Name"
                placeholder="Enter project name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />

              <Textarea
                label="Description"
                placeholder="Enter project description (optional)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />

              <div>
                <Input
                  label="Project Deadline (Optional)"
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Overall project completion target date
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" isLoading={isLoading}>
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push(`/projects/${projectId}`)}
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
