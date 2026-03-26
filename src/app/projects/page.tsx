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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
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
            {projects.map((project: any) => {
              const canDelete = project.owner_id === user.id || isAdmin;
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  canDelete={canDelete}
                />
              );
            })}
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
