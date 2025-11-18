# Integration Test Suite

This directory contains integration tests for the n8n-nodes-directus package.

## Prerequisites

### 1. Test Directus Instance

You need a running Directus instance for integration testing. You can set one up using Docker:

```bash
docker run -d \
  --name directus-test \
  -p 8055:8055 \
  -e KEY=test-key \
  -e SECRET=test-secret \
  -e DB_CLIENT=sqlite3 \
  -e DB_FILENAME=/directus/database/test.db \
  -e ADMIN_EMAIL=admin@example.com \
  -e ADMIN_PASSWORD=admin123 \
  directus/directus:latest
```

### 2. Load Test Data

Load the test fixtures into your Directus instance:

```bash
# Option 1: Using psql (for PostgreSQL)
psql -h localhost -U directus -d directus_test < test/fixtures/test-data.sql

# Option 2: Using Directus API/CLI
# Follow instructions in test/fixtures/test-data.sql
```

### 3. Configure Environment

Create a `.env.test` file in the project root:

```env
# Directus instance configuration
TEST_DIRECTUS_URL=http://localhost:8055
TEST_DIRECTUS_TOKEN=your-admin-token-here
TEST_DIRECTUS_EMAIL=admin@example.com
TEST_DIRECTUS_PASSWORD=admin123

# Test data IDs (populated after loading fixtures)
TEST_FLOW_ID=test-flow-webhook
TEST_USER_ID=test-user-1
TEST_ROLE_ID=test-role-editor
TEST_PRESET_ID=test-preset-1
```

## Running Tests

### Install Dependencies

```bash
npm install
npm install --save-dev jest @types/jest ts-jest dotenv
```

### Run All Integration Tests

```bash
npm run test:integration
```

### Run Specific Test Suite

```bash
npm run test:integration -- flow-operations
npm run test:integration -- activity-logs
```

### Run with Coverage

```bash
npm run test:coverage
```

### Watch Mode

```bash
npm run test:watch
```

## Test Structure

```
test/
├── README.md                         # This file
├── setup.ts                          # Test environment setup
├── fixtures/
│   └── test-data.sql                # Test database fixtures
└── integration/
    ├── flow-operations.test.ts      # Flow trigger, chain, loop tests
    ├── activity-logs.test.ts        # Activity and revision tests
    ├── user-management.test.ts      # User CRUD and bulk ops tests (TODO)
    ├── presets.test.ts              # Preset operations tests (TODO)
    └── agent-tools.test.ts          # AI agent tool tests (TODO)
```

## Writing Tests

### Basic Test Structure

```typescript
import { TEST_CONFIG, setupTests, teardownTests } from '../setup';

describe('My Feature', () => {
	beforeAll(async () => {
		await setupTests();
	});

	afterAll(async () => {
		await teardownTests();
	});

	it('should do something', async () => {
		// Your test code here
	});
});
```

### Using Retry Helper

For flaky tests or operations that may take time:

```typescript
import { retry, wait } from '../setup';

it('should eventually succeed', async () => {
	const result = await retry(async () => {
		// Operation that might fail initially
		return await someOperation();
	});

	expect(result).toBeDefined();
});
```

### Accessing Test Configuration

```typescript
import { TEST_CONFIG } from '../setup';

// Use test configuration
const flowId = TEST_CONFIG.testFlowId;
const url = TEST_CONFIG.directusUrl;
```

## Test Coverage Goals

- **Overall Coverage**: >80%
- **Critical Paths**: 100%
  - Flow trigger and monitoring
  - User authentication
  - Error handling
- **Edge Cases**: >70%

## Continuous Integration

The test suite is designed to run in CI/CD pipelines. Ensure your CI environment:

1. Has a Directus test instance available
2. Loads test fixtures before running tests
3. Sets environment variables from secrets
4. Fails the build on test failures

### GitHub Actions Example

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      directus:
        image: directus/directus:latest
        ports:
          - 8055:8055
        env:
          KEY: test-key
          SECRET: test-secret
          DB_CLIENT: sqlite3
          ADMIN_EMAIL: admin@example.com
          ADMIN_PASSWORD: admin123

    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Load test fixtures
        run: # Load fixtures command
      - name: Run integration tests
        env:
          TEST_DIRECTUS_URL: http://localhost:8055
          TEST_DIRECTUS_TOKEN: ${{ secrets.TEST_TOKEN }}
        run: npm run test:integration
```

## Troubleshooting

### Tests Fail to Connect to Directus

- Verify Directus is running: `curl http://localhost:8055/server/info`
- Check `.env.test` configuration
- Ensure network connectivity

### Test Data Not Found

- Verify test fixtures were loaded
- Check test data IDs in `.env.test` match actual IDs
- Review `test/fixtures/test-data.sql` for any errors

### Timeouts

- Increase timeout in `test/setup.ts`: `TEST_CONFIG.defaultTimeout`
- Check Directus instance performance
- Use retry helper for flaky operations

### Permission Errors

- Verify test token has admin permissions
- Check role permissions in Directus
- Ensure test user has necessary access

## Future Enhancements

- [ ] Add user management tests
- [ ] Add preset operation tests
- [ ] Add AI agent tool tests
- [ ] Implement end-to-end workflow tests
- [ ] Add performance benchmarks
- [ ] Create visual regression tests
- [ ] Add API mocking for unit tests
- [ ] Implement test data factories

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Add necessary fixtures
4. Document any special setup requirements
5. Ensure tests are idempotent
6. Clean up test data after tests
7. Update this README if needed

## Resources

- [n8n Node Development](https://docs.n8n.io/integrations/creating-nodes/)
- [Directus API Documentation](https://docs.directus.io/reference/introduction/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/testing.html)
