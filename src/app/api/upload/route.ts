import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { saveFile, validateFile } from '@/lib/fileUpload';
import { AppError } from '@/lib/errors';

/**
 * POST /api/upload
 * Upload a file
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    await getCurrentUser();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Save file
    const result = await saveFile(file);

    // Store file metadata in database (optional - for tracking)
    const fileData = {
      id: `file_${Date.now()}`,
      ...result,
    };

    return NextResponse.json(
      {
        success: true,
        data: fileData,
        message: 'File uploaded successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
