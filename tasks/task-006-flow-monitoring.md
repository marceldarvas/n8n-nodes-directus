# Task 006: Flow Execution Monitoring

## Priority: HIGH
**Effort**: 5-7 hours
**Developer**: Backend/API specialist
**Phase**: 2 - Flow Operations

## Status
- [ ] Not Started
- [ ] In Progress
- [ ] Code Review
- [ ] Testing
- [ ] Completed

## Prerequisites
- ✅ Task 001: Fix Syntax Errors
- ✅ Task 004: Flow Trigger Operation (MUST BE COMPLETED FIRST)

## Description
Implement operations to monitor flow execution status, retrieve flow logs, track errors, and analyze execution performance. This enables n8n workflows to query flow execution results, monitor for failures, and provide visibility into Directus automation.

## Background
When flows are triggered (especially in async mode), you need to:
- Check if execution completed successfully
- Retrieve execution logs and results
- Monitor for errors
- Track execution time and performance
- Filter activity logs by flow operations

This is essential for debugging and ensuring flows work correctly.

## Implementation Steps

### 1. Extend Flow Description (1 hour)
- [ ] Add `getExecution` operation to FlowDescription.ts
- [ ] Add `listExecutions` operation
- [ ] Add `getExecutionLogs` operation
- [ ] Add execution status filtering options

```typescript
{
  name: 'Get Execution',
  value: 'getExecution',
  description: 'Get details of a flow execution',
  action: 'Get flow execution',
},
{
  name: 'List Executions',
  value: 'listExecutions',
  description: 'List flow executions with filters',
  action: 'List flow executions',
},
{
  name: 'Get Execution Logs',
  value: 'getExecutionLogs',
  description: 'Get detailed logs for a flow execution',
  action: 'Get execution logs',
},
```

### 2. Add Execution Query Parameters (1.5 hours)
- [ ] Execution ID input
- [ ] Flow ID filter (list executions for specific flow)
- [ ] Date range filter
- [ ] Status filter (success/failed/running)
- [ ] Limit and pagination
- [ ] Sort options (by date, duration)

```typescript
{
  displayName: 'Execution ID',
  name: 'executionId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['flow'],
      operation: ['getExecution', 'getExecutionLogs'],
    },
  },
  default: '',
  description: 'The ID of the flow execution',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  options: [
    { name: 'All', value: 'all' },
    { name: 'Success', value: 'success' },
    { name: 'Failed', value: 'failed' },
    { name: 'Running', value: 'running' },
  ],
  default: 'all',
  displayOptions: {
    show: {
      resource: ['flow'],
      operation: ['listExecutions'],
    },
  },
  description: 'Filter by execution status',
},
```

### 3. Implement Get Execution Function (1.5 hours)
- [ ] Query activity logs for execution ID
- [ ] Parse execution status
- [ ] Extract execution metadata (start time, end time, duration)
- [ ] Return formatted execution details
- [ ] Handle execution not found errors

```typescript
async function getFlowExecution(
  this: IExecuteFunctions,
  executionId: string,
): Promise<IFlowExecution> {
  // Query activity logs for this execution
  const activities = await directusApiRequest.call(
    this,
    'GET',
    '/activity',
    {},
    {
      filter: {
        _and: [
          { action: { _eq: 'run' } },
          { collection: { _eq: 'directus_flows' } },
          { item: { _contains: executionId } },
        ],
      },
      sort: ['-timestamp'],
      limit: 1,
    },
  );

  if (activities.data.length === 0) {
    throw new Error(`Flow execution ${executionId} not found`);
  }

  const execution = activities.data[0];

  return {
    id: executionId,
    flowId: execution.item,
    status: execution.revisions?.[0]?.data?.status || 'unknown',
    startTime: execution.timestamp,
    user: execution.user,
    ip: execution.ip,
  };
}
```

### 4. Implement List Executions Function (1.5 hours)
- [ ] Query activity logs with filters
- [ ] Support flow ID filtering
- [ ] Support date range filtering
- [ ] Support status filtering
- [ ] Add pagination support
- [ ] Return array of executions with metadata

```typescript
async function listFlowExecutions(
  this: IExecuteFunctions,
  filters: IExecutionFilters,
): Promise<IFlowExecution[]> {
  const queryFilters: any = {
    _and: [
      { action: { _eq: 'run' } },
      { collection: { _eq: 'directus_flows' } },
    ],
  };

  if (filters.flowId) {
    queryFilters._and.push({ item: { _eq: filters.flowId } });
  }

  if (filters.dateFrom) {
    queryFilters._and.push({
      timestamp: { _gte: filters.dateFrom },
    });
  }

  if (filters.dateTo) {
    queryFilters._and.push({
      timestamp: { _lte: filters.dateTo },
    });
  }

  const activities = await directusApiRequest.call(
    this,
    'GET',
    '/activity',
    {},
    {
      filter: queryFilters,
      sort: ['-timestamp'],
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    },
  );

  return activities.data.map(parseExecutionFromActivity);
}
```

### 5. Implement Get Execution Logs (2 hours)
- [ ] Query all activity entries for execution
- [ ] Include operation-level logs
- [ ] Parse operation inputs/outputs
- [ ] Extract error messages
- [ ] Calculate execution time per operation
- [ ] Return detailed log structure

```typescript
async function getFlowExecutionLogs(
  this: IExecuteFunctions,
  executionId: string,
): Promise<IExecutionLogs> {
  // Get all activity related to this execution
  const activities = await directusApiRequest.call(
    this,
    'GET',
    '/activity',
    {},
    {
      filter: {
        _and: [
          { collection: { _eq: 'directus_flows' } },
          {
            _or: [
              { item: { _contains: executionId } },
              { comment: { _contains: executionId } },
            ],
          },
        ],
      },
      sort: ['timestamp'],
      limit: -1, // Get all logs
    },
  );

  // Parse logs by operation
  const operationLogs = activities.data.map((activity) => ({
    timestamp: activity.timestamp,
    operation: activity.action,
    input: activity.revisions?.[0]?.data?.input,
    output: activity.revisions?.[0]?.data?.output,
    error: activity.revisions?.[0]?.data?.error,
    duration: activity.revisions?.[0]?.data?.duration,
  }));

  return {
    executionId,
    operations: operationLogs,
    totalDuration: operationLogs.reduce((sum, op) => sum + (op.duration || 0), 0),
    errorCount: operationLogs.filter((op) => op.error).length,
  };
}
```

### 6. Add Polling Helper for Sync Mode (1 hour)
- [ ] Implement pollFlowExecution() function
- [ ] Configurable polling interval (default: 1000ms)
- [ ] Max polling duration (default: 60000ms)
- [ ] Return execution result when complete
- [ ] Throw timeout error if exceeded

```typescript
async function pollFlowExecution(
  this: IExecuteFunctions,
  executionId: string,
  maxWaitMs: number = 60000,
  intervalMs: number = 1000,
): Promise<any> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const execution = await getFlowExecution.call(this, executionId);

    if (execution.status === 'success' || execution.status === 'failed') {
      const logs = await getFlowExecutionLogs.call(this, executionId);
      return { execution, logs };
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Flow execution ${executionId} timed out after ${maxWaitMs}ms`);
}
```

### 7. Integrate into Main Node (30 min)
- [ ] Add execution operations to execute()
- [ ] Handle getExecution, listExecutions, getExecutionLogs
- [ ] Format output for readability
- [ ] Add error handling

## Testing Criteria

### Unit Tests
```typescript
describe('Flow Execution Monitoring', () => {
  it('should get execution details by ID', async () => {
    const executionId = 'test-execution-id';
    const execution = await getFlowExecution(executionId);
    expect(execution).toHaveProperty('status');
    expect(execution).toHaveProperty('flowId');
  });

  it('should list executions with filters', async () => {
    const filters = { flowId: 'test-flow-id', limit: 10 };
    const executions = await listFlowExecutions(filters);
    expect(Array.isArray(executions)).toBe(true);
  });

  it('should get execution logs with operations', async () => {
    const executionId = 'test-execution-id';
    const logs = await getFlowExecutionLogs(executionId);
    expect(logs).toHaveProperty('operations');
    expect(logs).toHaveProperty('totalDuration');
  });

  it('should poll execution until complete', async () => {
    const executionId = 'test-execution-id';
    const result = await pollFlowExecution(executionId, 10000);
    expect(result.execution.status).toMatch(/success|failed/);
  });
});
```

### Integration Tests
1. **Monitor Flow Execution**
   - [ ] Trigger a flow in async mode
   - [ ] Get execution ID from trigger response
   - [ ] Query execution status
   - [ ] Verify status updates from running to success

2. **List Flow Executions**
   - [ ] Trigger multiple flows
   - [ ] List all executions
   - [ ] Filter by specific flow ID
   - [ ] Filter by date range
   - [ ] Verify pagination works

3. **Get Execution Logs**
   - [ ] Trigger flow with multiple operations
   - [ ] Get execution logs
   - [ ] Verify all operations appear in logs
   - [ ] Check operation inputs/outputs
   - [ ] Verify error logs for failed operations

4. **Sync Mode Polling**
   - [ ] Trigger flow in sync mode
   - [ ] Verify polling occurs
   - [ ] Check result returned after completion
   - [ ] Test timeout scenario with slow flow

## Expected Outcomes
- ✅ Get execution details by ID
- ✅ List executions with filtering (flow, date, status)
- ✅ Retrieve detailed execution logs with operation data
- ✅ Polling helper for sync execution mode
- ✅ Execution performance metrics (duration, error count)
- ✅ Clear error messages for failed executions
- ✅ Pagination support for large result sets

## Files Modified
- `nodes/Directus/Descriptions/FlowDescription.ts` (add monitoring operations)
- `nodes/Directus/GenericFunctions.ts` (add monitoring functions)
- `nodes/Directus/Directus.node.ts` (add execute logic)

## API Endpoints Used
- `GET /activity` - Query flow execution logs
- `GET /activity?filter[collection][_eq]=directus_flows` - Flow-specific activity
- `GET /revisions` - Detailed revision data (operation inputs/outputs)

## Example Output

### Execution Details
```json
{
  "id": "abc123",
  "flowId": "8cbb43fe-4cdf-4991-8352-c461779cad5f",
  "status": "success",
  "startTime": "2025-01-15T10:30:00Z",
  "endTime": "2025-01-15T10:30:05Z",
  "duration": 5000,
  "user": "system",
  "triggerType": "webhook"
}
```

### Execution Logs
```json
{
  "executionId": "abc123",
  "totalDuration": 5000,
  "errorCount": 0,
  "operations": [
    {
      "timestamp": "2025-01-15T10:30:00Z",
      "operation": "log",
      "input": { "message": "Flow started" },
      "output": null,
      "duration": 10
    },
    {
      "timestamp": "2025-01-15T10:30:02Z",
      "operation": "request_url",
      "input": { "url": "https://api.example.com" },
      "output": { "status": 200, "data": "..." },
      "duration": 2000
    }
  ]
}
```

## Dependencies
**Blocks**:
- Task 021: AI Agent Flow Trigger Tool (needs monitoring for sync mode)

**Blocked By**:
- Task 001: Syntax errors
- Task 004: Flow trigger (need executions to monitor)

**Can Run in Parallel With**:
- Task 005: Flow webhook management
- Task 007: Flow chaining
- Task 008-010: User management
- Task 011-014: Filter presets

## Notes
- Activity logs are the primary source for execution data
- Directus may limit activity log retention (check settings)
- Operation logs include input/output only if tracking enabled in flow settings
- Consider adding execution export functionality in future
- Polling interval should be configurable per use case
- Long-running flows may need higher timeout limits

## Concurrency
✅ **Can be developed in parallel with Tasks 005, 007-014** after Task 004

## Related Documentation
- Directus Activity: https://docs.directus.io/api/activity
- Flow Logging: https://docs.directus.io/tutorials/tips-and-tricks/build-a-monitoring-pipeline-for-flows-and-extensions
- Revisions: https://docs.directus.io/api/revisions

## Definition of Done
- [ ] Get execution operation implemented
- [ ] List executions with filters implemented
- [ ] Get execution logs operation implemented
- [ ] Polling helper for sync mode functional
- [ ] Unit tests passing with >80% coverage
- [ ] Integration tests with live Directus flows successful
- [ ] Performance metrics calculated correctly
- [ ] Documentation updated
- [ ] Git commit with message: "feat: add flow execution monitoring and logging"
