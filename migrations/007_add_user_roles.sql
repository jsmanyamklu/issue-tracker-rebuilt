-- Add role-based access control to users table

-- Create user role enum
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'developer', 'viewer');

-- Add role column to users table with default 'developer'
ALTER TABLE users
ADD COLUMN role user_role NOT NULL DEFAULT 'developer';

-- Create index on role for faster filtering
CREATE INDEX idx_users_role ON users(role);

-- Update comment
COMMENT ON COLUMN users.role IS 'User role for access control: admin, manager, developer, viewer';

-- Set first user as admin (if exists)
UPDATE users
SET role = 'admin'
WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);
