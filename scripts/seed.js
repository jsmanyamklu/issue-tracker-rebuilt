#!/usr/bin/env node

/**
 * Database seed script
 * Populates the database with sample data for development
 */

const { Pool } = require('pg');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedDatabase() {
  console.log('🌱 Seeding database with sample data...\n');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create sample users
    console.log('👤 Creating sample users...');
    const users = await client.query(`
      INSERT INTO users (email, name, provider, provider_id, avatar_url)
      VALUES
        ('john.doe@example.com', 'John Doe', 'google', 'google_123', 'https://i.pravatar.cc/150?img=1'),
        ('jane.smith@example.com', 'Jane Smith', 'github', 'github_456', 'https://i.pravatar.cc/150?img=2'),
        ('bob.wilson@example.com', 'Bob Wilson', 'google', 'google_789', 'https://i.pravatar.cc/150?img=3')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, name;
    `);

    if (users.rows.length > 0) {
      console.log(`✅ Created ${users.rows.length} users`);
      users.rows.forEach((u) => console.log(`   - ${u.name}`));
    } else {
      console.log('⏭️  Users already exist, fetching...');
      const existingUsers = await client.query(
        "SELECT id, name FROM users WHERE email IN ('john.doe@example.com', 'jane.smith@example.com', 'bob.wilson@example.com')"
      );
      users.rows = existingUsers.rows;
    }

    const [john, jane, bob] = users.rows;

    // Create sample projects
    console.log('\n📁 Creating sample projects...');
    const projects = await client.query(
      `
      INSERT INTO projects (name, description, owner_id)
      VALUES
        ($1, $2, $3),
        ($4, $5, $6)
      ON CONFLICT DO NOTHING
      RETURNING id, name;
    `,
      [
        'Customer Portal',
        'Web application for customer self-service',
        john.id,
        'Mobile App',
        'iOS and Android mobile application',
        jane.id,
      ]
    );

    if (projects.rows.length > 0) {
      console.log(`✅ Created ${projects.rows.length} projects`);
      projects.rows.forEach((p) => console.log(`   - ${p.name}`));
    }

    const [portal, mobile] = projects.rows;

    // Create sample issues
    console.log('\n🐛 Creating sample issues...');
    const issues = await client.query(
      `
      INSERT INTO issues (project_id, title, description, status, priority, type, reporter_id, assignee_id)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8),
        ($9, $10, $11, $12, $13, $14, $15, $16),
        ($17, $18, $19, $20, $21, $22, $23, $24),
        ($25, $26, $27, $28, $29, $30, $31, $32),
        ($33, $34, $35, $36, $37, $38, $39, $40)
      ON CONFLICT DO NOTHING
      RETURNING id, title;
    `,
      [
        // Issue 1
        portal.id,
        'Login page not responsive on mobile',
        'The login form breaks on screens smaller than 768px',
        'open',
        'high',
        'bug',
        john.id,
        jane.id,
        // Issue 2
        portal.id,
        'Add password reset functionality',
        'Users should be able to reset their password via email',
        'in_progress',
        'medium',
        'feature',
        jane.id,
        bob.id,
        // Issue 3
        portal.id,
        'Improve dashboard load time',
        'Dashboard takes 5+ seconds to load with large datasets',
        'open',
        'critical',
        'improvement',
        bob.id,
        jane.id,
        // Issue 4
        mobile.id,
        'App crashes on iOS 17',
        'Application crashes when opening notifications on iOS 17',
        'open',
        'critical',
        'bug',
        jane.id,
        john.id,
        // Issue 5
        mobile.id,
        'Implement dark mode',
        'Add dark mode theme to the mobile app',
        'open',
        'low',
        'feature',
        john.id,
        null,
      ]
    );

    if (issues.rows.length > 0) {
      console.log(`✅ Created ${issues.rows.length} issues`);
      issues.rows.forEach((i) => console.log(`   - ${i.title}`));
    }

    // Create sample comments
    console.log('\n💬 Creating sample comments...');
    const comments = await client.query(
      `
      INSERT INTO comments (issue_id, user_id, content)
      VALUES
        ($1, $2, $3),
        ($4, $5, $6),
        ($7, $8, $9)
      ON CONFLICT DO NOTHING
      RETURNING id;
    `,
      [
        issues.rows[0].id,
        jane.id,
        'I can reproduce this on iPhone 12. The form inputs are overlapping.',
        issues.rows[0].id,
        john.id,
        'Thanks for confirming. Will prioritize this for the next sprint.',
        issues.rows[1].id,
        bob.id,
        'Started working on this. Should have it ready by end of week.',
      ]
    );

    if (comments.rows.length > 0) {
      console.log(`✅ Created ${comments.rows.length} comments`);
    }

    await client.query('COMMIT');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.rows.length}`);
    console.log(`   Projects: ${projects.rows.length}`);
    console.log(`   Issues: ${issues.rows.length}`);
    console.log(`   Comments: ${comments.rows.length}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seed
seedDatabase().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
