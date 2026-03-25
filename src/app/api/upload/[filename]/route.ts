import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { deleteFile } from '@/lib/fileUpload';
import { AppError } from '@/lib/errors';

/**
 * DELETE /api/upload/[filename]
 * Delete a file
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // Verify authentication
    await getCurrentUser();

    const { filename } = await params;

    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Filename is required' },
        { status: 400 }
      );
    }

    // Delete file from disk
    await deleteFile(filename);

    return NextResponse.json(
      {
        success: true,
        message: 'File deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete error:', error);
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
