import { getCurrentUser } from '@/lib/auth';
import { issueService, projectService } from '@/services';
import { notFound, redirect } from 'next/navigation';
import { KanbanBoard } from '@/components/KanbanBoard';
import { Card } from '@/components/ui/Card';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

async function getProjectIssues(projectId: string) {
  try {
    const [project, issues] = await Promise.all([
      projectService.getById(projectId),
      issueService.getByProjectId(projectId),
    ]);

    return { project, issues };
  } catch (error) {
    console.error('Failed to fetch project data:', error);
    return null;
  }
}

export default async function ProjectKanbanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin');
  }

  const { id } = await params;
  const data = await getProjectIssues(id);

  if (!data) {
    notFound();
  }

  const { project, issues } = data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb
            items={[
              { label: 'Projects', href: '/projects' },
              { label: project.name, href: `/projects/${project.id}` },
              { label: 'Kanban' },
            ]}
          />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {project.name} - Kanban Board
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Drag and drop issues to change their status
            </p>
          </div>

          <div className="flex gap-2">
            <Link href={`/projects/${project.id}`}>
              <Button variant="secondary">Back to Project</Button>
            </Link>
            <Link href={`/issues/new?project_id=${project.id}`}>
              <Button>+ New Issue</Button>
            </Link>
          </div>
        </div>

        {/* Kanban Board */}
        <KanbanBoard issues={issues as any} />
      </div>
    </div>
  );
}
