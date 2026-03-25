import { NextRequest, NextResponse } from 'next/server';
import { issueController } from '@/controllers';
import { getCurrentUser } from '@/lib/auth';
import { CreateIssueDTO, IssueFilters } from '@/types';
import { AppError } from '@/lib/errors';

/**
 * GET /api/issues
 * Get all issues or filtered issues
 */
export async function GET(request: NextRequest) {
  try {
    await getCurrentUser(); // Verify authentication

    const searchParams = request.nextUrl.searchParams;

    // Build filters from query params
    const filters: IssueFilters = {};

    if (searchParams.has('project_id')) {
      filters.project_id = searchParams.get('project_id')!;
    }
    if (searchParams.has('status')) {
      filters.status = searchParams.get('status') as any;
    }
    if (searchParams.has('priority')) {
      filters.priority = searchParams.get('priority') as any;
    }
    if (searchParams.has('type')) {
      filters.type = searchParams.get('type') as any;
    }
    if (searchParams.has('assignee_id')) {
      const assigneeId = searchParams.get('assignee_id')!;
      // Handle 'null' string for unassigned issues
      filters.assignee_id = assigneeId === 'null' ? 'unassigned' : assigneeId;
    }
    if (searchParams.has('reporter_id')) {
      filters.reporter_id = searchParams.get('reporter_id')!;
    }
    if (searchParams.has('user_id')) {
      filters.user_id = searchParams.get('user_id')!;
    }

    // Check if any filters are applied
    const hasFilters = Object.keys(filters).length > 0;

    const response = hasFilters
      ? await issueController.getWithFilters(filters)
      : await issueController.getAll();

    return NextResponse.json(response, {
      status: response.success ? 200 : 500,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/issues
 * Create a new issue
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    const body = await request.json();
    const data: CreateIssueDTO = {
      ...body,
      reporter_id: user.id,
    };

    const response = await issueController.create(data);

    return NextResponse.json(response, {
      status: response.success ? 201 : 400,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
