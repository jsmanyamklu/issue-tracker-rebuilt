'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Issue {
  id: string;
  title: string;
  description: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'bug' | 'feature' | 'task' | 'improvement';
  created_at: string;
  due_date: string | null;
  project: { id: string; name: string } | null;
  assignee: { id: string; name: string; email: string; avatar_url: string } | null;
  reporter: { id: string; name: string; email: string; avatar_url: string } | null;
}

interface Project {
  id: string;
  name: string;
}

interface CurrentUser {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
}

export default function IssuesPage() {
  const searchParams = useSearchParams();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');
  const [priorityFilter, setPriorityFilter] = useState<string>(searchParams.get('priority') || 'all');
  const [projectFilter, setProjectFilter] = useState<string>(searchParams.get('project_id') || 'all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>(searchParams.get('assignee_id') || 'all');
  const [scopeFilter, setScopeFilter] = useState<string>(searchParams.get('scope') || 'all');
  const [overdueFilter, setOverdueFilter] = useState<boolean>(searchParams.get('overdue') === 'true');
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);

  // Load URL params and current user on mount
  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [statusFilter, priorityFilter, projectFilter, assigneeFilter, scopeFilter, currentUser]);

  async function loadCurrentUser() {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Failed to load current user:', err);
    }
  }

  async function loadData() {
    setIsLoading(true);
    setError('');

    try {
      // Build query params
      const params = new URLSearchParams();

      // Always apply basic filters
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (priorityFilter !== 'all') {
        params.append('priority', priorityFilter);
      }
      if (projectFilter !== 'all') {
        params.append('project_id', projectFilter);
      }

      // Apply scope and assignee filters
      if (currentUser) {
        const isAdminOrManager = currentUser.role === 'admin' || currentUser.role === 'manager';

        // Scope filter takes precedence for user-specific filtering
        if (scopeFilter === 'assigned') {
          params.append('assignee_id', currentUser.id);
        } else if (scopeFilter === 'reported') {
          params.append('reporter_id', currentUser.id);
        } else if (scopeFilter === 'my') {
          params.append('user_id', currentUser.id);
        } else {
          // scopeFilter is 'all' - apply assignee dropdown filter
          if (assigneeFilter !== 'all') {
            if (assigneeFilter === 'unassigned') {
              params.append('assignee_id', 'null');
            } else {
              params.append('assignee_id', assigneeFilter);
            }
          }
        }
      }

      console.log('=== FILTER DEBUG ===');
      console.log('User role:', currentUser?.role);
      console.log('Filter states:', {
        status: statusFilter,
        priority: priorityFilter,
        project: projectFilter,
        assignee: assigneeFilter,
        scope: scopeFilter
      });
      console.log('API params:', params.toString());
      console.log('===================');

      const [issuesRes, projectsRes, usersRes] = await Promise.all([
        fetch(`/api/issues?${params.toString()}`),
        fetch('/api/projects'),
        fetch('/api/users'),
      ]);

      if (!issuesRes.ok) {
        const errorData = await issuesRes.json();
        throw new Error(errorData.error || 'Failed to fetch issues');
      }

      if (!projectsRes.ok) {
        throw new Error('Failed to fetch projects');
      }

      const issuesData = await issuesRes.json();
      const projectsData = await projectsRes.json();
      const usersData = usersRes.ok ? await usersRes.json() : { data: [] };

      setIssues(issuesData.data || []);
      setProjects(projectsData.data || []);
      setUsers(usersData.data || []);
    } catch (err: any) {
      console.error('Error loading issues:', err);
      setError(err.message || 'Failed to load issues');
    } finally {
      setIsLoading(false);
    }
  }

  // Client-side search and overdue filtering
  const filteredIssues = issues.filter((issue) => {
    // Search filter
    const matchesSearch = searchQuery === ''
      ? true
      : issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Overdue filter
    if (overdueFilter) {
      if (!issue.due_date) return false;
      const dueDate = new Date(issue.due_date);
      const today = new Date();
      dueDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const isOverdue = dueDate < today && issue.status !== 'closed' && issue.status !== 'resolved';
      return isOverdue;
    }

    return true;
  });

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
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Search */}
              <div className="md:col-span-6">
                <Input
                  placeholder="Search issues by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Scope Filter - Only show for admin/manager */}
              {currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Scope
                  </label>
                  <select
                    value={scopeFilter}
                    onChange={(e) => setScopeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="all">All Issues</option>
                    <option value="assigned">Assigned to Me</option>
                    <option value="reported">Reported by Me</option>
                    <option value="my">My Issues (Both)</option>
                  </select>
                </div>
              )}

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
                    setScopeFilter('all');
                    setOverdueFilter(false);
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Filter Indicator */}
        {overdueFilter && (
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <span className="text-red-700 dark:text-red-400 font-semibold">🚨 Showing Overdue Issues Only</span>
              <button
                onClick={() => setOverdueFilter(false)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        )}

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
                        <div className="flex items-start justify-between gap-4">
                          {/* Left side - Avatars and Content */}
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            {/* Avatars */}
                            <div className="flex-shrink-0 flex gap-2">
                              {/* Reporter Avatar */}
                              {issue.reporter?.avatar_url ? (
                                <img
                                  src={issue.reporter.avatar_url}
                                  alt={issue.reporter?.name || 'Reporter'}
                                  title={`Reporter: ${issue.reporter?.name || 'Unknown'}`}
                                  className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700"
                                />
                              ) : (
                                <div
                                  className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold"
                                  title={`Reporter: ${issue.reporter?.name || 'Unknown'}`}
                                >
                                  {issue.reporter?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                              )}
                              {/* Assignee Avatar */}
                              {issue.assignee ? (
                                issue.assignee.avatar_url ? (
                                  <img
                                    src={issue.assignee.avatar_url}
                                    alt={issue.assignee?.name || 'Assignee'}
                                    title={`Assignee: ${issue.assignee?.name || 'Unknown'}`}
                                    className="w-10 h-10 rounded-full border-2 border-green-200 dark:border-green-700"
                                  />
                                ) : (
                                  <div
                                    className="w-10 h-10 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center text-green-700 dark:text-green-300 font-semibold"
                                    title={`Assignee: ${issue.assignee?.name || 'Unknown'}`}
                                  >
                                    {issue.assignee?.name?.charAt(0).toUpperCase() || '?'}
                                  </div>
                                )
                              ) : (
                                <div
                                  className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500"
                                  title="Unassigned"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              {/* Title */}
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                {issue.title}
                              </h3>

                              {/* Description */}
                              {issue.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                                  {issue.description}
                                </p>
                              )}

                              {/* Badges */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant={statusColor[issue.status]}>
                                  {issue.status.replace('_', ' ')}
                                </Badge>
                                <Badge variant={priorityColor[issue.priority]}>
                                  {issue.priority}
                                </Badge>
                                <Badge variant={typeColor[issue.type]}>{issue.type}</Badge>
                                {(() => {
                                  const dueDate = issue.due_date ? new Date(issue.due_date) : null;
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  const isOverdue = dueDate && dueDate < today && issue.status !== 'closed' && issue.status !== 'resolved';
                                  if (isOverdue) {
                                    const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                                    return (
                                      <Badge variant="danger" className="animate-pulse font-semibold">
                                        🚨 {daysOverdue}d overdue
                                      </Badge>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>
                          </div>

                          {/* Right side - Project, Timestamp, and Assignee */}
                          <div className="flex-shrink-0 text-right flex flex-col justify-between">
                            <div>
                              <div className="font-semibold text-primary-600 dark:text-primary-400 text-sm mb-1">
                                {issue.project?.name || 'Unknown Project'}
                              </div>
                              <time className="text-gray-500 dark:text-gray-400 font-mono text-xs block" title={new Date(issue.created_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true
                              })}>
                                {new Date(issue.created_at).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </time>
                            </div>
                            <div className="text-sm mt-4">
                              <div className="text-gray-600 dark:text-gray-400 text-xs mb-1">Assigned to:</div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {issue.assignee?.name || 'Unassigned'}
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
