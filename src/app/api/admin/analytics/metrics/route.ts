import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import activityLogService from '@/services/ActivityLogService';

/**
 * GET /api/admin/analytics/metrics
 * Get comprehensive analytics metrics (Admin/Manager only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and manager can view analytics
    if (session.user.role !== 'admin' && session.user.role !== 'manager') {
      return NextResponse.json(
        { error: 'Forbidden - Admin or Manager access required' },
        { status: 403 }
      );
    }

    const metrics = await activityLogService.getAnalyticsMetrics();

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Failed to fetch analytics metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
