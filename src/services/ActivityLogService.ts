import activityLogRepository from '@/repositories/ActivityLogRepository';
import {
  ActivityLog,
  ActivityLogWithUser,
  CreateActivityLogDTO,
  ActivityLogFilters,
  ActivityActionType,
  ResourceType,
  AnalyticsMetrics,
  IssueMetrics,
  UserMetrics,
  ProjectMetrics,
  PerformanceMetrics,
} from '@/types';
import issueRepository from '@/repositories/IssueRepository';
import userRepository from '@/repositories/UserRepository';
import projectRepository from '@/repositories/ProjectRepository';

/**
 * Service for activity logging and analytics
 */
class ActivityLogService {
  /**
   * Log an activity
   */
  async logActivity(data: CreateActivityLogDTO): Promise<ActivityLog> {
    try {
      return await activityLogRepository.create(data);
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw error - logging should not break the main flow
      throw error;
    }
  }

  /**
   * Log issue creation
   */
  async logIssueCreated(
    userId: string,
    issueId: string,
    details: { title: string; project_id: string; priority: string }
  ): Promise<void> {
    await this.logActivity({
      user_id: userId,
      action_type: ActivityActionType.ISSUE_CREATED,
      resource_type: ResourceType.ISSUE,
      resource_id: issueId,
      details,
    });
  }

  /**
   * Log issue update
   */
  async logIssueUpdated(
    userId: string,
    issueId: string,
    changes: Record<string, any>
  ): Promise<void> {
    await this.logActivity({
      user_id: userId,
      action_type: ActivityActionType.ISSUE_UPDATED,
      resource_type: ResourceType.ISSUE,
      resource_id: issueId,
      details: { changes },
    });
  }

  /**
   * Log issue status change
   */
  async logIssueStatusChanged(
    userId: string,
    issueId: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    await this.logActivity({
      user_id: userId,
      action_type: ActivityActionType.ISSUE_STATUS_CHANGED,
      resource_type: ResourceType.ISSUE,
      resource_id: issueId,
      details: { old_status: oldStatus, new_status: newStatus },
    });
  }

  /**
   * Log issue assignment
   */
  async logIssueAssigned(
    userId: string,
    issueId: string,
    assigneeId: string,
    assigneeName: string
  ): Promise<void> {
    await this.logActivity({
      user_id: userId,
      action_type: ActivityActionType.ISSUE_ASSIGNED,
      resource_type: ResourceType.ISSUE,
      resource_id: issueId,
      details: { assignee_id: assigneeId, assignee_name: assigneeName },
    });
  }

  /**
   * Log project creation
   */
  async logProjectCreated(
    userId: string,
    projectId: string,
    details: { name: string }
  ): Promise<void> {
    await this.logActivity({
      user_id: userId,
      action_type: ActivityActionType.PROJECT_CREATED,
      resource_type: ResourceType.PROJECT,
      resource_id: projectId,
      details,
    });
  }

  /**
   * Log comment creation
   */
  async logCommentCreated(
    userId: string,
    commentId: string,
    issueId: string
  ): Promise<void> {
    await this.logActivity({
      user_id: userId,
      action_type: ActivityActionType.COMMENT_CREATED,
      resource_type: ResourceType.COMMENT,
      resource_id: commentId,
      details: { issue_id: issueId },
    });
  }

  /**
   * Get activity logs with filters
   */
  async getActivityLogs(
    filters: ActivityLogFilters
  ): Promise<{ logs: ActivityLogWithUser[]; total: number }> {
    const [logs, total] = await Promise.all([
      activityLogRepository.findAll(filters),
      activityLogRepository.count(filters),
    ]);

    return { logs, total };
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit: number = 50): Promise<ActivityLogWithUser[]> {
    return activityLogRepository.getRecent(limit);
  }

  /**
   * Get activity for a specific resource
   */
  async getResourceActivity(
    resourceType: ResourceType,
    resourceId: string
  ): Promise<ActivityLogWithUser[]> {
    return activityLogRepository.findByResource(resourceType, resourceId);
  }

  /**
   * Get user activity
   */
  async getUserActivity(userId: string, limit?: number): Promise<ActivityLogWithUser[]> {
    return activityLogRepository.findByUser(userId, limit);
  }

  /**
   * Get comprehensive analytics metrics
   */
  async getAnalyticsMetrics(): Promise<AnalyticsMetrics> {
    const [issueMetrics, userMetrics, projectMetrics, performanceMetrics] =
      await Promise.all([
        this.getIssueMetrics(),
        this.getUserMetrics(),
        this.getProjectMetrics(),
        this.getPerformanceMetrics(),
      ]);

    return {
      issue_metrics: issueMetrics,
      user_metrics: userMetrics,
      project_metrics: projectMetrics,
      performance_metrics: performanceMetrics,
    };
  }

  /**
   * Get issue-related metrics
   */
  private async getIssueMetrics(): Promise<IssueMetrics> {
    // Get all issues with their current state
    const issues = await issueRepository.findAll({});

    const now = new Date();
    const total_issues = issues.length;
    const open_issues = issues.filter((i) => i.status === 'open').length;
    const in_progress_issues = issues.filter((i) => i.status === 'in_progress').length;
    const resolved_issues = issues.filter((i) => i.status === 'resolved').length;
    const closed_issues = issues.filter((i) => i.status === 'closed').length;
    const overdue_issues = issues.filter(
      (i) => i.due_date && new Date(i.due_date) < now && i.status !== 'closed'
    ).length;

    // Calculate average resolution time from activity logs
    const resolutionLogs = await activityLogRepository.findByActionType(
      ActivityActionType.ISSUE_STATUS_CHANGED
    );

    let totalResolutionTime = 0;
    let resolvedCount = 0;

    for (const log of resolutionLogs) {
      if (log.details.new_status === 'resolved' || log.details.new_status === 'closed') {
        // Find when the issue was created
        const creationLog = await activityLogRepository.findByResource(
          ResourceType.ISSUE,
          log.resource_id
        );
        const createdLog = creationLog.find(
          (l) => l.action_type === ActivityActionType.ISSUE_CREATED
        );

        if (createdLog) {
          const createdAt = new Date(createdLog.created_at);
          const resolvedAt = new Date(log.created_at);
          const diffHours =
            (resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
          totalResolutionTime += diffHours;
          resolvedCount++;
        }
      }
    }

    const average_resolution_time_hours =
      resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;

    // Group by priority
    const issues_by_priority: Record<string, number> = {
      low: issues.filter((i) => i.priority === 'low').length,
      medium: issues.filter((i) => i.priority === 'medium').length,
      high: issues.filter((i) => i.priority === 'high').length,
      critical: issues.filter((i) => i.priority === 'critical').length,
    };

    // Group by type
    const issues_by_type: Record<string, number> = {
      bug: issues.filter((i) => i.type === 'bug').length,
      feature: issues.filter((i) => i.type === 'feature').length,
      task: issues.filter((i) => i.type === 'task').length,
      improvement: issues.filter((i) => i.type === 'improvement').length,
    };

    // Calculate velocity (issues resolved per day in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentResolutions = resolutionLogs.filter(
      (log) => new Date(log.created_at) >= thirtyDaysAgo
    );
    const issue_velocity = recentResolutions.length / 30;

    return {
      total_issues,
      open_issues,
      in_progress_issues,
      resolved_issues,
      closed_issues,
      overdue_issues,
      average_resolution_time_hours,
      issues_by_priority: issues_by_priority as any,
      issues_by_type: issues_by_type as any,
      issue_velocity,
    };
  }

  /**
   * Get user-related metrics
   */
  private async getUserMetrics(): Promise<UserMetrics> {
    const allUsers = await userRepository.findAll();
    const total_users = allUsers.length;

    // Get active users in last 7 and 30 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activityStats = await activityLogRepository.getUserActivityStats(thirtyDaysAgo);

    const recentActivity7 = await activityLogRepository.getUserActivityStats(sevenDaysAgo);
    const active_users_last_7_days = recentActivity7.length;
    const active_users_last_30_days = activityStats.length;

    // Most active users
    const most_active_users = activityStats.slice(0, 10).map((stat) => ({
      user_id: stat.id,
      user_name: stat.name,
      action_count: parseInt(stat.action_count, 10),
    }));

    // Top resolvers (users who resolved most issues)
    const resolutionLogs = await activityLogRepository.findByActionType(
      ActivityActionType.ISSUE_STATUS_CHANGED
    );

    const resolverStats: Record<string, { count: number; totalTime: number }> = {};

    for (const log of resolutionLogs) {
      if (
        log.user_id &&
        (log.details.new_status === 'resolved' || log.details.new_status === 'closed')
      ) {
        if (!resolverStats[log.user_id]) {
          resolverStats[log.user_id] = { count: 0, totalTime: 0 };
        }
        resolverStats[log.user_id].count++;
      }
    }

    const top_resolvers = await Promise.all(
      Object.entries(resolverStats)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 10)
        .map(async ([userId, stats]) => {
          const user = await userRepository.findById(userId);
          return {
            user_id: userId,
            user_name: user?.name || 'Unknown',
            resolved_count: stats.count,
            average_resolution_hours: 0, // TODO: Calculate from issue creation to resolution
          };
        })
    );

    return {
      total_users,
      active_users_last_7_days,
      active_users_last_30_days,
      most_active_users,
      top_resolvers,
    };
  }

  /**
   * Get project-related metrics
   */
  private async getProjectMetrics(): Promise<ProjectMetrics> {
    const allProjects = await projectRepository.findAll();
    const total_projects = allProjects.length;

    // Count projects with issues
    const projectsWithIssues = new Set<string>();
    const projectsWithOverdue = new Set<string>();

    const allIssues = await issueRepository.findAll({});
    const now = new Date();

    for (const issue of allIssues) {
      projectsWithIssues.add(issue.project_id);
      if (issue.due_date && new Date(issue.due_date) < now && issue.status !== 'closed') {
        projectsWithOverdue.add(issue.project_id);
      }
    }

    const active_projects = projectsWithIssues.size;
    const projects_with_overdue_issues = projectsWithOverdue.size;

    // Calculate health scores for each project
    const project_health_scores = await Promise.all(
      allProjects.map(async (project) => {
        const projectIssues = allIssues.filter((i) => i.project_id === project.id);
        const open_issues = projectIssues.filter((i) => i.status === 'open').length;
        const overdue_issues = projectIssues.filter(
          (i) =>
            i.due_date &&
            new Date(i.due_date) < now &&
            i.status !== 'closed' &&
            i.status !== 'resolved'
        ).length;

        // Simple health score calculation
        // 100 = perfect, decreases with open and overdue issues
        let health_score = 100;
        health_score -= open_issues * 5;
        health_score -= overdue_issues * 10;
        health_score = Math.max(0, Math.min(100, health_score));

        return {
          project_id: project.id,
          project_name: project.name,
          health_score,
          open_issues,
          overdue_issues,
        };
      })
    );

    return {
      total_projects,
      active_projects,
      projects_with_overdue_issues,
      project_health_scores: project_health_scores.sort(
        (a, b) => a.health_score - b.health_score
      ),
    };
  }

  /**
   * Get performance-related metrics
   */
  private async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    // Get assignment logs
    const assignmentLogs = await activityLogRepository.findByActionType(
      ActivityActionType.ISSUE_ASSIGNED
    );

    // Calculate time to assign
    let totalTimeToAssign = 0;
    let assignmentCount = 0;

    for (const log of assignmentLogs) {
      const creationLog = await activityLogRepository.findByResource(
        ResourceType.ISSUE,
        log.resource_id
      );
      const created = creationLog.find(
        (l) => l.action_type === ActivityActionType.ISSUE_CREATED
      );

      if (created) {
        const createdAt = new Date(created.created_at);
        const assignedAt = new Date(log.created_at);
        const diffHours = (assignedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        totalTimeToAssign += diffHours;
        assignmentCount++;
      }
    }

    const average_time_to_assign_hours =
      assignmentCount > 0 ? totalTimeToAssign / assignmentCount : 0;

    // Calculate reassignment rate
    const issueAssignments: Record<string, number> = {};
    for (const log of assignmentLogs) {
      issueAssignments[log.resource_id] = (issueAssignments[log.resource_id] || 0) + 1;
    }

    const reassignedIssues = Object.values(issueAssignments).filter((count) => count > 1)
      .length;
    const reassignment_rate =
      assignmentCount > 0 ? (reassignedIssues / Object.keys(issueAssignments).length) * 100 : 0;

    return {
      average_time_to_assign_hours,
      average_time_to_first_response_hours: 0, // TODO: Calculate from comments
      average_time_in_progress_hours: 0, // TODO: Calculate from status changes
      reassignment_rate,
      bottlenecks: [], // TODO: Identify bottlenecks from status transitions
    };
  }

  /**
   * Get activity statistics for a date range
   */
  async getActivityStats(startDate?: Date, endDate?: Date): Promise<any> {
    const [actionStats, userStats, hourlyDist, dailyDist] = await Promise.all([
      activityLogRepository.getActionTypeStats(startDate, endDate),
      activityLogRepository.getUserActivityStats(startDate, endDate),
      activityLogRepository.getHourlyDistribution(startDate, endDate),
      activityLogRepository.getDailyDistribution(startDate, endDate),
    ]);

    return {
      action_type_stats: actionStats,
      user_activity_stats: userStats,
      hourly_distribution: hourlyDist,
      daily_distribution: dailyDist,
    };
  }
}

export const activityLogService = new ActivityLogService();
export default activityLogService;
