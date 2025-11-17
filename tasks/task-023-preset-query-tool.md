# Task 023: AI Agent Preset Query Tool

## Priority: MEDIUM
**Effort**: 2-3 hours
**Developer**: AI/Agent specialist
**Phase**: 6 - AI Agent Integration

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- ✅ Task 018: Tool Wrapper Architecture
- ✅ Task 019: Function Calling Schemas
- ✅ Task 011: Apply Presets

## Description
Implement the preset query tool for AI agents, enabling data extraction using Directus filter presets through natural language.

## Implementation

### 1. Create Preset Query Tool Class (1.5 hours)
```typescript
class QueryWithPresetTool extends DirectusAgentTool {
  name = 'query_with_preset';
  description = 'Queries data using Directus filter preset';
  parameters = {
    type: 'object',
    properties: {
      collection: { type: 'string', description: 'Collection to query' },
      preset_name: { type: 'string', description: 'Preset name' },
      additional_filters: { type: 'object', description: 'Extra filters' },
      limit: { type: 'number', default: 100 },
    },
    required: ['collection', 'preset_name'],
  };

  async run(context: IExecuteFunctions, params: any): Promise<any> {
    // Apply preset to query
    const results = await applyPresetToQuery.call(
      context,
      params.collection,
      params.preset_name,
      params.additional_filters,
    );

    return {
      collection: params.collection,
      preset: params.preset_name,
      count: results.data.length,
      items: results.data.slice(0, params.limit || 100),
    };
  }
}
```

### 2. Add List Presets Tool (1 hour)
- [ ] List available presets
- [ ] Filter by collection
- [ ] Get preset details

### 3. Register Tools (30 min)

## Testing with AI Agent
```
User: "Get published articles using the 'Recent Articles' preset"

AI Agent: [Calls query_with_preset]

Response: {
  "success": true,
  "data": {
    "collection": "articles",
    "preset": "Recent Articles",
    "count": 25,
    "items": [...]
  }
}
```

## Expected Outcomes
- ✅ Query data with presets via AI
- ✅ Preset discovery
- ✅ Natural language data extraction
- ✅ Leverage Directus filter UI from AI

## Files Created
- New: `nodes/Directus/AgentTools/QueryWithPresetTool.ts`
- New: `nodes/Directus/AgentTools/ListPresetsTool.ts`

## Dependencies
**Blocked By**: Tasks 018, 019, 011
**Can Run in Parallel With**: Tasks 020-022

## Definition of Done
- [ ] Preset query tool implemented
- [ ] List presets functional
- [ ] Tests passing with AI agent
- [ ] Git commit: "feat: add AI agent preset query tool"
