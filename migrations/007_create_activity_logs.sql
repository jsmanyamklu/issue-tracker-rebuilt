-- Migration: Create activity_logs table for comprehensive audit trail
-- Date: 2026-03-25
-- Purpose: Track all user actions and system events for analytics and compliance

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_action ON activity_logs(user_id, action_type);

-- Add comment for documentation
COMMENT ON TABLE activity_logs IS 'Comprehensive audit trail of all user actions and system events';
COMMENT ON COLUMN activity_logs.action_type IS 'Type of action performed (e.g., issue_created, status_changed)';
COMMENT ON COLUMN activity_logs.resource_type IS 'Type of resource affected (e.g., issue, project, comment)';
COMMENT ON COLUMN activity_logs.resource_id IS 'UUID of the affected resource';
COMMENT ON COLUMN activity_logs.details IS 'JSON object containing action-specific details (old/new values, metadata)';
COMMENT ON COLUMN activity_logs.ip_address IS 'IP address of the user performing the action';
COMMENT ON COLUMN activity_logs.user_agent IS 'Browser user agent string';

-- Create function to automatically clean old logs (optional retention policy)
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs(retention_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM activity_logs
  WHERE created_at < CURRENT_TIMESTAMP - (retention_days || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_activity_logs IS 'Deletes activity logs older than specified retention period (default 365 days)';

-- Insert initial log entry for migration
INSERT INTO activity_logs (
  user_id,
  action_type,
  resource_type,
  resource_id,
  details
) VALUES (
  NULL,
  'system_migration',
  'database',
  gen_random_uuid(),
  '{"migration": "007_create_activity_logs", "description": "Activity logging system initialized"}'::JSONB
);
