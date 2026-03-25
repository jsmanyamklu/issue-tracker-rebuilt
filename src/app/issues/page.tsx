'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

interface Issue {
  id: string;
  title: string;
  description: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'bug' | 'feature' | 'task' | 'improvement';
  created_at: string;
  project: { id: string; name: string };
  assignee: { id: string; name: string; email: string; avatar_url: string } | null;
  reporter: { id: string; name: string; email: string; avatar_url: string };
}

interface Project {
  id: string;
  name: string;
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    loadData();
  }, [statusFilter, priorityFilter, projectFilter, assigneeFilter]);

  async function loadData() {
    setIsLoading(true);
    setError('');

    try {
      // Build query params
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (projectFilter !== 'all') params.append('project_id', projectFilter);
      if (assigneeFilter !== 'all') params.append('assignee_id', assigneeFilter);

      const [issuesRes, projectsRes, usersRes] = await Promise.all([
        fetch(`/api/issues?${params.toString()}`),
        fetch('/api/projects'),
        fetch('/api/users'),
      ]);

      if (!issuesRes.ok || !projectsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const issuesData = await issuesRes.json();
      const projectsData = await projectsRes.json();
      const usersData = await usersRes.json();

      setIssues(issuesData.data || []);
      setProjects(projectsData.data || []);
      setUsers(usersData.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load issues');
    } finally {
      setIsLoading(false);
    }
  }

  // Client-side search filtering
  const filteredIssues = issues.filter((issue) =>
    searchQuery === ''
      ? true
      : issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColor = {
    open: 'warning',
    in_progress: 'info',
    resolved: 'success',
    closed: 'default',
  } as const;

  const priorityColor = {
    low: 'default',
    medium: 'info',
    high: 'warning',
    critical: 'danger',
  } as const;

  const typeColor = {
    bug: 'danger',
    feature: 'success',
    task: 'info',
    improvement: 'default',
  } as const;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Issues</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Track and manage all issues</p>
          </div>
          <Link href="/issues/new">
            <Button>+ New Issue</Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-5">
                <Input
                  placeholder="Search issues by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Project Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project
                </label>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assignee
                </label>
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Assignees</option>
                  <option value="unassigned">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                    setProjectFilter('all');
                    setAssigneeFilter('all');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Showing {filteredIssues.length} of {issues.length} issues
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="text-center text-red-600">{error}</div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500 dark:text-gray-300">Loading issues...</div>
            </CardContent>
          </Card>
        ) : (
          /* Issues List */
          <>
            {filteredIssues.length > 0 ? (
              <div className="space-y-3">
                {filteredIssues.map((issue) => (
                  <Link key={issue.id} href={`/issues/${issue.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={statusColor[issue.status]}>
                                {issue.status.replace('_', ' ')}
                              </Badge>
                              <Badge variant={priorityColor[issue.priority]}>
                                {issue.priority}
                              </Badge>
                              <Badge variant={typeColor[issue.type]}>{issue.type}</Badge>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {issue.title}
                            </h3>
                            {issue.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                                {issue.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-300">
                              <div>
                                <span className="font-medium">Project:</span>{' '}
                                {issue.project.name}
                              </div>
                              <div>
                                <span className="font-medium">Reporter:</span>{' '}
                                {issue.reporter.name}
                              </div>
                              {issue.assignee && (
                                <div>
                                  <span className="font-medium">Assignee:</span>{' '}
                                  {issue.assignee.name}
                                </div>
                              )}
                              <div>
                                {new Date(issue.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all' || assigneeFilter !== 'all'
                        ? 'No issues match your filters'
                        : 'No issues yet'}
                    </p>
                    <Link href="/issues/new">
                      <Button>Create First Issue</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
