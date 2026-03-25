const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  console.log('🔧 Running migration 009...\n');

  try {
    // Add due_date column
    console.log('Adding due_date column to projects table...');
    await pool.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE');
    console.log('✅ Column added');

    // Create index
    console.log('Creating index on due_date...');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_projects_due_date ON projects(due_date)');
    console.log('✅ Index created');

    // Add comment
    console.log('Adding column comment...');
    await pool.query("COMMENT ON COLUMN projects.due_date IS 'Project deadline - overall completion target date'");
    console.log('✅ Comment added');

    console.log('\n✅ Migration 009 completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
