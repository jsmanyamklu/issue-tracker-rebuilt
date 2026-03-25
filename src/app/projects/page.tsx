import { getSession } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { NoProjects } from '@/components/ui/EmptyState';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { projectService, issueService } from '@/services';
import { redirect } from 'next/navigation';

async function getProjectsWithStats() {
  try {
    const projects = await projectService.getAllWithOwner();

    // Fetch issue stats for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project: any) => {
        const stats = await issueService.getStatsByStatus(project.id);
        return {
          ...project,
          issueStats: stats,
        };
      })
    );

    return projectsWithStats;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
}

export default async function ProjectsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const projects = await getProjectsWithStats();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Manage your projects and track issues
            </p>
          </div>
          <Link href="/projects/new">
            <Button>+ New Project</Button>
          </Link>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {project.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    {/* Issue Statistics */}
                    {project.issueStats && (() => {
                      const total = project.issueStats.open + project.issueStats.in_progress +
                                   project.issueStats.resolved + project.issueStats.closed;
                      const completed = project.issueStats.resolved + project.issueStats.closed;
                      const progress = total > 0 ? (completed / total) * 100 : 0;

                      return (
                        <div className="mb-4 pb-4 border-b border-gray-200 space-y-3">
                          {/* Progress Bar */}
                          {total > 0 && (
                            <div>
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span className="font-medium">Progress</span>
                                <span>{completed}/{total} completed</span>
                              </div>
                              <ProgressBar value={progress} showLabel={false} size="sm" />
                            </div>
                          )}

                          {/* Issue Status Badges */}
                          <div className="text-xs font-semibold text-gray-500 mb-2">Issues</div>
                          <div className="flex flex-wrap gap-2">
                            {project.issueStats.open > 0 && (
                              <Badge variant="warning" className="text-xs">
                                🟡 {project.issueStats.open}
                              </Badge>
                            )}
                            {project.issueStats.in_progress > 0 && (
                              <Badge variant="info" className="text-xs">
                                🔵 {project.issueStats.in_progress}
                              </Badge>
                            )}
                            {project.issueStats.resolved > 0 && (
                              <Badge variant="success" className="text-xs">
                                🟢 {project.issueStats.resolved}
                              </Badge>
                            )}
                            {project.issueStats.closed > 0 && (
                              <Badge variant="default" className="text-xs">
                                ⚪ {project.issueStats.closed}
                              </Badge>
                            )}
                            {total === 0 && (
                              <span className="text-xs text-gray-400">No issues yet</span>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>Owner: {project.owner?.name || 'Unknown'}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <NoProjects />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
