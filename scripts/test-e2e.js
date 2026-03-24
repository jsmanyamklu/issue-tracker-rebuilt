/**
 * End-to-End Test Script
 * Tests all critical functionality of the Issue Tracker application
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m',
};

let testsPassed = 0;
let testsFailed = 0;
const failedTests = [];

console.log(`${COLORS.blue}╔════════════════════════════════════════════════╗${COLORS.reset}`);
console.log(`${COLORS.blue}║   Issue Tracker - End-to-End Test Suite      ║${COLORS.reset}`);
console.log(`${COLORS.blue}╚════════════════════════════════════════════════╝${COLORS.reset}\n`);
console.log(`Testing: ${BASE_URL}\n`);

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({ statusCode: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

function pass(testName) {
  console.log(`${COLORS.green}✓${COLORS.reset} ${testName}`);
  testsPassed++;
}

function fail(testName, reason) {
  console.log(`${COLORS.red}✗${COLORS.reset} ${testName}`);
  console.log(`  ${COLORS.red}Reason: ${reason}${COLORS.reset}`);
  testsFailed++;
  failedTests.push({ test: testName, reason });
}

function section(name) {
  console.log(`\n${COLORS.yellow}▶ ${name}${COLORS.reset}`);
}

async function testHealthCheck() {
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);

    if (response.statusCode === 200) {
      pass('Health check endpoint returns 200');
    } else {
      fail('Health check endpoint', `Expected 200, got ${response.statusCode}`);
    }

    if (response.data && response.data.status) {
      pass('Health check returns status field');
    } else {
      fail('Health check response', 'Missing status field');
    }

    if (response.data && response.data.checks) {
      pass('Health check returns checks field');

      if (response.data.checks.database) {
        pass('Health check includes database check');
      } else {
        fail('Database health check', 'Missing database check');
      }

      if (response.data.checks.memory) {
        pass('Health check includes memory check');
      } else {
        fail('Memory health check', 'Missing memory check');
      }
    } else {
      fail('Health check response', 'Missing checks field');
    }
  } catch (error) {
    fail('Health check endpoint', error.message);
  }
}

async function testMetrics() {
  try {
    const response = await makeRequest(`${BASE_URL}/api/metrics`);

    if (response.statusCode === 200) {
      pass('Metrics endpoint returns 200');
    } else {
      fail('Metrics endpoint', `Expected 200, got ${response.statusCode}`);
    }

    if (response.data && response.data.database) {
      pass('Metrics includes database statistics');
    } else {
      fail('Metrics response', 'Missing database statistics');
    }

    if (response.data && response.data.system) {
      pass('Metrics includes system statistics');
    } else {
      fail('Metrics response', 'Missing system statistics');
    }
  } catch (error) {
    fail('Metrics endpoint', error.message);
  }
}

async function testSecurityHeaders() {
  try {
    const response = await makeRequest(`${BASE_URL}/`);
    const headers = response.headers;

    const securityHeaders = {
      'x-frame-options': 'DENY',
      'x-content-type-options': 'nosniff',
      'x-xss-protection': '1; mode=block',
      'referrer-policy': 'strict-origin-when-cross-origin',
    };

    for (const [header, expectedValue] of Object.entries(securityHeaders)) {
      if (headers[header]) {
        pass(`Security header: ${header}`);
      } else {
        fail(`Security header: ${header}`, 'Header not present');
      }
    }

    if (headers['content-security-policy']) {
      pass('Content-Security-Policy header present');
    } else {
      fail('Content-Security-Policy', 'Header not present');
    }

  } catch (error) {
    fail('Security headers test', error.message);
  }
}

async function testAPIEndpoints() {
  const endpoints = [
    { path: '/api/health', method: 'GET', expectedStatus: 200 },
    { path: '/api/metrics', method: 'GET', expectedStatus: 200 },
    { path: '/api/auth/csrf', method: 'GET', expectedStatus: 200 },
    { path: '/api/auth/providers', method: 'GET', expectedStatus: 200 },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
      });

      if (response.statusCode === endpoint.expectedStatus) {
        pass(`${endpoint.method} ${endpoint.path} returns ${endpoint.expectedStatus}`);
      } else {
        fail(
          `${endpoint.method} ${endpoint.path}`,
          `Expected ${endpoint.expectedStatus}, got ${response.statusCode}`
        );
      }
    } catch (error) {
      fail(`${endpoint.method} ${endpoint.path}`, error.message);
    }
  }
}

async function testPages() {
  const pages = [
    '/',
    '/auth/signin',
    '/projects',
    '/issues',
    '/dashboard',
  ];

  for (const page of pages) {
    try {
      const response = await makeRequest(`${BASE_URL}${page}`);

      // Pages might redirect to signin if not authenticated (302)
      // or return 200 if accessible
      if (response.statusCode === 200 || response.statusCode === 302 || response.statusCode === 307) {
        pass(`Page ${page} is accessible`);
      } else {
        fail(`Page ${page}`, `Expected 200/302/307, got ${response.statusCode}`);
      }
    } catch (error) {
      fail(`Page ${page}`, error.message);
    }
  }
}

async function testRateLimitHeaders() {
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);
    const headers = response.headers;

    // Rate limit headers might not be present on all endpoints
    // Just check if they exist when present
    if (headers['x-ratelimit-limit']) {
      pass('Rate limit headers present');
    } else {
      console.log(`${COLORS.yellow}ℹ${COLORS.reset} Rate limit headers not found (may not be applied to health endpoint)`);
    }
  } catch (error) {
    fail('Rate limit headers test', error.message);
  }
}

async function testDatabaseConnection() {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/issue_tracker',
    });

    await pool.query('SELECT 1');
    pass('Database connection successful');

    const result = await pool.query('SELECT COUNT(*) FROM users');
    pass(`Database query successful (${result.rows[0].count} users)`);

    await pool.end();
  } catch (error) {
    fail('Database connection', error.message);
  }
}

async function testDatabaseIndexes() {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/issue_tracker',
    });

    const result = await pool.query(`
      SELECT tablename, indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);

    const expectedIndexes = [
      'idx_users_email',
      'idx_projects_owner_id',
      'idx_issues_project_id',
      'idx_issues_assignee_id',
      'idx_issues_status',
      'idx_comments_issue_id',
    ];

    const indexNames = result.rows.map(row => row.indexname);

    for (const expectedIndex of expectedIndexes) {
      if (indexNames.includes(expectedIndex)) {
        pass(`Database index exists: ${expectedIndex}`);
      } else {
        fail(`Database index: ${expectedIndex}`, 'Index not found');
      }
    }

    await pool.end();
  } catch (error) {
    fail('Database indexes test', error.message);
  }
}

async function runAllTests() {
  section('Health & Monitoring Tests');
  await testHealthCheck();
  await testMetrics();

  section('Security Tests');
  await testSecurityHeaders();
  await testRateLimitHeaders();

  section('API Endpoint Tests');
  await testAPIEndpoints();

  section('Page Accessibility Tests');
  await testPages();

  section('Database Tests');
  await testDatabaseConnection();
  await testDatabaseIndexes();

  // Summary
  console.log(`\n${COLORS.blue}╔════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.blue}║              Test Summary                      ║${COLORS.reset}`);
  console.log(`${COLORS.blue}╚════════════════════════════════════════════════╝${COLORS.reset}\n`);

  const total = testsPassed + testsFailed;
  const successRate = ((testsPassed / total) * 100).toFixed(1);

  console.log(`Total Tests:  ${total}`);
  console.log(`${COLORS.green}Passed:       ${testsPassed}${COLORS.reset}`);
  console.log(`${COLORS.red}Failed:       ${testsFailed}${COLORS.reset}`);
  console.log(`Success Rate: ${successRate}%\n`);

  if (testsFailed > 0) {
    console.log(`${COLORS.red}Failed Tests:${COLORS.reset}`);
    failedTests.forEach(({ test, reason }) => {
      console.log(`  ${COLORS.red}✗${COLORS.reset} ${test}`);
      console.log(`    ${reason}`);
    });
    console.log('');
    process.exit(1);
  } else {
    console.log(`${COLORS.green}✨ All tests passed!${COLORS.reset}\n`);
    process.exit(0);
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error(`${COLORS.red}Fatal error:${COLORS.reset}`, error);
  process.exit(1);
});
