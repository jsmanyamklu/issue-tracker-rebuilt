const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addProjectDueDates() {
  console.log('📅 Adding due dates to projects...\n');

  try {
    // Get all projects without due dates
    const result = await pool.query(
      'SELECT id, name, created_at FROM projects WHERE due_date IS NULL'
    );

    const projects = result.rows;
    console.log(`Found ${projects.length} projects without due dates\n`);

    if (projects.length === 0) {
      console.log('✅ All projects already have due dates!');
      return;
    }

    let updated = 0;

    for (const project of projects) {
      const createdAt = new Date(project.created_at);

      // Set project deadline to be 60-90 days from creation
      const daysToAdd = Math.floor(Math.random() * 31) + 60; // 60-90 days

      const dueDate = new Date(createdAt);
      dueDate.setDate(dueDate.getDate() + daysToAdd);

      // 20% chance to make it overdue (in the past)
      const makeOverdue = Math.random() < 0.2;
      if (makeOverdue) {
        const today = new Date();
        const daysSinceCreated = Math.floor((today - createdAt) / (1000 * 60 * 60 * 24));
        // Set it to be 5-15 days ago
        const daysAgo = Math.floor(Math.random() * 11) + 5;
        dueDate.setTime(today.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      }

      // Update the project
      await pool.query(
        'UPDATE projects SET due_date = $1 WHERE id = $2',
        [dueDate, project.id]
      );

      updated++;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isOverdue = dueDate < today;
      const emoji = isOverdue ? '🔴' : '🟢';
      console.log(`   ${emoji} ${project.name} → Deadline: ${dueDate.toLocaleDateString()}`);
    }

    console.log(`\n✅ Updated ${updated} projects with due dates!`);
    console.log('\n📊 Summary:');

    // Get statistics
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN due_date IS NOT NULL THEN 1 END) as with_due_dates,
        COUNT(CASE WHEN due_date < NOW() THEN 1 END) as overdue
      FROM projects
    `);

    const { total, with_due_dates, overdue } = stats.rows[0];
    console.log(`   Total projects: ${total}`);
    console.log(`   With due dates: ${with_due_dates}`);
    console.log(`   Currently overdue: ${overdue}`);

  } catch (error) {
    console.error('❌ Error adding project due dates:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addProjectDueDates()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
