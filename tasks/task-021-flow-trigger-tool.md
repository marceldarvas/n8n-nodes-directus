# Task 021: AI Agent Flow Trigger Tool

## Priority: CRITICAL
**Effort**: 3-4 hours
**Developer**: AI/Agent specialist
**Phase**: 6 - AI Agent Integration

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- ✅ Task 018: Tool Wrapper Architecture
- ✅ Task 019: Function Calling Schemas
- ✅ Task 004: Flow Trigger Operation

## Description
Implement the flow trigger tool for AI agents, enabling triggering and monitoring of Directus Flows through natural language. **CRITICAL** for the use case requirement "trigger flows."

## Implementation

### 1. Create Flow Trigger Tool Class (2 hours)
```typescript
class TriggerDirectusFlowTool extends DirectusAgentTool {
  name = 'trigger_directus_flow';
  description = 'Triggers a Directus Flow automation';
  parameters = {
    type: 'object',
    properties: {
      flow_name: { type: 'string', description: 'Flow name to trigger' },
      payload: { type: 'object', description: 'Data for flow (optional)' },
      wait_for_completion: { type: 'boolean', default: false },
    },
    required: ['flow_name'],
  };

  async run(context: IExecuteFunctions, params: any): Promise<any> {
    // Resolve flow name to ID
    const flowId = await getFlowIdByName.call(context, params.flow_name);

    // Trigger flow
    const result = await triggerFlow.call(
      context,
      flowId,
      params.payload,
    );

    // If wait for completion, poll for result
    if (params.wait_for_completion) {
      const execution = await pollFlowExecution.call(
        context,
        result.execution_id,
      );
      return {
        execution_id: result.execution_id,
        status: execution.status,
        result: execution.result,
      };
    }

    return {
      execution_id: result.execution_id,
      status: 'triggered',
      message: `Flow "${params.flow_name}" triggered successfully`,
    };
  }
}
```

### 2. Add Flow Status Tool (1 hour)
- [ ] Check flow execution status
- [ ] Get flow execution results
- [ ] Monitor for completion

### 3. Add Flow Query Tool (30 min)
- [ ] List available flows
- [ ] Search flows by name
- [ ] Get flow details

### 4. Register Tools (30 min)

## Testing with AI Agent
```
User: "Trigger the 'Send Welcome Email' flow for
       user john@example.com"

AI Agent: [Calls trigger_directus_flow]

Response: {
  "success": true,
  "data": {
    "execution_id": "xyz789",
    "status": "triggered",
    "message": "Flow 'Send Welcome Email' triggered successfully"
  }
}
```

## Expected Outcomes
- ✅ Trigger flow tool functional
- ✅ Flow status monitoring working
- ✅ AI can trigger flows via natural language
- ✅ Support for sync and async execution
- ✅ Clear execution feedback

## Files Created
- New: `nodes/Directus/AgentTools/TriggerDirectusFlowTool.ts`
- New: `nodes/Directus/AgentTools/FlowStatusTool.ts`
- New: `nodes/Directus/AgentTools/QueryFlowsTool.ts`

## Dependencies
**Blocked By**: Tasks 018, 019, 004
**Can Run in Parallel With**: Tasks 020, 022, 023

## Definition of Done
- [ ] Flow trigger tool implemented
- [ ] Status monitoring functional
- [ ] Tests passing with AI agent
- [ ] Natural language flow triggering working
- [ ] Git commit: "feat: add AI agent flow trigger tool"
