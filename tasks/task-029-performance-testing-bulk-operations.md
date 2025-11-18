# Task 029: Performance Testing and Optimization for Bulk Operations

## Priority: LOW
**Effort**: 2-3 hours
**Developer**: Backend/Performance specialist
**Phase**: 8 - Performance Optimization (Optional)

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- Task 027: Unit tests completed
- Task 028: Integration tests (optional but recommended)

## Description

Implement performance tests and benchmarks for bulk operations to ensure the n8n-nodes-directus package handles large-scale operations efficiently without degrading performance or causing memory issues.

## Context

The package supports bulk operations:
- **Bulk user creation**: Create 100+ users at once
- **Bulk updates**: Update multiple items simultaneously
- **Flow loops**: Process 50+ items through flows
- **Large queries**: Fetch 1000+ records with pagination

**Current State:**
- ✅ Bulk operations implemented
- ❌ No performance testing
- ❌ No benchmarks established
- ❌ Unknown memory behavior under load
- ❌ No optimization guidelines

## Problem Scenarios

### Scenario 1: Memory Leak
```typescript
// Processing 1000 users in a loop
for (let i = 0; i < 1000; i++) {
    await createUser({ email: `user${i}@example.com` });
}
// Does memory grow linearly? Exponentially? Does it get released?
```

### Scenario 2: Rate Limiting
```typescript
// Bulk creating 500 users
await bulkCreateUsers(users); // 500 users
// Does it hit Directus rate limits?
// Is there backoff/retry logic?
```

### Scenario 3: Concurrent Flows
```typescript
// 100 flows running concurrently
await loopFlows('process-data', items, 10); // concurrency = 10
// Does concurrency work correctly?
// Any race conditions?
```

## Implementation Steps

### 1. Performance Test Framework (0.5 hours)

**File**: `test/performance/setup.ts`

```typescript
export interface PerformanceMetrics {
    operationName: string;
    itemCount: number;
    duration: number; // milliseconds
    throughput: number; // items/second
    memoryUsed: number; // MB
    memoryPeak: number; // MB
    cpuAverage: number; // percentage
}

export function measurePerformance<T>(
    operationName: string,
    operation: () => Promise<T>,
): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const startMemory = process.memoryUsage().heapUsed;
    const startTime = Date.now();

    return operation().then((result) => {
        const endTime = Date.now();
        const endMemory = process.memoryUsage().heapUsed;

        const metrics = {
            operationName,
            itemCount: Array.isArray(result) ? result.length : 1,
            duration: endTime - startTime,
            throughput: 0,
            memoryUsed: (endMemory - startMemory) / 1024 / 1024,
            memoryPeak: process.memoryUsage().heapUsed / 1024 / 1024,
            cpuAverage: process.cpuUsage().user / 1000, // microseconds to ms
        };

        metrics.throughput = metrics.itemCount / (metrics.duration / 1000);

        return { result, metrics };
    });
}

export function printMetrics(metrics: PerformanceMetrics) {
    console.log(`
📊 Performance Metrics: ${metrics.operationName}
  Items: ${metrics.itemCount}
  Duration: ${metrics.duration}ms
  Throughput: ${metrics.throughput.toFixed(2)} items/sec
  Memory Used: ${metrics.memoryUsed.toFixed(2)} MB
  Memory Peak: ${metrics.memoryPeak.toFixed(2)} MB
  CPU Average: ${metrics.cpuAverage.toFixed(2)} ms
    `);
}

export const PERFORMANCE_THRESHOLDS = {
    bulkCreateUsers: {
        maxDuration: 10000, // 10s for 100 users
        maxMemoryPerItem: 1, // 1MB per user max
        minThroughput: 10, // 10 users/second minimum
    },
    loopFlows: {
        maxDuration: 30000, // 30s for 50 items
        maxMemoryPerItem: 2,
        minThroughput: 5,
    },
    largeQuery: {
        maxDuration: 5000, // 5s for 1000 records
        maxMemoryPerItem: 0.5,
        minThroughput: 200,
    },
};
```

### 2. Bulk User Creation Performance (0.5 hours)

**File**: `test/performance/bulk-users.perf.ts`

```typescript
import { measurePerformance, printMetrics, PERFORMANCE_THRESHOLDS } from './setup';
import { bulkCreateUsers } from '../../nodes/Directus/GenericFunctions';

describe('Bulk User Creation Performance', () => {
    it('should create 100 users efficiently', async () => {
        const users = Array.from({ length: 100 }, (_, i) => ({
            email: `perftest${i}@example.com`,
            password: 'TestPass123!',
            role: 'Editor',
        }));

        const { result, metrics } = await measurePerformance(
            'Bulk Create 100 Users',
            () => bulkCreateUsers.call(mockContext, users)
        );

        printMetrics(metrics);

        // Assertions
        expect(result).toHaveLength(100);
        expect(metrics.duration).toBeLessThan(
            PERFORMANCE_THRESHOLDS.bulkCreateUsers.maxDuration
        );
        expect(metrics.memoryUsed / 100).toBeLessThan(
            PERFORMANCE_THRESHOLDS.bulkCreateUsers.maxMemoryPerItem
        );
        expect(metrics.throughput).toBeGreaterThan(
            PERFORMANCE_THRESHOLDS.bulkCreateUsers.minThroughput
        );
    }, 15000);

    it('should handle 500 users without memory leak', async () => {
        const initialMemory = process.memoryUsage().heapUsed;

        for (let batch = 0; batch < 5; batch++) {
            const users = Array.from({ length: 100 }, (_, i) => ({
                email: `perftest-batch${batch}-${i}@example.com`,
                password: 'TestPass123!',
                role: 'Editor',
            }));

            await bulkCreateUsers.call(mockContext, users);

            // Force garbage collection if available
            if (global.gc) global.gc();
        }

        const finalMemory = process.memoryUsage().heapUsed;
        const memoryGrowth = (finalMemory - initialMemory) / 1024 / 1024;

        console.log(`Memory growth after 500 users: ${memoryGrowth.toFixed(2)} MB`);

        // Memory should not grow more than 50MB for 500 users
        expect(memoryGrowth).toBeLessThan(50);
    }, 60000);

    it('should handle rate limiting gracefully', async () => {
        // Mock rate limit response
        let requestCount = 0;
        (global.fetch as jest.Mock).mockImplementation(() => {
            requestCount++;
            if (requestCount > 50) {
                // Simulate rate limit after 50 requests
                return Promise.resolve({
                    ok: false,
                    status: 429,
                    json: async () => ({ errors: [{ message: 'Rate limit' }] }),
                });
            }
            return mockSuccessResponse;
        });

        const users = Array.from({ length: 100 }, (_, i) => ({
            email: `ratelimit${i}@example.com`,
            password: 'Pass123!',
            role: 'Editor',
        }));

        const startTime = Date.now();
        await expect(
            bulkCreateUsers.call(mockContext, users)
        ).rejects.toThrow('Rate limit');

        const duration = Date.now() - startTime;

        // Should fail quickly (not retry indefinitely)
        expect(duration).toBeLessThan(10000);
        expect(requestCount).toBeLessThan(100); // Should stop retrying
    }, 15000);
});
```

### 3. Flow Loop Performance (0.5 hours)

**File**: `test/performance/flow-loops.perf.ts`

```typescript
describe('Flow Loop Performance', () => {
    it('should process 50 items efficiently', async () => {
        const items = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            data: `Item ${i}`,
        }));

        const { result, metrics } = await measurePerformance(
            'Loop Flow - 50 Items',
            () => loopFlows.call(mockContext, 'test-flow', items)
        );

        printMetrics(metrics);

        expect(result).toHaveLength(50);
        expect(metrics.duration).toBeLessThan(
            PERFORMANCE_THRESHOLDS.loopFlows.maxDuration
        );
        expect(metrics.throughput).toBeGreaterThan(
            PERFORMANCE_THRESHOLDS.loopFlows.minThroughput
        );
    }, 45000);

    it('should respect concurrency limits', async () => {
        const items = Array.from({ length: 20 }, (_, i) => ({ id: i }));
        let concurrentCount = 0;
        let maxConcurrent = 0;

        (global.fetch as jest.Mock).mockImplementation(async () => {
            concurrentCount++;
            maxConcurrent = Math.max(maxConcurrent, concurrentCount);

            await new Promise((resolve) => setTimeout(resolve, 100));

            concurrentCount--;
            return mockSuccessResponse;
        });

        await loopFlows.call(mockContext, 'test-flow', items, 5); // concurrency = 5

        // Max concurrent should be 5 (not 20)
        expect(maxConcurrent).toBeLessThanOrEqual(5);
        expect(maxConcurrent).toBeGreaterThan(1); // But should use concurrency
    }, 30000);

    it('should handle 100 items without memory issues', async () => {
        const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));
        const initialMemory = process.memoryUsage().heapUsed;

        await loopFlows.call(mockContext, 'test-flow', items, 10);

        const finalMemory = process.memoryUsage().heapUsed;
        const memoryGrowth = (finalMemory - initialMemory) / 1024 / 1024;

        console.log(`Memory growth for 100 items: ${memoryGrowth.toFixed(2)} MB`);
        expect(memoryGrowth).toBeLessThan(100); // <100MB for 100 items
    }, 60000);
});
```

### 4. Large Query Performance (0.5 hours)

**File**: `test/performance/large-queries.perf.ts`

```typescript
describe('Large Query Performance', () => {
    it('should fetch 1000 records efficiently', async () => {
        const mockRecords = Array.from({ length: 1000 }, (_, i) => ({
            id: `item-${i}`,
            title: `Item ${i}`,
        }));

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: mockRecords }),
        });

        const { result, metrics } = await measurePerformance(
            'Query 1000 Records',
            () => queryItems.call(mockContext, { collection: 'articles', limit: 1000 })
        );

        printMetrics(metrics);

        expect(result).toHaveLength(1000);
        expect(metrics.duration).toBeLessThan(
            PERFORMANCE_THRESHOLDS.largeQuery.maxDuration
        );
        expect(metrics.throughput).toBeGreaterThan(
            PERFORMANCE_THRESHOLDS.largeQuery.minThroughput
        );
    }, 10000);

    it('should handle pagination efficiently', async () => {
        // Test paginating through 5000 records in batches of 100
        let page = 0;
        const results = [];

        const { metrics } = await measurePerformance('Paginate 5000 Records', async () => {
            for (page = 0; page < 50; page++) {
                const batch = await queryItems.call(mockContext, {
                    collection: 'articles',
                    limit: 100,
                    offset: page * 100,
                });
                results.push(...batch);
            }
            return results;
        });

        printMetrics(metrics);

        expect(results).toHaveLength(5000);
        expect(metrics.duration).toBeLessThan(30000); // 30s max
        expect(metrics.memoryUsed).toBeLessThan(500); // <500MB
    }, 45000);
});
```

### 5. Benchmark Report Generation (0.5 hours)

**File**: `test/performance/generate-report.ts`

```typescript
import * as fs from 'fs';

export function generateBenchmarkReport(allMetrics: PerformanceMetrics[]) {
    const report = `
# Performance Benchmark Report

**Generated**: ${new Date().toISOString()}

## Summary

| Operation | Items | Duration | Throughput | Memory Used |
|-----------|-------|----------|------------|-------------|
${allMetrics.map((m) => `| ${m.operationName} | ${m.itemCount} | ${m.duration}ms | ${m.throughput.toFixed(2)}/s | ${m.memoryUsed.toFixed(2)}MB |`).join('\n')}

## Detailed Results

${allMetrics.map((m) => `
### ${m.operationName}

- **Items Processed**: ${m.itemCount}
- **Duration**: ${m.duration}ms
- **Throughput**: ${m.throughput.toFixed(2)} items/second
- **Memory Used**: ${m.memoryUsed.toFixed(2)} MB
- **Memory Peak**: ${m.memoryPeak.toFixed(2)} MB
- **CPU Average**: ${m.cpuAverage.toFixed(2)} ms

`).join('\n')}

## Performance Thresholds

All operations must meet these thresholds:

${Object.entries(PERFORMANCE_THRESHOLDS).map(([op, thresholds]) => `
### ${op}
- Max Duration: ${thresholds.maxDuration}ms
- Max Memory Per Item: ${thresholds.maxMemoryPerItem}MB
- Min Throughput: ${thresholds.minThroughput} items/sec
`).join('\n')}

---

*Generated by n8n-nodes-directus performance test suite*
    `;

    fs.writeFileSync('test/performance/BENCHMARK_REPORT.md', report);
    console.log('✅ Benchmark report generated: test/performance/BENCHMARK_REPORT.md');
}
```

## Expected Outcomes

- ✅ **Performance benchmarks** established
- ✅ **Regression detection** (catch performance degradation)
- ✅ **Memory leak detection**
- ✅ **Concurrency verification**
- ✅ **Rate limit handling tested**
- ✅ **Optimization opportunities identified**
- ✅ **Performance documentation** for users

## Files Created

- New: `test/performance/setup.ts`
- New: `test/performance/bulk-users.perf.ts`
- New: `test/performance/flow-loops.perf.ts`
- New: `test/performance/large-queries.perf.ts`
- New: `test/performance/generate-report.ts`
- New: `test/performance/BENCHMARK_REPORT.md` (generated)
- New: `jest.config.performance.js`
- Modified: `package.json` (add perf scripts)

## NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test:perf": "node --expose-gc jest --config jest.config.performance.js",
    "test:perf:report": "npm run test:perf && node test/performance/generate-report.js"
  }
}
```

## Performance Thresholds

### Current Targets

| Operation | Items | Max Duration | Max Memory | Min Throughput |
|-----------|-------|--------------|------------|----------------|
| Bulk Create Users | 100 | 10s | 100MB | 10/sec |
| Loop Flows | 50 | 30s | 100MB | 5/sec |
| Large Query | 1000 | 5s | 500MB | 200/sec |

### Future Optimizations

If tests reveal performance issues:

1. **Batching**: Implement request batching for bulk operations
2. **Caching**: Cache role lookups, presets
3. **Streaming**: Stream large result sets
4. **Connection pooling**: Reuse HTTP connections
5. **Parallel processing**: Optimize concurrency

## Success Criteria

- [ ] Performance tests implemented and passing
- [ ] Benchmarks established for all bulk operations
- [ ] Memory leak tests verify no leaks
- [ ] Concurrency tests verify limits respected
- [ ] Rate limiting handled gracefully
- [ ] Benchmark report generated
- [ ] Performance regression CI checks added
- [ ] Git commit: "test: add performance testing and benchmarks"

## CI/CD Integration

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0' # Weekly

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:perf:report
      - name: Upload benchmark report
        uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: test/performance/BENCHMARK_REPORT.md
```

## Benefits

1. **Catch Regressions**: Performance tests fail if code slows down
2. **Capacity Planning**: Know limits before hitting them in production
3. **Optimization Targets**: Data-driven performance improvements
4. **User Confidence**: Documented performance characteristics
5. **Memory Safety**: Verify no leaks in long-running operations

## Definition of Done

- [ ] All performance tests passing
- [ ] Benchmarks meet defined thresholds
- [ ] No memory leaks detected
- [ ] Concurrency working correctly
- [ ] Rate limiting handled gracefully
- [ ] Benchmark report generated and committed
- [ ] Documentation updated with performance guidelines
- [ ] CI/CD running performance tests

---

**Priority**: LOW (nice-to-have after core tests)
**Dependencies**: Task 027 (unit tests should exist first)
**Estimated Effort**: 2-3 hours
