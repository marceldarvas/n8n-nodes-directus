# Task 015: Flow-Specific Activity Log Filtering

## Priority: MEDIUM
**Effort**: 2-3 hours
**Developer**: Any
**Phase**: 5 - Activity & Logging Enhancement

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- ✅ Task 001: Fix Syntax Errors
- ✅ Task 004: Flow Trigger Operation

## Description
Enhance Activity operations to filter specifically by flow operations, making it easier to track flow executions, debug issues, and analyze automation performance.

## Implementation Steps

### 1. Add Flow-Specific Filters (1 hour)
- [ ] Extend Activity > List operation
- [ ] Add "Flow" filter type
- [ ] Flow ID filter
- [ ] Flow execution ID filter
- [ ] Operation type filter within flows

### 2. Create Flow Activity Helper (1.5 hours)
```typescript
async function getFlowActivity(
  this: IExecuteFunctions,
  filters: IFlowActivityFilters,
): Promise<any> {
  const queryFilters: any = {
    _and: [
      { collection: { _eq: 'directus_flows' } },
    ],
  };

  if (filters.flowId) {
    queryFilters._and.push({ item: { _eq: filters.flowId } });
  }

  if (filters.executionId) {
    queryFilters._and.push({ comment: { _contains: filters.executionId } });
  }

  if (filters.operationType) {
    queryFilters._and.push({ action: { _contains: filters.operationType } });
  }

  if (filters.dateFrom || filters.dateTo) {
    // Add date filters
  }

  return await directusApiRequest.call(
    this,
    'GET',
    '/activity',
    {},
    {
      filter: queryFilters,
      sort: ['-timestamp'],
      limit: filters.limit || 100,
    },
  );
}
```

### 3. Add Performance Metrics (30 min)
- [ ] Calculate average execution time
- [ ] Count successful vs failed executions
- [ ] Identify slowest operations
- [ ] Generate summary statistics

## Testing
- [ ] Trigger multiple flows
- [ ] Filter activity by specific flow ID
- [ ] Filter by execution ID
- [ ] Generate performance report
- [ ] Verify metrics accuracy

## Expected Outcomes
- ✅ Filter activity logs by flow
- ✅ Flow execution tracking
- ✅ Performance metrics
- ✅ Error rate analysis

## Files Modified
- `nodes/Directus/Descriptions/ActivityDescription.ts`
- `nodes/Directus/GenericFunctions.ts`
- `nodes/Directus/Directus.node.ts`

## Dependencies
**Blocked By**: Task 004 (need flows to log)
**Can Run in Parallel With**: Tasks 016-017

## Definition of Done
- [ ] Flow activity filters implemented
- [ ] Performance metrics working
- [ ] Tests passing
- [ ] Git commit: "feat: add flow-specific activity log filtering"
