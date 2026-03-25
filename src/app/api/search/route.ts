import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { issueService, projectService } from '@/services';
import { AppError } from '@/lib/errors';

/**
 * GET /api/search
 * Global search for projects and issues
 */
export async function GET(request: NextRequest) {
  try {
    await getCurrentUser(); // Verify authentication

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (query.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Search both projects and issues
    const [projects, issues] = await Promise.all([
      projectService.search(query),
      issueService.search(query),
    ]);

    // Format results
    const projectResults = projects.map((project: any) => ({
      type: 'project',
      id: project.id,
      title: project.name,
      description: project.description,
    }));

    const issueResults = issues.map((issue: any) => ({
      type: 'issue',
      id: issue.id,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      project: issue.project?.name,
    }));

    const results = [...projectResults, ...issueResults].slice(0, 10); // Limit to 10 results

    return NextResponse.json({
      success: true,
      data: results,
      message: `Found ${results.length} result(s)`,
    });
  } catch (error) {
    console.error('Search error:', error);
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}
