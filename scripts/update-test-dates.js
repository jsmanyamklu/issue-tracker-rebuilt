#!/usr/bin/env node

/**
 * Update existing issues with test dates for overdue functionality
 * Sets creation dates to past dates and due dates to one day later
 */

const { Pool } = require('pg');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateTestDates() {
  console.log('🔄 Updating test dates for existing issues...\n');

  const client = await pool.connect();

  try {
    // Get all existing issues
    const { rows: issues } = await client.query(
      'SELECT id, title FROM issues ORDER BY created_at DESC'
    );

    if (issues.length === 0) {
      console.log('⚠️  No issues found in the database');
      return;
    }

    console.log(`📋 Found ${issues.length} issue(s) to update\n`);

    let updated = 0;
    const now = new Date();

    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i];

      // Alternate between yesterday and a week ago
      let daysOld;
      if (i % 3 === 0) {
        daysOld = 7; // Week old
      } else if (i % 3 === 1) {
        daysOld = 3; // 3 days old
      } else {
        daysOld = 1; // Yesterday
      }

      // Calculate creation date
      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - daysOld);

      // Due date is one day after creation date (making it overdue)
      const dueDate = new Date(createdAt);
      dueDate.setDate(dueDate.getDate() + 1);

      // Update the issue
      await client.query(
        `UPDATE issues
         SET created_at = $1,
             due_date = $2,
             updated_at = $1
         WHERE id = $3`,
        [createdAt, dueDate, issue.id]
      );

      const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));

      console.log(`✅ Updated: "${issue.title.substring(0, 50)}${issue.title.length > 50 ? '...' : ''}"`);
      console.log(`   Created: ${createdAt.toLocaleDateString()} (${daysOld} days ago)`);
      console.log(`   Due: ${dueDate.toLocaleDateString()} (${daysOverdue} days overdue)\n`);

      updated++;
    }

    console.log(`\n🎉 Successfully updated ${updated} issue(s)!`);
    console.log('\n📊 Summary:');
    console.log(`   - Issues are now ${updated > 0 ? 'overdue' : 'up to date'}`);
    console.log(`   - Creation dates: Yesterday, 3 days ago, or 1 week ago`);
    console.log(`   - Due dates: 1 day after creation (all overdue now)`);
    console.log('\n💡 Refresh your browser to see the overdue indicators!');

  } catch (error) {
    console.error('\n❌ Error updating test dates:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the update
updateTestDates().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
