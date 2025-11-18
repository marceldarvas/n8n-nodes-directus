# Task 028: Setup Integration Testing Environment with Real Directus

## Priority: MEDIUM
**Effort**: 3-4 hours
**Developer**: DevOps/Backend specialist
**Phase**: 7 - Testing (Optional Enhancement)

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- Task 027: Unit tests implemented (mocked)

## Description

Set up a complete integration testing environment with a real Directus instance to verify that the n8n-nodes-directus package works correctly with actual Directus API calls (not mocks).

**Note**: This is **supplementary** to Task 027 (unit tests). Unit tests verify logic, integration tests verify API compatibility.

## Why Integration Tests Matter

**Unit tests (Task 027):**
- ✅ Fast execution (<30s)
- ✅ No external dependencies
- ✅ Test logic and error handling
- ❌ Don't verify actual Directus API responses
- ❌ Can't catch API changes
- ❌ Don't test real network conditions

**Integration tests (This task):**
- ✅ Verify actual Directus API works
- ✅ Catch API version incompatibilities
- ✅ Test real authentication
- ✅ Verify data flows end-to-end
- ❌ Slower execution (~2-5 minutes)
- ❌ Requires Directus instance
- ❌ More complex setup

## Implementation Steps

### 1. Docker Compose Setup (1 hour)

**File**: `docker-compose.test.yml`

```yaml
version: '3.8'

services:
  directus-test:
    image: directus/directus:latest
    ports:
      - "8055:8055"
    environment:
      KEY: test-directus-key-1234567890
      SECRET: test-directus-secret-abcdefgh

      # Database - SQLite for fast test setup
      DB_CLIENT: sqlite3
      DB_FILENAME: /directus/database/test.db

      # Admin user
      ADMIN_EMAIL: admin@test.example.com
      ADMIN_PASSWORD: TestAdmin123!

      # Test token (create via bootstrap)
      # ADMIN_TOKEN: test-static-token-12345

      # Disable HTTPS requirement for local testing
      PUBLIC_URL: http://localhost:8055

      # Enable CORS for n8n
      CORS_ENABLED: true
      CORS_ORIGIN: "*"

    volumes:
      - directus-test-db:/directus/database
      - directus-test-uploads:/directus/uploads
      - ./test/fixtures/directus-schema.json:/directus/schema.json
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8055/server/info"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

volumes:
  directus-test-db:
  directus-test-uploads:
```

### 2. Test Fixtures and Schema (1 hour)

**File**: `test/fixtures/directus-schema.json`

```json
{
  "version": 1,
  "directus": "10.0.0",
  "collections": [
    {
      "collection": "test_articles",
      "meta": {
        "icon": "article",
        "note": "Test articles for integration tests"
      },
      "schema": {
        "name": "test_articles"
      },
      "fields": [
        {
          "field": "id",
          "type": "uuid",
          "schema": { "is_primary_key": true }
        },
        {
          "field": "status",
          "type": "string",
          "schema": { "default_value": "draft" }
        },
        {
          "field": "title",
          "type": "string"
        },
        {
          "field": "content",
          "type": "text"
        },
        {
          "field": "author",
          "type": "uuid"
        },
        {
          "field": "date_created",
          "type": "timestamp"
        }
      ]
    }
  ],
  "flows": [
    {
      "id": "test-flow-webhook",
      "name": "Test Webhook Flow",
      "status": "active",
      "trigger": "webhook",
      "options": {
        "method": "POST",
        "async": false
      },
      "operations": [
        {
          "name": "Log Payload",
          "type": "log",
          "options": {
            "message": "Webhook received: {{$trigger.body}}"
          }
        }
      ]
    }
  ]
}
```

**File**: `test/fixtures/test-data.sql` (Enhanced)

```sql
-- Load test roles
INSERT INTO directus_roles (id, name, icon, description) VALUES
  ('test-role-admin', 'Test Administrator', 'admin_panel_settings', 'Test admin role'),
  ('test-role-editor', 'Test Editor', 'edit', 'Test editor role'),
  ('test-role-viewer', 'Test Viewer', 'visibility', 'Test viewer role');

-- Load test users
INSERT INTO directus_users (id, email, password, status, role) VALUES
  ('test-user-1', 'testuser1@example.com', '$argon2id$v=19$m=65536,t=3,p=4$...', 'active', 'test-role-editor'),
  ('test-user-2', 'testuser2@example.com', '$argon2id$v=19$m=65536,t=3,p=4$...', 'active', 'test-role-viewer');

-- Load test articles
INSERT INTO test_articles (id, status, title, content, author) VALUES
  ('article-1', 'published', 'Test Article 1', 'Content 1', 'test-user-1'),
  ('article-2', 'draft', 'Test Article 2', 'Content 2', 'test-user-1'),
  ('article-3', 'published', 'Test Article 3', 'Content 3', 'test-user-2');

-- Create test presets
INSERT INTO directus_presets (id, bookmark, collection, filter) VALUES
  ('preset-published', 'Published Articles', 'test_articles', '{"status":{"_eq":"published"}}'),
  ('preset-drafts', 'Draft Articles', 'test_articles', '{"status":{"_eq":"draft"}}');
```

### 3. Test Environment Scripts (0.5 hours)

**File**: `test/scripts/start-test-env.sh`

```bash
#!/bin/bash

echo "🚀 Starting Directus test environment..."

# Start Docker Compose
docker-compose -f docker-compose.test.yml up -d

# Wait for Directus to be healthy
echo "⏳ Waiting for Directus to be ready..."
timeout=60
elapsed=0
until docker-compose -f docker-compose.test.yml exec -T directus-test wget -q -O- http://localhost:8055/server/info > /dev/null 2>&1; do
    if [ $elapsed -ge $timeout ]; then
        echo "❌ Timeout waiting for Directus to start"
        exit 1
    fi
    echo "   Still waiting... (${elapsed}s)"
    sleep 5
    elapsed=$((elapsed + 5))
done

echo "✅ Directus is ready!"

# Get admin token
echo "🔑 Getting admin token..."
TOKEN=$(docker-compose -f docker-compose.test.yml exec -T directus-test \
    wget -qO- --post-data='{"email":"admin@test.example.com","password":"TestAdmin123!"}' \
    --header='Content-Type: application/json' \
    http://localhost:8055/auth/login | jq -r '.data.access_token')

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to get admin token"
    exit 1
fi

# Save token to .env.test
echo "TEST_DIRECTUS_URL=http://localhost:8055" > .env.test
echo "TEST_DIRECTUS_TOKEN=$TOKEN" >> .env.test
echo "TEST_DIRECTUS_EMAIL=admin@test.example.com" >> .env.test
echo "TEST_DIRECTUS_PASSWORD=TestAdmin123!" >> .env.test

echo "✅ Token saved to .env.test"

# Load test data
echo "📦 Loading test fixtures..."
docker-compose -f docker-compose.test.yml exec -T directus-test \
    sqlite3 /directus/database/test.db < test/fixtures/test-data.sql

echo "✅ Test environment ready!"
echo ""
echo "Environment details:"
echo "  URL: http://localhost:8055"
echo "  Email: admin@test.example.com"
echo "  Password: TestAdmin123!"
echo "  Token: $TOKEN"
echo ""
echo "Run tests with: npm run test:integration"
```

**File**: `test/scripts/stop-test-env.sh`

```bash
#!/bin/bash
echo "🛑 Stopping Directus test environment..."
docker-compose -f docker-compose.test.yml down -v
rm -f .env.test
echo "✅ Test environment stopped"
```

### 4. Integration Test Implementation (1 hour)

**File**: `test/integration-real/flow-operations.integration.ts`

```typescript
import { directusApiRequest, triggerFlow } from '../../nodes/Directus/GenericFunctions';
import { TEST_CONFIG } from '../setup';

describe('Flow Operations Integration (Real Directus)', () => {
    // These tests run against actual Directus instance

    beforeAll(async () => {
        // Verify test environment is ready
        if (!TEST_CONFIG.directusToken) {
            throw new Error('Test environment not configured. Run: npm run test:env:start');
        }
    });

    it('should trigger real Directus flow', async () => {
        const mockContext = createRealContext();

        const result = await triggerFlow.call(
            mockContext,
            'test-flow-webhook',
            { message: 'Integration test' },
            'sync'
        );

        // Verify against real API response
        expect(result).toHaveProperty('execution_id');
        expect(result.status).toMatch(/completed|running/);
    }, 10000); // Real API calls need more time

    it('should create real user with role lookup', async () => {
        const mockContext = createRealContext();

        const result = await createUser.call(mockContext, {
            email: `test-${Date.now()}@example.com`,
            password: 'TestPass123!',
            role: 'Test Editor', // Real role name lookup
        });

        expect(result).toHaveProperty('id');
        expect(result.email).toContain('test-');

        // Cleanup
        await deleteUser.call(mockContext, result.id);
    }, 10000);

    // More real tests...
});
```

### 5. NPM Scripts (0.5 hours)

**Update**: `package.json`

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --config jest.config.integration.js",
    "test:integration": "jest --config jest.config.integration-real.js",
    "test:integration:watch": "jest --config jest.config.integration-real.js --watch",
    "test:env:start": "bash test/scripts/start-test-env.sh",
    "test:env:stop": "bash test/scripts/stop-test-env.sh",
    "test:env:restart": "npm run test:env:stop && npm run test:env:start",
    "test:full": "npm run test:env:start && npm run test:integration && npm run test:env:stop"
  }
}
```

**File**: `jest.config.integration-real.js`

```javascript
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/test'],
    testMatch: ['**/test/integration-real/**/*.integration.ts'],
    setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
    testTimeout: 60000, // Real API calls need more time
    maxWorkers: 1, // Run serially
};
```

## Expected Outcomes

- ✅ Dockerized Directus test environment
- ✅ One-command setup: `npm run test:env:start`
- ✅ Real integration tests against actual Directus API
- ✅ Test fixtures and sample data
- ✅ Automated cleanup
- ✅ CI/CD ready (can run in GitHub Actions)
- ✅ Verifies compatibility with Directus versions

## Files Created

- New: `docker-compose.test.yml`
- New: `test/fixtures/directus-schema.json`
- New: `test/scripts/start-test-env.sh`
- New: `test/scripts/stop-test-env.sh`
- New: `test/integration-real/*.integration.ts`
- New: `jest.config.integration-real.js`
- Modified: `package.json`
- Modified: `.gitignore` (ignore .env.test)
- New: `.github/workflows/integration-tests.yml`

## Usage

```bash
# Start test environment
npm run test:env:start

# Run integration tests
npm run test:integration

# Watch mode
npm run test:integration:watch

# Stop test environment
npm run test:env:stop

# Run everything
npm run test:full
```

## CI/CD Integration

**File**: `.github/workflows/integration-tests.yml`

```yaml
name: Integration Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  integration-tests:
    runs-on: ubuntu-latest

    services:
      directus:
        image: directus/directus:latest
        env:
          KEY: test-key
          SECRET: test-secret
          DB_CLIENT: sqlite3
          ADMIN_EMAIL: admin@test.com
          ADMIN_PASSWORD: TestPass123!
        ports:
          - 8055:8055

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Wait for Directus
        run: |
          timeout 60 bash -c 'until curl -f http://localhost:8055/server/info; do sleep 2; done'

      - name: Setup test data
        run: npm run test:env:setup

      - name: Run integration tests
        run: npm run test:integration
        env:
          TEST_DIRECTUS_URL: http://localhost:8055
          TEST_DIRECTUS_TOKEN: ${{ secrets.TEST_TOKEN }}
```

## Testing Checklist

- [ ] Docker Compose starts Directus successfully
- [ ] Health check passes
- [ ] Test fixtures load correctly
- [ ] Admin token retrieved
- [ ] .env.test created with credentials
- [ ] Integration tests connect to Directus
- [ ] Flow trigger works with real API
- [ ] User creation works with real API
- [ ] Preset queries return real data
- [ ] Cleanup scripts remove test data
- [ ] Environment stops cleanly
- [ ] CI/CD pipeline runs tests

## Benefits

1. **API Compatibility**: Catches breaking changes in Directus API
2. **Version Testing**: Can test against multiple Directus versions
3. **Real Confidence**: Verify actual API behavior, not mocks
4. **Bug Discovery**: Find integration issues missed by unit tests
5. **Documentation**: Examples show real API usage

## Trade-offs

**Pros:**
- Catches real API issues
- Verifies end-to-end functionality
- Tests actual network/auth conditions

**Cons:**
- Slower than unit tests (~2-5 min vs 30s)
- Requires Docker
- More complex setup
- Can be flaky (network, timing)

## Dependencies

**Requires:**
- Docker and Docker Compose
- Directus Docker image
- ~500MB disk space for Docker volumes

**Blocked By**: Task 027 (unit tests should be implemented first)
**Can Run In Parallel With**: None (this is supplementary)

## Success Criteria

- [ ] `npm run test:env:start` successfully starts Directus
- [ ] Tests connect to real Directus instance
- [ ] >20 real integration tests implemented
- [ ] All tests pass against real API
- [ ] CI/CD pipeline runs integration tests
- [ ] Documentation updated
- [ ] Git commit: "test: add integration testing environment with Docker"

## Definition of Done

- [ ] Docker Compose environment working
- [ ] Test fixtures load automatically
- [ ] Integration tests pass reliably
- [ ] CI/CD integration working
- [ ] Documentation complete
- [ ] Team trained on usage

---

**Priority**: MEDIUM (nice-to-have after unit tests)
**Recommendation**: Implement Task 027 (unit tests) first, then this task for additional confidence.
