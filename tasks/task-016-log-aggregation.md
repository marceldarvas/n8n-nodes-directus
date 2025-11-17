# Task 016: Custom Log Aggregation and Analytics

## Priority: LOW
**Effort**: 3-4 hours
**Developer**: Any
**Phase**: 5 - Activity & Logging Enhancement

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- ✅ Task 001: Fix Syntax Errors

## Description
Create operations to aggregate activity logs and generate analytics reports: user activity summaries, collection usage statistics, error frequency analysis, and peak usage detection.

## Implementation Steps

### 1. Add Aggregation Operations (1.5 hours)
- [ ] User activity summary
- [ ] Collection usage stats
- [ ] Error frequency by type
- [ ] Peak usage time analysis

### 2. Implement Aggregation Functions (2 hours)
```typescript
async function aggregateActivityByUser(
  this: IExecuteFunctions,
  dateRange: IDateRange,
): Promise<IUserActivitySummary[]> {
  const activities = await directusApiRequest.call(
    this,
    'GET',
    '/activity',
    {},
    {
      filter: {
        timestamp: {
          _gte: dateRange.from,
          _lte: dateRange.to,
        },
      },
      limit: -1,
    },
  );

  // Group by user and count actions
  const userStats = activities.data.reduce((acc, activity) => {
    if (!acc[activity.user]) {
      acc[activity.user] = {
        user: activity.user,
        actions: 0,
        creates: 0,
        updates: 0,
        deletes: 0,
      };
    }
    acc[activity.user].actions++;
    acc[activity.user][`${activity.action}s`]++;
    return acc;
  }, {});

  return Object.values(userStats);
}
```

### 3. Add Report Generation (30 min)
- [ ] Daily/weekly/monthly reports
- [ ] CSV export
- [ ] Chart-ready data format

## Testing
- [ ] Generate user activity report
- [ ] Aggregate errors by collection
- [ ] Identify peak hours
- [ ] Export as CSV

## Expected Outcomes
- ✅ User activity summaries
- ✅ Collection usage statistics
- ✅ Error analysis reports
- ✅ Time-based usage patterns
- ✅ Export capabilities

## Files Modified
- `nodes/Directus/Descriptions/ActivityDescription.ts`
- `nodes/Directus/GenericFunctions.ts`
- `nodes/Directus/Directus.node.ts`

## Dependencies
**Can Run in Parallel With**: All tasks except 001

## Definition of Done
- [ ] Aggregation operations implemented
- [ ] Reports generated correctly
- [ ] Export functional
- [ ] Tests passing
- [ ] Git commit: "feat: add log aggregation and analytics"
