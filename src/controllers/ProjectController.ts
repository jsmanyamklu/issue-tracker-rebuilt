import { projectService } from '@/services';
import { CreateProjectDTO, UpdateProjectDTO, ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils';
import { AppError } from '@/lib/errors';

/**
 * Project Controller
 * Handles HTTP request/response logic for projects
 */
export class ProjectController {
  /**
   * Get project by ID
   */
  async getById(id: string, includeOwner: boolean = false): Promise<ApiResponse> {
    try {
      const project = includeOwner
        ? await projectService.getByIdWithOwner(id)
        : await projectService.getById(id);
      return createSuccessResponse(project);
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to fetch project', 'Internal server error');
    }
  }

  /**
   * Get all projects
   */
  async getAll(includeOwner: boolean = false): Promise<ApiResponse> {
    try {
      const projects = includeOwner
        ? await projectService.getAllWithOwner()
        : await projectService.getAll();
      return createSuccessResponse(projects);
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to fetch projects', 'Internal server error');
    }
  }

  /**
   * Get projects by owner
   */
  async getByOwnerId(ownerId: string): Promise<ApiResponse> {
    try {
      const projects = await projectService.getByOwnerId(ownerId);
      return createSuccessResponse(projects);
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to fetch projects', 'Internal server error');
    }
  }

  /**
   * Create a new project
   */
  async create(data: CreateProjectDTO): Promise<ApiResponse> {
    try {
      const project = await projectService.create(data);
      return createSuccessResponse(project, 'Project created successfully');
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to create project', 'Internal server error');
    }
  }

  /**
   * Update a project
   */
  async update(id: string, data: UpdateProjectDTO, userId: string): Promise<ApiResponse> {
    try {
      const project = await projectService.update(id, data, userId);
      return createSuccessResponse(project, 'Project updated successfully');
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to update project', 'Internal server error');
    }
  }

  /**
   * Delete a project
   */
  async delete(id: string, userId: string): Promise<ApiResponse> {
    try {
      await projectService.delete(id, userId);
      return createSuccessResponse(null, 'Project deleted successfully');
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to delete project', 'Internal server error');
    }
  }

  /**
   * Get project issue count
   */
  async getIssueCount(projectId: string): Promise<ApiResponse> {
    try {
      const count = await projectService.getIssueCount(projectId);
      return createSuccessResponse({ count });
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to get issue count', 'Internal server error');
    }
  }

  /**
   * Search projects
   */
  async search(searchTerm: string): Promise<ApiResponse> {
    try {
      const projects = await projectService.search(searchTerm);
      return createSuccessResponse(projects);
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.message);
      }
      return createErrorResponse('Failed to search projects', 'Internal server error');
    }
  }
}

// Export singleton instance
export const projectController = new ProjectController();
