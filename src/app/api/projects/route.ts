import { NextRequest, NextResponse } from 'next/server';
import { projectController } from '@/controllers';
import { getCurrentUser } from '@/lib/auth';
import { CreateProjectDTO } from '@/types';
import { AppError } from '@/lib/errors';

/**
 * GET /api/projects
 * Get all projects
 */
export async function GET(request: NextRequest) {
  try {
    await getCurrentUser(); // Verify authentication

    const searchParams = request.nextUrl.searchParams;
    const includeOwner = searchParams.get('includeOwner') === 'true';

    const response = await projectController.getAll(includeOwner);

    return NextResponse.json(response, {
      status: response.success ? 200 : 500,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    const body = await request.json();
    const data: CreateProjectDTO = {
      ...body,
      owner_id: user.id,
    };

    const response = await projectController.create(data);

    return NextResponse.json(response, {
      status: response.success ? 201 : 400,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
