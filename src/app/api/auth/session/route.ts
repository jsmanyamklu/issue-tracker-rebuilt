import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

/**
 * GET /api/auth/session
 * Get current user session
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        avatar_url: session.user.avatar_url,
      },
    });
  } catch (error) {
    console.error('Failed to get session:', error);
    return NextResponse.json(
      { user: null, error: 'Failed to get session' },
      { status: 500 }
    );
  }
}
