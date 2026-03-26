import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { workloadService } from '@/services';
import { AppError } from '@/lib/errors';

/**
 * GET /api/workload
 * Get workload summary for all users
 */
export async function GET(request: NextRequest) {
  try {
    await getCurrentUser(); // Verify authentication

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'summary') {
      const summary = await workloadService.getWorkloadSummary();
      return NextResponse.json({ success: true, data: summary });
    }

    if (action === 'distribution') {
      const distribution = await workloadService.getWorkloadDistribution();
      return NextResponse.json({ success: true, data: distribution });
    }

    if (action === 'best-available') {
      const excludeUserId = searchParams.get('exclude');
      const bestUser = await workloadService.getBestAvailableUser(excludeUserId || undefined);
      return NextResponse.json({ success: true, data: bestUser });
    }

    if (action === 'overloaded') {
      const threshold = searchParams.get('threshold');
      const overloadedUsers = await workloadService.getOverloadedUsers(
        threshold ? parseInt(threshold) : undefined
      );
      return NextResponse.json({ success: true, data: overloadedUsers });
    }

    // Default: return all user workloads
    const workloads = await workloadService.getAllUserWorkloads();
    return NextResponse.json({ success: true, data: workloads });

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
