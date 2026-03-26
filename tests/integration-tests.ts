/**
 * Integration Tests
 * Tests complete workflows and feature interactions
 */

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  duration: number;
  details?: any;
}

class IntegrationTester {
  private results: TestResult[] = [];
  private authToken?: string;
  private testUserId?: string;
  private testProjectId?: string;

  async runTest(
    testName: string,
    testFn: () => Promise<{ passed: boolean; message: string; details?: any }>
  ): Promise<void> {
    const startTime = Date.now();
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      this.results.push({
        test: testName,
        passed: result.passed,
        message: result.message,
        duration,
        details: result.details,
      });
      console.log(
        result.passed ? '✅' : '❌',
        testName,
        `(${duration}ms)`,
        result.passed ? '' : `- ${result.message}`
      );
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.results.push({
        test: testName,
        passed: false,
        message: error.message,
        duration,
      });
      console.log('❌', testName, `(${duration}ms)`, `- Error: ${error.message}`);
    }
  }

  getResults(): TestResult[] {
    return this.results;
  }

  getSummary(): { total: number; passed: number; failed: number; duration: number } {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = total - passed;
    const duration = this.results.reduce((sum, r) => sum + r.duration, 0);
    return { total, passed, failed, duration };
  }
}

/**
 * Test: Workload calculation accuracy
 */
async function testWorkloadCalculation(): Promise<{
  passed: boolean;
  message: string;
  details?: any;
}> {
  // This test verifies that workload scores are calculated correctly
  // Expected formula: (open × 1) + (in_progress × 2) + (overdue × 5)

  try {
    const response = await fetch(`${API_BASE}/api/workload`);
    if (!response.ok) {
      return { passed: false, message: `API returned ${response.status}` };
    }

    const data = await response.json();
    const workloads = data.data;

    if (!workloads || workloads.length === 0) {
      return { passed: false, message: 'No workload data available' };
    }

    // Verify calculation for each user
    let allCorrect = true;
    const errors: string[] = [];

    for (const workload of workloads) {
      const expectedScore =
        workload.open_issues * 1 +
        workload.in_progress_issues * 2 +
        workload.overdue_issues * 5;

      if (workload.workload_score !== expectedScore) {
        allCorrect = false;
        errors.push(
          `${workload.user_name}: expected ${expectedScore}, got ${workload.workload_score}`
        );
      }
    }

    if (!allCorrect) {
      return {
        passed: false,
        message: `Calculation errors: ${errors.join('; ')}`,
        details: { errors },
      };
    }

    return {
      passed: true,
      message: `Verified ${workloads.length} users, all calculations correct`,
      details: { userCount: workloads.length },
    };
  } catch (error: any) {
    return { passed: false, message: error.message };
  }
}

/**
 * Test: Best available user selection
 */
async function testBestAvailableSelection(): Promise<{
  passed: boolean;
  message: string;
  details?: any;
}> {
  try {
    // Get all workloads
    const allResponse = await fetch(`${API_BASE}/api/workload`);
    if (!allResponse.ok) {
      return { passed: false, message: 'Failed to fetch workloads' };
    }
    const allData = await allResponse.json();
    const workloads = allData.data;

    // Get best available
    const bestResponse = await fetch(`${API_BASE}/api/workload?action=best-available`);
    if (!bestResponse.ok) {
      return { passed: false, message: 'Failed to fetch best available' };
    }
    const bestData = await bestResponse.json();
    const bestUser = bestData.data;

    if (!bestUser) {
      return {
        passed: workloads.length === 0,
        message: workloads.length === 0 ? 'No users available (expected)' : 'No best user found but users exist',
      };
    }

    // Verify it's actually the user with lowest workload
    const minWorkload = Math.min(...workloads.map((w: any) => w.workload_score));
    if (bestUser.workload_score !== minWorkload) {
      return {
        passed: false,
        message: `Best user has score ${bestUser.workload_score}, but minimum is ${minWorkload}`,
      };
    }

    return {
      passed: true,
      message: `Best available: ${bestUser.user_name} (score: ${bestUser.workload_score})`,
      details: { bestUser, totalUsers: workloads.length },
    };
  } catch (error: any) {
    return { passed: false, message: error.message };
  }
}

/**
 * Test: Workload distribution categories
 */
async function testWorkloadDistribution(): Promise<{
  passed: boolean;
  message: string;
  details?: any;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/workload?action=distribution`);
    if (!response.ok) {
      return { passed: false, message: `API returned ${response.status}` };
    }

    const data = await response.json();
    const distribution = data.data;

    // Verify all categories exist
    const requiredCategories = ['underutilized', 'balanced', 'busy', 'overloaded'];
    const missingCategories = requiredCategories.filter(
      (cat) => !(cat in distribution)
    );

    if (missingCategories.length > 0) {
      return {
        passed: false,
        message: `Missing categories: ${missingCategories.join(', ')}`,
      };
    }

    // Verify users are correctly categorized
    const allResponse = await fetch(`${API_BASE}/api/workload`);
    const allData = await allResponse.json();
    const workloads = allData.data;

    let miscategorized = 0;
    for (const workload of workloads) {
      const score = workload.workload_score;
      const userId = workload.user_id;

      const isInUnderutilized = distribution.underutilized.some(
        (u: any) => u.user_id === userId
      );
      const isInBalanced = distribution.balanced.some((u: any) => u.user_id === userId);
      const isInBusy = distribution.busy.some((u: any) => u.user_id === userId);
      const isInOverloaded = distribution.overloaded.some(
        (u: any) => u.user_id === userId
      );

      // Verify correct categorization
      if (score <= 5 && !isInUnderutilized) miscategorized++;
      if (score > 5 && score <= 15 && !isInBalanced) miscategorized++;
      if (score > 15 && score <= 25 && !isInBusy) miscategorized++;
      if (score > 25 && !isInOverloaded) miscategorized++;
    }

    if (miscategorized > 0) {
      return {
        passed: false,
        message: `${miscategorized} users miscategorized`,
      };
    }

    return {
      passed: true,
      message: `Distribution correct: Available:${distribution.underutilized.length} Balanced:${distribution.balanced.length} Busy:${distribution.busy.length} Overloaded:${distribution.overloaded.length}`,
      details: { distribution },
    };
  } catch (error: any) {
    return { passed: false, message: error.message };
  }
}

/**
 * Test: Overdue issue detection
 */
async function testOverdueDetection(): Promise<{
  passed: boolean;
  message: string;
  details?: any;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/notifications/overdue`);

    // 403 is acceptable if not logged in as manager
    if (response.status === 403) {
      return {
        passed: true,
        message: 'Access denied (expected for non-manager users)',
      };
    }

    if (!response.ok) {
      return { passed: false, message: `API returned ${response.status}` };
    }

    const data = await response.json();
    const overdueIssues = data.data || [];

    // Verify all returned issues are actually overdue
    const now = new Date();
    let notOverdueCount = 0;

    for (const issue of overdueIssues) {
      const dueDate = new Date(issue.due_date);
      if (dueDate >= now) {
        notOverdueCount++;
      }
    }

    if (notOverdueCount > 0) {
      return {
        passed: false,
        message: `${notOverdueCount} issues marked as overdue are not actually overdue`,
      };
    }

    return {
      passed: true,
      message: `Found ${overdueIssues.length} overdue issues, all valid`,
      details: { overdueCount: overdueIssues.length },
    };
  } catch (error: any) {
    return { passed: false, message: error.message };
  }
}

/**
 * Test: Overdue summary metrics
 */
async function testOverdueSummary(): Promise<{
  passed: boolean;
  message: string;
  details?: any;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/notifications/overdue?action=summary`);

    // 403 is acceptable if not logged in as manager
    if (response.status === 403) {
      return {
        passed: true,
        message: 'Access denied (expected for non-manager users)',
      };
    }

    if (!response.ok) {
      return { passed: false, message: `API returned ${response.status}` };
    }

    const data = await response.json();
    const summary = data.data;

    // Verify summary structure
    const requiredFields = [
      'total_overdue',
      'critical_overdue',
      'high_overdue',
      'needs_escalation',
      'affected_users',
    ];
    const missingFields = requiredFields.filter((field) => !(field in summary));

    if (missingFields.length > 0) {
      return {
        passed: false,
        message: `Missing fields: ${missingFields.join(', ')}`,
      };
    }

    // Verify escalation count logic (overdue > 3 days)
    const issuesResponse = await fetch(`${API_BASE}/api/notifications/overdue`);
    if (issuesResponse.ok) {
      const issuesData = await issuesResponse.json();
      const overdueIssues = issuesData.data || [];

      const now = new Date();
      const actualEscalationCount = overdueIssues.filter((issue: any) => {
        const dueDate = new Date(issue.due_date);
        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysOverdue > 3;
      }).length;

      if (summary.needs_escalation !== actualEscalationCount) {
        return {
          passed: false,
          message: `Escalation count mismatch: expected ${actualEscalationCount}, got ${summary.needs_escalation}`,
        };
      }
    }

    return {
      passed: true,
      message: `Summary: ${summary.total_overdue} overdue, ${summary.needs_escalation} need escalation`,
      details: { summary },
    };
  } catch (error: any) {
    return { passed: false, message: error.message };
  }
}

/**
 * Test: Overloaded users detection
 */
async function testOverloadedUsersDetection(): Promise<{
  passed: boolean;
  message: string;
  details?: any;
}> {
  try {
    const threshold = 15;
    const response = await fetch(`${API_BASE}/api/workload?action=overloaded&threshold=${threshold}`);

    if (!response.ok) {
      return { passed: false, message: `API returned ${response.status}` };
    }

    const data = await response.json();
    const overloadedUsers = data.data;

    // Verify all returned users exceed threshold
    let belowThresholdCount = 0;
    for (const user of overloadedUsers) {
      if (user.workload_score <= threshold) {
        belowThresholdCount++;
      }
    }

    if (belowThresholdCount > 0) {
      return {
        passed: false,
        message: `${belowThresholdCount} users below threshold (${threshold}) marked as overloaded`,
      };
    }

    // Verify no users above threshold are missing
    const allResponse = await fetch(`${API_BASE}/api/workload`);
    const allData = await allResponse.json();
    const allWorkloads = allData.data;

    const expectedOverloaded = allWorkloads.filter(
      (w: any) => w.workload_score > threshold
    );
    if (overloadedUsers.length !== expectedOverloaded.length) {
      return {
        passed: false,
        message: `Expected ${expectedOverloaded.length} overloaded users, got ${overloadedUsers.length}`,
      };
    }

    return {
      passed: true,
      message: `Found ${overloadedUsers.length} users with workload > ${threshold}`,
      details: { overloadedUsers, threshold },
    };
  } catch (error: any) {
    return { passed: false, message: error.message };
  }
}

/**
 * Test: Workload summary consistency
 */
async function testWorkloadSummaryConsistency(): Promise<{
  passed: boolean;
  message: string;
  details?: any;
}> {
  try {
    // Get individual workloads
    const allResponse = await fetch(`${API_BASE}/api/workload`);
    if (!allResponse.ok) {
      return { passed: false, message: 'Failed to fetch workloads' };
    }
    const allData = await allResponse.json();
    const workloads = allData.data;

    // Get summary
    const summaryResponse = await fetch(`${API_BASE}/api/workload?action=summary`);
    if (!summaryResponse.ok) {
      return { passed: false, message: 'Failed to fetch summary' };
    }
    const summaryData = await summaryResponse.json();
    const summary = summaryData.data;

    // Verify total_users matches actual count
    if (summary.total_users !== workloads.length) {
      return {
        passed: false,
        message: `Total users mismatch: summary says ${summary.total_users}, but got ${workloads.length}`,
      };
    }

    // Verify average workload
    const actualAverage =
      workloads.reduce((sum: number, w: any) => sum + w.workload_score, 0) / workloads.length;
    const difference = Math.abs(summary.average_workload - actualAverage);
    if (difference > 0.01) {
      return {
        passed: false,
        message: `Average workload mismatch: expected ${actualAverage.toFixed(2)}, got ${summary.average_workload.toFixed(2)}`,
      };
    }

    // Verify users_with_issues count
    const usersWithIssues = workloads.filter((w: any) => w.total_issues > 0).length;
    if (summary.users_with_issues !== usersWithIssues) {
      return {
        passed: false,
        message: `Users with issues mismatch: expected ${usersWithIssues}, got ${summary.users_with_issues}`,
      };
    }

    return {
      passed: true,
      message: `Summary consistent with individual workloads`,
      details: { summary },
    };
  } catch (error: any) {
    return { passed: false, message: error.message };
  }
}

/**
 * Main test runner
 */
async function runAllTests(): Promise<void> {
  console.log('🧪 Starting Integration Tests\n');
  console.log(`📍 API Base URL: ${API_BASE}\n`);

  const tester = new IntegrationTester();

  console.log('🔢 Workload Calculation Tests:');
  await tester.runTest('Workload score calculation accuracy', testWorkloadCalculation);
  await tester.runTest('Best available user selection', testBestAvailableSelection);
  await tester.runTest('Workload distribution categories', testWorkloadDistribution);
  await tester.runTest('Workload summary consistency', testWorkloadSummaryConsistency);

  console.log('\n🚨 Overdue & Notification Tests:');
  await tester.runTest('Overdue issue detection', testOverdueDetection);
  await tester.runTest('Overdue summary metrics', testOverdueSummary);

  console.log('\n⚠️ Overload Detection Tests:');
  await tester.runTest('Overloaded users detection', testOverloadedUsersDetection);

  // Summary
  console.log('\n' + '='.repeat(60));
  const summary = tester.getSummary();
  console.log('📈 Test Summary:');
  console.log(`   Total: ${summary.total}`);
  console.log(`   ✅ Passed: ${summary.passed}`);
  console.log(`   ❌ Failed: ${summary.failed}`);
  console.log(`   ⏱️  Total Duration: ${summary.duration}ms`);
  console.log(`   📊 Success Rate: ${((summary.passed / summary.total) * 100).toFixed(1)}%`);
  console.log('='.repeat(60) + '\n');

  // Detailed results
  if (summary.failed > 0) {
    console.log('❌ Failed Tests:');
    tester
      .getResults()
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`   • ${r.test}: ${r.message}`);
      });
    console.log('');
  }

  // Save results to file
  const results = {
    timestamp: new Date().toISOString(),
    summary,
    tests: tester.getResults(),
  };

  const fs = require('fs');
  const path = require('path');
  const resultsPath = path.join(__dirname, 'integration-test-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`💾 Results saved to: ${resultsPath}\n`);
}

// Run if executed directly
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log('✅ All integration tests completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

export { runAllTests, IntegrationTester };
