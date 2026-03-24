#!/usr/bin/env node

/**
 * Database migration script
 * Runs all SQL migration files in order
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  const client = await pool.connect();

  try {
    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Migrations tracking table ready\n');

    // Get list of executed migrations
    const { rows: executedMigrations } = await client.query(
      'SELECT filename FROM migrations ORDER BY id'
    );

    const executedSet = new Set(executedMigrations.map((m) => m.filename));

    // Read migration files
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️  No migration files found');
      return;
    }

    let executedCount = 0;

    // Execute each migration
    for (const file of files) {
      if (executedSet.has(file)) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`📄 Executing ${file}...`);

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await client.query('BEGIN');

      try {
        // Execute the migration
        await client.query(sql);

        // Record the migration
        await client.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [file]
        );

        await client.query('COMMIT');

        console.log(`✅ Successfully executed ${file}\n`);
        executedCount++;
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Error executing ${file}:`, error.message);
        throw error;
      }
    }

    if (executedCount === 0) {
      console.log('✨ All migrations are up to date!');
    } else {
      console.log(`\n🎉 Successfully executed ${executedCount} migration(s)!`);
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migrations
runMigrations().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
