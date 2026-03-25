const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addDueDates() {
  console.log('📅 Adding due dates to issues without them...\n');

  try {
    // Get all issues without due dates
    const result = await pool.query(
      'SELECT id, title, status, priority, created_at FROM issues WHERE due_date IS NULL'
    );

    const issues = result.rows;
    console.log(`Found ${issues.length} issues without due dates\n`);

    if (issues.length === 0) {
      console.log('✅ All issues already have due dates!');
      return;
    }

    let updated = 0;

    for (const issue of issues) {
      // Calculate due date based on priority and status
      const createdAt = new Date(issue.created_at);
      let daysToAdd;

      // Set due date based on priority
      switch (issue.priority) {
        case 'critical':
          daysToAdd = Math.floor(Math.random() * 3) + 2; // 2-4 days
          break;
        case 'high':
          daysToAdd = Math.floor(Math.random() * 7) + 5; // 5-11 days
          break;
        case 'medium':
          daysToAdd = Math.floor(Math.random() * 14) + 7; // 7-20 days
          break;
        case 'low':
          daysToAdd = Math.floor(Math.random() * 21) + 14; // 14-34 days
          break;
        default:
          daysToAdd = Math.floor(Math.random() * 14) + 7; // 7-20 days
      }

      // For closed/resolved issues, set due date in the past (before created date + reasonable time)
      if (issue.status === 'closed' || issue.status === 'resolved') {
        // Make some overdue, some on time
        const wasOverdue = Math.random() > 0.5;
        if (wasOverdue) {
          // Set due date earlier than it should have been
          daysToAdd = Math.floor(daysToAdd * 0.7);
        }
      } else {
        // For open/in_progress issues, 30% should be overdue
        const makeOverdue = Math.random() < 0.3;
        if (makeOverdue) {
          // Set due date in the past
          const today = new Date();
          const daysSinceCreated = Math.floor((today - createdAt) / (1000 * 60 * 60 * 24));
          // Make it overdue by 1-5 days
          daysToAdd = daysSinceCreated - Math.floor(Math.random() * 5) - 1;
        }
      }

      const dueDate = new Date(createdAt);
      dueDate.setDate(dueDate.getDate() + daysToAdd);

      // Update the issue
      await pool.query(
        'UPDATE issues SET due_date = $1 WHERE id = $2',
        [dueDate, issue.id]
      );

      updated++;
      const isOverdue = dueDate < new Date() && issue.status !== 'closed' && issue.status !== 'resolved';
      const emoji = isOverdue ? '🚨' : '📅';
      console.log(`   ${emoji} ${issue.title.substring(0, 50)}... → Due: ${dueDate.toLocaleDateString()}`);
    }

    console.log(`\n✅ Updated ${updated} issues with due dates!`);
    console.log('\n📊 Summary:');

    // Get statistics
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN due_date IS NOT NULL THEN 1 END) as with_due_dates,
        COUNT(CASE
          WHEN due_date < NOW()
          AND status NOT IN ('closed', 'resolved')
          THEN 1
        END) as overdue
      FROM issues
    `);

    const { total, with_due_dates, overdue } = stats.rows[0];
    console.log(`   Total issues: ${total}`);
    console.log(`   With due dates: ${with_due_dates}`);
    console.log(`   Currently overdue: ${overdue}`);

  } catch (error) {
    console.error('❌ Error adding due dates:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addDueDates()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
