import { query } from '@/lib/db';
import { Project, ProjectWithOwner, CreateProjectDTO, UpdateProjectDTO } from '@/types';
import { DatabaseError } from '@/lib/errors';

/**
 * Project Repository
 * Handles all database operations for projects
 */
export class ProjectRepository {
  /**
   * Find project by ID
   */
  async findById(id: string): Promise<Project | null> {
    try {
      const result = await query<Project>(
        'SELECT * FROM projects WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new DatabaseError('Failed to find project by ID', error as Error);
    }
  }

  /**
   * Find project by ID with owner information
   */
  async findByIdWithOwner(id: string): Promise<ProjectWithOwner | null> {
    try {
      const result = await query<ProjectWithOwner>(
        `SELECT p.*,
                json_build_object(
                  'id', u.id,
                  'name', u.name,
                  'email', u.email,
                  'avatar_url', u.avatar_url
                ) as owner
         FROM projects p
         JOIN users u ON p.owner_id = u.id
         WHERE p.id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new DatabaseError('Failed to find project with owner', error as Error);
    }
  }

  /**
   * Get all projects
   */
  async findAll(): Promise<Project[]> {
    try {
      const result = await query<Project>(
        'SELECT * FROM projects ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      throw new DatabaseError('Failed to fetch projects', error as Error);
    }
  }

  /**
   * Get all projects with owner information
   */
  async findAllWithOwner(): Promise<ProjectWithOwner[]> {
    try {
      const result = await query<ProjectWithOwner>(
        `SELECT p.*,
                json_build_object(
                  'id', u.id,
                  'name', u.name,
                  'email', u.email,
                  'avatar_url', u.avatar_url
                ) as owner
         FROM projects p
         JOIN users u ON p.owner_id = u.id
         ORDER BY p.created_at DESC`
      );
      return result.rows;
    } catch (error) {
      throw new DatabaseError('Failed to fetch projects with owners', error as Error);
    }
  }

  /**
   * Get projects by owner ID
   */
  async findByOwnerId(ownerId: string): Promise<Project[]> {
    try {
      const result = await query<Project>(
        'SELECT * FROM projects WHERE owner_id = $1 ORDER BY created_at DESC',
        [ownerId]
      );
      return result.rows;
    } catch (error) {
      throw new DatabaseError('Failed to fetch projects by owner', error as Error);
    }
  }

  /**
   * Create a new project
   */
  async create(data: CreateProjectDTO): Promise<Project> {
    try {
      const result = await query<Project>(
        `INSERT INTO projects (name, description, owner_id, due_date)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [data.name, data.description, data.owner_id, data.due_date || null]
      );
      return result.rows[0];
    } catch (error) {
      throw new DatabaseError('Failed to create project', error as Error);
    }
  }

  /**
   * Update project
   */
  async update(id: string, data: UpdateProjectDTO): Promise<Project> {
    try {
      const result = await query<Project>(
        `UPDATE projects
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             due_date = CASE WHEN $3::text = 'null' THEN NULL ELSE COALESCE($3::timestamp, due_date) END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [data.name, data.description, data.due_date, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new DatabaseError('Failed to update project', error as Error);
    }
  }

  /**
   * Delete project
   */
  async delete(id: string): Promise<void> {
    try {
      await query('DELETE FROM projects WHERE id = $1', [id]);
    } catch (error) {
      throw new DatabaseError('Failed to delete project', error as Error);
    }
  }

  /**
   * Get project issue count
   */
  async getIssueCount(projectId: string): Promise<number> {
    try {
      const result = await query<{ count: string }>(
        'SELECT COUNT(*) as count FROM issues WHERE project_id = $1',
        [projectId]
      );
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      throw new DatabaseError('Failed to get issue count', error as Error);
    }
  }

  /**
   * Search projects by name
   */
  async search(searchTerm: string): Promise<Project[]> {
    try {
      const result = await query<Project>(
        `SELECT * FROM projects
         WHERE name ILIKE $1 OR description ILIKE $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [`%${searchTerm}%`]
      );
      return result.rows;
    } catch (error) {
      throw new DatabaseError('Failed to search projects', error as Error);
    }
  }
}

// Export singleton instance
export const projectRepository = new ProjectRepository();
