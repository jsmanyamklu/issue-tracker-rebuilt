import { getSession } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { projectService } from '@/services';
import { redirect } from 'next/navigation';

async function getProjects() {
  try {
    const projects = await projectService.getAllWithOwner();
    return projects;
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

  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="mt-2 text-gray-600">
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
                    <div className="flex items-center gap-2 text-sm text-gray-500">
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
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">No projects yet</p>
              <Link href="/projects/new">
                <Button>Create Your First Project</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
