import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { rootCauseAnalyzer } from '@/lib/ai';
import { AppError } from '@/lib/errors';

/**
 * POST /api/ai/root-cause
 * Analyze root cause of an issue
 */
export async function POST(request: NextRequest) {
  try {
    await getCurrentUser(); // Verify authentication

    const { title, description, logs } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const analysis = await rootCauseAnalyzer.analyze(title, description, logs);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Root cause analysis failed' },
      { status: 500 }
    );
  }
}
