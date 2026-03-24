import { NextRequest, NextResponse } from 'next/server';
import { issueController } from '@/controllers';
import { getCurrentUser } from '@/lib/auth';
import { AppError } from '@/lib/errors';

/**
 * GET /api/issues/search
 * Search issues by title and description
 */
export async function GET(request: NextRequest) {
  try {
    await getCurrentUser(); // Verify authentication

    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');

    if (!q) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }

    const response = await issueController.search(q);

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
