/**
 * File Storage Utility
 *
 * For PROTOTYPE: Uses local file storage (public/uploads)
 * For PRODUCTION: Replace with Vercel Blob, Supabase Storage, or AWS S3
 */

import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Generate unique filename
 */
function generateFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = randomBytes(8).toString('hex');
  const ext = path.extname(originalFilename);
  const nameWithoutExt = path.basename(originalFilename, ext);
  const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-').substring(0, 50);

  return `${timestamp}-${random}-${sanitized}${ext}`;
}

/**
 * Upload file to local storage
 *
 * @param file - File buffer
 * @param originalFilename - Original filename from user
 * @returns Upload result with URL and metadata
 */
export async function uploadFile(
  file: Buffer,
  originalFilename: string
): Promise<{
  filename: string;
  originalFilename: string;
  size: number;
  url: string;
  path: string;
}> {
  await ensureUploadDir();

  const filename = generateFilename(originalFilename);
  const filePath = path.join(UPLOAD_DIR, filename);

  // Write file to disk
  await fs.writeFile(filePath, file);

  // Return metadata
  return {
    filename,
    originalFilename,
    size: file.length,
    url: `/uploads/${filename}`, // Public URL
    path: filePath, // Full system path
  };
}

/**
 * Delete file from storage
 */
export async function deleteFile(filename: string): Promise<void> {
  const filePath = path.join(UPLOAD_DIR, filename);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Failed to delete file:', error);
    // Don't throw - file might already be deleted
  }
}

/**
 * Check if file exists
 */
export async function fileExists(filename: string): Promise<boolean> {
  const filePath = path.join(UPLOAD_DIR, filename);

  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file size
 */
export async function getFileSize(filename: string): Promise<number> {
  const filePath = path.join(UPLOAD_DIR, filename);
  const stats = await fs.stat(filePath);
  return stats.size;
}

// Re-export client-safe utilities from attachmentUtils
export {
  isAllowedFileType,
  isValidFileSize,
  isImage,
  getFileIcon,
  formatFileSize,
} from './attachmentUtils';

// NOTE: For production, replace this with cloud storage:
//
// Vercel Blob:
// import { put, del } from '@vercel/blob';
// const blob = await put(filename, file, { access: 'public' });
// return { url: blob.url, ... };
//
// Supabase Storage:
// import { createClient } from '@supabase/supabase-js';
// const supabase = createClient(url, key);
// await supabase.storage.from('attachments').upload(filename, file);
//
// AWS S3:
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// const s3 = new S3Client({ region: 'us-east-1' });
// await s3.send(new PutObjectCommand({ Bucket, Key: filename, Body: file }));
