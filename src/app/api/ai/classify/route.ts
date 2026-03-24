import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { issueClassifier } from '@/lib/ai';
import { AppError } from '@/lib/errors';

/**
 * POST /api/ai/classify
 * Classify an issue automatically
 */
export async function POST(request: NextRequest) {
  try {
    await getCurrentUser(); // Verify authentication

    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const classification = await issueClassifier.classify(title, description);

    return NextResponse.json({
      success: true,
      data: classification,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Classification failed' },
      { status: 500 }
    );
  }
}
