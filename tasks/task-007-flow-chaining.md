# Task 007: Flow Chain Management

## Priority: MEDIUM
**Effort**: 4-5 hours
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
Implement operations to trigger multiple flows in sequence, pass data between flows, implement conditional flow execution, and loop through arrays to trigger flows for each item. This enables complex flow orchestration from n8n.

## Background
Directus Flows can trigger other flows using the "Trigger Flow" operation. This task adds n8n-level orchestration to:
- Chain multiple flows together
- Pass data from one flow to the next
- Conditionally execute flows based on results
- Loop through data arrays, triggering flows for each item

## Implementation Steps

### 1. Add Chain Flow Operation (1 hour)
- [ ] Add `chainFlows` operation to FlowDescription.ts
- [ ] Add `loopFlows` operation
- [ ] Define parameters for flow sequences

```typescript
{
  name: 'Chain Flows',
  value: 'chainFlows',
  description: 'Trigger multiple flows in sequence',
  action: 'Chain flows together',
},
{
  name: 'Loop Flows',
  value: 'loopFlows',
  description: 'Loop through data and trigger flow for each item',
  action: 'Loop through data with flow',
},
```

### 2. Add Chain Flow Parameters (1 hour)
- [ ] Flow sequence array (flow IDs or names)
- [ ] Initial payload
- [ ] Data passing strategy (full, partial, transform)
- [ ] Error handling (stop on error, continue, rollback)
- [ ] Execution mode (sequential, parallel)

```typescript
{
  displayName: 'Flows to Chain',
  name: 'flowChain',
  type: 'fixedCollection',
  typeOptions: {
    multipleValues: true,
  },
  default: {},
  options: [
    {
      displayName: 'Flow',
      name: 'flow',
      values: [
        {
          displayName: 'Flow ID or Name',
          name: 'flowId',
          type: 'string',
          default: '',
        },
        {
          displayName: 'Pass Data',
          name: 'passData',
          type: 'options',
          options: [
            { name: 'All Data', value: 'all' },
            { name: 'Result Only', value: 'result' },
            { name: 'Custom', value: 'custom' },
          ],
          default: 'all',
        },
      ],
    },
  ],
},
```

### 3. Implement Chain Flows Function (2 hours)
- [ ] Loop through flow sequence
- [ ] Trigger each flow with previous result
- [ ] Handle data transformation between flows
- [ ] Collect results from all flows
- [ ] Implement error handling strategies

```typescript
async function chainFlows(
  this: IExecuteFunctions,
  flowChain: IFlowChainConfig[],
  initialPayload: any,
  options: IChainOptions,
): Promise<any[]> {
  const results: any[] = [];
  let currentPayload = initialPayload;

  for (const flowConfig of flowChain) {
    try {
      // Trigger flow with current payload
      const result = await triggerFlow.call(
        this,
        flowConfig.flowId,
        currentPayload,
      );

      results.push(result);

      // Prepare payload for next flow based on passData strategy
      if (flowConfig.passData === 'all') {
        currentPayload = { ...currentPayload, ...result };
      } else if (flowConfig.passData === 'result') {
        currentPayload = result;
      } else if (flowConfig.passData === 'custom') {
        currentPayload = transformPayload(currentPayload, result, flowConfig.transform);
      }

      // Add delay if configured
      if (options.delayMs) {
        await new Promise((resolve) => setTimeout(resolve, options.delayMs));
      }
    } catch (error) {
      if (options.errorHandling === 'stop') {
        throw new Error(`Flow chain failed at ${flowConfig.flowId}: ${error.message}`);
      } else if (options.errorHandling === 'continue') {
        results.push({ error: error.message, flowId: flowConfig.flowId });
      }
    }
  }

  return results;
}
```

### 4. Implement Loop Flows Function (1.5 hours)
- [ ] Accept array input
- [ ] Trigger flow for each array item
- [ ] Support parallel or sequential execution
- [ ] Collect results in array
- [ ] Add concurrency limit for parallel mode

```typescript
async function loopFlows(
  this: IExecuteFunctions,
  flowId: string,
  dataArray: any[],
  options: ILoopOptions,
): Promise<any[]> {
  if (options.executionMode === 'sequential') {
    const results: any[] = [];

    for (const item of dataArray) {
      const result = await triggerFlow.call(this, flowId, item);
      results.push(result);

      if (options.delayMs) {
        await new Promise((resolve) => setTimeout(resolve, options.delayMs));
      }
    }

    return results;
  } else {
    // Parallel execution with concurrency limit
    const concurrency = options.concurrency || 5;
    const results = await pLimit(concurrency, dataArray, async (item) => {
      return await triggerFlow.call(this, flowId, item);
    });

    return results;
  }
}
```

### 5. Add Conditional Flow Execution (30 min)
- [ ] Add condition evaluation helper
- [ ] Support simple comparisons (equals, greater than, etc.)
- [ ] Support expression-based conditions
- [ ] Trigger different flows based on condition

```typescript
function shouldExecuteFlow(
  condition: IFlowCondition,
  data: any,
): boolean {
  if (condition.type === 'simple') {
    const value = data[condition.field];
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'greaterThan':
        return value > condition.value;
      case 'contains':
        return String(value).includes(condition.value);
      default:
        return false;
    }
  } else if (condition.type === 'expression') {
    // Evaluate JavaScript expression safely
    return evaluateExpression(condition.expression, data);
  }

  return true;
}
```

### 6. Integrate into Main Node (30 min)
- [ ] Add chain/loop operations to execute()
- [ ] Handle flow orchestration logic
- [ ] Format results appropriately
- [ ] Add comprehensive error handling

## Testing Criteria

### Integration Tests
1. **Sequential Flow Chain**
   - [ ] Create 3 simple flows in Directus
   - [ ] Chain them from n8n (Flow A → Flow B → Flow C)
   - [ ] Verify each flow receives previous result
   - [ ] Check final result contains all data

2. **Parallel Flow Execution**
   - [ ] Chain flows with parallel execution mode
   - [ ] Verify all flows trigger simultaneously
   - [ ] Check concurrency limit respected
   - [ ] Verify results collected correctly

3. **Loop Through Array**
   - [ ] Create flow that processes single item
   - [ ] Pass array of 10 items
   - [ ] Verify flow triggered 10 times
   - [ ] Check all results returned

4. **Error Handling**
   - [ ] Chain flows where middle flow fails
   - [ ] Test "stop on error" - chain halts
   - [ ] Test "continue on error" - chain completes
   - [ ] Verify error details in results

5. **Conditional Execution**
   - [ ] Set up condition based on data
   - [ ] Trigger flow A if condition true
   - [ ] Trigger flow B if condition false
   - [ ] Verify correct flow executes

## Expected Outcomes
- ✅ Chain multiple flows in sequence
- ✅ Pass data between chained flows
- ✅ Loop through arrays triggering flows
- ✅ Sequential and parallel execution modes
- ✅ Conditional flow execution
- ✅ Configurable error handling (stop/continue)
- ✅ Concurrency limits for parallel execution
- ✅ Results collection from all flows

## Files Modified
- `nodes/Directus/Descriptions/FlowDescription.ts` (add chain operations)
- `nodes/Directus/GenericFunctions.ts` (add chain/loop functions)
- `nodes/Directus/Directus.node.ts` (add execute logic)

## Example Usage

### Chain Flows
```json
{
  "operation": "chainFlows",
  "flowChain": [
    { "flowId": "validate-user", "passData": "result" },
    { "flowId": "create-account", "passData": "all" },
    { "flowId": "send-welcome", "passData": "custom" }
  ],
  "initialPayload": { "email": "user@example.com" },
  "errorHandling": "stop"
}
```

### Loop Flows
```json
{
  "operation": "loopFlows",
  "flowId": "process-order",
  "dataArray": [
    { "orderId": 1, "amount": 100 },
    { "orderId": 2, "amount": 200 }
  ],
  "executionMode": "parallel",
  "concurrency": 3
}
```

## Dependencies
**Blocks**:
- Task 021: AI Agent Flow Trigger Tool (advanced orchestration)

**Blocked By**:
- Task 001: Syntax errors
- Task 004: Flow trigger (need basic trigger first)

**Can Run in Parallel With**:
- Task 005: Flow webhook management
- Task 006: Flow monitoring
- Task 008-010: User management
- Task 011-014: Filter presets

## Notes
- Sequential execution is safer but slower
- Parallel execution needs careful concurrency management
- Error handling strategy depends on use case
- Consider rate limiting when looping through large arrays
- Data transformation between flows is powerful but complex
- May want to add rollback support in future

## Concurrency
✅ **Can be developed in parallel with Tasks 005, 006, 008-014** after Task 004

## Related Documentation
- Trigger Flow Operation: https://learndirectus.com/how-to-loop-through-data-in-flows/
- Flow Chaining: https://directus.io/docs/guides/automate/operations

## Definition of Done
- [ ] Chain flows operation implemented
- [ ] Loop flows operation implemented
- [ ] Sequential execution working
- [ ] Parallel execution with concurrency control
- [ ] Data passing between flows functional
- [ ] Error handling strategies implemented
- [ ] Integration tests passing
- [ ] Documentation updated
- [ ] Git commit with message: "feat: add flow chaining and loop operations"
