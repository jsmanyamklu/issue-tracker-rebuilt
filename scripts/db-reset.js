#!/usr/bin/env node

/**
 * Database reset script
 * WARNING: This will drop all tables and data!
 * Use only in development
 */

const { Pool } = require('pg');
const path = require('path');
const readline = require('readline');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function confirm(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

async function resetDatabase() {
  console.log('⚠️  WARNING: This will delete ALL data in the database!\n');

  const confirmed = await confirm('Type "yes" to continue: ');

  if (!confirmed) {
    console.log('❌ Reset cancelled');
    process.exit(0);
  }

  const client = await pool.connect();

  try {
    console.log('\n🗑️  Dropping all tables...');

    await client.query('BEGIN');

    // Drop tables in reverse order of dependencies
    await client.query('DROP TABLE IF EXISTS issue_embeddings CASCADE');
    await client.query('DROP TABLE IF EXISTS comments CASCADE');
    await client.query('DROP TABLE IF EXISTS issues CASCADE');
    await client.query('DROP TABLE IF EXISTS projects CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    await client.query('DROP TABLE IF EXISTS migrations CASCADE');

    // Drop custom types
    await client.query('DROP TYPE IF EXISTS issue_status CASCADE');
    await client.query('DROP TYPE IF EXISTS issue_priority CASCADE');
    await client.query('DROP TYPE IF EXISTS issue_type CASCADE');

    // Drop function
    await client.query('DROP FUNCTION IF EXISTS update_updated_at_column CASCADE');

    await client.query('COMMIT');

    console.log('✅ All tables dropped successfully');
    console.log('\n💡 Run "npm run migrate" to recreate the database schema');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Check environment
if (process.env.NODE_ENV === 'production') {
  console.error('❌ Cannot run db-reset in production environment!');
  process.exit(1);
}

// Run reset
resetDatabase().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
