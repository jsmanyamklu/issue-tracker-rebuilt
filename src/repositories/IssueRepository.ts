import { query } from '@/lib/db';
import {
  Issue,
  IssueWithRelations,
  CreateIssueDTO,
  UpdateIssueDTO,
  IssueFilters,
  IssueStatus,
  IssuePriority,
  IssueType,
} from '@/types';
import { DatabaseError } from '@/lib/errors';

/**
 * Issue Repository
 * Handles all database operations for issues
 */
export class IssueRepository {
  /**
   * Find issue by ID
   */
  async findById(id: string): Promise<Issue | null> {
    try {
      const result = await query<Issue>(
        'SELECT * FROM issues WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new DatabaseError('Failed to find issue by ID', error as Error);
    }
  }

  /**
   * Find issue by ID with all relations (project, assignee, reporter)
   */
  async findByIdWithRelations(id: string): Promise<IssueWithRelations | null> {
    try {
      const result = await query<IssueWithRelations>(
        `SELECT i.*,
                json_build_object(
                  'id', p.id,
                  'name', p.name
                ) as project,
                json_build_object(
                  'id', a.id,
                  'name', a.name,
                  'email', a.email,
                  'avatar_url', a.avatar_url
                ) as assignee,
                json_build_object(
                  'id', r.id,
                  'name', r.name,
                  'email', r.email,
                  'avatar_url', r.avatar_url
                ) as reporter
         FROM issues i
         JOIN projects p ON i.project_id = p.id
         LEFT JOIN users a ON i.assignee_id = a.id
         JOIN users r ON i.reporter_id = r.id
         WHERE i.id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new DatabaseError('Failed to find issue with relations', error as Error);
    }
  }

  /**
   * Get all issues
   */
  async findAll(): Promise<Issue[]> {
    try {
      const result = await query<Issue>(
        'SELECT * FROM issues ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      throw new DatabaseError('Failed to fetch issues', error as Error);
    }
  }

  /**
   * Get all issues with relations
   */
  async findAllWithRelations(): Promise<IssueWithRelations[]> {
    try {
      const result = await query<IssueWithRelations>(
        `SELECT i.*,
                json_build_object(
                  'id', p.id,
                  'name', p.name
                ) as project,
                json_build_object(
                  'id', a.id,
                  'name', a.name,
                  'email', a.email,
                  'avatar_url', a.avatar_url
                ) as assignee,
                json_build_object(
                  'id', r.id,
                  'name', r.name,
                  'email', r.email,
                  'avatar_url', r.avatar_url
                ) as reporter
         FROM issues i
         JOIN projects p ON i.project_id = p.id
         LEFT JOIN users a ON i.assignee_id = a.id
         JOIN users r ON i.reporter_id = r.id
         ORDER BY i.created_at DESC`
      );
      return result.rows;
    } catch (error) {
      throw new DatabaseError('Failed to fetch issues with relations', error as Error);
    }
  }

  /**
   * Find issues with filters
   */
  async findWithFilters(filters: IssueFilters): Promise<IssueWithRelations[]> {
    try {
      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (filters.project_id) {
        conditions.push(`i.project_id = $${paramIndex++}`);
        params.push(filters.project_id);
      }

      if (filters.status) {
        conditions.push(`i.status = $${paramIndex++}`);
        params.push(filters.status);
      }

      if (filters.priority) {
        conditions.push(`i.priority = $${paramIndex++}`);
        params.push(filters.priority);
      }

      if (filters.type) {
        conditions.push(`i.type = $${paramIndex++}`);
        params.push(filters.type);
      }

      if (filters.assignee_id) {
        conditions.push(`i.assignee_id = $${paramIndex++}`);
        params.push(filters.assignee_id);
      }

      if (filters.reporter_id) {
        conditions.push(`i.reporter_id = $${paramIndex++}`);
        params.push(filters.reporter_id);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const result = await query<IssueWithRelations>(
        `SELECT i.*,
                json_build_object(
                  'id', p.id,
                  'name', p.name
                ) as project,
                json_build_object(
                  'id', a.id,
                  'name', a.name,
                  'email', a.email,
                  'avatar_url', a.avatar_url
                ) as assignee,
                json_build_object(
                  'id', r.id,
                  'name', r.name,
                  'email', r.email,
                  'avatar_url', r.avatar_url
                ) as reporter
         FROM issues i
         JOIN projects p ON i.project_id = p.id
         LEFT JOIN users a ON i.assignee_id = a.id
         JOIN users r ON i.reporter_id = r.id
         ${whereClause}
         ORDER BY i.created_at DESC`,
        params
      );
      return result.rows;
    } catch (error) {
      throw new DatabaseError('Failed to fetch issues with filters', error as Error);
    }
  }

  /**
   * Get issues by project ID
   */
  async findByProjectId(projectId: string): Promise<Issue[]> {
    try {
      const result = await query<Issue>(
        'SELECT * FROM issues WHERE project_id = $1 ORDER BY created_at DESC',
        [projectId]
      );
      return result.rows;
    } catch (error) {
      throw new DatabaseError('Failed to fetch issues by project', error as Error);
    }
  }

  /**
   * Get issues assigned to a user
   */
  async findByAssigneeId(assigneeId: string): Promise<IssueWithRelations[]> {
    try {
      const result = await query<IssueWithRelations>(
        `SELECT i.*,
                json_build_object(
                  'id', p.id,
                  'name', p.name
                ) as project,
                json_build_object(
                  'id', a.id,
                  'name', a.name,
                  'email', a.email,
                  'avatar_url', a.avatar_url
                ) as assignee,
                json_build_object(
                  'id', r.id,
                  'name', r.name,
                  'email', r.email,
                  'avatar_url', r.avatar_url
                ) as reporter
         FROM issues i
         JOIN projects p ON i.project_id = p.id
         LEFT JOIN users a ON i.assignee_id = a.id
         JOIN users r ON i.reporter_id = r.id
         WHERE i.assignee_id = $1
         ORDER BY i.created_at DESC`,
        [assigneeId]
      );
      return result.rows;
    } catch (error) {
      throw new DatabaseError('Failed to fetch issues by assignee', error as Error);
    }
  }

  /**
   * Get issues reported by a user
   */
  async findByReporterId(reporterId: string): Promise<Issue[]> {
    try {
      const result = await query<Issue>(
        'SELECT * FROM issues WHERE reporter_id = $1 ORDER BY created_at DESC',
        [reporterId]
      );
      return result.rows;
    } catch (error) {
      throw new DatabaseError('Failed to fetch issues by reporter', error as Error);
    }
  }

  /**
   * Create a new issue
   */
  async create(data: CreateIssueDTO): Promise<Issue> {
    try {
      const result = await query<Issue>(
        `INSERT INTO issues (project_id, title, description, status, priority, type, assignee_id, reporter_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          data.project_id,
          data.title,
          data.description,
          data.status || 'open',
          data.priority || 'medium',
          data.type || 'task',
          data.assignee_id,
          data.reporter_id,
        ]
      );
      return result.rows[0];
    } catch (error) {
      throw new DatabaseError('Failed to create issue', error as Error);
    }
  }

  /**
   * Update issue
   */
  async update(id: string, data: UpdateIssueDTO): Promise<Issue> {
    try {
      const result = await query<Issue>(
        `UPDATE issues
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             status = COALESCE($3, status),
             priority = COALESCE($4, priority),
             type = COALESCE($5, type),
             assignee_id = COALESCE($6, assignee_id),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $7
         RETURNING *`,
        [
          data.title,
          data.description,
          data.status,
          data.priority,
          data.type,
          data.assignee_id,
          id,
        ]
      );
      return result.rows[0];
    } catch (error) {
      throw new DatabaseError('Failed to update issue', error as Error);
    }
  }

  /**
   * Delete issue
   */
  async delete(id: string): Promise<void> {
    try {
      await query('DELETE FROM issues WHERE id = $1', [id]);
    } catch (error) {
      throw new DatabaseError('Failed to delete issue', error as Error);
    }
  }

  /**
   * Full-text search issues by title and description
   */
  async search(searchTerm: string): Promise<IssueWithRelations[]> {
    try {
      const result = await query<IssueWithRelations>(
        `SELECT i.*,
                json_build_object(
                  'id', p.id,
                  'name', p.name
                ) as project,
                json_build_object(
                  'id', a.id,
                  'name', a.name,
                  'email', a.email,
                  'avatar_url', a.avatar_url
                ) as assignee,
                json_build_object(
                  'id', r.id,
                  'name', r.name,
                  'email', r.email,
                  'avatar_url', r.avatar_url
                ) as reporter
         FROM issues i
         JOIN projects p ON i.project_id = p.id
         LEFT JOIN users a ON i.assignee_id = a.id
         JOIN users r ON i.reporter_id = r.id
         WHERE to_tsvector('english', i.title || ' ' || COALESCE(i.description, '')) @@ plainto_tsquery('english', $1)
         ORDER BY i.created_at DESC
         LIMIT 20`,
        [searchTerm]
      );
      return result.rows;
    } catch (error) {
      throw new DatabaseError('Failed to search issues', error as Error);
    }
  }

  /**
   * Get issue statistics by status
   */
  async getStatsByStatus(projectId?: string): Promise<Record<IssueStatus, number>> {
    try {
      const whereClause = projectId ? 'WHERE project_id = $1' : '';
      const params = projectId ? [projectId] : [];

      const result = await query<{ status: IssueStatus; count: string }>(
        `SELECT status, COUNT(*) as count
         FROM issues
         ${whereClause}
         GROUP BY status`,
        params
      );

      const stats: Record<IssueStatus, number> = {
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0,
      };

      result.rows.forEach((row) => {
        stats[row.status] = parseInt(row.count, 10);
      });

      return stats;
    } catch (error) {
      throw new DatabaseError('Failed to get issue statistics', error as Error);
    }
  }

  /**
   * Get issue statistics by priority
   */
  async getStatsByPriority(projectId?: string): Promise<Record<IssuePriority, number>> {
    try {
      const whereClause = projectId ? 'WHERE project_id = $1' : '';
      const params = projectId ? [projectId] : [];

      const result = await query<{ priority: IssuePriority; count: string }>(
        `SELECT priority, COUNT(*) as count
         FROM issues
         ${whereClause}
         GROUP BY priority`,
        params
      );

      const stats: Record<IssuePriority, number> = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      };

      result.rows.forEach((row) => {
        stats[row.priority] = parseInt(row.count, 10);
      });

      return stats;
    } catch (error) {
      throw new DatabaseError('Failed to get priority statistics', error as Error);
    }
  }
}

// Export singleton instance
export const issueRepository = new IssueRepository();
