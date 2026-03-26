# 📎 File Upload Feature - Implementation Plan

## Overview

Add file attachment capability to issues and comments, allowing users to upload reference documents, screenshots, logs, and other files.

---

## Use Cases

### For Bug Reports
- Attach screenshots showing the error
- Upload log files for debugging
- Include environment configuration files

### For Feature Requests
- Share mockup images
- Attach specification documents
- Include reference materials

### For General Communication
- Share data files (Excel, CSV)
- Upload design assets
- Include meeting notes or PDFs

---

## Technical Architecture

### Database Schema Changes

```sql
-- New table for file attachments
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id) NOT NULL,

  -- File metadata
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL, -- bytes
  mime_type VARCHAR(100) NOT NULL,

  -- Storage info
  storage_provider VARCHAR(50) NOT NULL, -- 'vercel-blob', 'supabase', 's3'
  storage_key TEXT NOT NULL, -- path/key in storage
  storage_url TEXT NOT NULL, -- public or signed URL

  -- Additional metadata
  thumbnail_url TEXT, -- for images
  width INTEGER, -- for images
  height INTEGER, -- for images

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP, -- soft delete

  -- Indexes
  CONSTRAINT check_linked_to_issue_or_comment CHECK (
    (issue_id IS NOT NULL AND comment_id IS NULL) OR
    (issue_id IS NULL AND comment_id IS NOT NULL)
  )
);

CREATE INDEX idx_attachments_issue ON attachments(issue_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_attachments_comment ON attachments(comment_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);
```

---

## Implementation Steps

### Phase 1: Basic Upload (1 week)

#### 1. Choose Storage Provider
**Recommended: Vercel Blob (if on Vercel) or Supabase Storage (if on Supabase)**

```typescript
// lib/storage.ts
import { put, del } from '@vercel/blob';

export async function uploadFile(file: File, folder: string) {
  const filename = `${folder}/${Date.now()}-${file.name}`;

  const blob = await put(filename, file, {
    access: 'public',
    addRandomSuffix: true,
  });

  return {
    url: blob.url,
    key: blob.pathname,
    size: file.size,
    mimeType: file.type,
  };
}

export async function deleteFile(url: string) {
  await del(url);
}
```

#### 2. API Route for Upload

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { uploadFile } from '@/lib/storage';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate file size (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: 'File too large. Maximum size is 10MB' },
      { status: 400 }
    );
  }

  // Validate file type
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ];

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'File type not allowed' },
      { status: 400 }
    );
  }

  try {
    // Upload to storage
    const upload = await uploadFile(file, 'attachments');

    // Save to database
    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO attachments (
        uploaded_by, filename, original_filename, file_size,
        mime_type, storage_provider, storage_key, storage_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        user.id,
        upload.key,
        file.name,
        upload.size,
        upload.mimeType,
        'vercel-blob',
        upload.key,
        upload.url,
      ]
    );

    return NextResponse.json({
      success: true,
      attachment: result.rows[0],
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

#### 3. API Route for Linking Attachment

```typescript
// app/api/attachments/link/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { attachmentId, issueId, commentId } = await request.json();

  const pool = getPool();

  try {
    // Verify user can attach to this issue/comment
    if (issueId) {
      const issueCheck = await pool.query(
        'SELECT id FROM issues WHERE id = $1',
        [issueId]
      );
      if (issueCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
      }
    }

    // Link attachment
    await pool.query(
      `UPDATE attachments
       SET issue_id = $1, comment_id = $2
       WHERE id = $3 AND uploaded_by = $4`,
      [issueId, commentId, attachmentId, user.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Link error:', error);
    return NextResponse.json({ error: 'Failed to link attachment' }, { status: 500 });
  }
}
```

#### 4. Upload Component

```typescript
// components/FileUpload.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface FileUploadProps {
  onUploadComplete: (attachment: any) => void;
  maxSizeMB?: number;
}

export function FileUpload({ onUploadComplete, maxSizeMB = 10 }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File too large. Maximum size is ${maxSizeMB}MB`);
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onUploadComplete(data.attachment);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
        id="file-upload"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
      />
      <label htmlFor="file-upload">
        <Button
          as="span"
          variant="secondary"
          disabled={isUploading}
          className="cursor-pointer"
        >
          {isUploading ? '📤 Uploading...' : '📎 Attach File'}
        </Button>
      </label>
      {error && (
        <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
      )}
    </div>
  );
}
```

#### 5. Attachment Display Component

```typescript
// components/AttachmentList.tsx
'use client';

interface Attachment {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  storage_url: string;
  created_at: string;
  uploaded_by: {
    name: string;
    avatar_url: string;
  };
}

interface AttachmentListProps {
  attachments: Attachment[];
  canDelete?: boolean;
  onDelete?: (id: string) => void;
}

export function AttachmentList({
  attachments,
  canDelete = false,
  onDelete
}: AttachmentListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.startsWith('text/')) return '📃';
    return '📎';
  };

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
        Attachments ({attachments.length})
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 hover:shadow-md transition-shadow"
          >
            {isImage(attachment.mime_type) ? (
              <div className="mb-2">
                <a
                  href={attachment.storage_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={attachment.storage_url}
                    alt={attachment.original_filename}
                    className="w-full h-32 object-cover rounded"
                  />
                </a>
              </div>
            ) : (
              <div className="mb-2 flex items-center justify-center h-20 bg-neutral-100 dark:bg-neutral-800 rounded">
                <span className="text-4xl">{getFileIcon(attachment.mime_type)}</span>
              </div>
            )}

            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <a
                  href={attachment.storage_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 truncate block"
                  title={attachment.original_filename}
                >
                  {attachment.original_filename}
                </a>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {formatFileSize(attachment.file_size)}
                </p>
              </div>

              {canDelete && onDelete && (
                <button
                  onClick={() => onDelete(attachment.id)}
                  className="text-danger-600 hover:text-danger-700 dark:text-danger-400 text-sm"
                  aria-label="Delete attachment"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 6. Integration in Comment Form

```typescript
// Update CommentForm component
'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { AttachmentList } from '@/components/AttachmentList';

export function CommentForm({ issueId }: { issueId: string }) {
  const [comment, setComment] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUploadComplete = (attachment: any) => {
    setAttachments([...attachments, attachment]);
  };

  const handleDeleteAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Create comment
      const commentRes = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue_id: issueId,
          content: comment,
        }),
      });

      const commentData = await commentRes.json();

      // Link attachments to comment
      for (const attachment of attachments) {
        await fetch('/api/attachments/link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attachmentId: attachment.id,
            commentId: commentData.comment.id,
          }),
        });
      }

      // Reset form
      setComment('');
      setAttachments([]);

      // Refresh page or update UI
      window.location.reload();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
        className="w-full px-4 py-3 border rounded-lg"
        rows={4}
      />

      <FileUpload onUploadComplete={handleUploadComplete} />

      {attachments.length > 0 && (
        <AttachmentList
          attachments={attachments}
          canDelete={true}
          onDelete={handleDeleteAttachment}
        />
      )}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || (!comment.trim() && attachments.length === 0)}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
      >
        {isSubmitting ? 'Posting...' : 'Post Comment'}
      </button>
    </div>
  );
}
```

---

## Phase 2: Enhanced Features (Optional - 1 week)

### Image Preview & Thumbnails
```typescript
// Generate thumbnails for images
import sharp from 'sharp';

async function generateThumbnail(file: Buffer) {
  return await sharp(file)
    .resize(300, 300, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer();
}
```

### Drag & Drop Upload
```typescript
// Add to FileUpload component
const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    // Process file
  }
};

return (
  <div
    onDrop={handleDrop}
    onDragOver={(e) => e.preventDefault()}
    className="border-2 border-dashed rounded-lg p-8 text-center"
  >
    Drop files here or click to upload
  </div>
);
```

### File Validation & Security
```typescript
// Virus scanning (using ClamAV or cloud service)
import { scanFile } from '@/lib/virus-scanner';

const isSafe = await scanFile(file);
if (!isSafe) {
  throw new Error('File contains malware');
}

// Content type validation (check actual file content, not just extension)
import { fileTypeFromBuffer } from 'file-type';

const buffer = await file.arrayBuffer();
const fileType = await fileTypeFromBuffer(Buffer.from(buffer));

if (fileType?.mime !== file.type) {
  throw new Error('File type mismatch - possible spoofing attempt');
}
```

---

## Storage Cost Estimates

### Vercel Blob
```
First 1GB: FREE
After: $0.15/GB/month

Example:
- 1000 files @ 1MB each = 1GB = $0/month
- 10,000 files @ 1MB each = 10GB = $1.50/month
- 100,000 files @ 1MB each = 100GB = $15/month
```

### Supabase Storage
```
First 1GB: FREE
After: $0.021/GB/month

Example:
- 10GB = $0.21/month
- 100GB = $2.10/month
- 1TB = $21/month
```

### AWS S3
```
$0.023/GB/month (storage)
$0.09/GB (data transfer out)

Example:
- 100GB storage = $2.30/month
- Plus data transfer costs
```

---

## Security Considerations

### 1. File Type Validation
- Whitelist allowed MIME types
- Check actual file content (not just extension)
- Reject executable files

### 2. Size Limits
- Per-file limit: 10MB (basic) or 100MB (enhanced)
- Per-user limit: Optional total storage quota
- Rate limiting: Max uploads per hour

### 3. Access Control
- Only authenticated users can upload
- Only issue participants can view attachments
- Role-based delete permissions
- Signed URLs for private files

### 4. Malware Scanning (Optional)
- Scan files on upload
- Quarantine suspicious files
- Use ClamAV or cloud scanning service

---

## Allowed File Types

### Images
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- SVG (.svg) - with sanitization

### Documents
- PDF (.pdf)
- Word (.doc, .docx)
- Excel (.xls, .xlsx)
- PowerPoint (.ppt, .pptx)
- Text (.txt)
- CSV (.csv)
- Markdown (.md)

### Archives (Optional)
- ZIP (.zip)
- TAR (.tar, .tar.gz)

### Code (Optional)
- Log files (.log)
- JSON (.json)
- XML (.xml)

---

## UI/UX Considerations

### Upload Locations
1. **Issue Description** (when creating/editing issue)
2. **Comments** (when adding comment)
3. **Dedicated Attachments Tab** (on issue detail page)

### Display Options
1. **Inline Images** - Show thumbnails in comments
2. **File List** - List all attachments with download links
3. **Gallery View** - Image gallery for screenshots
4. **Attachment Count Badge** - Show count on issue cards

---

## Testing Checklist

- [ ] Upload various file types
- [ ] Upload files at size limit (10MB)
- [ ] Upload file exceeding size limit (should fail)
- [ ] Upload disallowed file type (should fail)
- [ ] Delete attachment (owner)
- [ ] Delete attachment (non-owner, should fail)
- [ ] View attachment from issue
- [ ] View attachment from comment
- [ ] Test on mobile (photo upload from camera)
- [ ] Test drag & drop (desktop)
- [ ] Test with slow network (progress indicator)
- [ ] Test concurrent uploads

---

## Migration Plan

### For Existing Production System

```sql
-- Step 1: Create table
-- (Run during maintenance window or use migration tool)

-- Step 2: Deploy new code with feature flag
UPDATE system_settings
SET value = 'false'
WHERE key = 'file_uploads_enabled';

-- Step 3: Test in production with limited users
-- Enable for admins only first

-- Step 4: Gradual rollout
-- Enable for all users

-- Step 5: Monitor
-- Check storage usage
-- Monitor upload errors
-- Track user adoption
```

---

## Cost-Benefit Analysis

### Development Cost: $2,000-5,000
- Backend API: 2-3 days ($800-1,500)
- Frontend components: 2-3 days ($800-1,500)
- Testing & polish: 1-2 days ($400-1,000)
- Storage setup: 0.5 day ($200-500)
- Documentation: 0.5 day ($200-500)

### Ongoing Costs: $0-50/month
- Storage: $0-30/month (depends on usage)
- Bandwidth: $0-20/month (depends on downloads)

### Benefits
- ⭐ Users can provide complete bug reports (screenshots)
- ⭐ Designers can share mockups directly
- ⭐ Developers can attach log files
- ⭐ Better documentation of issues
- ⭐ Reduced back-and-forth communication
- ⭐ Competitive parity (most issue trackers have this)

### ROI
**Time saved:** 5-10 hours/week for 20-person team
- No more external file sharing services
- No more "where's that screenshot?"
- Fewer clarification requests

**Value:** $250-500/week = $1,000-2,000/month
**Payback:** 1-2 months

---

## Comparison with Competitors

| Feature | Jira | Linear | Asana | TaskForge (Proposed) |
|---------|------|--------|-------|----------------------|
| File attachments | ✅ | ✅ | ✅ | ✅ |
| Image preview | ✅ | ✅ | ✅ | ✅ |
| Drag & drop | ✅ | ✅ | ✅ | ✅ |
| File size limit | 10-100MB | 50MB | 100MB | 10-100MB |
| Storage included | Limited | Limited | Limited | Based on plan |

**Conclusion:** This is a **must-have feature** for competitive parity.

---

## Recommendation

**Priority:** 🔥 **HIGH**

**Implementation Path:**
1. ✅ **Phase 1 (Basic)** - Implement now ($2-3K, 1 week)
   - Essential for team productivity
   - Low complexity
   - High ROI

2. ⭐ **Phase 2 (Enhanced)** - Add later ($2-3K, 1 week)
   - Nice-to-have improvements
   - Can wait for user feedback

**Total Investment:** $4-6K for complete solution
**Timeline:** 2 weeks total
**ROI:** 1-2 months payback

---

**Next Steps:**
1. Choose storage provider (Vercel Blob recommended)
2. Set up storage credentials
3. Implement Phase 1 (basic upload)
4. Test with small user group
5. Roll out to all users
6. Collect feedback
7. Implement Phase 2 if needed

---

**This feature transforms TaskForge from good to great!** 🚀
