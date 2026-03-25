import { projectRepository } from '@/repositories';
import { userRepository } from '@/repositories';
import { Project, ProjectWithOwner, CreateProjectDTO, UpdateProjectDTO } from '@/types';
import { NotFoundError, ValidationError, ForbiddenError } from '@/lib/errors';
import { ProjectPermissions } from '@/lib/permissions';
import activityLogService from './ActivityLogService';

/**
 * Project Service
 * Contains business logic for project operations
 */
export class ProjectService {
  /**
   * Get project by ID
   */
  async getById(id: string): Promise<Project> {
    const project = await projectRepository.findById(id);

    if (!project) {
      throw new NotFoundError('Project');
    }

    return project;
  }

  /**
   * Get project by ID with owner information
   */
  async getByIdWithOwner(id: string): Promise<ProjectWithOwner> {
    const project = await projectRepository.findByIdWithOwner(id);

    if (!project) {
      throw new NotFoundError('Project');
    }

    return project;
  }

  /**
   * Get all projects
   */
  async getAll(): Promise<Project[]> {
    return await projectRepository.findAll();
  }

  /**
   * Get all projects with owner information
   */
  async getAllWithOwner(): Promise<ProjectWithOwner[]> {
    return await projectRepository.findAllWithOwner();
  }

  /**
   * Get projects by owner ID
   */
  async getByOwnerId(ownerId: string): Promise<Project[]> {
    // Verify user exists
    const user = await userRepository.findById(ownerId);
    if (!user) {
      throw new NotFoundError('User');
    }

    return await projectRepository.findByOwnerId(ownerId);
  }

  /**
   * Create a new project
   */
  async create(data: CreateProjectDTO): Promise<Project> {
    // Validate required fields
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('Project name is required');
    }

    if (data.name.length > 255) {
      throw new ValidationError('Project name must be 255 characters or less');
    }

    // Verify owner exists and check permission
    const owner = await userRepository.findById(data.owner_id);
    if (!owner) {
      throw new NotFoundError('Owner user');
    }

    // Check if user has permission to create projects
    if (!ProjectPermissions.canCreate(owner.role)) {
      throw new ForbiddenError('You do not have permission to create projects');
    }

    // Create the project
    const project = await projectRepository.create(data);

    // Log activity
    await activityLogService.logProjectCreated(
      data.owner_id,
      project.id,
      { name: project.name }
    ).catch(err => console.error('Failed to log project creation:', err));

    return project;
  }

  /**
   * Update a project
   */
  async update(id: string, data: UpdateProjectDTO, userId: string): Promise<Project> {
    // Verify project exists
    const existingProject = await projectRepository.findById(id);
    if (!existingProject) {
      throw new NotFoundError('Project');
    }

    // Get user and check permissions
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Check permissions using RBAC
    if (!ProjectPermissions.canEdit(user.role, userId, existingProject)) {
      throw new ForbiddenError('You do not have permission to update this project');
    }

    // Validate name if provided
    if (data.name !== undefined) {
      if (data.name.trim().length === 0) {
        throw new ValidationError('Project name cannot be empty');
      }
      if (data.name.length > 255) {
        throw new ValidationError('Project name must be 255 characters or less');
      }
    }

    // Update the project
    const updatedProject = await projectRepository.update(id, data);

    // Log activity
    const changes: Record<string, any> = {};
    if (data.name && data.name !== existingProject.name) {
      changes.name = { old: existingProject.name, new: data.name };
    }
    if (data.description !== undefined) {
      changes.description = 'updated';
    }

    await activityLogService.logActivity({
      user_id: userId,
      action_type: 'project_updated' as any,
      resource_type: 'project' as any,
      resource_id: id,
      details: { changes },
    }).catch(err => console.error('Failed to log project update:', err));

    return updatedProject;
  }

  /**
   * Delete a project
   */
  async delete(id: string, userId: string): Promise<void> {
    // Verify project exists
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new NotFoundError('Project');
    }

    // Get user and check permissions
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Check permissions using RBAC
    if (!ProjectPermissions.canDelete(user.role, userId, project)) {
      throw new ForbiddenError('You do not have permission to delete this project');
    }

    // Log activity before deletion
    await activityLogService.logActivity({
      user_id: userId,
      action_type: 'project_deleted' as any,
      resource_type: 'project' as any,
      resource_id: id,
      details: {
        name: project.name,
        owner_id: project.owner_id,
      },
    }).catch(err => console.error('Failed to log project deletion:', err));

    await projectRepository.delete(id);
  }

  /**
   * Get project issue count
   */
  async getIssueCount(projectId: string): Promise<number> {
    // Verify project exists
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project');
    }

    return await projectRepository.getIssueCount(projectId);
  }

  /**
   * Search projects
   */
  async search(searchTerm: string): Promise<Project[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    return await projectRepository.search(searchTerm);
  }

  /**
   * Check if user is project owner
   */
  async isOwner(projectId: string, userId: string): Promise<boolean> {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      return false;
    }

    return project.owner_id === userId;
  }
}

// Export singleton instance
export const projectService = new ProjectService();
