-- Migration: Add Performance Indexes
-- Description: Adds indexes for frequently queried columns to improve performance

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider_lookup ON users(provider, provider_id);

-- Projects table indexes
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);

-- Issues table indexes
CREATE INDEX IF NOT EXISTS idx_issues_project_id ON issues(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_assignee_id ON issues(assignee_id);
CREATE INDEX IF NOT EXISTS idx_issues_reporter_id ON issues(reporter_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);
CREATE INDEX IF NOT EXISTS idx_issues_type ON issues(type);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issues_updated_at ON issues(updated_at DESC);
-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_issues_project_status ON issues(project_id, status);
CREATE INDEX IF NOT EXISTS idx_issues_assignee_status ON issues(assignee_id, status);
CREATE INDEX IF NOT EXISTS idx_issues_status_priority ON issues(status, priority);

-- Comments table indexes
CREATE INDEX IF NOT EXISTS idx_comments_issue_id ON comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Issue embeddings table indexes
CREATE INDEX IF NOT EXISTS idx_issue_embeddings_issue_id ON issue_embeddings(issue_id);

-- Add full-text search indexes for PostgreSQL
CREATE INDEX IF NOT EXISTS idx_issues_title_search ON issues USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_issues_description_search ON issues USING gin(to_tsvector('english', COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_projects_name_search ON projects USING gin(to_tsvector('english', name));
