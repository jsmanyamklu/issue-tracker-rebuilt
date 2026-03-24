import { issueService } from '@/services';
import { CreateIssueDTO, UpdateIssueDTO, IssueFilters, ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils';
import { AppError } from '@/lib/errors';

/**
 * Issue Controller
 * Handles HTTP request/response logic for issues
 */
export class IssueController {
  /**
   * Get issue by ID
   */
  async getById(id: string): Promise<ApiResponse> {
    try {
      const issue = await issueService.getById(id);
      return createSuccessResponse(issue);
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to fetch issue', 'Internal server error');
    }
  }

  /**
   * Get all issues
   */
  async getAll(): Promise<ApiResponse> {
    try {
      const issues = await issueService.getAll();
      return createSuccessResponse(issues);
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to fetch issues', 'Internal server error');
    }
  }

  /**
   * Get issues with filters
   */
  async getWithFilters(filters: IssueFilters): Promise<ApiResponse> {
    try {
      const issues = await issueService.getWithFilters(filters);
      return createSuccessResponse(issues);
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to fetch issues', 'Internal server error');
    }
  }

  /**
   * Get issues by project ID
   */
  async getByProjectId(projectId: string): Promise<ApiResponse> {
    try {
      const issues = await issueService.getByProjectId(projectId);
      return createSuccessResponse(issues);
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to fetch issues', 'Internal server error');
    }
  }

  /**
   * Get issues assigned to user
   */
  async getByAssigneeId(assigneeId: string): Promise<ApiResponse> {
    try {
      const issues = await issueService.getByAssigneeId(assigneeId);
      return createSuccessResponse(issues);
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to fetch issues', 'Internal server error');
    }
  }

  /**
   * Create a new issue
   */
  async create(data: CreateIssueDTO): Promise<ApiResponse> {
    try {
      const issue = await issueService.create(data);
      return createSuccessResponse(issue, 'Issue created successfully');
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to create issue', 'Internal server error');
    }
  }

  /**
   * Update an issue
   */
  async update(id: string, data: UpdateIssueDTO, userId: string): Promise<ApiResponse> {
    try {
      const issue = await issueService.update(id, data, userId);
      return createSuccessResponse(issue, 'Issue updated successfully');
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to update issue', 'Internal server error');
    }
  }

  /**
   * Delete an issue
   */
  async delete(id: string, userId: string): Promise<ApiResponse> {
    try {
      await issueService.delete(id, userId);
      return createSuccessResponse(null, 'Issue deleted successfully');
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to delete issue', 'Internal server error');
    }
  }

  /**
   * Assign issue to user
   */
  async assign(issueId: string, assigneeId: string, requesterId: string): Promise<ApiResponse> {
    try {
      const issue = await issueService.assign(issueId, assigneeId, requesterId);
      return createSuccessResponse(issue, 'Issue assigned successfully');
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to assign issue', 'Internal server error');
    }
  }

  /**
   * Search issues
   */
  async search(searchTerm: string): Promise<ApiResponse> {
    try {
      const issues = await issueService.search(searchTerm);
      return createSuccessResponse(issues);
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to search issues', 'Internal server error');
    }
  }

  /**
   * Get issue statistics
   */
  async getStats(projectId?: string): Promise<ApiResponse> {
    try {
      const [statusStats, priorityStats] = await Promise.all([
        issueService.getStatsByStatus(projectId),
        issueService.getStatsByPriority(projectId),
      ]);

      return createSuccessResponse({
        byStatus: statusStats,
        byPriority: priorityStats,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to fetch statistics', 'Internal server error');
    }
  }

  /**
   * Get dashboard summary for user
   */
  async getDashboardSummary(userId: string): Promise<ApiResponse> {
    try {
      const summary = await issueService.getDashboardSummary(userId);
      return createSuccessResponse(summary);
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to fetch dashboard summary', 'Internal server error');
    }
  }
}

// Export singleton instance
export const issueController = new IssueController();
