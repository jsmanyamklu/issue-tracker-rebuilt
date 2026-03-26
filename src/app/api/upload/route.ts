import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  uploadFile,
  isAllowedFileType,
  isValidFileSize,
} from '@/lib/storage';
import { getPool } from '@/lib/db';

/**
 * POST /api/upload
 * Upload a file attachment
 * Returns attachment metadata to be linked to issue or comment
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to upload files.' },
        { status: 401 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Please select a file to upload.' },
        { status: 400 }
      );
    }

    // 3. Validate file type
    if (!isAllowedFileType(file.type)) {
      return NextResponse.json(
        {
          error: `File type '${file.type}' is not allowed. Please upload images, PDFs, or documents.`,
        },
        { status: 400 }
      );
    }

    // 4. Validate file size (10MB limit for prototype)
    if (!isValidFileSize(file.size, 10)) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // 5. Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. Upload file to storage
    const uploadResult = await uploadFile(buffer, file.name);

    // 7. Save metadata to database
    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO attachments (
        uploaded_by,
        filename,
        original_filename,
        file_size,
        mime_type,
        storage_provider,
        storage_path,
        storage_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        user.id,
        uploadResult.filename,
        uploadResult.originalFilename,
        uploadResult.size,
        file.type,
        'local', // For prototype; change to 'vercel-blob', 'supabase', etc. in production
        uploadResult.path,
        uploadResult.url,
      ]
    );

    const attachment = result.rows[0];

    // 8. Return success response
    return NextResponse.json({
      success: true,
      attachment: {
        id: attachment.id,
        filename: attachment.filename,
        original_filename: attachment.original_filename,
        file_size: attachment.file_size,
        mime_type: attachment.mime_type,
        storage_url: attachment.storage_url,
        created_at: attachment.created_at,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error: 'Upload failed. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload
 * Get upload configuration and limits
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    maxFileSize: '10MB',
    allowedTypes: [
      'Images (JPEG, PNG, GIF, WebP)',
      'Documents (PDF, Word, Excel, PowerPoint)',
      'Text files (TXT, CSV, Markdown)',
    ],
  });
}
