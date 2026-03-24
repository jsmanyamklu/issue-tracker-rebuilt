import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { similarIssueFinder } from '@/lib/ai';
import { AppError } from '@/lib/errors';

/**
 * POST /api/ai/similar
 * Find similar issues
 */
export async function POST(request: NextRequest) {
  try {
    await getCurrentUser(); // Verify authentication

    const body = await request.json();

    let similarIssues;

    if (body.issue_id) {
      // Find similar to existing issue
      similarIssues = await similarIssueFinder.findSimilar(
        body.issue_id,
        body.limit || 5,
        body.threshold || 0.7
      );
    } else if (body.title) {
      // Find similar by text
      similarIssues = await similarIssueFinder.findSimilarByText(
        body.title,
        body.description,
        body.limit || 5,
        body.threshold || 0.7
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Either issue_id or title is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: similarIssues,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to find similar issues' },
      { status: 500 }
    );
  }
}
