'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

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

export default function ProjectsOverviewPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [overdueFilter, setOverdueFilter] = useState<boolean>(false);

  useEffect(() => {
    loadAllIssues();
  }, []);

  async function loadAllIssues() {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/issues');
      if (!response.ok) {
        throw new Error('Failed to fetch issues');
      }

      const data = await response.json();
      setIssues(data.data || []);
    } catch (err: any) {
      console.error('Error loading issues:', err);
      setError(err.message || 'Failed to load issues');
    } finally {
      setIsLoading(false);
    }
  }

  // Calculate stats from ALL issues
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueIssues = issues.filter((i) =>
    i.due_date &&
    new Date(i.due_date) < today &&
    i.status !== 'closed' &&
    i.status !== 'resolved'
  );

  const stats = {
    total: issues.length,
    open: issues.filter((i) => i.status === 'open').length,
    inProgress: issues.filter((i) => i.status === 'in_progress').length,
    resolved: issues.filter((i) => i.status === 'resolved').length,
    closed: issues.filter((i) => i.status === 'closed').length,
    overdue: overdueIssues.length,
  };

  // Client-side filtering
  const filteredIssues = issues.filter((issue) => {
    // Status filter
    if (statusFilter !== 'all' && issue.status !== statusFilter) {
      return false;
    }

    // Overdue filter
    if (overdueFilter) {
      if (!issue.due_date) return false;
      const dueDate = new Date(issue.due_date);
      const todayCheck = new Date();
      dueDate.setHours(0, 0, 0, 0);
      todayCheck.setHours(0, 0, 0, 0);
      const isOverdue = dueDate < todayCheck && issue.status !== 'closed' && issue.status !== 'resolved';
      return isOverdue;
    }

    return true;
  });

  // Group issues by project for display
  const projectNames = Array.from(new Set(filteredIssues.map(i => i.project?.name).filter(Boolean)));

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Projects Overview</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Consolidated view of all issues across {projectNames.length} projects
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/projects">
              <Button variant="secondary">← Back to Projects</Button>
            </Link>
            <Link href="/issues/new">
              <Button>+ New Issue</Button>
            </Link>
          </div>
        </div>

        {/* Stats - Clickable Filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <button
            onClick={() => {
              setStatusFilter('all');
              setOverdueFilter(false);
            }}
            className="block w-full"
          >
            <Card className={`cursor-pointer transition-all hover:shadow-lg ${statusFilter === 'all' && !overdueFilter ? 'ring-2 ring-primary-500' : ''}`}>
              <CardContent className="text-center py-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Issues</div>
              </CardContent>
            </Card>
          </button>
          <button
            onClick={() => {
              setStatusFilter('open');
              setOverdueFilter(false);
            }}
            className="block w-full"
          >
            <Card className={`cursor-pointer transition-all hover:shadow-lg ${statusFilter === 'open' ? 'ring-2 ring-yellow-500' : ''}`}>
              <CardContent className="text-center py-4">
                <div className="text-2xl font-bold text-yellow-600">{stats.open}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Open</div>
              </CardContent>
            </Card>
          </button>
          <button
            onClick={() => {
              setStatusFilter('in_progress');
              setOverdueFilter(false);
            }}
            className="block w-full"
          >
            <Card className={`cursor-pointer transition-all hover:shadow-lg ${statusFilter === 'in_progress' ? 'ring-2 ring-blue-500' : ''}`}>
              <CardContent className="text-center py-4">
                <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">In Progress</div>
              </CardContent>
            </Card>
          </button>
          <button
            onClick={() => {
              setStatusFilter('resolved');
              setOverdueFilter(false);
            }}
            className="block w-full"
          >
            <Card className={`cursor-pointer transition-all hover:shadow-lg ${statusFilter === 'resolved' ? 'ring-2 ring-green-500' : ''}`}>
              <CardContent className="text-center py-4">
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Resolved</div>
              </CardContent>
            </Card>
          </button>
          <button
            onClick={() => {
              setStatusFilter('closed');
              setOverdueFilter(false);
            }}
            className="block w-full"
          >
            <Card className={`cursor-pointer transition-all hover:shadow-lg ${statusFilter === 'closed' ? 'ring-2 ring-gray-500' : ''}`}>
              <CardContent className="text-center py-4">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">{stats.closed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Closed</div>
              </CardContent>
            </Card>
          </button>
          {stats.overdue > 0 && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setOverdueFilter(true);
              }}
              className="block w-full"
            >
              <Card className={`cursor-pointer transition-all hover:shadow-lg border-2 border-red-500 dark:border-red-600 ${overdueFilter ? 'ring-2 ring-red-500' : ''}`}>
                <CardContent className="text-center py-4">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-500 animate-pulse">
                    🚨 {stats.overdue}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-400 font-semibold">Overdue</div>
                </CardContent>
              </Card>
            </button>
          )}
        </div>

        {/* Active Filter Badge */}
        {(statusFilter !== 'all' || overdueFilter) && (
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg">
              <span className="text-blue-700 dark:text-blue-400 font-medium">
                {overdueFilter ? '🚨 Overdue Issues' : `Status: ${statusFilter === 'in_progress' ? 'In Progress' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`}
              </span>
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setOverdueFilter(false);
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Showing {filteredIssues.length} of {issues.length} issues across all projects
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
                                  const todayCheck = new Date();
                                  todayCheck.setHours(0, 0, 0, 0);
                                  const isOverdue = dueDate && dueDate < todayCheck && issue.status !== 'closed' && issue.status !== 'resolved';
                                  if (isOverdue) {
                                    const daysOverdue = Math.ceil((todayCheck.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
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

                          {/* Right side - Project Name & Timestamp */}
                          <div className="flex-shrink-0 text-right">
                            <div className="mb-2">
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">PROJECT</div>
                              <Link
                                href={`/projects/${issue.project?.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm block"
                              >
                                📁 {issue.project?.name || 'Unknown'}
                              </Link>
                            </div>
                            <time className="text-gray-500 dark:text-gray-400 font-mono text-xs block" title={new Date(issue.created_at).toLocaleString()}>
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
                      {statusFilter !== 'all' || overdueFilter
                        ? 'No issues match your filter'
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
