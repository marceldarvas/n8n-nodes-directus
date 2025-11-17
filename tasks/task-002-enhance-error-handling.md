# Task 002: Enhance Error Handling in GenericFunctions

## Priority: HIGH
**Effort**: 4-6 hours
**Developer**: Any (Foundation work)
**Phase**: 1 - Foundation & Bug Fixes

## Status
- [ ] Not Started
- [ ] In Progress
- [ ] Code Review
- [ ] Testing
- [ ] Completed

## Prerequisites
- ✅ Task 001: Fix Syntax Errors (MUST BE COMPLETED FIRST)

## Description
Improve error handling in `GenericFunctions.ts` to provide better debugging information, handle rate limiting, implement retry logic, and ensure graceful degradation for API failures. This will make the node more robust for production AI agent workflows.

## Current Implementation
The existing `GenericFunctions.ts` file includes:
- `directusApiRequest()` - Main HTTP request function
- Basic error handling with status code checking
- Simple header construction
- Query parameter building

## Implementation Steps

### 1. Enhanced Error Types (1 hour)
- [ ] Create custom error classes for different Directus error scenarios
- [ ] Add DirectusRateLimitError class
- [ ] Add DirectusAuthenticationError class
- [ ] Add DirectusPermissionError class
- [ ] Add DirectusValidationError class
- [ ] Add DirectusNetworkError class

```typescript
// Example structure
export class DirectusApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errors?: any[],
    public endpoint?: string
  ) {
    super(message);
    this.name = 'DirectusApiError';
  }
}
```

### 2. Rate Limit Handling (1.5 hours)
- [ ] Detect 429 (Too Many Requests) responses
- [ ] Parse Retry-After header
- [ ] Implement exponential backoff strategy
- [ ] Add configurable max retry attempts (default: 3)
- [ ] Log rate limit warnings

```typescript
// Rate limit detection example
if (response.statusCode === 429) {
  const retryAfter = response.headers['retry-after'];
  // Implement retry logic
}
```

### 3. Retry Logic with Backoff (2 hours)
- [ ] Add retry wrapper function
- [ ] Implement exponential backoff (1s, 2s, 4s, 8s)
- [ ] Make retryable errors configurable
- [ ] Add circuit breaker pattern for repeated failures
- [ ] Log retry attempts for debugging

```typescript
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];
```

### 4. Improved Error Messages (1 hour)
- [ ] Extract error details from Directus API responses
- [ ] Include endpoint URL in error messages
- [ ] Add request ID if available
- [ ] Format validation errors as readable messages
- [ ] Provide actionable suggestions (e.g., "Check your API token")

### 5. Timeout Configuration (30 min)
- [ ] Add configurable request timeout (default: 30s)
- [ ] Handle timeout errors gracefully
- [ ] Provide clear timeout error messages
- [ ] Allow per-operation timeout overrides

### 6. Response Validation (1 hour)
- [ ] Validate response structure before returning
- [ ] Handle empty responses
- [ ] Check for unexpected data types
- [ ] Add schema validation for critical operations

## Testing Criteria

### Unit Tests
```typescript
// Test rate limit handling
it('should retry on 429 with backoff', async () => {
  // Mock 429 response
  // Verify retry attempts
  // Check exponential backoff timing
});

// Test authentication errors
it('should throw DirectusAuthenticationError on 401', async () => {
  // Mock 401 response
  // Verify error type and message
});

// Test timeout handling
it('should timeout after configured duration', async () => {
  // Mock slow response
  // Verify timeout error
});
```

### Integration Tests
- [ ] Test against live Directus instance with rate limiting
- [ ] Verify retry logic with temporary network failures
- [ ] Test timeout behavior with slow endpoints
- [ ] Validate error messages are user-friendly

### Error Scenarios to Test
1. **401 Unauthorized** - Invalid token
2. **403 Forbidden** - Insufficient permissions
3. **404 Not Found** - Invalid endpoint
4. **429 Rate Limit** - Too many requests
5. **500 Server Error** - Directus internal error
6. **Network timeout** - No response
7. **Invalid JSON** - Malformed response

## Expected Outcomes
- ✅ Custom error classes for all Directus error types
- ✅ Automatic retry with exponential backoff for transient errors
- ✅ Rate limit handling with Retry-After header support
- ✅ Improved error messages with actionable suggestions
- ✅ Configurable timeout with graceful handling
- ✅ Comprehensive unit test coverage (>80%)
- ✅ Better debugging information in error logs

## Files Modified
- `nodes/Directus/GenericFunctions.ts` (main changes)
- `nodes/Directus/Directus.node.ts` (error handling updates)
- New file: `nodes/Directus/Errors.ts` (custom error classes)

## Configuration Options to Add

### In Credentials (DirectusApi.credentials.ts)
```typescript
{
  displayName: 'Request Timeout',
  name: 'timeout',
  type: 'number',
  default: 30000,
  description: 'Request timeout in milliseconds',
}
```

### In GenericFunctions
```typescript
const retryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504]
};
```

## Dependencies
**Blocks**:
- Task 004-007 (Flow operations need reliable error handling)
- Task 018-023 (AI agent tools need clear error messages)

**Blocked By**:
- Task 001 (Syntax errors must be fixed first)

**Can Run in Parallel With**:
- Task 003 (OAuth2 authentication)

## Notes
- Focus on making errors actionable for users (especially AI agents)
- Log detailed error information for debugging
- Consider adding Sentry or similar error tracking in the future
- Document all error types in README for troubleshooting
- Error messages should be clear enough for AI agents to understand and retry appropriately

## Concurrency
✅ **Can be developed in parallel with Task 003** (OAuth2) after Task 001 is complete

## Related Documentation
- Directus API Error Reference: https://docs.directus.io/api/errors
- n8n Error Handling Guide: https://docs.n8n.io/integrations/creating-nodes/build/reference/
- Rate Limiting: https://directus.io/docs/configuration/security-limits

## Definition of Done
- [ ] All custom error classes implemented
- [ ] Retry logic with exponential backoff working
- [ ] Rate limit handling with Retry-After support
- [ ] Timeout configuration functional
- [ ] Unit tests passing with >80% coverage
- [ ] Integration tests passing against live Directus
- [ ] Error messages tested with AI agent workflows
- [ ] Documentation updated in README
- [ ] Git commit with message: "feat: enhance error handling with retry logic and custom error types"
