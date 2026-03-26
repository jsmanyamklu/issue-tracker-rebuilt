import { getCurrentUser } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/Card';
import { NoProjects } from '@/components/ui/EmptyState';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { projectService, issueService } from '@/services';
import { redirect } from 'next/navigation';
import { ProjectCard } from '@/components/projects/ProjectCard';

async function getProjectsWithStats() {
  try {
    const projects = await projectService.getAllWithOwner();

    // Fetch issue stats for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project: any) => {
        const [stats, overdueCount] = await Promise.all([
          issueService.getStatsByStatus(project.id),
          issueService.getOverdueCount(project.id),
        ]);
        return {
          ...project,
          issueStats: stats,
          overdueCount,
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
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin');
  }

  const projects = await getProjectsWithStats();
  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-accent-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-accent-700 dark:from-white dark:via-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
              Projects
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-300 text-lg">
              Manage your projects and track issues
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/projects/overview">
              <Button variant="secondary">📊 View All Issues</Button>
            </Link>
            <Link href="/projects/new">
              <Button>+ New Project</Button>
            </Link>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any, index: number) => {
              const canDelete = project.owner_id === user.id || isAdmin;
              return (
                <div key={project.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <ProjectCard
                    project={project}
                    canDelete={canDelete}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="animate-fade-in">
            <CardContent>
              <NoProjects />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
