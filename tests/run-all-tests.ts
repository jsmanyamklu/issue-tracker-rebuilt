/**
 * Master Test Runner
 * Orchestrates all tests and generates comprehensive reports
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);
const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface TestSuite {
  name: string;
  file: string;
  results?: any;
}

interface MasterTestResults {
  timestamp: string;
  duration: number;
  server_available: boolean;
  suites: TestSuite[];
  overall: {
    total_tests: number;
    passed: number;
    failed: number;
    success_rate: number;
  };
}

class MasterTestRunner {
  private results: MasterTestResults = {
    timestamp: new Date().toISOString(),
    duration: 0,
    server_available: false,
    suites: [],
    overall: {
      total_tests: 0,
      passed: 0,
      failed: 0,
      success_rate: 0,
    },
  };

  private startTime: number = 0;

  /**
   * Check if the Next.js server is running
   */
  async checkServerHealth(): Promise<boolean> {
    console.log('🔍 Checking server availability...');
    try {
      const response = await fetch(`${API_BASE}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        console.log('✅ Server is running and healthy\n');
        return true;
      }

      console.log('⚠️  Server responded but may have issues\n');
      return false;
    } catch (error) {
      console.log('❌ Server is not responding');
      console.log('   Please start the server with: npm run dev\n');
      return false;
    }
  }

  /**
   * Run a single test suite
   */
  async runTestSuite(suite: TestSuite): Promise<void> {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 Running: ${suite.name}`);
    console.log('='.repeat(60));

    try {
      // Use ts-node to run TypeScript files directly
      const command = `npx ts-node "${suite.file}"`;
      const { stdout, stderr } = await execAsync(command, {
        cwd: path.dirname(suite.file),
        env: { ...process.env, NEXT_PUBLIC_APP_URL: API_BASE },
      });

      console.log(stdout);
      if (stderr) {
        console.error('Warnings/Errors:', stderr);
      }

      // Read the results file
      const resultsFile = suite.file.replace('.ts', '-results.json');
      if (fs.existsSync(resultsFile)) {
        const resultsContent = fs.readFileSync(resultsFile, 'utf-8');
        suite.results = JSON.parse(resultsContent);

        // Update overall stats
        if (suite.results.summary) {
          this.results.overall.total_tests += suite.results.summary.total;
          this.results.overall.passed += suite.results.summary.passed;
          this.results.overall.failed += suite.results.summary.failed;
        }
      }

      console.log(`✅ ${suite.name} completed`);
    } catch (error: any) {
      console.error(`❌ ${suite.name} failed:`, error.message);
      suite.results = {
        error: error.message,
        summary: { total: 0, passed: 0, failed: 1 },
      };
      this.results.overall.failed += 1;
    }
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport(): string {
    const successRate =
      this.results.overall.total_tests > 0
        ? ((this.results.overall.passed / this.results.overall.total_tests) * 100).toFixed(1)
        : '0.0';

    const statusColor =
      Number(successRate) >= 90 ? '#10b981' : Number(successRate) >= 70 ? '#f59e0b' : '#ef4444';

    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TaskForge Test Report - ${this.results.timestamp}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f3f4f6;
      padding: 2rem;
      color: #1f2937;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header {
      background: white;
      padding: 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    .header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: #111827;
    }
    .header .meta {
      color: #6b7280;
      font-size: 0.875rem;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .summary-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .summary-card .label {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }
    .summary-card .value {
      font-size: 2rem;
      font-weight: bold;
      color: #111827;
    }
    .success-rate {
      background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%);
      color: white;
    }
    .success-rate .value { color: white; }
    .success-rate .label { color: rgba(255,255,255,0.9); }
    .suite {
      background: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 1rem;
    }
    .suite-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .suite-header h2 {
      font-size: 1.25rem;
      color: #111827;
    }
    .suite-stats {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
    }
    .stat-passed { color: #10b981; font-weight: 600; }
    .stat-failed { color: #ef4444; font-weight: 600; }
    .test-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .test-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 0.375rem;
      border-left: 3px solid transparent;
    }
    .test-item.passed {
      border-left-color: #10b981;
    }
    .test-item.failed {
      border-left-color: #ef4444;
      background: #fef2f2;
    }
    .test-name {
      flex: 1;
      font-weight: 500;
    }
    .test-duration {
      color: #6b7280;
      font-size: 0.875rem;
      margin-right: 1rem;
    }
    .test-status {
      font-weight: 600;
    }
    .test-status.passed { color: #10b981; }
    .test-status.failed { color: #ef4444; }
    .test-message {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }
    .test-message.error { color: #dc2626; }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 0.875rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TaskForge Test Report</h1>
      <div class="meta">
        Generated: ${new Date(this.results.timestamp).toLocaleString()} |
        Duration: ${(this.results.duration / 1000).toFixed(2)}s |
        Server: ${this.results.server_available ? '✅ Available' : '❌ Unavailable'}
      </div>
    </div>

    <div class="summary">
      <div class="summary-card success-rate">
        <div class="label">Success Rate</div>
        <div class="value">${successRate}%</div>
      </div>
      <div class="summary-card">
        <div class="label">Total Tests</div>
        <div class="value">${this.results.overall.total_tests}</div>
      </div>
      <div class="summary-card">
        <div class="label">Passed</div>
        <div class="value" style="color: #10b981;">${this.results.overall.passed}</div>
      </div>
      <div class="summary-card">
        <div class="label">Failed</div>
        <div class="value" style="color: #ef4444;">${this.results.overall.failed}</div>
      </div>
    </div>
`;

    // Add test suite details
    for (const suite of this.results.suites) {
      if (!suite.results) continue;

      const summary = suite.results.summary || { total: 0, passed: 0, failed: 0 };
      const tests = suite.results.tests || [];

      html += `
    <div class="suite">
      <div class="suite-header">
        <h2>${suite.name}</h2>
        <div class="suite-stats">
          <span class="stat-passed">✅ ${summary.passed} passed</span>
          <span class="stat-failed">❌ ${summary.failed} failed</span>
        </div>
      </div>
      <div class="test-list">
`;

      for (const test of tests) {
        const statusClass = test.passed ? 'passed' : 'failed';
        const statusText = test.passed ? '✅ PASS' : '❌ FAIL';

        html += `
        <div class="test-item ${statusClass}">
          <div style="flex: 1;">
            <div class="test-name">${test.test}</div>
            ${!test.passed ? `<div class="test-message error">${test.message}</div>` : test.message ? `<div class="test-message">${test.message}</div>` : ''}
          </div>
          <span class="test-duration">${test.duration}ms</span>
          <span class="test-status ${statusClass}">${statusText}</span>
        </div>
`;
      }

      html += `
      </div>
    </div>
`;
    }

    html += `
    <div class="footer">
      <p>TaskForge Issue Tracker - Automated Test Suite</p>
      <p>Phase 1-3 Implementation Testing</p>
    </div>
  </div>
</body>
</html>
`;

    return html;
  }

  /**
   * Save test results
   */
  async saveResults(): Promise<void> {
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    // Calculate overall success rate
    if (this.results.overall.total_tests > 0) {
      this.results.overall.success_rate =
        (this.results.overall.passed / this.results.overall.total_tests) * 100;
    }

    // Save JSON report
    const jsonPath = path.join(resultsDir, 'test-results.json');
    fs.writeFileSync(jsonPath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 JSON Report: ${jsonPath}`);

    // Save HTML report
    const htmlPath = path.join(resultsDir, 'test-results.html');
    const htmlContent = this.generateHTMLReport();
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`📄 HTML Report: ${htmlPath}`);

    // Also save timestamped copies
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const timestampedJsonPath = path.join(resultsDir, `test-results-${timestamp}.json`);
    const timestampedHtmlPath = path.join(resultsDir, `test-results-${timestamp}.html`);

    fs.writeFileSync(timestampedJsonPath, JSON.stringify(this.results, null, 2));
    fs.writeFileSync(timestampedHtmlPath, htmlContent);
  }

  /**
   * Run all test suites
   */
  async runAll(): Promise<void> {
    this.startTime = Date.now();

    console.log('🚀 TaskForge Automated Test Suite');
    console.log('='.repeat(60));
    console.log(`📍 API Base: ${API_BASE}`);
    console.log(`🕐 Started: ${new Date().toLocaleString()}`);
    console.log('='.repeat(60));

    // Check server health
    this.results.server_available = await this.checkServerHealth();

    if (!this.results.server_available) {
      console.log('⚠️  WARNING: Server is not available!');
      console.log('   Tests may fail. Please start the server and try again.\n');
      console.log('   Start server: npm run dev\n');

      // Give user option to continue
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const continueAnyway = await new Promise<boolean>((resolve) => {
        readline.question('Continue anyway? (y/N): ', (answer: string) => {
          readline.close();
          resolve(answer.toLowerCase() === 'y');
        });
      });

      if (!continueAnyway) {
        console.log('❌ Tests cancelled by user');
        process.exit(1);
      }
    }

    // Define test suites
    this.results.suites = [
      {
        name: 'API Endpoint Tests',
        file: path.join(__dirname, 'api-tests.ts'),
      },
      {
        name: 'Integration Tests',
        file: path.join(__dirname, 'integration-tests.ts'),
      },
    ];

    // Run each test suite
    for (const suite of this.results.suites) {
      await this.runTestSuite(suite);
    }

    // Calculate duration
    this.results.duration = Date.now() - this.startTime;

    // Print overall summary
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 OVERALL TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`⏱️  Total Duration: ${(this.results.duration / 1000).toFixed(2)}s`);
    console.log(`📦 Test Suites: ${this.results.suites.length}`);
    console.log(`🧪 Total Tests: ${this.results.overall.total_tests}`);
    console.log(`✅ Passed: ${this.results.overall.passed}`);
    console.log(`❌ Failed: ${this.results.overall.failed}`);

    if (this.results.overall.total_tests > 0) {
      const successRate = (
        (this.results.overall.passed / this.results.overall.total_tests) *
        100
      ).toFixed(1);
      console.log(`📈 Success Rate: ${successRate}%`);

      if (Number(successRate) >= 90) {
        console.log('\n🎉 Excellent! All major features working correctly.');
      } else if (Number(successRate) >= 70) {
        console.log('\n⚠️  Some tests failed. Review the report for details.');
      } else {
        console.log('\n❌ Multiple test failures detected. Immediate attention required.');
      }
    }

    console.log('='.repeat(60));

    // Save results
    await this.saveResults();

    console.log('\n✅ Test run completed!\n');

    // Exit with appropriate code
    process.exit(this.results.overall.failed > 0 ? 1 : 0);
  }
}

// Main execution
if (require.main === module) {
  const runner = new MasterTestRunner();
  runner.runAll().catch((error) => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

export { MasterTestRunner };
