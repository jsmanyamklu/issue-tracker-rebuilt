-- Add due_date column to issues table
ALTER TABLE issues ADD COLUMN due_date DATE;

-- Create index for due_date queries
CREATE INDEX idx_issues_due_date ON issues(due_date) WHERE due_date IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN issues.due_date IS 'Expected date of issue closure';
