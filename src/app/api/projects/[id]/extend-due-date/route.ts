import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPool } from '@/lib/db';

/**
 * POST /api/projects/[id]/extend-due-date
 * Extend project due date (admin/manager only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate and authorize
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admin and manager can extend project due dates
    if (user.role !== 'admin' && user.role !== 'manager') {
      return NextResponse.json(
        { success: false, error: 'Only admins and managers can extend project due dates' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { new_due_date } = body;

    if (!new_due_date) {
      return NextResponse.json(
        { success: false, error: 'New due date is required' },
        { status: 400 }
      );
    }

    // 2. Validate date is in the future
    const newDate = new Date(new_due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (newDate < today) {
      return NextResponse.json(
        { success: false, error: 'New due date cannot be in the past' },
        { status: 400 }
      );
    }

    // 3. Check if project exists and get current due date
    const pool = getPool();
    const projectResult = await pool.query(
      'SELECT id, name, due_date FROM projects WHERE id = $1',
      [id]
    );

    if (projectResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const project = projectResult.rows[0];
    const currentDueDate = project.due_date;

    // 4. Check if new date is actually an extension
    if (currentDueDate) {
      const current = new Date(currentDueDate);
      if (newDate <= current) {
        return NextResponse.json(
          {
            success: false,
            error: `New due date must be after current due date (${current.toLocaleDateString()})`,
          },
          { status: 400 }
        );
      }
    }

    // 5. Check all open issues and their due dates
    const issuesResult = await pool.query(
      `SELECT id, title, due_date
       FROM issues
       WHERE project_id = $1
         AND status NOT IN ('closed', 'resolved')
         AND due_date IS NOT NULL
       ORDER BY due_date DESC`,
      [id]
    );

    const openIssues = issuesResult.rows;
    const issuesExceedingNewDate = openIssues.filter(issue => {
      const issueDueDate = new Date(issue.due_date);
      return issueDueDate > newDate;
    });

    // 6. Update project due date
    await pool.query(
      'UPDATE projects SET due_date = $1, updated_at = NOW() WHERE id = $2',
      [new_due_date, id]
    );

    // 7. Return response with warnings if needed
    return NextResponse.json({
      success: true,
      message: 'Project due date extended successfully',
      data: {
        project_id: id,
        project_name: project.name,
        old_due_date: currentDueDate,
        new_due_date: new_due_date,
        open_issues_count: openIssues.length,
        issues_exceeding_new_date: issuesExceedingNewDate.map(issue => ({
          id: issue.id,
          title: issue.title,
          due_date: issue.due_date,
        })),
      },
      warnings:
        issuesExceedingNewDate.length > 0
          ? [
              `${issuesExceedingNewDate.length} issue(s) have due dates after the new project due date. Please review and update them.`,
            ]
          : undefined,
    });
  } catch (error) {
    console.error('Error extending project due date:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to extend project due date',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
