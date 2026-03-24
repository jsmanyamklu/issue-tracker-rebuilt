-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('google', 'github')),
  provider_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_id)
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Create index on provider and provider_id for OAuth lookups
CREATE INDEX idx_users_provider ON users(provider, provider_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert comment for documentation
COMMENT ON TABLE users IS 'User accounts with OAuth authentication';
COMMENT ON COLUMN users.provider IS 'OAuth provider: google or github';
COMMENT ON COLUMN users.provider_id IS 'Unique ID from OAuth provider';
