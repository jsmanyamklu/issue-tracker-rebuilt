import { NextRequest, NextResponse } from 'next/server';
import { issueController } from '@/controllers';
import { getCurrentUser } from '@/lib/auth';
import { AppError } from '@/lib/errors';

/**
 * GET /api/issues/stats
 * Get issue statistics (by status and priority)
 */
export async function GET(request: NextRequest) {
  try {
    await getCurrentUser(); // Verify authentication

    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('project_id') || undefined;

    const response = await issueController.getStats(projectId);

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
