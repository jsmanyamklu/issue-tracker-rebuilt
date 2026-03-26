# TaskForge Automated Test Suite

Comprehensive automated testing for Phase 1-3 assignment features.

## Test Suites

### 1. API Endpoint Tests (`api-tests.ts`)
Tests all workload, assignment, and notification API endpoints.

**Tests include:**
- GET /api/workload (all workloads)
- GET /api/workload?action=summary
- GET /api/workload?action=distribution
- GET /api/workload?action=best-available
- GET /api/workload?action=overloaded
- GET /api/notifications/overdue
- GET /api/notifications/overdue?action=summary

**Run:**
```bash
npm run test:api
```

### 2. Integration Tests (`integration-tests.ts`)
Tests complete workflows and feature interactions.

**Tests include:**
- Workload calculation accuracy
- Best available user selection
- Workload distribution categories
- Workload summary consistency
- Overdue issue detection
- Overdue summary metrics
- Overloaded users detection

**Run:**
```bash
npm run test:integration
```

### 3. Test Data Generator (`seed-test-data.ts`)
Generates test data structure and SQL seeding scripts.

**Creates:**
- 6 test users (Admin, Manager, 3 Developers, Viewer)
- 3 test projects (Alpha, Beta, Gamma)
- ~20 test issues with varied workload scenarios
  - Alice: 3 issues (score 6, balanced)
  - Bob: 5 issues including 1 overdue (score 13)
  - Charlie: 8 issues including 3 overdue (score 28, overloaded)

**Run:**
```bash
npm run test:seed
```

## Running All Tests

### Prerequisites
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Ensure database is running and seeded with data**

### Execute Complete Test Suite
```bash
npm test
```

This will:
1. Check server health
2. Run API endpoint tests
3. Run integration tests
4. Generate comprehensive reports

## Test Results

After running tests, results are saved to `tests/results/`:

- **test-results.json** - Latest JSON report
- **test-results.html** - Latest HTML report (open in browser)
- **test-results-{timestamp}.json** - Timestamped JSON archives
- **test-results-{timestamp}.html** - Timestamped HTML archives

### HTML Report Features
- Overall success rate with color coding
- Total tests, passed, and failed counts
- Detailed breakdown by test suite
- Individual test results with durations
- Failed test messages and errors
- Visual status indicators

## Test Output

Console output includes:
- ✅ Passed tests (green checkmark)
- ❌ Failed tests (red X)
- Test duration in milliseconds
- Summary statistics
- Success rate percentage

## Environment Variables

Tests use the following environment variables:

```bash
# API base URL (defaults to http://localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Test Scenarios

### Workload Calculation
Tests verify the workload scoring formula:
```
score = (open_issues × 1) + (in_progress_issues × 2) + (overdue_issues × 5)
```

### Workload Categories
- **Available**: score ≤ 5 (🟢)
- **Balanced**: score 6-15 (🟡)
- **Busy**: score 16-25 (🔴)
- **Overloaded**: score > 25 (🚨)

### Manager Escalation
Tests verify issues overdue > 3 days trigger escalation.

### Best Available User
Tests verify the user with the lowest workload score is correctly identified.

## Troubleshooting

### Server Not Running
```
❌ Server is not responding
Please start the server with: npm run dev
```

**Solution:** Start the development server before running tests.

### No Data Available
```
❌ No workload data returned
```

**Solution:** Ensure database is seeded with users and issues.

### Permission Denied (403)
```
✅ Access denied (expected for non-manager)
```

**Note:** Some endpoints require manager/admin authentication. 403 errors are expected for these tests.

## CI/CD Integration

To integrate with CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    npm install
    npm run build
    npm run dev &
    sleep 10
    npm test
```

## Test Coverage

Current test coverage:

✅ **Workload Service**
- All workload calculations
- Best available selection
- Distribution categories
- Summary consistency

✅ **Notification Service**
- Overdue detection
- Escalation logic
- Summary metrics

✅ **API Endpoints**
- All workload endpoints
- All notification endpoints

⚠️ **Not Yet Covered**
- Auto-assignment workflow (requires authentication)
- Manual reassignment (requires authentication)
- Activity logging verification
- Slack notification delivery

## Future Enhancements

- [ ] Add authentication to test suite
- [ ] Test auto-assignment workflow end-to-end
- [ ] Test manual reassignment flows
- [ ] Verify activity log entries
- [ ] Mock Slack notifications
- [ ] Add performance benchmarks
- [ ] Test concurrent requests
- [ ] Add load testing

## Support

For issues or questions:
1. Check test output and HTML report
2. Review individual test messages
3. Check server logs
4. Verify database connection
5. Ensure all environment variables are set

---

**Last Updated:** March 26, 2026
**Test Suite Version:** 1.0.0
**Compatible with:** Phase 1-3 Implementation
