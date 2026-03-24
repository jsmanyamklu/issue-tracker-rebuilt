-- Create table for storing issue embeddings (for AI similarity search)
CREATE TABLE IF NOT EXISTS issue_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL UNIQUE REFERENCES issues(id) ON DELETE CASCADE,
  embedding FLOAT8[] NOT NULL,
  model VARCHAR(100) NOT NULL DEFAULT 'text-embedding-ada-002',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on issue_id
CREATE INDEX idx_issue_embeddings_issue_id ON issue_embeddings(issue_id);

-- Create trigger for issue_embeddings table
CREATE TRIGGER update_issue_embeddings_updated_at
  BEFORE UPDATE ON issue_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert comment for documentation
COMMENT ON TABLE issue_embeddings IS 'Vector embeddings for issues to enable AI similarity search';
COMMENT ON COLUMN issue_embeddings.embedding IS 'Float array representing the issue embedding vector';
COMMENT ON COLUMN issue_embeddings.model IS 'Name of the embedding model used';
