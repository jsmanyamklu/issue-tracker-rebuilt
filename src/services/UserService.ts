import { userRepository } from '@/repositories';
import { User, UserRole } from '@/types';
import { NotFoundError, ValidationError, ForbiddenError } from '@/lib/errors';
import { isValidEmail } from '@/lib/utils';
import { AdminPermissions, getAllRoles } from '@/lib/permissions';

/**
 * User Service
 * Contains business logic for user operations
 */
export class UserService {
  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User> {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<User> {
    if (!isValidEmail(email)) {
      throw new ValidationError('Invalid email address');
    }

    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    return await userRepository.findAll();
  }

  /**
   * Search users by name or email
   */
  async search(searchTerm: string): Promise<User[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    if (searchTerm.trim().length < 2) {
      throw new ValidationError('Search term must be at least 2 characters');
    }

    return await userRepository.search(searchTerm);
  }

  /**
   * Update user profile
   */
  async update(
    id: string,
    data: {
      name?: string;
      avatar_url?: string;
    }
  ): Promise<User> {
    // Verify user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError('User');
    }

    // Validate name if provided
    if (data.name !== undefined) {
      if (data.name.trim().length === 0) {
        throw new ValidationError('Name cannot be empty');
      }
      if (data.name.length > 255) {
        throw new ValidationError('Name must be 255 characters or less');
      }
    }

    // Update the user
    return await userRepository.update(id, data);
  }

  /**
   * Update user role (Admin only)
   */
  async updateRole(
    userId: string,
    newRole: UserRole,
    adminUserId: string
  ): Promise<User> {
    // Get admin user
    const adminUser = await userRepository.findById(adminUserId);
    if (!adminUser) {
      throw new NotFoundError('Admin user');
    }

    // Check if admin has permission
    if (!AdminPermissions.canManageRoles(adminUser.role)) {
      throw new ForbiddenError('You do not have permission to manage user roles');
    }

    // Verify target user exists
    const targetUser = await userRepository.findById(userId);
    if (!targetUser) {
      throw new NotFoundError('User');
    }

    // Validate new role
    if (!getAllRoles().includes(newRole)) {
      throw new ValidationError('Invalid role');
    }

    // Check if admin can assign this role
    if (!AdminPermissions.canAssignRole(adminUser.role, newRole)) {
      throw new ForbiddenError('You do not have permission to assign this role');
    }

    // Prevent changing own role
    if (userId === adminUserId) {
      throw new ForbiddenError('You cannot change your own role');
    }

    // Update role
    return await userRepository.updateRole(userId, newRole);
  }

  /**
   * Get users by role
   */
  async getByRole(role: UserRole): Promise<User[]> {
    // Validate role
    if (!getAllRoles().includes(role)) {
      throw new ValidationError('Invalid role');
    }

    return await userRepository.findByRole(role);
  }
}

// Export singleton instance
export const userService = new UserService();
