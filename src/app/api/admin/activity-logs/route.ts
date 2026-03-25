import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import activityLogService from '@/services/ActivityLogService';
import { ActivityLogFilters } from '@/types';

/**
 * GET /api/admin/activity-logs
 * Get activity logs (Admin/Manager only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and manager can view activity logs
    if (session.user.role !== 'admin' && session.user.role !== 'manager') {
      return NextResponse.json(
        { error: 'Forbidden - Admin or Manager access required' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters: ActivityLogFilters = {
      user_id: searchParams.get('user_id') || undefined,
      action_type: searchParams.get('action_type') as any || undefined,
      resource_type: searchParams.get('resource_type') as any || undefined,
      resource_id: searchParams.get('resource_id') || undefined,
      start_date: searchParams.get('start_date')
        ? new Date(searchParams.get('start_date')!)
        : undefined,
      end_date: searchParams.get('end_date')
        ? new Date(searchParams.get('end_date')!)
        : undefined,
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!, 10)
        : 50,
      offset: searchParams.get('offset')
        ? parseInt(searchParams.get('offset')!, 10)
        : 0,
    };

    const result = await activityLogService.getActivityLogs(filters);

    return NextResponse.json({
      logs: result.logs,
      total: result.total,
      page: Math.floor((filters.offset || 0) / (filters.limit || 50)) + 1,
      limit: filters.limit,
      hasMore: (filters.offset || 0) + result.logs.length < result.total,
    });
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
