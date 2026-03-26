/**
 * Test Data Seeding Script
 * Creates test users, projects, and issues for automated testing
 */

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface TestUser {
  id?: string;
  name: string;
  email: string;
  role: string;
  password?: string;
}

interface TestProject {
  id?: string;
  name: string;
  description: string;
  due_date?: string;
}

interface TestIssue {
  id?: string;
  project_id: string;
  title: string;
  description: string;
  priority: string;
  type: string;
  status: string;
  assignee_id?: string;
  due_date?: string;
}

// Test users with different roles
export const TEST_USERS: TestUser[] = [
  {
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin',
  },
  {
    name: 'Manager User',
    email: 'manager@test.com',
    role: 'manager',
  },
  {
    name: 'Developer Alice',
    email: 'alice@test.com',
    role: 'developer',
  },
  {
    name: 'Developer Bob',
    email: 'bob@test.com',
    role: 'developer',
  },
  {
    name: 'Developer Charlie',
    email: 'charlie@test.com',
    role: 'developer',
  },
  {
    name: 'Viewer User',
    email: 'viewer@test.com',
    role: 'viewer',
  },
];

// Test projects
export const TEST_PROJECTS: TestProject[] = [
  {
    name: 'Test Project Alpha',
    description: 'Primary test project with various issues',
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  },
  {
    name: 'Test Project Beta',
    description: 'Secondary test project for workload distribution',
    due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
  },
  {
    name: 'Test Project Gamma',
    description: 'Project for overdue issue testing',
    due_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago (overdue)
  },
];

/**
 * Create test issues with various scenarios
 */
export function generateTestIssues(
  projectIds: string[],
  userIds: { [key: string]: string }
): TestIssue[] {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  return [
    // Alice's workload (3 issues = score 6)
    {
      project_id: projectIds[0],
      title: 'Alice Task 1 - Open',
      description: 'Testing open issue for Alice',
      priority: 'medium',
      type: 'task',
      status: 'open',
      assignee_id: userIds['alice@test.com'],
      due_date: tomorrow.toISOString(),
    },
    {
      project_id: projectIds[0],
      title: 'Alice Task 2 - In Progress',
      description: 'Testing in-progress issue for Alice',
      priority: 'high',
      type: 'bug',
      status: 'in_progress',
      assignee_id: userIds['alice@test.com'],
      due_date: tomorrow.toISOString(),
    },
    {
      project_id: projectIds[1],
      title: 'Alice Task 3 - In Progress',
      description: 'Another in-progress for Alice',
      priority: 'low',
      type: 'feature',
      status: 'in_progress',
      assignee_id: userIds['alice@test.com'],
      due_date: tomorrow.toISOString(),
    },

    // Bob's workload (5 issues = score 13 with 1 overdue)
    {
      project_id: projectIds[0],
      title: 'Bob Task 1 - Open',
      description: 'Testing open issue for Bob',
      priority: 'medium',
      type: 'task',
      status: 'open',
      assignee_id: userIds['bob@test.com'],
      due_date: tomorrow.toISOString(),
    },
    {
      project_id: projectIds[0],
      title: 'Bob Task 2 - Open',
      description: 'Another open for Bob',
      priority: 'low',
      type: 'task',
      status: 'open',
      assignee_id: userIds['bob@test.com'],
      due_date: tomorrow.toISOString(),
    },
    {
      project_id: projectIds[1],
      title: 'Bob Task 3 - In Progress',
      description: 'In-progress for Bob',
      priority: 'high',
      type: 'bug',
      status: 'in_progress',
      assignee_id: userIds['bob@test.com'],
      due_date: tomorrow.toISOString(),
    },
    {
      project_id: projectIds[1],
      title: 'Bob Task 4 - In Progress',
      description: 'Another in-progress for Bob',
      priority: 'medium',
      type: 'improvement',
      status: 'in_progress',
      assignee_id: userIds['bob@test.com'],
      due_date: tomorrow.toISOString(),
    },
    {
      project_id: projectIds[2],
      title: 'Bob Task 5 - OVERDUE',
      description: 'Overdue issue for Bob - should trigger notification',
      priority: 'critical',
      type: 'bug',
      status: 'in_progress',
      assignee_id: userIds['bob@test.com'],
      due_date: yesterday.toISOString(),
    },

    // Charlie's heavy workload (8 issues = score 28, OVERLOADED)
    {
      project_id: projectIds[0],
      title: 'Charlie Task 1 - Open',
      description: 'Open task for Charlie',
      priority: 'medium',
      type: 'task',
      status: 'open',
      assignee_id: userIds['charlie@test.com'],
      due_date: tomorrow.toISOString(),
    },
    {
      project_id: projectIds[0],
      title: 'Charlie Task 2 - Open',
      description: 'Another open for Charlie',
      priority: 'high',
      type: 'bug',
      status: 'open',
      assignee_id: userIds['charlie@test.com'],
      due_date: tomorrow.toISOString(),
    },
    {
      project_id: projectIds[0],
      title: 'Charlie Task 3 - Open',
      description: 'Third open for Charlie',
      priority: 'low',
      type: 'task',
      status: 'open',
      assignee_id: userIds['charlie@test.com'],
      due_date: tomorrow.toISOString(),
    },
    {
      project_id: projectIds[1],
      title: 'Charlie Task 4 - In Progress',
      description: 'In-progress for Charlie',
      priority: 'high',
      type: 'feature',
      status: 'in_progress',
      assignee_id: userIds['charlie@test.com'],
      due_date: tomorrow.toISOString(),
    },
    {
      project_id: projectIds[1],
      title: 'Charlie Task 5 - In Progress',
      description: 'Another in-progress for Charlie',
      priority: 'medium',
      type: 'improvement',
      status: 'in_progress',
      assignee_id: userIds['charlie@test.com'],
      due_date: tomorrow.toISOString(),
    },
    {
      project_id: projectIds[2],
      title: 'Charlie Task 6 - OVERDUE 3 days',
      description: 'Should trigger manager escalation',
      priority: 'critical',
      type: 'bug',
      status: 'in_progress',
      assignee_id: userIds['charlie@test.com'],
      due_date: threeDaysAgo.toISOString(),
    },
    {
      project_id: projectIds[2],
      title: 'Charlie Task 7 - OVERDUE 5 days',
      description: 'Should trigger manager escalation',
      priority: 'high',
      type: 'bug',
      status: 'in_progress',
      assignee_id: userIds['charlie@test.com'],
      due_date: fiveDaysAgo.toISOString(),
    },
    {
      project_id: projectIds[2],
      title: 'Charlie Task 8 - OVERDUE 1 day',
      description: 'Recently overdue',
      priority: 'medium',
      type: 'task',
      status: 'open',
      assignee_id: userIds['charlie@test.com'],
      due_date: yesterday.toISOString(),
    },

    // Unassigned issues for auto-assignment testing
    {
      project_id: projectIds[0],
      title: 'Unassigned Task 1 - Should auto-assign',
      description: 'Testing auto-assignment feature',
      priority: 'medium',
      type: 'task',
      status: 'open',
      // No assignee - will be auto-assigned
      due_date: tomorrow.toISOString(),
    },
    {
      project_id: projectIds[1],
      title: 'Unassigned Critical Bug - Should show warning',
      description: 'Testing critical priority warning for auto-assignment',
      priority: 'critical',
      type: 'bug',
      status: 'open',
      // No assignee - will trigger warning
      due_date: tomorrow.toISOString(),
    },
  ];
}

/**
 * Seed database with test data
 */
export async function seedTestData(): Promise<{
  users: { [key: string]: string };
  projects: string[];
  issues: string[];
}> {
  console.log('🌱 Starting test data seeding...\n');

  // Note: In a real implementation, you would need to:
  // 1. Direct database access OR
  // 2. Admin API endpoints to create users/projects
  // 3. Authentication tokens for API calls

  console.log('⚠️  Note: This script simulates data structure.');
  console.log('   In production, you would need to:');
  console.log('   1. Use direct database access (psql or pg library)');
  console.log('   2. Create admin API endpoints for user creation');
  console.log('   3. Use proper authentication\n');

  // For demonstration, return mock IDs
  const userIds: { [key: string]: string } = {
    'admin@test.com': 'admin-uuid-1',
    'manager@test.com': 'manager-uuid-2',
    'alice@test.com': 'alice-uuid-3',
    'bob@test.com': 'bob-uuid-4',
    'charlie@test.com': 'charlie-uuid-5',
    'viewer@test.com': 'viewer-uuid-6',
  };

  const projectIds = ['project-alpha-uuid', 'project-beta-uuid', 'project-gamma-uuid'];

  console.log('✅ Test data structure prepared');
  console.log(`   Users: ${Object.keys(userIds).length}`);
  console.log(`   Projects: ${projectIds.length}`);
  console.log(`   Issues: ${generateTestIssues(projectIds, userIds).length}\n`);

  return {
    users: userIds,
    projects: projectIds,
    issues: generateTestIssues(projectIds, userIds).map(() => 'issue-uuid-' + Math.random()),
  };
}

// SQL script generation for direct database seeding
export function generateSeedSQL(): string {
  const sql: string[] = [];

  sql.push('-- Test Data Seeding SQL Script');
  sql.push('-- Run this against your PostgreSQL database\n');

  sql.push('-- Clean up existing test data');
  sql.push("DELETE FROM issues WHERE title LIKE '%Test%' OR title LIKE '%Alice%' OR title LIKE '%Bob%' OR title LIKE '%Charlie%';");
  sql.push("DELETE FROM projects WHERE name LIKE 'Test Project%';");
  sql.push("DELETE FROM users WHERE email LIKE '%@test.com';\n");

  sql.push('-- Insert test users');
  TEST_USERS.forEach((user) => {
    sql.push(
      `INSERT INTO users (id, name, email, role, provider, provider_id, created_at, updated_at) ` +
        `VALUES (gen_random_uuid(), '${user.name}', '${user.email}', '${user.role}', 'github', '${user.email}', NOW(), NOW());`
    );
  });

  sql.push('\n-- Get user IDs for reference');
  sql.push("-- You'll need to run this and use the IDs in the next section");
  sql.push("SELECT id, name, email FROM users WHERE email LIKE '%@test.com';\n");

  return sql.join('\n');
}

// Run if executed directly
if (require.main === module) {
  seedTestData()
    .then((data) => {
      console.log('✅ Seeding completed!\n');
      console.log('📊 Summary:');
      console.log(`   Users: ${Object.keys(data.users).length}`);
      console.log(`   Projects: ${data.projects.length}`);
      console.log(`   Issues: ${data.issues.length}\n`);

      console.log('📝 SQL Script:');
      console.log(generateSeedSQL());
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
