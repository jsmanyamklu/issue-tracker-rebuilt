import { NextRequest, NextResponse } from 'next/server';
import { userRepository } from '@/repositories';
import { getCurrentUser } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import log from '@/lib/logger';

/**
 * GET /api/users
 * Get all users (for assignee selection)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    await getCurrentUser();

    // Get all users
    const users = await userRepository.findAll();

    // Return sanitized user data (no sensitive info)
    const sanitizedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
    }));

    return NextResponse.json({
      success: true,
      data: sanitizedUsers,
    });
  } catch (error) {
    log.error('Error fetching users', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
