-- Migration: Fix attachments constraint to allow temporary unlinked uploads
-- Description: Allows files to be uploaded before being linked to issues/comments

-- Drop the old constraint that requires immediate linking
ALTER TABLE attachments DROP CONSTRAINT IF EXISTS check_linked_to_issue_or_comment;

-- Add new constraint that allows temporary unlinked attachments
-- Note: Attachments can exist without being linked (for temporary uploads)
-- but should not be linked to both an issue AND a comment at the same time
ALTER TABLE attachments ADD CONSTRAINT check_not_linked_to_both CHECK (
  NOT (issue_id IS NOT NULL AND comment_id IS NOT NULL)
);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT check_not_linked_to_both ON attachments IS
  'Ensures attachments are not linked to both issues and comments simultaneously. Allows temporary unlinked attachments during upload flow.';
