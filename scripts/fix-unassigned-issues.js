/**
 * Fix Unassigned Issues Script
 *
 * This script finds all issues with NULL assignee_id and assigns them to their reporter.
 * Run this to fix legacy issues that were created before auto-assignment was implemented.
 *
 * Usage: node scripts/fix-unassigned-issues.js
 */

const { Pool } = require('pg');
require('dotenv').config();

async function fixUnassignedIssues() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Searching for unassigned issues...\n');

    // Find all issues with NULL assignee_id
    const findQuery = `
      SELECT
        i.id,
        i.title,
        i.reporter_id,
        u.name as reporter_name,
        u.email as reporter_email,
        p.name as project_name
      FROM issues i
      LEFT JOIN users u ON i.reporter_id = u.id
      LEFT JOIN projects p ON i.project_id = p.id
      WHERE i.assignee_id IS NULL
      ORDER BY i.created_at ASC
    `;

    const result = await pool.query(findQuery);
    const unassignedIssues = result.rows;

    if (unassignedIssues.length === 0) {
      console.log('✅ No unassigned issues found! All issues have assignees.\n');
      await pool.end();
      return;
    }

    console.log(`📋 Found ${unassignedIssues.length} unassigned issue(s):\n`);

    // Display unassigned issues
    unassignedIssues.forEach((issue, index) => {
      console.log(`${index + 1}. "${issue.title}"`);
      console.log(`   Project: ${issue.project_name}`);
      console.log(`   Reporter: ${issue.reporter_name} (${issue.reporter_email})`);
      console.log(`   Will assign to: ${issue.reporter_name}`);
      console.log('');
    });

    console.log('⚙️  Fixing unassigned issues...\n');

    // Update all unassigned issues - assign to reporter
    const updateQuery = `
      UPDATE issues
      SET
        assignee_id = reporter_id,
        updated_at = NOW()
      WHERE assignee_id IS NULL
      RETURNING id, title
    `;

    const updateResult = await pool.query(updateQuery);
    const fixedIssues = updateResult.rows;

    console.log(`✅ Successfully fixed ${fixedIssues.length} issue(s)!\n`);

    // Log activity for each fixed issue
    console.log('📝 Logging activity for fixed issues...\n');

    for (const issue of unassignedIssues) {
      if (!issue.reporter_id) {
        console.log(`⚠️  Skipping activity log for issue "${issue.title}" - no reporter found`);
        continue;
      }

      const activityQuery = `
        INSERT INTO activity_logs (
          user_id,
          action,
          entity_type,
          entity_id,
          details
        ) VALUES (
          $1,
          'issue_assigned',
          'issue',
          $2,
          $3
        )
      `;

      const details = JSON.stringify({
        assignee_id: issue.reporter_id,
        assignee_name: issue.reporter_name,
        reason: 'Auto-assigned to reporter (migration fix)',
        migration: true,
      });

      try {
        await pool.query(activityQuery, [
          issue.reporter_id,
          issue.id,
          details,
        ]);
        console.log(`   ✓ Logged activity for: "${issue.title}"`);
      } catch (err) {
        console.error(`   ✗ Failed to log activity for: "${issue.title}"`, err.message);
      }
    }

    console.log('\n🎉 All done! Summary:');
    console.log(`   - Found: ${unassignedIssues.length} unassigned issues`);
    console.log(`   - Fixed: ${fixedIssues.length} issues`);
    console.log(`   - All issues now assigned to their reporters\n`);

    // Verify fix
    const verifyQuery = `
      SELECT COUNT(*) as count
      FROM issues
      WHERE assignee_id IS NULL
    `;

    const verifyResult = await pool.query(verifyQuery);
    const remainingUnassigned = parseInt(verifyResult.rows[0].count);

    if (remainingUnassigned === 0) {
      console.log('✅ Verification passed: No unassigned issues remaining!\n');
    } else {
      console.log(`⚠️  Warning: ${remainingUnassigned} unassigned issue(s) still remain.\n`);
    }

  } catch (error) {
    console.error('❌ Error fixing unassigned issues:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  console.log('🚀 Fix Unassigned Issues Script');
  console.log('================================\n');

  fixUnassignedIssues()
    .then(() => {
      console.log('✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixUnassignedIssues };
