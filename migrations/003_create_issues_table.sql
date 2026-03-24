-- Create enum types for issues
CREATE TYPE issue_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE issue_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE issue_type AS ENUM ('bug', 'feature', 'task', 'improvement');

-- Create issues table
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status issue_status NOT NULL DEFAULT 'open',
  priority issue_priority NOT NULL DEFAULT 'medium',
  type issue_type NOT NULL DEFAULT 'task',
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_assignee_not_empty CHECK (assignee_id IS NULL OR assignee_id != '00000000-0000-0000-0000-000000000000'::UUID)
);

-- Create indexes for faster queries
CREATE INDEX idx_issues_project_id ON issues(project_id);
CREATE INDEX idx_issues_assignee_id ON issues(assignee_id);
CREATE INDEX idx_issues_reporter_id ON issues(reporter_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_priority ON issues(priority);
CREATE INDEX idx_issues_type ON issues(type);
CREATE INDEX idx_issues_created_at ON issues(created_at DESC);
CREATE INDEX idx_issues_updated_at ON issues(updated_at DESC);

-- Create composite index for common query patterns
CREATE INDEX idx_issues_project_status ON issues(project_id, status);
CREATE INDEX idx_issues_assignee_status ON issues(assignee_id, status) WHERE assignee_id IS NOT NULL;

-- Create full-text search index on title and description
CREATE INDEX idx_issues_search ON issues USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Create trigger for issues table
CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON issues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert comments for documentation
COMMENT ON TABLE issues IS 'Issues/tickets within projects';
COMMENT ON COLUMN issues.status IS 'Current status of the issue';
COMMENT ON COLUMN issues.priority IS 'Priority level for the issue';
COMMENT ON COLUMN issues.type IS 'Type of issue (bug, feature, etc.)';
COMMENT ON COLUMN issues.assignee_id IS 'User assigned to work on this issue';
COMMENT ON COLUMN issues.reporter_id IS 'User who reported/created this issue';
