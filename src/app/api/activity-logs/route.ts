import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { activityLogService } from '@/services';
import { ResourceType } from '@/types';

/**
 * GET /api/activity-logs
 * Get activity logs with filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const resourceType = searchParams.get('resource_type') as ResourceType | null;
    const resourceId = searchParams.get('resource_id');
    const userId = searchParams.get('user_id');
    const actionType = searchParams.get('action_type');
    const limit = searchParams.get('limit');

    const filters: any = {};

    if (resourceType) filters.resource_type = resourceType;
    if (resourceId) filters.resource_id = resourceId;
    if (userId) filters.user_id = userId;
    if (actionType) filters.action_type = actionType;
    if (limit) filters.limit = parseInt(limit, 10);

    const result = await activityLogService.getActivityLogs(filters);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Failed to get activity logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get activity logs',
      },
      { status: 500 }
    );
  }
}
