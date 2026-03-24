import { query } from '@/lib/db';
import { User } from '@/types';
import { DatabaseError } from '@/lib/errors';

/**
 * User Repository
 * Handles all database operations for users
 */
export class UserRepository {
  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      const result = await query<User>(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new DatabaseError('Failed to find user by ID', error as Error);
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await query<User>(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new DatabaseError('Failed to find user by email', error as Error);
    }
  }

  /**
   * Find user by provider and provider ID
   */
  async findByProvider(
    provider: 'google' | 'github',
    providerId: string
  ): Promise<User | null> {
    try {
      const result = await query<User>(
        'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
        [provider, providerId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new DatabaseError('Failed to find user by provider', error as Error);
    }
  }

  /**
   * Get all users
   */
  async findAll(): Promise<User[]> {
    try {
      const result = await query<User>(
        'SELECT * FROM users ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      throw new DatabaseError('Failed to fetch users', error as Error);
    }
  }

  /**
   * Create a new user
   */
  async create(data: {
    email: string;
    name: string;
    avatar_url?: string;
    provider: 'google' | 'github';
    provider_id: string;
  }): Promise<User> {
    try {
      const result = await query<User>(
        `INSERT INTO users (email, name, avatar_url, provider, provider_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [data.email, data.name, data.avatar_url, data.provider, data.provider_id]
      );
      return result.rows[0];
    } catch (error) {
      throw new DatabaseError('Failed to create user', error as Error);
    }
  }

  /**
   * Update user
   */
  async update(
    id: string,
    data: {
      name?: string;
      avatar_url?: string;
      email?: string;
    }
  ): Promise<User> {
    try {
      const result = await query<User>(
        `UPDATE users
         SET name = COALESCE($1, name),
             avatar_url = COALESCE($2, avatar_url),
             email = COALESCE($3, email),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [data.name, data.avatar_url, data.email, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new DatabaseError('Failed to update user', error as Error);
    }
  }

  /**
   * Update user role
   */
  async updateRole(id: string, role: string): Promise<User> {
    try {
      const result = await query<User>(
        `UPDATE users
         SET role = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [role, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new DatabaseError('Failed to update user role', error as Error);
    }
  }

  /**
   * Get users by role
   */
  async findByRole(role: string): Promise<User[]> {
    try {
      const result = await query<User>(
        'SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC',
        [role]
      );
      return result.rows;
    } catch (error) {
      throw new DatabaseError('Failed to find users by role', error as Error);
    }
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    try {
      await query('DELETE FROM users WHERE id = $1', [id]);
    } catch (error) {
      throw new DatabaseError('Failed to delete user', error as Error);
    }
  }

  /**
   * Search users by name or email
   */
  async search(searchTerm: string): Promise<User[]> {
    try {
      const result = await query<User>(
        `SELECT * FROM users
         WHERE name ILIKE $1 OR email ILIKE $1
         ORDER BY name
         LIMIT 20`,
        [`%${searchTerm}%`]
      );
      return result.rows;
    } catch (error) {
      throw new DatabaseError('Failed to search users', error as Error);
    }
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
