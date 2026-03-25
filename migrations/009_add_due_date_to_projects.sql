-- Add due date to projects table
ALTER TABLE projects
ADD COLUMN due_date TIMESTAMP WITH TIME ZONE;

-- Create index on due_date for faster queries
CREATE INDEX idx_projects_due_date ON projects(due_date);

-- Add comment
COMMENT ON COLUMN projects.due_date IS 'Project deadline - overall completion target date';
