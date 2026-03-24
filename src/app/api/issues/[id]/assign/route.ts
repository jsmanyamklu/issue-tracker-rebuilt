import { NextRequest, NextResponse } from 'next/server';
import { issueController } from '@/controllers';
import { getCurrentUser } from '@/lib/auth';
import { AppError } from '@/lib/errors';

/**
 * POST /api/issues/[id]/assign
 * Assign issue to a user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const { assignee_id } = await request.json();

    if (!assignee_id) {
      return NextResponse.json(
        { success: false, error: 'assignee_id is required' },
        { status: 400 }
      );
    }

    const response = await issueController.assign(id, assignee_id, user.id);

    return NextResponse.json(response, {
      status: response.success ? 200 : 400,
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
