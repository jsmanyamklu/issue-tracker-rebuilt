import { NextRequest, NextResponse } from 'next/server';
import { issueController } from '@/controllers';
import { getCurrentUser } from '@/lib/auth';
import { AppError } from '@/lib/errors';

/**
 * GET /api/dashboard
 * Get dashboard summary for current user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    const response = await issueController.getDashboardSummary(user.id);

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
