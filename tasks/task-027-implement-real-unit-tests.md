# Task 027: Implement Actual Unit Tests with Proper Mocking

## Priority: HIGH
**Effort**: 5-6 hours
**Developer**: Backend/QA specialist
**Phase**: 7 - Testing (Follow-up)

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Context

Task 024 was marked as complete, but the tests are **placeholder-only** and provide **0% actual coverage**. All test files contain `expect(true).toBe(true)` stubs instead of real tests that verify backend functionality.

**Current State:**
- ✅ Test infrastructure exists (jest, ts-jest installed)
- ✅ Test files created with proper structure
- ❌ Tests don't actually call or verify backend code
- ❌ No mocking strategy implemented
- ❌ 0% real code coverage

**What Exists But Isn't Tested:**
- `triggerFlow()`, `chainFlows()`, `loopFlows()` in GenericFunctions.ts
- User management operations with role lookup
- Preset query operations
- Activity log aggregation
- Agent tools integration
- Error handling and retry logic

## Problem

The current test files look like this:
```typescript
it('should trigger flow asynchronously', async () => {
    // TODO: Implement test
    expect(true).toBe(true); // ❌ Tests nothing!
});
```

This passes CI/CD but provides zero confidence that code works.

## Description

Implement **real unit tests** with proper mocking that actually verify the backend code functions correctly. Use Jest mocks to avoid requiring external Directus instance.

## Implementation Steps

### 1. Create Proper Mocking Strategy (1 hour)

**File**: `test/mocks/directus.mock.ts`

```typescript
// Mock the Directus SDK
export const createMockDirectusClient = () => ({
    request: jest.fn(),
    with: jest.fn().mockReturnThis(),
});

// Mock fetch responses
export const mockFetchSuccess = (data: any) => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data }),
    });
};

export const mockFetchError = (status: number, message: string) => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status,
        json: async () => ({ errors: [{ message }] }),
    });
};

// Mock n8n execution context
export const createMockContext = (params: any = {}) => ({
    getNode: () => ({ name: 'Test Node' }),
    getNodeParameter: (name: string) => params[name],
    getCredentials: async () => ({
        url: 'https://test.directus.io',
        staticToken: 'test-token',
    }),
});
```

### 2. Implement Flow Operations Tests (1.5 hours)

**File**: `test/integration/flow-operations.test.ts`

Replace placeholders with real tests:

```typescript
import { triggerFlow, chainFlows, loopFlows } from '../../nodes/Directus/GenericFunctions';
import { mockFetchSuccess, mockFetchError, createMockContext } from '../mocks/directus.mock';

describe('Flow Operations', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    describe('triggerFlow', () => {
        it('should trigger flow and return execution ID', async () => {
            const mockContext = createMockContext({
                flowId: 'test-flow',
                payload: { test: 'data' },
            });

            mockFetchSuccess({
                execution_id: 'exec-123',
                status: 'running',
            });

            const result = await triggerFlow.call(
                mockContext,
                'test-flow',
                { test: 'data' },
                'async'
            );

            expect(result).toHaveProperty('execution_id', 'exec-123');
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/flows/test-flow/trigger'),
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        Authorization: 'Bearer test-token',
                    }),
                })
            );
        });

        it('should handle flow not found error', async () => {
            const mockContext = createMockContext();
            mockFetchError(404, 'Flow not found');

            await expect(
                triggerFlow.call(mockContext, 'invalid-flow', {}, 'async')
            ).rejects.toThrow('Flow not found');
        });
    });

    // Add 10+ more real tests for chainFlows, loopFlows, etc.
});
```

**Tests to implement:**
- ✅ Trigger flow async
- ✅ Trigger flow sync
- ✅ Handle flow not found
- ✅ Handle auth errors
- ✅ Chain multiple flows
- ✅ Loop through items
- ✅ Poll flow execution
- ✅ Get flow status
- ✅ Handle rate limiting
- ✅ Retry on network errors

**Coverage target**: >80% of GenericFunctions.ts flow operations

### 3. Implement User Management Tests (1 hour)

**File**: `test/integration/user-management.test.ts`

```typescript
describe('User Management', () => {
    it('should create user with role name lookup', async () => {
        // Mock role lookup
        mockFetchSuccess([{ id: 'role-uuid', name: 'Editor' }]);

        // Mock user creation
        mockFetchSuccess({
            id: 'user-123',
            email: 'test@example.com',
            role: 'role-uuid',
        });

        const result = await createUser.call(mockContext, {
            email: 'test@example.com',
            password: 'pass123',
            role: 'Editor', // Use name, not UUID
        });

        expect(result).toHaveProperty('id');
        expect(result.role).toBe('role-uuid');
        expect(global.fetch).toHaveBeenCalledTimes(2); // role lookup + create
    });

    it('should handle duplicate email error', async () => {
        mockFetchError(422, 'Email already exists');

        await expect(
            createUser.call(mockContext, { email: 'dup@example.com' })
        ).rejects.toThrow('Email already exists');
    });

    // Add 8+ more real tests
});
```

**Tests to implement:**
- ✅ Create user with role name
- ✅ Create user with role UUID
- ✅ Bulk create users
- ✅ Handle duplicate email
- ✅ Validate email format
- ✅ Query users with filters
- ✅ Update user role
- ✅ Send invitations
- ✅ Role lookup caching
- ✅ Permission errors

### 4. Implement Preset Tests (1 hour)

**File**: `test/integration/presets.test.ts`

```typescript
describe('Preset Operations', () => {
    it('should apply preset filters to query', async () => {
        // Mock preset lookup
        mockFetchSuccess({
            id: 'preset-1',
            filter: { status: { _eq: 'published' } },
        });

        // Mock data query with filters
        mockFetchSuccess([
            { id: '1', title: 'Article 1', status: 'published' },
            { id: '2', title: 'Article 2', status: 'published' },
        ]);

        const result = await applyPreset.call(mockContext, {
            presetName: 'Published Articles',
            collection: 'articles',
        });

        expect(result).toHaveLength(2);
        expect(result[0].status).toBe('published');
    });

    // Add 6+ more real tests
});
```

### 5. Implement Agent Tools Tests (1 hour)

**File**: `test/integration/agent-tools.test.ts`

```typescript
describe('AI Agent Tools', () => {
    it('should provide valid OpenAI function schema', () => {
        const tool = new CreateDirectusUserTool();
        const schema = tool.getOpenAISchema();

        expect(schema).toHaveProperty('name');
        expect(schema).toHaveProperty('description');
        expect(schema.parameters).toHaveProperty('type', 'object');
        expect(schema.parameters.properties).toHaveProperty('email');
        expect(schema.parameters.required).toContain('email');
    });

    it('should execute tool and return formatted response', async () => {
        mockFetchSuccess({ id: 'user-123', email: 'test@example.com' });

        const tool = new CreateDirectusUserTool();
        const result = await tool.execute(mockContext, {
            email: 'test@example.com',
            role_name: 'Editor',
        });

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('user_id');
        expect(result.message).toMatch(/created successfully/i);
    });

    // Add 8+ more real tests
});
```

### 6. Test Error Handling (0.5 hours)

Add comprehensive error handling tests across all modules:

```typescript
describe('Error Handling', () => {
    it('should retry on network errors', async () => {
        (global.fetch as jest.Mock)
            .mockRejectedValueOnce(new Error('Network error'))
            .mockRejectedValueOnce(new Error('Network error'))
            .mockResolvedValueOnce(mockSuccessResponse);

        const result = await triggerFlow.call(mockContext, 'test-flow', {});

        expect(result).toBeDefined();
        expect(global.fetch).toHaveBeenCalledTimes(3); // 2 retries + success
    });

    it('should handle rate limiting with backoff', async () => {
        mockFetchError(429, 'Rate limit exceeded');

        await expect(
            triggerFlow.call(mockContext, 'test-flow', {})
        ).rejects.toThrow('Rate limit');
    });

    // Add more error scenarios
});
```

### 7. Run Tests and Fix Failures (1 hour)

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Fix any failures
# Adjust mocks as needed
# Refactor code if bugs found
```

**Coverage targets:**
- Overall: >80%
- Critical paths: 100%
  - Flow trigger
  - User creation with role lookup
  - Error handling
  - Retry logic

## Expected Outcomes

- ✅ **Real tests** that actually verify code works
- ✅ **>80% code coverage** (not fake placeholders)
- ✅ **All critical paths tested** at 100%
- ✅ **Fast execution** (no external dependencies)
- ✅ **CI/CD ready** (reliable, deterministic)
- ✅ **Bug discovery** (likely to find issues in untested code)
- ✅ **Confidence** that backend actually works

## Files Modified

- Modified: `test/integration/flow-operations.test.ts` (replace placeholders)
- Modified: `test/integration/user-management.test.ts` (replace placeholders)
- Modified: `test/integration/presets.test.ts` (replace placeholders)
- Modified: `test/integration/agent-tools.test.ts` (replace placeholders)
- Modified: `test/integration/activity-logs.test.ts` (replace placeholders)
- New: `test/mocks/directus.mock.ts`
- New: `test/mocks/n8n.mock.ts`
- Modified: `jest.config.integration.js` (if needed for mocking)

## Testing Checklist

### Must Test
- [ ] Flow trigger (async/sync modes)
- [ ] Flow chaining
- [ ] Flow looping with concurrency
- [ ] User creation with role name lookup
- [ ] Bulk user operations
- [ ] Preset application
- [ ] Activity log aggregation
- [ ] Agent tool schemas (OpenAI/Anthropic)
- [ ] Agent tool execution
- [ ] Error handling and retries
- [ ] Rate limiting behavior
- [ ] Authentication failures
- [ ] Network error recovery

### Coverage Goals
- [ ] GenericFunctions.ts: >85%
- [ ] Flow operations: >90%
- [ ] User operations: >85%
- [ ] Preset operations: >80%
- [ ] Agent tools: >80%
- [ ] Error handlers: 100%

## Dependencies

**Blocked By**: None (can start immediately)
**Blocks**: Nothing, but provides confidence for production deployment

## Success Criteria

- [ ] All placeholder tests replaced with real tests
- [ ] `npm test` passes with >80% coverage
- [ ] No `expect(true).toBe(true)` in codebase
- [ ] Tests actually call backend functions
- [ ] Mocking strategy documented
- [ ] CI/CD pipeline shows real coverage numbers
- [ ] Git commit: "test: implement real unit tests with >80% coverage"

## Why This Matters

Currently, the codebase has:
- **Technical debt**: Tests that don't test
- **False confidence**: CI passes but code isn't verified
- **Risk**: Backend code has never been executed/tested
- **Quality**: Unknown if features actually work

After this task:
- **Real confidence**: Code is verified working
- **Bug prevention**: Issues caught before production
- **Maintainability**: Safe to refactor with test safety net
- **Documentation**: Tests show how to use the code

## Definition of Done

- [ ] Zero placeholder tests remain
- [ ] >80% code coverage achieved
- [ ] All tests pass reliably
- [ ] Coverage report generated
- [ ] Tests run in <30 seconds
- [ ] Documentation updated with testing guide
- [ ] PR reviewed and approved
- [ ] Git commit with coverage report

---

**Note**: This is the real work that Task 024 should have completed. The infrastructure exists, but actual test implementation was skipped.
