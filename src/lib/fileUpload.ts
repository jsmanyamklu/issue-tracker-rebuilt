import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

export interface FileUploadResult {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
}

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/json',
];

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Generate unique filename
function generateFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const randomName = randomBytes(16).toString('hex');
  return `${Date.now()}-${randomName}${ext}`;
}

// Validate file
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }

  return { valid: true };
}

// Save file to disk
export async function saveFile(file: File): Promise<FileUploadResult> {
  await ensureUploadDir();

  const filename = generateFilename(file.name);
  const filePath = path.join(UPLOAD_DIR, filename);

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Write file to disk
  await fs.writeFile(filePath, buffer);

  return {
    filename,
    originalName: file.name,
    mimetype: file.type,
    size: file.size,
    path: filePath,
    url: `/uploads/${filename}`,
  };
}

// Delete file from disk
export async function deleteFile(filename: string): Promise<void> {
  const filePath = path.join(UPLOAD_DIR, filename);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Failed to delete file:', error);
  }
}

// Get file info
export async function getFileInfo(filename: string): Promise<{
  exists: boolean;
  size?: number;
}> {
  const filePath = path.join(UPLOAD_DIR, filename);
  try {
    const stats = await fs.stat(filePath);
    return { exists: true, size: stats.size };
  } catch {
    return { exists: false };
  }
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Get file icon based on mimetype
export function getFileIcon(mimetype: string): string {
  if (mimetype.startsWith('image/')) return '🖼️';
  if (mimetype === 'application/pdf') return '📄';
  if (mimetype.startsWith('text/')) return '📝';
  return '📎';
}
