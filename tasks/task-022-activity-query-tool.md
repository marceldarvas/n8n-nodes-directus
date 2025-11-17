# Task 022: AI Agent Activity Query Tool

## Priority: MEDIUM
**Effort**: 2-3 hours
**Developer**: AI/Agent specialist
**Phase**: 6 - AI Agent Integration

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- ✅ Task 018: Tool Wrapper Architecture
- ✅ Task 019: Function Calling Schemas

## Description
Implement the activity query tool for AI agents, enabling querying and analysis of Directus activity logs through natural language for "log activity" requirement.

## Implementation

### 1. Create Activity Query Tool Class (1.5 hours)
```typescript
class QueryDirectusActivityTool extends DirectusAgentTool {
  name = 'query_directus_activity';
  description = 'Retrieves Directus activity logs';
  parameters = {
    type: 'object',
    properties: {
      collection: { type: 'string', description: 'Filter by collection' },
      user_id: { type: 'string', description: 'Filter by user' },
      action: { type: 'string', enum: ['create', 'update', 'delete'] },
      date_from: { type: 'string', format: 'date-time' },
      date_to: { type: 'string', format: 'date-time' },
      limit: { type: 'number', default: 50, maximum: 1000 },
    },
  };

  async run(context: IExecuteFunctions, params: any): Promise<any> {
    const filters: any = { _and: [] };

    if (params.collection) {
      filters._and.push({ collection: { _eq: params.collection } });
    }
    if (params.user_id) {
      filters._and.push({ user: { _eq: params.user_id } });
    }
    if (params.action) {
      filters._and.push({ action: { _eq: params.action } });
    }
    if (params.date_from || params.date_to) {
      const dateFilter: any = {};
      if (params.date_from) dateFilter._gte = params.date_from;
      if (params.date_to) dateFilter._lte = params.date_to;
      filters._and.push({ timestamp: dateFilter });
    }

    const activities = await directusApiRequest.call(
      context,
      'GET',
      '/activity',
      {},
      {
        filter: filters,
        limit: params.limit || 50,
        sort: ['-timestamp'],
      },
    );

    return {
      count: activities.data.length,
      activities: activities.data.map((a: any) => ({
        timestamp: a.timestamp,
        user: a.user,
        action: a.action,
        collection: a.collection,
        item: a.item,
      })),
    };
  }
}
```

### 2. Add Activity Summary Tool (1 hour)
- [ ] Summarize activity by user
- [ ] Summarize by collection
- [ ] Time-based aggregation

### 3. Register Tools (30 min)

## Testing with AI Agent
```
User: "Show me all user creations in the last 7 days"

AI Agent: [Calls query_directus_activity with filters]

Response: {
  "success": true,
  "data": {
    "count": 15,
    "activities": [...]
  }
}
```

## Expected Outcomes
- ✅ Query activity logs via AI
- ✅ Flexible filtering options
- ✅ Activity summaries
- ✅ Natural language activity queries

## Files Created
- New: `nodes/Directus/AgentTools/QueryDirectusActivityTool.ts`
- New: `nodes/Directus/AgentTools/ActivitySummaryTool.ts`

## Dependencies
**Blocked By**: Tasks 018, 019
**Can Run in Parallel With**: Tasks 020, 021, 023

## Definition of Done
- [ ] Activity query tool implemented
- [ ] Summary tool functional
- [ ] Tests passing with AI agent
- [ ] Git commit: "feat: add AI agent activity query tool"
