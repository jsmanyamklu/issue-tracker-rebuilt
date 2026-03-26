-- Migration: Create attachments table for file uploads
-- Description: Allows users to attach files to issues and comments

CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to either issue or comment (one must be set)
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,

  -- User who uploaded the file
  uploaded_by UUID REFERENCES users(id) NOT NULL,

  -- File metadata
  filename VARCHAR(255) NOT NULL, -- Generated unique filename
  original_filename VARCHAR(255) NOT NULL, -- Original filename from user
  file_size BIGINT NOT NULL, -- Size in bytes
  mime_type VARCHAR(100) NOT NULL, -- Content type

  -- Storage information
  storage_provider VARCHAR(50) NOT NULL DEFAULT 'local', -- 'local', 'vercel-blob', 'supabase', 's3'
  storage_path TEXT NOT NULL, -- Path to file in storage
  storage_url TEXT, -- Public URL (if applicable)

  -- Image-specific metadata
  thumbnail_url TEXT, -- Thumbnail for images
  width INTEGER, -- Image width
  height INTEGER, -- Image height

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP, -- Soft delete

  -- Constraints
  CONSTRAINT check_linked_to_issue_or_comment CHECK (
    (issue_id IS NOT NULL AND comment_id IS NULL) OR
    (issue_id IS NULL AND comment_id IS NOT NULL)
  ),
  CONSTRAINT check_file_size_positive CHECK (file_size > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_attachments_issue ON attachments(issue_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_attachments_comment ON attachments(comment_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_attachments_created_at ON attachments(created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE attachments IS 'Stores file attachments for issues and comments';
COMMENT ON COLUMN attachments.issue_id IS 'Reference to issue (if attached to issue)';
COMMENT ON COLUMN attachments.comment_id IS 'Reference to comment (if attached to comment)';
COMMENT ON COLUMN attachments.storage_provider IS 'Storage backend: local, vercel-blob, supabase, or s3';
COMMENT ON COLUMN attachments.deleted_at IS 'Soft delete timestamp - files can be recovered if needed';
