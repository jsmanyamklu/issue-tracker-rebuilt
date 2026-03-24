import { query } from '@/lib/db';
import { Comment, CommentWithUser, CreateCommentDTO } from '@/types';
import { DatabaseError } from '@/lib/errors';

/**
 * Comment Repository
 * Handles all database operations for comments
 */
export class CommentRepository {
  /**
   * Find comment by ID
   */
  async findById(id: string): Promise<Comment | null> {
    try {
      const result = await query<Comment>(
        'SELECT * FROM comments WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new DatabaseError('Failed to find comment by ID', error as Error);
    }
  }

  /**
   * Find comment by ID with user information
   */
  async findByIdWithUser(id: string): Promise<CommentWithUser | null> {
    try {
      const result = await query<CommentWithUser>(
        `SELECT c.*,
                json_build_object(
                  'id', u.id,
                  'name', u.name,
                  'avatar_url', u.avatar_url
                ) as user
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new DatabaseError('Failed to find comment with user', error as Error);
    }
  }

  /**
   * Get all comments for an issue
   */
  async findByIssueId(issueId: string): Promise<CommentWithUser[]> {
    try {
      const result = await query<CommentWithUser>(
        `SELECT c.*,
                json_build_object(
                  'id', u.id,
                  'name', u.name,
                  'avatar_url', u.avatar_url
                ) as user
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.issue_id = $1
         ORDER BY c.created_at ASC`,
        [issueId]
      );
      return result.rows;
    } catch (error) {
      throw new DatabaseError('Failed to fetch comments for issue', error as Error);
    }
  }

  /**
   * Get all comments by a user
   */
  async findByUserId(userId: string): Promise<Comment[]> {
    try {
      const result = await query<Comment>(
        'SELECT * FROM comments WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return result.rows;
    } catch (error) {
      throw new DatabaseError('Failed to fetch comments by user', error as Error);
    }
  }

  /**
   * Create a new comment
   */
  async create(data: CreateCommentDTO): Promise<Comment> {
    try {
      const result = await query<Comment>(
        `INSERT INTO comments (issue_id, user_id, content)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [data.issue_id, data.user_id, data.content]
      );
      return result.rows[0];
    } catch (error) {
      throw new DatabaseError('Failed to create comment', error as Error);
    }
  }

  /**
   * Update comment content
   */
  async update(id: string, content: string): Promise<Comment> {
    try {
      const result = await query<Comment>(
        `UPDATE comments
         SET content = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [content, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new DatabaseError('Failed to update comment', error as Error);
    }
  }

  /**
   * Delete comment
   */
  async delete(id: string): Promise<void> {
    try {
      await query('DELETE FROM comments WHERE id = $1', [id]);
    } catch (error) {
      throw new DatabaseError('Failed to delete comment', error as Error);
    }
  }

  /**
   * Get comment count for an issue
   */
  async getCountByIssueId(issueId: string): Promise<number> {
    try {
      const result = await query<{ count: string }>(
        'SELECT COUNT(*) as count FROM comments WHERE issue_id = $1',
        [issueId]
      );
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      throw new DatabaseError('Failed to get comment count', error as Error);
    }
  }

  /**
   * Get recent comments across all issues
   */
  async getRecent(limit: number = 10): Promise<CommentWithUser[]> {
    try {
      const result = await query<CommentWithUser>(
        `SELECT c.*,
                json_build_object(
                  'id', u.id,
                  'name', u.name,
                  'avatar_url', u.avatar_url
                ) as user
         FROM comments c
         JOIN users u ON c.user_id = u.id
         ORDER BY c.created_at DESC
         LIMIT $1`,
        [limit]
      );
      return result.rows;
    } catch (error) {
      throw new DatabaseError('Failed to fetch recent comments', error as Error);
    }
  }
}

// Export singleton instance
export const commentRepository = new CommentRepository();
