import { issueRepository } from '@/repositories';
import { projectRepository } from '@/repositories';
import { userRepository } from '@/repositories';
import {
  Issue,
  IssueWithRelations,
  CreateIssueDTO,
  UpdateIssueDTO,
  IssueFilters,
  IssueStatus,
  IssuePriority,
} from '@/types';
import { NotFoundError, ValidationError, ForbiddenError } from '@/lib/errors';
import { notifyIssueCreated, notifyIssueAssigned, notifyIssueStatusChanged } from '@/lib/notifications/slack';
import { IssuePermissions } from '@/lib/permissions';

/**
 * Issue Service
 * Contains business logic for issue operations
 */
export class IssueService {
  /**
   * Get issue by ID with relations
   */
  async getById(id: string): Promise<IssueWithRelations> {
    const issue = await issueRepository.findByIdWithRelations(id);

    if (!issue) {
      throw new NotFoundError('Issue');
    }

    return issue;
  }

  /**
   * Get all issues with relations
   */
  async getAll(): Promise<IssueWithRelations[]> {
    return await issueRepository.findAllWithRelations();
  }

  /**
   * Get issues with filters
   */
  async getWithFilters(filters: IssueFilters): Promise<IssueWithRelations[]> {
    return await issueRepository.findWithFilters(filters);
  }

  /**
   * Get issues by project ID
   */
  async getByProjectId(projectId: string): Promise<Issue[]> {
    // Verify project exists
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project');
    }

    return await issueRepository.findByProjectId(projectId);
  }

  /**
   * Get issues assigned to a user
   */
  async getByAssigneeId(assigneeId: string): Promise<IssueWithRelations[]> {
    // Verify user exists
    const user = await userRepository.findById(assigneeId);
    if (!user) {
      throw new NotFoundError('User');
    }

    return await issueRepository.findByAssigneeId(assigneeId);
  }

  /**
   * Get issues reported by a user
   */
  async getByReporterId(reporterId: string): Promise<Issue[]> {
    // Verify user exists
    const user = await userRepository.findById(reporterId);
    if (!user) {
      throw new NotFoundError('User');
    }

    return await issueRepository.findByReporterId(reporterId);
  }

  /**
   * Create a new issue
   */
  async create(data: CreateIssueDTO): Promise<Issue> {
    // Validate required fields
    if (!data.title || data.title.trim().length === 0) {
      throw new ValidationError('Title is required');
    }

    if (data.title.length > 500) {
      throw new ValidationError('Title must be 500 characters or less');
    }

    // Verify project exists
    const project = await projectRepository.findById(data.project_id);
    if (!project) {
      throw new NotFoundError('Project');
    }

    // Verify reporter exists and check permission
    const reporter = await userRepository.findById(data.reporter_id);
    if (!reporter) {
      throw new NotFoundError('Reporter user');
    }

    // Check if user has permission to create issues
    if (!IssuePermissions.canCreate(reporter.role)) {
      throw new ForbiddenError('You do not have permission to create issues');
    }

    // Verify assignee exists if provided
    if (data.assignee_id) {
      const assignee = await userRepository.findById(data.assignee_id);
      if (!assignee) {
        throw new NotFoundError('Assignee user');
      }

      // Check if reporter has permission to assign issues
      if (!IssuePermissions.canAssign(reporter.role)) {
        throw new ForbiddenError('You do not have permission to assign issues');
      }
    }

    // Create the issue
    const issue = await issueRepository.create(data);

    // Send Slack notification (async, non-blocking)
    const issueWithRelations = await issueRepository.findByIdWithRelations(issue.id);
    if (issueWithRelations) {
      notifyIssueCreated(issueWithRelations as any).catch(() => {
        // Silently ignore notification failures
      });
    }

    return issue;
  }

  /**
   * Update an issue
   */
  async update(id: string, data: UpdateIssueDTO, userId: string): Promise<Issue> {
    // Verify issue exists
    const existingIssue = await issueRepository.findById(id);
    if (!existingIssue) {
      throw new NotFoundError('Issue');
    }

    // Get user and check permissions
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Check if user can edit this issue
    if (!IssuePermissions.canEdit(user.role, userId, existingIssue)) {
      throw new ForbiddenError('You do not have permission to edit this issue');
    }

    // Validate title if provided
    if (data.title !== undefined) {
      if (data.title.trim().length === 0) {
        throw new ValidationError('Title cannot be empty');
      }
      if (data.title.length > 500) {
        throw new ValidationError('Title must be 500 characters or less');
      }
    }

    // Check permission for assignee change
    if (data.assignee_id !== undefined) {
      if (!IssuePermissions.canAssign(user.role)) {
        throw new ForbiddenError('You do not have permission to assign issues');
      }

      // Verify assignee exists if provided
      if (data.assignee_id) {
        const assignee = await userRepository.findById(data.assignee_id);
        if (!assignee) {
          throw new NotFoundError('Assignee user');
        }
      }
    }

    // Check permission for status change (especially closing)
    if (data.status !== undefined && data.status !== existingIssue.status) {
      if (data.status === IssueStatus.CLOSED) {
        if (!IssuePermissions.canClose(user.role, userId, existingIssue)) {
          throw new ForbiddenError('You do not have permission to close this issue');
        }
      }
    }

    // Check permission for priority change
    if (data.priority !== undefined && data.priority !== existingIssue.priority) {
      if (!IssuePermissions.canChangePriority(user.role)) {
        throw new ForbiddenError('You do not have permission to change issue priority');
      }
    }

    // Track old status for notification
    const oldStatus = existingIssue.status;

    // Update the issue
    const updatedIssue = await issueRepository.update(id, data);

    // Send Slack notification for status change (async, non-blocking)
    if (data.status && data.status !== oldStatus) {
      const issueWithRelations = await issueRepository.findByIdWithRelations(id);
      if (issueWithRelations && user) {
        notifyIssueStatusChanged(
          issueWithRelations as any,
          { name: user.name, email: user.email },
          oldStatus,
          data.status
        ).catch(() => {
          // Silently ignore notification failures
        });
      }
    }

    return updatedIssue;
  }

  /**
   * Delete an issue
   */
  async delete(id: string, userId: string): Promise<void> {
    // Verify issue exists
    const issue = await issueRepository.findByIdWithRelations(id);
    if (!issue) {
      throw new NotFoundError('Issue');
    }

    // Get user and check permissions
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Get project to check ownership
    const project = await projectRepository.findById(issue.project_id);
    if (!project) {
      throw new NotFoundError('Project');
    }

    // Check permission using RBAC
    if (!IssuePermissions.canDelete(user.role, userId, issue, project.owner_id)) {
      throw new ForbiddenError('You do not have permission to delete this issue');
    }

    await issueRepository.delete(id);
  }

  /**
   * Assign issue to a user
   */
  async assign(issueId: string, assigneeId: string, requesterId: string): Promise<Issue> {
    // Verify issue exists
    const issue = await issueRepository.findById(issueId);
    if (!issue) {
      throw new NotFoundError('Issue');
    }

    // Get requester and check permissions
    const requester = await userRepository.findById(requesterId);
    if (!requester) {
      throw new NotFoundError('Requester user');
    }

    // Check if requester can assign issues
    if (!IssuePermissions.canAssign(requester.role)) {
      throw new ForbiddenError('You do not have permission to assign issues');
    }

    // Verify assignee exists
    const assignee = await userRepository.findById(assigneeId);
    if (!assignee) {
      throw new NotFoundError('Assignee user');
    }

    // Update assignee
    const updatedIssue = await issueRepository.update(issueId, { assignee_id: assigneeId });

    // Send Slack notification (async, non-blocking)
    const issueWithRelations = await issueRepository.findByIdWithRelations(issueId);
    if (issueWithRelations && requester) {
      notifyIssueAssigned(
        issueWithRelations as any,
        { name: requester.name, email: requester.email }
      ).catch(() => {
        // Silently ignore notification failures
      });
    }

    return updatedIssue;
  }

  /**
   * Unassign issue
   */
  async unassign(issueId: string, requesterId: string): Promise<Issue> {
    // Verify issue exists
    const issue = await issueRepository.findById(issueId);
    if (!issue) {
      throw new NotFoundError('Issue');
    }

    // Update to remove assignee
    return await issueRepository.update(issueId, { assignee_id: null as any });
  }

  /**
   * Change issue status
   */
  async changeStatus(issueId: string, status: IssueStatus, userId: string): Promise<Issue> {
    // Verify issue exists
    const issue = await issueRepository.findById(issueId);
    if (!issue) {
      throw new NotFoundError('Issue');
    }

    // Update status
    return await issueRepository.update(issueId, { status });
  }

  /**
   * Change issue priority
   */
  async changePriority(
    issueId: string,
    priority: IssuePriority,
    userId: string
  ): Promise<Issue> {
    // Verify issue exists
    const issue = await issueRepository.findById(issueId);
    if (!issue) {
      throw new NotFoundError('Issue');
    }

    // Update priority
    return await issueRepository.update(issueId, { priority });
  }

  /**
   * Search issues
   */
  async search(searchTerm: string): Promise<IssueWithRelations[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    return await issueRepository.search(searchTerm);
  }

  /**
   * Get issue statistics by status
   */
  async getStatsByStatus(projectId?: string): Promise<Record<IssueStatus, number>> {
    return await issueRepository.getStatsByStatus(projectId);
  }

  /**
   * Get issue statistics by priority
   */
  async getStatsByPriority(projectId?: string): Promise<Record<IssuePriority, number>> {
    return await issueRepository.getStatsByPriority(projectId);
  }

  /**
   * Get user's assigned issues with status filter
   */
  async getUserAssignedIssues(
    userId: string,
    status?: IssueStatus
  ): Promise<IssueWithRelations[]> {
    const filters: IssueFilters = {
      assignee_id: userId,
    };

    if (status) {
      filters.status = status;
    }

    return await issueRepository.findWithFilters(filters);
  }

  /**
   * Get dashboard summary for a user
   */
  async getDashboardSummary(userId: string): Promise<{
    assignedToMe: number;
    reportedByMe: number;
    openIssues: number;
    closedIssues: number;
  }> {
    const [assignedToMe, reportedByMe, allIssues] = await Promise.all([
      issueRepository.findByAssigneeId(userId),
      issueRepository.findByReporterId(userId),
      issueRepository.findAll(),
    ]);

    // Count ALL open and closed issues in the system
    const openIssues = allIssues.filter((i) => i.status === 'open' || i.status === 'in_progress').length;
    const closedIssues = allIssues.filter((i) => i.status === 'closed' || i.status === 'resolved').length;

    return {
      assignedToMe: assignedToMe.length,
      reportedByMe: reportedByMe.length,
      openIssues,
      closedIssues,
    };
  }
}

// Export singleton instance
export const issueService = new IssueService();
