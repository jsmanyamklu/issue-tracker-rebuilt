import { commentRepository } from '@/repositories';
import { issueRepository } from '@/repositories';
import { userRepository } from '@/repositories';
import { Comment, CommentWithUser, CreateCommentDTO } from '@/types';
import { NotFoundError, ValidationError, ForbiddenError } from '@/lib/errors';
import { notifyIssueCommented } from '@/lib/notifications/slack';
import { CommentPermissions } from '@/lib/permissions';
import activityLogService from './ActivityLogService';

/**
 * Comment Service
 * Contains business logic for comment operations
 */
export class CommentService {
  /**
   * Get comment by ID
   */
  async getById(id: string): Promise<Comment> {
    const comment = await commentRepository.findById(id);

    if (!comment) {
      throw new NotFoundError('Comment');
    }

    return comment;
  }

  /**
   * Get comment by ID with user information
   */
  async getByIdWithUser(id: string): Promise<CommentWithUser> {
    const comment = await commentRepository.findByIdWithUser(id);

    if (!comment) {
      throw new NotFoundError('Comment');
    }

    return comment;
  }

  /**
   * Get all comments for an issue
   */
  async getByIssueId(issueId: string): Promise<CommentWithUser[]> {
    // Verify issue exists
    const issue = await issueRepository.findById(issueId);
    if (!issue) {
      throw new NotFoundError('Issue');
    }

    return await commentRepository.findByIssueId(issueId);
  }

  /**
   * Get all comments by a user
   */
  async getByUserId(userId: string): Promise<Comment[]> {
    // Verify user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    return await commentRepository.findByUserId(userId);
  }

  /**
   * Create a new comment
   */
  async create(data: CreateCommentDTO): Promise<Comment> {
    // Validate content
    if (!data.content || data.content.trim().length === 0) {
      throw new ValidationError('Comment content is required');
    }

    if (data.content.length > 10000) {
      throw new ValidationError('Comment content must be 10,000 characters or less');
    }

    // Verify issue exists
    const issue = await issueRepository.findById(data.issue_id);
    if (!issue) {
      throw new NotFoundError('Issue');
    }

    // Verify user exists and check permission
    const user = await userRepository.findById(data.user_id);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Check if user has permission to create comments
    if (!CommentPermissions.canCreate(user.role)) {
      throw new ForbiddenError('You do not have permission to create comments');
    }

    // Create the comment
    const comment = await commentRepository.create(data);

    // Log activity
    await activityLogService.logCommentCreated(
      data.user_id,
      comment.id,
      data.issue_id
    ).catch(err => console.error('Failed to log comment creation:', err));

    // Send Slack notification (async, non-blocking)
    const issueWithRelations = await issueRepository.findByIdWithRelations(data.issue_id);
    if (issueWithRelations) {
      notifyIssueCommented(
        issueWithRelations as any,
        { name: user.name, email: user.email },
        data.content
      ).catch(() => {
        // Silently ignore notification failures
      });
    }

    return comment;
  }

  /**
   * Update a comment
   */
  async update(id: string, content: string, userId: string): Promise<Comment> {
    // Verify comment exists
    const existingComment = await commentRepository.findById(id);
    if (!existingComment) {
      throw new NotFoundError('Comment');
    }

    // Get user and check permissions
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Check permissions using RBAC
    if (!CommentPermissions.canEdit(user.role, userId, existingComment)) {
      throw new ForbiddenError('You do not have permission to update this comment');
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      throw new ValidationError('Comment content cannot be empty');
    }

    if (content.length > 10000) {
      throw new ValidationError('Comment content must be 10,000 characters or less');
    }

    // Update the comment
    const updatedComment = await commentRepository.update(id, content);

    // Log activity
    await activityLogService.logActivity({
      user_id: userId,
      action_type: 'comment_updated' as any,
      resource_type: 'comment' as any,
      resource_id: id,
      details: {
        issue_id: existingComment.issue_id,
        content_changed: true,
      },
    }).catch(err => console.error('Failed to log comment update:', err));

    return updatedComment;
  }

  /**
   * Delete a comment
   */
  async delete(id: string, userId: string): Promise<void> {
    // Verify comment exists
    const comment = await commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundError('Comment');
    }

    // Get user and check permissions
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Check permissions using RBAC
    if (!CommentPermissions.canDelete(user.role, userId, comment)) {
      throw new ForbiddenError('You do not have permission to delete this comment');
    }

    // Log activity before deletion
    await activityLogService.logActivity({
      user_id: userId,
      action_type: 'comment_deleted' as any,
      resource_type: 'comment' as any,
      resource_id: id,
      details: {
        issue_id: comment.issue_id,
      },
    }).catch(err => console.error('Failed to log comment deletion:', err));

    await commentRepository.delete(id);
  }

  /**
   * Get comment count for an issue
   */
  async getCountByIssueId(issueId: string): Promise<number> {
    // Verify issue exists
    const issue = await issueRepository.findById(issueId);
    if (!issue) {
      throw new NotFoundError('Issue');
    }

    return await commentRepository.getCountByIssueId(issueId);
  }

  /**
   * Get recent comments
   */
  async getRecent(limit: number = 10): Promise<CommentWithUser[]> {
    if (limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    return await commentRepository.getRecent(limit);
  }
}

// Export singleton instance
export const commentService = new CommentService();
