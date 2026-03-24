import { commentService } from '@/services';
import { CreateCommentDTO, ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils';
import { AppError } from '@/lib/errors';

/**
 * Comment Controller
 * Handles HTTP request/response logic for comments
 */
export class CommentController {
  /**
   * Get comment by ID
   */
  async getById(id: string, includeUser: boolean = false): Promise<ApiResponse> {
    try {
      const comment = includeUser
        ? await commentService.getByIdWithUser(id)
        : await commentService.getById(id);
      return createSuccessResponse(comment);
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to fetch comment', 'Internal server error');
    }
  }

  /**
   * Get comments by issue ID
   */
  async getByIssueId(issueId: string): Promise<ApiResponse> {
    try {
      const comments = await commentService.getByIssueId(issueId);
      return createSuccessResponse(comments);
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to fetch comments', 'Internal server error');
    }
  }

  /**
   * Create a new comment
   */
  async create(data: CreateCommentDTO): Promise<ApiResponse> {
    try {
      const comment = await commentService.create(data);
      return createSuccessResponse(comment, 'Comment created successfully');
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to create comment', 'Internal server error');
    }
  }

  /**
   * Update a comment
   */
  async update(id: string, content: string, userId: string): Promise<ApiResponse> {
    try {
      const comment = await commentService.update(id, content, userId);
      return createSuccessResponse(comment, 'Comment updated successfully');
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to update comment', 'Internal server error');
    }
  }

  /**
   * Delete a comment
   */
  async delete(id: string, userId: string): Promise<ApiResponse> {
    try {
      await commentService.delete(id, userId);
      return createSuccessResponse(null, 'Comment deleted successfully');
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to delete comment', 'Internal server error');
    }
  }

  /**
   * Get recent comments
   */
  async getRecent(limit: number = 10): Promise<ApiResponse> {
    try {
      const comments = await commentService.getRecent(limit);
      return createSuccessResponse(comments);
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to fetch recent comments', 'Internal server error');
    }
  }
}

// Export singleton instance
export const commentController = new CommentController();
