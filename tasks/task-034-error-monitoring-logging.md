# Task 034: Production Error Monitoring and Logging

## Priority: LOW
**Effort**: 2-3 hours
**Developer**: Backend/DevOps specialist
**Phase**: 9 - Infrastructure & Automation

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- Core functionality implemented (Tasks 001-017)
- Error handling enhanced (Task 002)

## Description

Implement production-grade error monitoring and structured logging to track errors, performance issues, and usage patterns in deployed instances. This helps identify and resolve production issues quickly.

## Context

**Current State:**
- ❌ No error tracking in production
- ❌ No centralized logging
- ❌ No error alerting
- ❌ No performance monitoring
- ❌ No user error visibility
- ❌ Debugging relies on user reports

**Impact:**
- Production errors go unnoticed
- No visibility into failure rates
- Cannot proactively fix issues
- Poor user experience when errors occur
- Difficult to debug user-reported issues
- No metrics on API performance

## Problem Scenarios

### Scenario 1: Silent Production Failures
```typescript
// Error occurs in production
// User workflow fails silently
// No one knows until user reports it days later
// No stack trace, no context, can't reproduce
```

### Scenario 2: Performance Degradation
```typescript
// Directus API response time increases from 200ms to 5s
// User workflows become slow
// No alerts, no visibility
// Users frustrated, churn increases
```

### Scenario 3: Rate Limiting Issues
```typescript
// User hits Directus rate limits
// Gets cryptic error: "Too many requests"
// No context about which endpoint
// No information about retry strategy
```

## Implementation Options

### Option A: Sentry (Recommended)

**Pros:**
- Comprehensive error tracking
- Performance monitoring
- Release tracking
- Free tier available
- Great UI

**Cons:**
- External service dependency
- Privacy considerations

### Option B: Self-hosted (ELK Stack)

**Pros:**
- Full control
- No external dependencies
- Better privacy

**Cons:**
- Complex setup
- Maintenance overhead
- Infrastructure costs

**Recommendation**: Use **Sentry** for simplicity and features.

## Implementation Steps

### 1. Install Sentry (0.5 hours)

```bash
npm install @sentry/node @sentry/integrations
```

### 2. Create Sentry Integration Module (1 hour)

**File**: `nodes/Directus/integrations/sentry.ts`

```typescript
import * as Sentry from '@sentry/node';
import { INodeExecutionData } from 'n8n-workflow';

/**
 * Initialize Sentry error monitoring
 */
export function initSentry() {
  // Only initialize if DSN is provided
  const dsn = process.env.DIRECTUS_NODE_SENTRY_DSN;

  if (!dsn) {
    // Sentry disabled - no DSN provided
    return;
  }

  Sentry.init({
    dsn,

    // Environment (production, staging, development)
    environment: process.env.NODE_ENV || 'production',

    // Release version
    release: `n8n-nodes-directus@${require('../../../package.json').version}`,

    // Sample rate for performance monitoring (10%)
    tracesSampleRate: 0.1,

    // Enable performance monitoring
    enableTracing: true,

    // Integrations
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
    ],

    // Filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
          if (breadcrumb.data) {
            // Remove tokens, passwords
            delete breadcrumb.data.token;
            delete breadcrumb.data.password;
            delete breadcrumb.data.staticToken;
          }
          return breadcrumb;
        });
      }

      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }

      return event;
    },
  });

  console.log('✅ Sentry error monitoring initialized');
}

/**
 * Capture error with context
 */
export function captureError(
  error: Error,
  context: {
    operation?: string;
    resource?: string;
    itemIndex?: number;
    nodeParameters?: any;
  }
) {
  // Add context to error
  Sentry.withScope(scope => {
    // Set tags for filtering
    if (context.operation) {
      scope.setTag('operation', context.operation);
    }
    if (context.resource) {
      scope.setTag('resource', context.resource);
    }

    // Set extra context
    scope.setContext('directus_operation', {
      operation: context.operation,
      resource: context.resource,
      itemIndex: context.itemIndex,
    });

    // Add sanitized parameters (remove sensitive data)
    if (context.nodeParameters) {
      const sanitized = sanitizeParameters(context.nodeParameters);
      scope.setContext('node_parameters', sanitized);
    }

    // Capture the error
    Sentry.captureException(error);
  });
}

/**
 * Track performance of operations
 */
export function trackPerformance<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  const transaction = Sentry.startTransaction({
    name: operationName,
    op: 'directus.operation',
  });

  return operation()
    .then(result => {
      transaction.setStatus('ok');
      transaction.finish();
      return result;
    })
    .catch(error => {
      transaction.setStatus('internal_error');
      transaction.finish();
      throw error;
    });
}

/**
 * Remove sensitive data from parameters
 */
function sanitizeParameters(params: any): any {
  const sanitized = { ...params };

  // Remove sensitive fields
  const sensitiveFields = [
    'password',
    'token',
    'staticToken',
    'apiKey',
    'secret',
    'accessToken',
    'refreshToken',
  ];

  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Add breadcrumb for tracking operations
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: any
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data: sanitizeParameters(data || {}),
  });
}
```

### 3. Integrate into Main Node (0.5 hours)

**File**: `nodes/Directus/Directus.node.ts`

```typescript
import { initSentry, captureError, trackPerformance, addBreadcrumb } from './integrations/sentry';

export class Directus implements INodeType {
  constructor() {
    // Initialize Sentry on node load
    initSentry();
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    // Track operation execution
    addBreadcrumb('Starting Directus operation', 'directus', {
      resource,
      operation,
      itemCount: items.length,
    });

    try {
      // Wrap operation in performance tracking
      const result = await trackPerformance(
        `directus.${resource}.${operation}`,
        async () => {
          // Execute operation
          // ... existing operation logic ...
        }
      );

      return [returnData];

    } catch (error) {
      // Capture error with context
      captureError(error as Error, {
        operation,
        resource,
        nodeParameters: this.getNode().parameters,
      });

      // Re-throw to maintain n8n error handling
      throw error;
    }
  }
}
```

### 4. Structured Logging Module (1 hour)

**File**: `nodes/Directus/integrations/logger.ts`

```typescript
import * as winston from 'winston';

/**
 * Structured logger for Directus node
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'n8n-nodes-directus',
    version: require('../../../package.json').version,
  },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

/**
 * Log operation start
 */
export function logOperationStart(
  operation: string,
  resource: string,
  itemIndex: number
) {
  logger.info('Operation started', {
    operation,
    resource,
    itemIndex,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log operation success
 */
export function logOperationSuccess(
  operation: string,
  resource: string,
  duration: number,
  resultCount: number
) {
  logger.info('Operation completed', {
    operation,
    resource,
    duration,
    resultCount,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log operation error
 */
export function logOperationError(
  operation: string,
  resource: string,
  error: Error,
  context?: any
) {
  logger.error('Operation failed', {
    operation,
    resource,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log API request
 */
export function logApiRequest(
  method: string,
  endpoint: string,
  statusCode: number,
  duration: number
) {
  logger.debug('API request', {
    method,
    endpoint,
    statusCode,
    duration,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log rate limit encountered
 */
export function logRateLimit(
  endpoint: string,
  retryAfter: number
) {
  logger.warn('Rate limit encountered', {
    endpoint,
    retryAfter,
    timestamp: new Date().toISOString(),
  });
}
```

### 5. User-Facing Error Messages (0.5 hours)

**File**: `nodes/Directus/integrations/error-messages.ts`

```typescript
import { NodeOperationError } from 'n8n-workflow';

/**
 * Error message templates with user-friendly explanations
 */
export const ERROR_MESSAGES = {
  AUTHENTICATION_FAILED: {
    title: 'Authentication Failed',
    message: 'Could not authenticate with Directus. Please check your credentials.',
    suggestions: [
      'Verify your API token is correct',
      'Check if token has expired',
      'Ensure token has required permissions',
    ],
    learnMoreUrl: 'https://docs.directus.io/reference/authentication.html',
  },

  RATE_LIMIT_EXCEEDED: {
    title: 'Rate Limit Exceeded',
    message: 'Too many requests to Directus API. Please wait before retrying.',
    suggestions: [
      'Reduce the frequency of requests',
      'Implement batch operations',
      'Contact Directus admin to increase limits',
    ],
    learnMoreUrl: 'https://docs.directus.io/reference/api.html#rate-limiting',
  },

  RESOURCE_NOT_FOUND: {
    title: 'Resource Not Found',
    message: 'The requested resource does not exist in Directus.',
    suggestions: [
      'Check the resource ID is correct',
      'Verify the resource exists in Directus',
      'Check your permissions to access this resource',
    ],
  },

  ROLE_NOT_FOUND: {
    title: 'Role Not Found',
    message: 'The specified role does not exist.',
    suggestions: [
      'Check the role name spelling',
      'Use role UUID instead of name',
      'Create the role in Directus first',
    ],
  },
};

/**
 * Format user-friendly error
 */
export function formatUserError(
  node: any,
  errorType: keyof typeof ERROR_MESSAGES,
  additionalContext?: string
): NodeOperationError {
  const template = ERROR_MESSAGES[errorType];

  let message = `${template.title}\n\n${template.message}`;

  if (additionalContext) {
    message += `\n\nDetails: ${additionalContext}`;
  }

  if (template.suggestions) {
    message += '\n\nSuggestions:\n';
    template.suggestions.forEach(suggestion => {
      message += `  • ${suggestion}\n`;
    });
  }

  if (template.learnMoreUrl) {
    message += `\nLearn more: ${template.learnMoreUrl}`;
  }

  return new NodeOperationError(node, message);
}
```

### 6. Environment Configuration (0.25 hours)

**File**: `.env.example`

```bash
# Error Monitoring (Optional)
DIRECTUS_NODE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Logging
LOG_LEVEL=info  # debug, info, warn, error

# Node Environment
NODE_ENV=production  # development, staging, production
```

**Documentation** (`README.md`):

```markdown
## Error Monitoring (Optional)

To enable error monitoring with Sentry:

1. Create account at https://sentry.io
2. Create new project
3. Copy DSN
4. Set environment variable:
   ```bash
   export DIRECTUS_NODE_SENTRY_DSN="your-dsn-here"
   ```

All errors will be automatically tracked with context.
```

### 7. Update Dependencies (0.25 hours)

**package.json**:

```json
{
  "dependencies": {
    "@sentry/node": "^7.100.0",
    "@sentry/integrations": "^7.100.0",
    "winston": "^3.11.0"
  }
}
```

## Expected Outcomes

- ✅ **Production errors tracked** automatically
- ✅ **Performance monitored** for operations
- ✅ **Structured logging** for debugging
- ✅ **User-friendly errors** with solutions
- ✅ **Proactive alerts** on issues
- ✅ **Release tracking** for error correlation
- ✅ **Privacy preserved** (sensitive data redacted)

## Files Created/Modified

- New: `nodes/Directus/integrations/sentry.ts`
- New: `nodes/Directus/integrations/logger.ts`
- New: `nodes/Directus/integrations/error-messages.ts`
- New: `.env.example`
- Modified: `nodes/Directus/Directus.node.ts` (add monitoring)
- Modified: `package.json` (dependencies)
- Modified: `README.md` (monitoring setup docs)

## Sentry Setup Steps

1. **Create Sentry Account**: https://sentry.io/signup/
2. **Create Project**: Choose "Node.js"
3. **Copy DSN**: From project settings
4. **Configure Environment Variable**: Set `DIRECTUS_NODE_SENTRY_DSN`
5. **Deploy**: Errors will start flowing to Sentry

## Monitoring Dashboard

After setup, Sentry provides:

1. **Error Dashboard**: All errors, frequency, affected users
2. **Performance Dashboard**: Operation timings, slow queries
3. **Releases**: Track errors by version
4. **Alerts**: Email/Slack notifications on new errors
5. **Issue Tracking**: Assign, resolve, ignore errors

## Privacy Considerations

The implementation:
- ✅ Redacts passwords, tokens, API keys
- ✅ Removes Authorization headers
- ✅ Optional (disabled by default)
- ✅ Self-hosted option available
- ✅ Configurable data retention

## Success Criteria

- [ ] Sentry integration implemented
- [ ] Structured logging implemented
- [ ] User-friendly error messages created
- [ ] Sensitive data sanitization working
- [ ] Documentation updated
- [ ] Tested in production-like environment
- [ ] Alerts configured (email/Slack)
- [ ] Git commit: "feat: add production error monitoring and logging"

## Benefits

1. **Proactive**: Catch errors before users report them
2. **Context**: Full stack traces and operation context
3. **Performance**: Identify slow operations
4. **Quality**: Track error rates and fix patterns
5. **User Experience**: Better error messages
6. **Debugging**: Easier to reproduce issues

## Alerting Rules (Sentry)

Configure alerts for:

1. **New Errors**: First occurrence of new error
2. **Error Spike**: 100% increase in error rate
3. **High Frequency**: >10 errors in 5 minutes
4. **Critical Errors**: Authentication failures
5. **Performance**: Operations >5s duration

## Future Enhancements

- Add custom metrics tracking
- Add user session tracking (with consent)
- Add API usage analytics
- Add performance profiling
- Add custom dashboard with key metrics

---

**Priority**: LOW (nice-to-have for production readiness)
**Dependencies**: Task 002 (error handling)
**Estimated Effort**: 2-3 hours
