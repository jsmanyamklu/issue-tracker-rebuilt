import pool from '@/lib/db';
import {
  ActivityLog,
  ActivityLogWithUser,
  CreateActivityLogDTO,
  ActivityLogFilters,
  ActivityActionType,
  ResourceType,
} from '@/types';

/**
 * Repository for activity log database operations
 */
class ActivityLogRepository {
  /**
   * Create a new activity log entry
   */
  async create(data: CreateActivityLogDTO): Promise<ActivityLog> {
    const query = `
      INSERT INTO activity_logs (
        user_id,
        action_type,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      data.user_id || null,
      data.action_type,
      data.resource_type,
      data.resource_id,
      JSON.stringify(data.details || {}),
      data.ip_address || null,
      data.user_agent || null,
    ];

    const result = await pool.query<ActivityLog>(query, values);
    return result.rows[0];
  }

  /**
   * Get activity logs with optional filters and pagination
   */
  async findAll(filters: ActivityLogFilters = {}): Promise<ActivityLogWithUser[]> {
    let query = `
      SELECT
        al.*,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email,
          'avatar_url', u.avatar_url
        ) as user
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;

    const values: any[] = [];
    let paramCount = 1;

    if (filters.user_id) {
      query += ` AND al.user_id = $${paramCount}`;
      values.push(filters.user_id);
      paramCount++;
    }

    if (filters.action_type) {
      query += ` AND al.action_type = $${paramCount}`;
      values.push(filters.action_type);
      paramCount++;
    }

    if (filters.resource_type) {
      query += ` AND al.resource_type = $${paramCount}`;
      values.push(filters.resource_type);
      paramCount++;
    }

    if (filters.resource_id) {
      query += ` AND al.resource_id = $${paramCount}`;
      values.push(filters.resource_id);
      paramCount++;
    }

    if (filters.start_date) {
      query += ` AND al.created_at >= $${paramCount}`;
      values.push(filters.start_date);
      paramCount++;
    }

    if (filters.end_date) {
      query += ` AND al.created_at <= $${paramCount}`;
      values.push(filters.end_date);
      paramCount++;
    }

    query += ` ORDER BY al.created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
      paramCount++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramCount}`;
      values.push(filters.offset);
    }

    const result = await pool.query<ActivityLogWithUser>(query, values);
    return result.rows;
  }

  /**
   * Get activity logs count with filters
   */
  async count(filters: ActivityLogFilters = {}): Promise<number> {
    let query = `SELECT COUNT(*) as count FROM activity_logs WHERE 1=1`;

    const values: any[] = [];
    let paramCount = 1;

    if (filters.user_id) {
      query += ` AND user_id = $${paramCount}`;
      values.push(filters.user_id);
      paramCount++;
    }

    if (filters.action_type) {
      query += ` AND action_type = $${paramCount}`;
      values.push(filters.action_type);
      paramCount++;
    }

    if (filters.resource_type) {
      query += ` AND resource_type = $${paramCount}`;
      values.push(filters.resource_type);
      paramCount++;
    }

    if (filters.start_date) {
      query += ` AND created_at >= $${paramCount}`;
      values.push(filters.start_date);
      paramCount++;
    }

    if (filters.end_date) {
      query += ` AND created_at <= $${paramCount}`;
      values.push(filters.end_date);
      paramCount++;
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Get activity logs for a specific resource
   */
  async findByResource(
    resourceType: ResourceType,
    resourceId: string,
    limit: number = 50
  ): Promise<ActivityLogWithUser[]> {
    return this.findAll({
      resource_type: resourceType,
      resource_id: resourceId,
      limit,
    });
  }

  /**
   * Get recent activity logs
   */
  async getRecent(limit: number = 100): Promise<ActivityLogWithUser[]> {
    return this.findAll({ limit });
  }

  /**
   * Get activity logs for a specific user
   */
  async findByUser(userId: string, limit: number = 100): Promise<ActivityLogWithUser[]> {
    return this.findAll({ user_id: userId, limit });
  }

  /**
   * Get activity logs by date range
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    limit?: number
  ): Promise<ActivityLogWithUser[]> {
    return this.findAll({
      start_date: startDate,
      end_date: endDate,
      limit,
    });
  }

  /**
   * Get activity logs by action type
   */
  async findByActionType(
    actionType: ActivityActionType,
    limit: number = 100
  ): Promise<ActivityLogWithUser[]> {
    return this.findAll({ action_type: actionType, limit });
  }

  /**
   * Get action type statistics
   */
  async getActionTypeStats(startDate?: Date, endDate?: Date): Promise<any[]> {
    let query = `
      SELECT
        action_type,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
      FROM activity_logs
      WHERE 1=1
    `;

    const values: any[] = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND created_at >= $${paramCount}`;
      values.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND created_at <= $${paramCount}`;
      values.push(endDate);
      paramCount++;
    }

    query += ` GROUP BY action_type ORDER BY count DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Get user activity statistics
   */
  async getUserActivityStats(startDate?: Date, endDate?: Date): Promise<any[]> {
    let query = `
      SELECT
        u.id,
        u.name,
        u.email,
        COUNT(*) as action_count,
        COUNT(DISTINCT DATE(al.created_at)) as active_days
      FROM activity_logs al
      JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;

    const values: any[] = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND al.created_at >= $${paramCount}`;
      values.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND al.created_at <= $${paramCount}`;
      values.push(endDate);
      paramCount++;
    }

    query += ` GROUP BY u.id, u.name, u.email ORDER BY action_count DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Get hourly activity distribution
   */
  async getHourlyDistribution(startDate?: Date, endDate?: Date): Promise<any[]> {
    let query = `
      SELECT
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM activity_logs
      WHERE 1=1
    `;

    const values: any[] = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND created_at >= $${paramCount}`;
      values.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND created_at <= $${paramCount}`;
      values.push(endDate);
      paramCount++;
    }

    query += ` GROUP BY hour ORDER BY hour`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Get daily activity distribution
   */
  async getDailyDistribution(startDate?: Date, endDate?: Date): Promise<any[]> {
    let query = `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM activity_logs
      WHERE 1=1
    `;

    const values: any[] = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND created_at >= $${paramCount}`;
      values.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND created_at <= $${paramCount}`;
      values.push(endDate);
      paramCount++;
    }

    query += ` GROUP BY date ORDER BY date DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Delete old activity logs (cleanup)
   */
  async deleteOlderThan(days: number): Promise<number> {
    const query = `
      DELETE FROM activity_logs
      WHERE created_at < NOW() - INTERVAL '${days} days'
    `;

    const result = await pool.query(query);
    return result.rowCount || 0;
  }
}

export const activityLogRepository = new ActivityLogRepository();
export default activityLogRepository;
