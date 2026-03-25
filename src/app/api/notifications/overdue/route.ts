import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { issueRepository } from '@/repositories';
import { notifyOverdueIssues } from '@/lib/notifications/email';
import { AppError } from '@/lib/errors';

/**
 * POST /api/notifications/overdue
 * Check for overdue issues and send notifications to assignees
 * Requires admin role
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    // Only admins can trigger overdue notifications
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    console.log('🔍 Checking for overdue issues...');

    // Find all overdue issues
    const overdueIssues = await issueRepository.findOverdueIssues();

    if (overdueIssues.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No overdue issues found',
        data: {
          total: 0,
          sent: 0,
          failed: 0,
        },
      });
    }

    console.log(`📧 Found ${overdueIssues.length} overdue issue(s). Sending notifications...`);

    // Send notifications
    const result = await notifyOverdueIssues(overdueIssues);

    const notificationChannels = [];
    if (result.sent > 0) {
      notificationChannels.push(`📧 Email: ${result.sent} sent`);
    }
    if (result.failed > 0) {
      notificationChannels.push(`❌ Email: ${result.failed} failed`);
    }
    if (result.slackSent) {
      notificationChannels.push(`💬 Slack: Sent`);
    }

    return NextResponse.json({
      success: true,
      message: `Notifications sent: ${notificationChannels.join(', ')}`,
      data: {
        total: overdueIssues.length,
        emailSent: result.sent,
        emailFailed: result.failed,
        slackSent: result.slackSent,
        issues: overdueIssues.map((issue) => ({
          id: issue.id,
          title: issue.title,
          assignee: issue.assignee?.name || 'Unassigned',
          daysOverdue: Math.ceil(
            (new Date().getTime() - new Date(issue.due_date!).getTime()) / (1000 * 60 * 60 * 24)
          ),
        })),
      },
    });
  } catch (error) {
    console.error('❌ Error sending overdue notifications:', error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to send overdue notifications' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/overdue
 * Get list of overdue issues without sending notifications
 */
export async function GET(request: NextRequest) {
  try {
    await getCurrentUser(); // Verify authentication

    console.log('🔍 Fetching overdue issues...');

    const overdueIssues = await issueRepository.findOverdueIssues();

    return NextResponse.json({
      success: true,
      data: overdueIssues.map((issue) => ({
        id: issue.id,
        title: issue.title,
        project: issue.project.name,
        assignee: issue.assignee?.name || 'Unassigned',
        assigneeEmail: issue.assignee?.email,
        dueDate: issue.due_date,
        daysOverdue: Math.ceil(
          (new Date().getTime() - new Date(issue.due_date!).getTime()) / (1000 * 60 * 60 * 24)
        ),
        priority: issue.priority,
        status: issue.status,
      })),
      total: overdueIssues.length,
    });
  } catch (error) {
    console.error('❌ Error fetching overdue issues:', error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch overdue issues' },
      { status: 500 }
    );
  }
}
