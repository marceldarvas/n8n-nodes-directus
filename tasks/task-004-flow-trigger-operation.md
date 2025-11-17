# Task 004: Implement Flow Trigger Operation

## Priority: CRITICAL
**Effort**: 8-12 hours
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
- ✅ Task 002: Enhanced Error Handling (recommended for better error messages)

## Description
Implement the ability to trigger Directus Flows from n8n workflows. This is a **CRITICAL** feature for the use case "trigger flows" mentioned in INTEGRATION_RESEARCH.md. Currently, Flow operations are completely missing from the node.

## Background
Directus Flows are event-driven automation pipelines. They can be triggered via:
- Webhooks (POST requests to `/flows/trigger/{flow_id}`)
- Manual triggers from the UI
- Event hooks (database events)
- Schedule triggers (cron)

This task focuses on webhook-based triggering from n8n.

## Implementation Steps

### 1. Create Flow Description File (2 hours)
- [ ] Create `nodes/Directus/Descriptions/FlowDescription.ts`
- [ ] Define Flow resource operations:
  - `trigger` - Trigger a flow via webhook
  - `get` - Get flow details by ID
  - `list` - List all flows
- [ ] Add operation parameters

```typescript
export const flowOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    displayOptions: {
      show: {
        resource: ['flow'],
      },
    },
    options: [
      {
        name: 'Trigger',
        value: 'trigger',
        description: 'Trigger a flow via webhook',
        action: 'Trigger a flow',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a flow by ID',
        action: 'Get a flow',
      },
      {
        name: 'List',
        value: 'list',
        description: 'List all flows',
        action: 'List flows',
      },
    ],
    default: 'trigger',
  },
];
```

### 2. Add Trigger Flow Parameters (2 hours)
- [ ] Flow selection (by ID or name)
- [ ] Payload input (JSON object)
- [ ] Execution mode (async/sync)
- [ ] Query parameters support
- [ ] Return options configuration

```typescript
// Flow selection parameter
{
  displayName: 'Flow',
  name: 'flowId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['flow'],
      operation: ['trigger'],
    },
  },
  default: '',
  placeholder: 'e.g., 8cbb43fe-4cdf-4991-8352-c461779cad5f',
  description: 'The ID of the flow to trigger',
}
```

### 3. Implement Flow Name Lookup Helper (1.5 hours)
- [ ] Add function to query flows by name
- [ ] Cache flow IDs for performance
- [ ] Handle flow not found errors
- [ ] Support partial name matching (optional)

```typescript
async function getFlowIdByName(
  this: IExecuteFunctions,
  flowName: string,
): Promise<string> {
  const flows = await directusApiRequest.call(
    this,
    'GET',
    '/flows',
    {},
    { filter: { name: { _eq: flowName } } },
  );

  if (flows.data.length === 0) {
    throw new Error(`Flow "${flowName}" not found`);
  }

  return flows.data[0].id;
}
```

### 4. Implement Trigger Flow Function (3 hours)
- [ ] Create `triggerFlow()` function in GenericFunctions.ts
- [ ] Build webhook trigger URL: `/flows/trigger/{flow_id}`
- [ ] Support GET and POST methods
- [ ] Handle payload passing
- [ ] Add query parameters support
- [ ] Parse response (execution ID, status)

```typescript
async function triggerFlow(
  this: IExecuteFunctions,
  flowId: string,
  payload?: object,
  queryParams?: object,
): Promise<any> {
  const method = payload ? 'POST' : 'GET';
  const endpoint = `/flows/trigger/${flowId}`;

  const response = await directusApiRequest.call(
    this,
    method,
    endpoint,
    payload || {},
    queryParams || {},
  );

  return response;
}
```

### 5. Add Execution Mode Support (1.5 hours)
- [ ] Async mode - Trigger and return immediately
- [ ] Sync mode - Wait for flow completion (polling)
- [ ] Configurable polling interval (default: 1s)
- [ ] Max polling duration (default: 60s)
- [ ] Return flow execution results

```typescript
// Sync execution with polling
if (executionMode === 'sync') {
  const executionId = response.execution_id;
  const result = await pollFlowExecution.call(this, executionId);
  return result;
}
```

### 6. Integrate into Main Node (2 hours)
- [ ] Add 'flow' to resource list in Directus.node.ts
- [ ] Import FlowDescription
- [ ] Add flow operations to properties
- [ ] Implement execute() logic for flow operations
- [ ] Add proper error handling
- [ ] Test all flow operations

### 7. Add Return Data Options (1 hour)
- [ ] Option to return execution ID only
- [ ] Option to return full response
- [ ] Option to return flow metadata
- [ ] Format output for AI agents

## Testing Criteria

### Unit Tests
```typescript
describe('Flow Operations', () => {
  it('should trigger flow with payload', async () => {
    const flowId = 'test-flow-id';
    const payload = { key: 'value' };
    const result = await triggerFlow(flowId, payload);
    expect(result).toHaveProperty('execution_id');
  });

  it('should find flow by name', async () => {
    const flowName = 'Test Flow';
    const flowId = await getFlowIdByName(flowName);
    expect(flowId).toBeTruthy();
  });

  it('should handle flow not found error', async () => {
    await expect(getFlowIdByName('NonExistent')).rejects.toThrow();
  });
});
```

### Integration Tests
1. **Manual Flow Trigger**
   - [ ] Create a simple flow in Directus with webhook trigger
   - [ ] Trigger flow from n8n with empty payload
   - [ ] Verify flow executes
   - [ ] Check execution appears in Directus activity log

2. **Flow with Payload**
   - [ ] Create flow that uses webhook payload data
   - [ ] Trigger with JSON payload from n8n
   - [ ] Verify payload data is accessible in flow
   - [ ] Check flow operations receive correct data

3. **Flow Name Lookup**
   - [ ] Trigger flow using name instead of ID
   - [ ] Verify name resolves to correct flow
   - [ ] Test with non-existent name (should error)

4. **Async vs Sync Execution**
   - [ ] Test async mode returns immediately
   - [ ] Test sync mode waits for completion
   - [ ] Verify sync mode returns flow results

### Error Scenarios
- [ ] Invalid flow ID (404 error)
- [ ] Flow not found by name
- [ ] Invalid payload format
- [ ] Permission denied (403)
- [ ] Flow execution timeout
- [ ] Network failure during trigger

## Expected Outcomes
- ✅ New 'Flow' resource in Directus node
- ✅ Trigger operation with ID or name selection
- ✅ Payload passing support (JSON object)
- ✅ Async and sync execution modes
- ✅ Flow listing and detail retrieval
- ✅ Clear error messages for AI agents
- ✅ Comprehensive test coverage

## Files Created/Modified
- New file: `nodes/Directus/Descriptions/FlowDescription.ts`
- Modified: `nodes/Directus/Directus.node.ts` (add flow resource)
- Modified: `nodes/Directus/GenericFunctions.ts` (add flow functions)

## API Endpoints Used
- `POST /flows/trigger/{flow_id}` - Trigger flow with payload
- `GET /flows/trigger/{flow_id}` - Trigger flow without payload
- `GET /flows` - List flows (for name lookup)
- `GET /flows/{id}` - Get flow details

## Example Usage in n8n

### Trigger Flow by ID
```json
{
  "resource": "flow",
  "operation": "trigger",
  "flowId": "8cbb43fe-4cdf-4991-8352-c461779cad5f",
  "payload": {
    "user_email": "test@example.com",
    "action": "welcome"
  },
  "executionMode": "async"
}
```

### Trigger Flow by Name
```json
{
  "resource": "flow",
  "operation": "trigger",
  "flowIdentifier": "name",
  "flowName": "Send Welcome Email",
  "payload": {
    "user_email": "test@example.com"
  },
  "executionMode": "sync",
  "maxWaitTime": 30
}
```

## Dependencies
**Blocks**:
- Task 005: Flow Webhook Management (needs trigger basics)
- Task 006: Flow Monitoring (needs execution IDs)
- Task 007: Flow Chaining (needs trigger capability)
- Task 021: AI Agent Flow Trigger Tool (needs this foundation)

**Blocked By**:
- Task 001: Syntax errors
- Task 002: Error handling (recommended)

**Can Run in Parallel With**:
- Task 003: OAuth2 (different feature)
- Task 008-010: User management (different resource)
- Task 011-014: Filter presets (different resource)

## Notes
- This is the HIGHEST PRIORITY task for the use case
- Flow triggering is essential for "trigger flows" requirement
- Design API to be AI agent-friendly (clear inputs/outputs)
- Consider adding flow execution status checking in sync mode
- Query parameters can pass dynamic values to flows
- Ensure payload format matches Directus Flow webhook expectations

## Concurrency
✅ **Can be developed in parallel with Tasks 003, 008-010, 011-014** (different resources)
⚠️ **Should be completed BEFORE Tasks 005-007** (flow operations build on this)

## Related Documentation
- Directus Flows: https://docs.directus.io/guides/automate/flows
- Flow Triggers: https://learndirectus.com/how-to-trigger-a-flow/
- Webhook Params: https://rphl.dev/blog/sending-params-to-directus-flow

## Definition of Done
- [ ] Flow resource added to Directus node
- [ ] Trigger operation implemented and tested
- [ ] Flow name lookup working
- [ ] Async and sync execution modes functional
- [ ] Unit tests passing with >80% coverage
- [ ] Integration tests passing with live Directus flows
- [ ] Error handling comprehensive and clear
- [ ] Documentation added to README
- [ ] Git commit with message: "feat: add flow trigger operation for Directus Flows"
- [ ] Code review approved
