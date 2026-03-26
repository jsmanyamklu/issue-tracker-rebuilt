# 📎 File Upload Feature - Prototype Implementation

## ✅ What's Been Built

The file upload feature is now ready to test! Here's what's implemented:

### 1. Database Schema ✅
- **Migration:** `migrations/010_create_attachments_table.sql`
- **Table:** `attachments` with all necessary fields
- **Relationships:** Links to issues OR comments

### 2. Storage Layer ✅
- **File:** `src/lib/storage.ts`
- **Storage:** Local file system (`public/uploads/`)
- **Features:**
  - File validation (type, size)
  - Unique filename generation
  - Helper functions (formatFileSize, getFileIcon, etc.)
- **Note:** Ready to swap with Vercel Blob/Supabase for production

### 3. API Routes ✅
- **Upload:** `src/app/api/upload/route.ts`
  - POST: Upload file and save metadata
  - GET: Get upload limits/config
- **Attachments:** `src/app/api/attachments/route.ts`
  - POST: Link attachment to issue/comment
  - GET: List attachments for issue/comment
  - DELETE: Delete attachment (with permissions)

### 4. React Components ✅
- **FileUpload:** `src/components/FileUpload.tsx`
  - Upload button with progress indicator
  - File validation
  - Error handling
- **AttachmentList:** `src/components/AttachmentList.tsx`
  - Grid display of attachments
  - Image previews
  - Download & delete actions

---

## 🚀 How to Test

### Step 1: Run Database Migration

```bash
# Connect to your database and run:
psql $DATABASE_URL < migrations/010_create_attachments_table.sql

# Or if using the migration runner:
npm run db:migrate
```

### Step 2: Start Dev Server

```bash
npm run dev
```

The server will create the `public/uploads/` folder automatically.

### Step 3: Test Upload API Directly

```bash
# Test upload endpoint
curl -X POST http://localhost:3000/api/upload \
  -H "Cookie: your-auth-cookie" \
  -F "file=@/path/to/test.jpg"

# Response:
# {
#   "success": true,
#   "attachment": {
#     "id": "uuid",
#     "filename": "...",
#     "original_filename": "test.jpg",
#     "file_size": 12345,
#     "mime_type": "image/jpeg",
#     "storage_url": "/uploads/...",
#     "created_at": "2026-03-26..."
#   }
# }
```

---

## 📝 Integration Example

Here's how to add file uploads to any form (e.g., comments, issues):

```tsx
'use client';

import { useState } from 'react';
import { FileUpload, Attachment } from '@/components/FileUpload';
import { AttachmentList } from '@/components/AttachmentList';

export function CommentFormWithAttachments({ issueId }: { issueId: string }) {
  const [comment, setComment] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle file upload completion
  const handleUploadComplete = (attachment: Attachment) => {
    setAttachments([...attachments, attachment]);
  };

  // Handle attachment deletion (before submit)
  const handleDeleteAttachment = async (id: string) => {
    // Delete from server
    await fetch(`/api/attachments?id=${id}`, { method: 'DELETE' });
    // Remove from state
    setAttachments(attachments.filter(a => a.id !== id));
  };

  // Submit comment with attachments
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // 1. Create comment
      const commentRes = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue_id: issueId,
          content: comment,
        }),
      });

      const commentData = await commentRes.json();

      // 2. Link all attachments to the comment
      for (const attachment of attachments) {
        await fetch('/api/attachments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attachmentId: attachment.id,
            commentId: commentData.comment.id,
          }),
        });
      }

      // 3. Reset form
      setComment('');
      setAttachments([]);

      // 4. Refresh or update UI
      window.location.reload(); // Or use a more elegant state update
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
      <h3 className="text-lg font-bold">Add Comment</h3>

      {/* Comment Text */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment..."
        className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700"
        rows={4}
      />

      {/* File Upload */}
      <FileUpload onUploadComplete={handleUploadComplete} />

      {/* Show Attachments */}
      {attachments.length > 0 && (
        <AttachmentList
          attachments={attachments}
          canDelete={true}
          onDelete={handleDeleteAttachment}
          showUploader={false}
        />
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || (!comment.trim() && attachments.length === 0)}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </div>
  );
}
```

---

## 📋 Integration Checklist

### For Comment Forms:
- [ ] Import `FileUpload` and `AttachmentList` components
- [ ] Add state for attachments array
- [ ] Add `FileUpload` component below textarea
- [ ] Show `AttachmentList` if attachments exist
- [ ] On submit: Link attachments to comment via `/api/attachments` POST
- [ ] Test creating comment with attachments

### For Issue Forms (Create/Edit):
- [ ] Same steps as comments
- [ ] Link attachments to issue_id instead of comment_id
- [ ] Consider showing existing attachments on edit

### For Issue Detail Page:
- [ ] Fetch attachments for issue: `GET /api/attachments?issue_id=xxx`
- [ ] Display using `AttachmentList` component
- [ ] Add delete handler (checks permissions)

---

## 🎯 Quick Test Page (Optional)

Create a test page to try file uploads:

```tsx
// src/app/test-upload/page.tsx
'use client';

import { useState } from 'react';
import { FileUpload, Attachment } from '@/components/FileUpload';
import { AttachmentList } from '@/components/AttachmentList';

export default function TestUploadPage() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const handleUploadComplete = (attachment: Attachment) => {
    console.log('Upload complete:', attachment);
    setAttachments([...attachments, attachment]);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/attachments?id=${id}`, { method: 'DELETE' });
    setAttachments(attachments.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">File Upload Test</h1>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
            <FileUpload onUploadComplete={handleUploadComplete} />
          </div>

          {attachments.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
              <AttachmentList
                attachments={attachments}
                canDelete={true}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

Access at: http://localhost:3000/test-upload

---

## 🔧 Configuration

### File Size Limit
Default: 10MB (prototype)

To change:
```typescript
// In src/lib/storage.ts
export function isValidFileSize(size: number, maxSizeMB: number = 10) {
  // Change default from 10 to your desired size
}
```

### Allowed File Types
Default: Images, PDFs, Office docs, text files

To add more types:
```typescript
// In src/lib/storage.ts
export function isAllowedFileType(mimeType: string): boolean {
  const allowedTypes = [
    // Add your MIME types here
    'application/zip',
    'video/mp4',
    // etc.
  ];
  return allowedTypes.includes(mimeType);
}
```

### Storage Location
Default: `public/uploads/` (local filesystem)

For production, replace in `src/lib/storage.ts`:

**Vercel Blob:**
```typescript
import { put } from '@vercel/blob';

export async function uploadFile(file: Buffer, originalFilename: string) {
  const filename = generateFilename(originalFilename);
  const blob = await put(filename, file, { access: 'public' });

  return {
    filename,
    originalFilename,
    size: file.length,
    url: blob.url,
    path: blob.pathname,
  };
}
```

**Supabase Storage:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function uploadFile(file: Buffer, originalFilename: string) {
  const filename = generateFilename(originalFilename);

  const { data, error } = await supabase.storage
    .from('attachments')
    .upload(filename, file, {
      contentType: 'auto',
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('attachments')
    .getPublicUrl(filename);

  return {
    filename,
    originalFilename,
    size: file.length,
    url: urlData.publicUrl,
    path: filename,
  };
}
```

---

## 🐛 Troubleshooting

### "Upload failed" error
1. Check if you're logged in (authentication required)
2. Check file size (must be < 10MB)
3. Check file type (must be in allowed list)
4. Check console for detailed error

### "Attachment not found" when linking
1. Ensure attachment was uploaded successfully (check ID)
2. Ensure issue/comment exists
3. Check you're the uploader

### Files not showing in uploads folder
1. Check if `public/uploads/` folder exists
2. Check file permissions
3. Check server logs for errors

### Images not loading
1. Ensure Next.js static files are being served correctly
2. Check browser console for 404 errors
3. Verify file exists in `public/uploads/`

---

## ✨ Next Steps

### For Full Production Deployment:
1. **Run migration** on production database
2. **Switch to cloud storage** (Vercel Blob/Supabase/S3)
3. **Update storage URLs** in env variables
4. **Integrate into existing forms** (comments, issues)
5. **Add to issue detail pages** (show attachments)
6. **Test thoroughly** with various file types
7. **Set up CDN** for better performance (optional)

### Enhancements to Consider:
- [ ] Drag & drop upload
- [ ] Multiple file upload at once
- [ ] Image compression/thumbnails
- [ ] Virus scanning (ClamAV or cloud service)
- [ ] File preview modal
- [ ] Copy attachment between issues
- [ ] Bulk download as ZIP

---

## 📊 Estimated Storage Costs

### For 1000 users with ~5MB attachments each:

**Vercel Blob:**
- Storage: 5GB = $0.75/month
- Bandwidth: ~10GB/month = Free (included)
- **Total: ~$1/month**

**Supabase:**
- Storage: 5GB (within free tier)
- Bandwidth: 10GB (within free tier)
- **Total: $0/month** (free tier)

**AWS S3:**
- Storage: 5GB = $0.12/month
- Bandwidth: 10GB = $0.90/month
- **Total: ~$1/month**

---

## ✅ Prototype Status

**READY TO TEST!** All core functionality implemented:

| Feature | Status |
|---------|--------|
| Database schema | ✅ Complete |
| File upload API | ✅ Complete |
| Attachment management API | ✅ Complete |
| Storage utility | ✅ Complete |
| FileUpload component | ✅ Complete |
| AttachmentList component | ✅ Complete |
| Documentation | ✅ Complete |

**What's NOT included (can add for production):**
- Drag & drop (easy to add)
- Multiple files at once (easy to add)
- Image thumbnails (moderate effort)
- Virus scanning (requires external service)

---

## 🎉 Success!

You now have a fully functional file upload prototype! Test it out and when you're ready for production, just:

1. Run the migration
2. Switch storage provider (optional)
3. Integrate into your forms
4. Deploy!

**Questions or issues?** Check the troubleshooting section or review the code comments in the source files.

Happy uploading! 📎
