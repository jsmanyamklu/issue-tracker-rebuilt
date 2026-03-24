import { NextRequest, NextResponse } from 'next/server';
import { commentController } from '@/controllers';
import { getCurrentUser } from '@/lib/auth';
import { CreateCommentDTO } from '@/types';
import { AppError } from '@/lib/errors';

/**
 * GET /api/issues/[id]/comments
 * Get all comments for an issue
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getCurrentUser(); // Verify authentication
    const { id } = await params;

    const response = await commentController.getByIssueId(id);

    return NextResponse.json(response, {
      status: response.success ? 200 : 404,
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
 * POST /api/issues/[id]/comments
 * Create a new comment on an issue
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { id } = await params;

    const data: CreateCommentDTO = {
      issue_id: id,
      user_id: user.id,
      content: body.content,
    };

    const response = await commentController.create(data);

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
