import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import logAnalyzer from '@/lib/ai/log-analyzer';

/**
 * GET /api/admin/analytics/insights
 * Get AI-powered insights from activity logs (Admin/Manager only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and manager can view AI insights
    if (session.user.role !== 'admin' && session.user.role !== 'manager') {
      return NextResponse.json(
        { error: 'Forbidden - Admin or Manager access required' },
        { status: 403 }
      );
    }

    // Get days parameter (default 30)
    const searchParams = request.nextUrl.searchParams;
    const daysBack = searchParams.get('days')
      ? parseInt(searchParams.get('days')!, 10)
      : 30;

    // Check if AI is available
    if (!logAnalyzer.isAvailable()) {
      return NextResponse.json({
        error: 'AI analysis not configured',
        message: 'Please configure ANTHROPIC_API_KEY to enable AI-powered insights',
        ai_available: false,
      }, { status: 503 });
    }

    const insights = await logAnalyzer.analyzeActivityLogs(daysBack);

    return NextResponse.json({
      insights,
      ai_available: true,
      analysis_period_days: daysBack,
    });
  } catch (error) {
    console.error('Failed to generate AI insights:', error);
    return NextResponse.json(
      { error: 'Internal server error', ai_available: false },
      { status: 500 }
    );
  }
}
