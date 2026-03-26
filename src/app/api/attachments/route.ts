import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPool } from '@/lib/db';
import { deleteFile } from '@/lib/storage';

/**
 * POST /api/attachments
 * Link an attachment to an issue or comment
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { attachmentId, issueId, commentId } = await request.json();

    if (!attachmentId) {
      return NextResponse.json(
        { error: 'Attachment ID is required' },
        { status: 400 }
      );
    }

    if (!issueId && !commentId) {
      return NextResponse.json(
        { error: 'Either issue_id or comment_id is required' },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Verify attachment belongs to current user (or is not yet linked)
    const attachmentCheck = await pool.query(
      'SELECT * FROM attachments WHERE id = $1 AND uploaded_by = $2',
      [attachmentId, user.id]
    );

    if (attachmentCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Attachment not found or access denied' },
        { status: 404 }
      );
    }

    // If linking to issue, verify issue exists
    if (issueId) {
      const issueCheck = await pool.query('SELECT id FROM issues WHERE id = $1', [
        issueId,
      ]);
      if (issueCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
      }
    }

    // If linking to comment, verify comment exists
    if (commentId) {
      const commentCheck = await pool.query(
        'SELECT id FROM comments WHERE id = $1',
        [commentId]
      );
      if (commentCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      }
    }

    // Link attachment
    await pool.query(
      `UPDATE attachments
       SET issue_id = $1, comment_id = $2, updated_at = NOW()
       WHERE id = $3`,
      [issueId, commentId, attachmentId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Link attachment error:', error);
    return NextResponse.json(
      { error: 'Failed to link attachment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/attachments?id=xxx
 * Delete an attachment
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get('id');

    if (!attachmentId) {
      return NextResponse.json(
        { error: 'Attachment ID is required' },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Get attachment info
    const result = await pool.query(
      'SELECT * FROM attachments WHERE id = $1 AND deleted_at IS NULL',
      [attachmentId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    const attachment = result.rows[0];

    // Check permissions: user must be uploader or admin/manager
    const canDelete =
      attachment.uploaded_by === user.id ||
      user.role === 'admin' ||
      user.role === 'manager';

    if (!canDelete) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this attachment' },
        { status: 403 }
      );
    }

    // Soft delete in database
    await pool.query(
      'UPDATE attachments SET deleted_at = NOW() WHERE id = $1',
      [attachmentId]
    );

    // Delete physical file
    try {
      await deleteFile(attachment.filename);
    } catch (fileError) {
      console.error('Failed to delete physical file:', fileError);
      // Continue anyway - file might already be deleted
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete attachment error:', error);
    return NextResponse.json(
      { error: 'Failed to delete attachment' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/attachments?issue_id=xxx or ?comment_id=xxx
 * List attachments for an issue or comment
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const issueId = searchParams.get('issue_id');
    const commentId = searchParams.get('comment_id');

    if (!issueId && !commentId) {
      return NextResponse.json(
        { error: 'Either issue_id or comment_id is required' },
        { status: 400 }
      );
    }

    const pool = getPool();

    let query = `
      SELECT
        a.*,
        u.name as uploaded_by_name,
        u.avatar_url as uploaded_by_avatar
      FROM attachments a
      LEFT JOIN users u ON a.uploaded_by = u.id
      WHERE a.deleted_at IS NULL
    `;

    const params: any[] = [];

    if (issueId) {
      query += ' AND a.issue_id = $1';
      params.push(issueId);
    } else if (commentId) {
      query += ' AND a.comment_id = $1';
      params.push(commentId);
    }

    query += ' ORDER BY a.created_at ASC';

    const result = await pool.query(query, params);

    const attachments = result.rows.map((row) => ({
      id: row.id,
      filename: row.filename,
      original_filename: row.original_filename,
      file_size: row.file_size,
      mime_type: row.mime_type,
      storage_url: row.storage_url,
      created_at: row.created_at,
      uploaded_by: {
        id: row.uploaded_by,
        name: row.uploaded_by_name,
        avatar_url: row.uploaded_by_avatar,
      },
    }));

    return NextResponse.json({ success: true, attachments });
  } catch (error) {
    console.error('List attachments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attachments' },
      { status: 500 }
    );
  }
}
