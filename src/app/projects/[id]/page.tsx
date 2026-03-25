import { getCurrentUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { notFound } from 'next/navigation';
import { projectService, issueService } from '@/services';

async function getProject(id: string) {
  try {
    const project = await projectService.getByIdWithOwner(id);
    return project;
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return null;
  }
}

async function getProjectIssues(id: string) {
  try {
    const issues = await issueService.getByProjectId(id);
    return issues;
  } catch (error) {
    console.error('Failed to fetch issues:', error);
    return [];
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const { id } = await params;
  const [project, issues] = await Promise.all([
    getProject(id),
    getProjectIssues(id),
  ]);

  if (!project) {
    notFound();
  }

  const isOwner = project.owner_id === user.id;

  const stats = {
    total: issues.length,
    open: issues.filter((i: any) => i.status === 'open').length,
    inProgress: issues.filter((i: any) => i.status === 'in_progress').length,
    resolved: issues.filter((i: any) => i.status === 'resolved').length,
    closed: issues.filter((i: any) => i.status === 'closed').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Owner: {project.owner?.name || 'Unknown'}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/issues/new?project_id=${project.id}`}>
                <Button>+ New Issue</Button>
              </Link>
              {isOwner && (
                <Link href={`/projects/${project.id}/edit`}>
                  <Button variant="secondary">Edit Project</Button>
                </Link>
              )}
            </div>
          </div>
          {project.description && (
            <p className="text-gray-700 dark:text-gray-300">{project.description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.open}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Open</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Resolved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">{stats.closed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Closed</div>
            </CardContent>
          </Card>
        </div>

        {/* Issues List */}
        <Card>
          <CardHeader>
            <CardTitle>Issues</CardTitle>
          </CardHeader>
          <CardContent>
            {issues.length > 0 ? (
              <div className="space-y-3">
                {issues.map((issue: any) => (
                  <Link
                    key={issue.id}
                    href={`/issues/${issue.id}`}
                    className="block p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{issue.title}</h4>
                        {issue.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                            {issue.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={
                              issue.priority === 'critical' || issue.priority === 'high'
                                ? 'danger'
                                : 'default'
                            }
                          >
                            {issue.priority}
                          </Badge>
                          <Badge variant="info">{issue.type}</Badge>
                          <Badge
                            variant={
                              issue.status === 'open'
                                ? 'warning'
                                : issue.status === 'resolved' || issue.status === 'closed'
                                ? 'success'
                                : 'info'
                            }
                          >
                            {issue.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No issues in this project yet</p>
                <Link href={`/issues/new?project_id=${project.id}`}>
                  <Button>Create First Issue</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
