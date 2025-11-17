# Task 005: Flow Webhook Management

## Priority: MEDIUM
**Effort**: 4-6 hours
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
Add operations to create, update, and manage Directus Flow webhook configurations programmatically. This enables n8n workflows to dynamically create webhook-triggered flows, update trigger settings, and manage flow lifecycle.

## Background
While Task 004 handles triggering existing flows, this task focuses on managing the webhook configuration of flows themselves. This is useful for:
- Creating flows dynamically from n8n
- Updating webhook URLs and methods
- Configuring query parameter handling
- Managing flow triggers programmatically

## Implementation Steps

### 1. Extend Flow Description (1.5 hours)
- [ ] Add `create` operation to FlowDescription.ts
- [ ] Add `update` operation
- [ ] Add `delete` operation
- [ ] Add `getWebhookUrl` helper operation

```typescript
{
  name: 'Create',
  value: 'create',
  description: 'Create a new flow',
  action: 'Create a flow',
},
{
  name: 'Update',
  value: 'update',
  description: 'Update an existing flow',
  action: 'Update a flow',
},
{
  name: 'Delete',
  value: 'delete',
  description: 'Delete a flow',
  action: 'Delete a flow',
},
```

### 2. Add Create Flow Parameters (2 hours)
- [ ] Flow name (required)
- [ ] Flow description
- [ ] Trigger type selection (webhook, event, schedule, manual)
- [ ] Webhook method (GET/POST/PUT/DELETE)
- [ ] Webhook query parameters
- [ ] Status (active/inactive)
- [ ] Operations array (initial flow steps)

```typescript
{
  displayName: 'Flow Name',
  name: 'flowName',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['flow'],
      operation: ['create'],
    },
  },
  default: '',
  description: 'The name of the flow to create',
},
{
  displayName: 'Trigger Type',
  name: 'triggerType',
  type: 'options',
  options: [
    { name: 'Webhook', value: 'webhook' },
    { name: 'Event Hook', value: 'event' },
    { name: 'Schedule', value: 'schedule' },
    { name: 'Manual', value: 'manual' },
  ],
  default: 'webhook',
  description: 'Type of trigger for the flow',
},
```

### 3. Implement Create Flow Function (2 hours)
- [ ] Build flow configuration object
- [ ] Create trigger configuration based on type
- [ ] Handle webhook-specific settings
- [ ] Set up initial operations (optional)
- [ ] Return created flow with webhook URL

```typescript
async function createFlow(
  this: IExecuteFunctions,
  flowConfig: IFlowConfig,
): Promise<any> {
  const body = {
    name: flowConfig.name,
    description: flowConfig.description,
    status: flowConfig.status || 'active',
    trigger: {
      type: flowConfig.triggerType,
      ...(flowConfig.triggerType === 'webhook' && {
        method: flowConfig.webhookMethod || 'POST',
        async: flowConfig.async !== false,
      }),
    },
    operations: flowConfig.operations || [],
  };

  const response = await directusApiRequest.call(
    this,
    'POST',
    '/flows',
    body,
  );

  // Add webhook URL to response
  if (flowConfig.triggerType === 'webhook') {
    response.webhookUrl = `/flows/trigger/${response.data.id}`;
  }

  return response.data;
}
```

### 4. Add Update Flow Function (1 hour)
- [ ] Support updating flow name/description
- [ ] Update trigger configuration
- [ ] Update webhook method
- [ ] Update status (activate/deactivate)
- [ ] Partial updates support

```typescript
async function updateFlow(
  this: IExecuteFunctions,
  flowId: string,
  updates: Partial<IFlowConfig>,
): Promise<any> {
  const body: any = {};

  if (updates.name) body.name = updates.name;
  if (updates.description) body.description = updates.description;
  if (updates.status) body.status = updates.status;
  if (updates.triggerType || updates.webhookMethod) {
    body.trigger = {
      ...(updates.triggerType && { type: updates.triggerType }),
      ...(updates.webhookMethod && { method: updates.webhookMethod }),
    };
  }

  return await directusApiRequest.call(
    this,
    'PATCH',
    `/flows/${flowId}`,
    body,
  );
}
```

### 5. Add Webhook URL Helper (30 min)
- [ ] Generate full webhook URL for a flow
- [ ] Include Directus instance base URL
- [ ] Support query parameter preview
- [ ] Return curl command example (for testing)

```typescript
async function getFlowWebhookUrl(
  this: IExecuteFunctions,
  flowId: string,
): Promise<string> {
  const credentials = await this.getCredentials('directusApi');
  const baseUrl = credentials.url as string;
  return `${baseUrl}/flows/trigger/${flowId}`;
}
```

### 6. Integrate into Main Node (1 hour)
- [ ] Add create/update/delete operations to execute()
- [ ] Handle flow CRUD in switch statement
- [ ] Add proper error handling for each operation
- [ ] Format output appropriately

## Testing Criteria

### Unit Tests
```typescript
describe('Flow Webhook Management', () => {
  it('should create flow with webhook trigger', async () => {
    const config = {
      name: 'Test Flow',
      triggerType: 'webhook',
      webhookMethod: 'POST',
    };
    const result = await createFlow(config);
    expect(result).toHaveProperty('id');
    expect(result.webhookUrl).toContain('/flows/trigger/');
  });

  it('should update flow trigger method', async () => {
    const flowId = 'test-flow-id';
    const updates = { webhookMethod: 'GET' };
    const result = await updateFlow(flowId, updates);
    expect(result.trigger.method).toBe('GET');
  });

  it('should generate webhook URL', async () => {
    const flowId = 'test-flow-id';
    const url = await getFlowWebhookUrl(flowId);
    expect(url).toMatch(/^https?:\/\/.*\/flows\/trigger\/test-flow-id$/);
  });
});
```

### Integration Tests
1. **Create Webhook Flow**
   - [ ] Create flow via n8n
   - [ ] Verify flow appears in Directus
   - [ ] Test generated webhook URL works
   - [ ] Trigger flow using webhook URL
   - [ ] Verify flow executes

2. **Update Flow Configuration**
   - [ ] Create flow
   - [ ] Update webhook method from POST to GET
   - [ ] Verify method change in Directus
   - [ ] Test updated webhook works with new method

3. **Delete Flow**
   - [ ] Create flow
   - [ ] Delete flow via n8n
   - [ ] Verify flow removed from Directus
   - [ ] Verify webhook URL no longer works

4. **Flow Lifecycle**
   - [ ] Create inactive flow
   - [ ] Verify webhook doesn't trigger
   - [ ] Update status to active
   - [ ] Verify webhook now works

## Expected Outcomes
- ✅ Create flow operation with webhook configuration
- ✅ Update flow operation for modifying triggers
- ✅ Delete flow operation
- ✅ Webhook URL generation helper
- ✅ Support for all trigger types (webhook, event, schedule, manual)
- ✅ Flow status management (active/inactive)
- ✅ Integration with existing flow trigger operation

## Files Modified
- `nodes/Directus/Descriptions/FlowDescription.ts` (add operations)
- `nodes/Directus/GenericFunctions.ts` (add createFlow, updateFlow functions)
- `nodes/Directus/Directus.node.ts` (add execute logic)

## API Endpoints Used
- `POST /flows` - Create flow
- `PATCH /flows/{id}` - Update flow
- `DELETE /flows/{id}` - Delete flow
- `GET /flows/{id}` - Get flow details

## Example Flow Configuration

### Simple Webhook Flow
```json
{
  "name": "User Registration Handler",
  "description": "Handles new user registrations",
  "triggerType": "webhook",
  "webhookMethod": "POST",
  "status": "active",
  "operations": [
    {
      "type": "log",
      "options": {
        "message": "New user: {{$trigger.body.email}}"
      }
    }
  ]
}
```

### Event Hook Flow
```json
{
  "name": "Article Published",
  "triggerType": "event",
  "eventType": "items.create",
  "collection": "articles",
  "status": "active"
}
```

## Dependencies
**Blocks**:
- Task 021: AI Agent Flow Trigger Tool (benefits from dynamic flow creation)

**Blocked By**:
- Task 001: Syntax errors
- Task 004: Flow trigger operation (need basic flow support first)

**Can Run in Parallel With**:
- Task 006: Flow Monitoring (different concern)
- Task 007: Flow Chaining (different concern)
- Task 008-010: User management
- Task 011-014: Filter presets

## Notes
- This is an advanced feature - not critical for initial MVP
- Focus on webhook flows first (most common use case)
- Event hooks require collection/action configuration
- Schedule flows need cron expression support
- Consider adding flow template library in future
- Webhook URLs should be clearly displayed to users

## Concurrency
✅ **Can be developed in parallel with Tasks 006, 007, 008-010, 011-014** after Task 004

## Related Documentation
- Directus Flows API: https://docs.directus.io/api/flows
- Flow Triggers: https://docs.directus.io/guides/automate/flows#triggers
- Operations: https://docs.directus.io/api/operations

## Security Considerations
- [ ] Validate flow names (no injection)
- [ ] Restrict flow creation to admin users (check permissions)
- [ ] Sanitize operation configurations
- [ ] Warn about public webhook URLs
- [ ] Consider webhook authentication options

## Definition of Done
- [ ] Create flow operation implemented
- [ ] Update flow operation implemented
- [ ] Delete flow operation implemented
- [ ] Webhook URL helper working
- [ ] Unit tests passing
- [ ] Integration tests with Directus successful
- [ ] All trigger types supported
- [ ] Documentation updated
- [ ] Git commit with message: "feat: add flow webhook management operations"
