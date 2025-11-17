# Task 013: Insights Dashboard Panel Data Access

## Priority: MEDIUM
**Effort**: 4-6 hours
**Developer**: Backend specialist
**Phase**: 4 - Filter Presets & Insights

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- ✅ Task 001: Fix Syntax Errors

## Description
Create operations to retrieve Insights panel configurations and execute panel queries to get dashboard data. This may require a custom Directus endpoint as panel result data is not directly exposed via standard API.

## Background
Directus Insights Panels show aggregated/filtered data in dashboards. According to INTEGRATION_RESEARCH.md:
- Panel configurations stored in database
- No direct API to retrieve panel result data
- Requires custom endpoint for panel query execution

## Implementation Steps

### 1. Add Insights Resource (1 hour)
- [ ] Create InsightsDescription.ts
- [ ] Add operations: list panels, get panel, execute panel
- [ ] Panel selection parameters

### 2. Implement List Panels (30 min)
```typescript
async function listInsightsPanels(
  this: IExecuteFunctions,
  dashboardId?: string,
): Promise<any> {
  const filter = dashboardId
    ? { dashboard: { _eq: dashboardId } }
    : {};

  return await directusApiRequest.call(
    this,
    'GET',
    '/panels',
    {},
    { filter },
  );
}
```

### 3. Implement Execute Panel Query (3 hours)
**Option A: Via Standard API (limited)**
- [ ] Get panel configuration
- [ ] Extract query parameters
- [ ] Execute query against collection
- [ ] Apply aggregations manually

**Option B: Via Custom Directus Endpoint (recommended)**
- [ ] Document how to create custom endpoint in Directus
- [ ] Provide endpoint code template
- [ ] Use custom endpoint from n8n
- [ ] Return panel result data

```typescript
// Custom Directus endpoint example for README
// extensions/endpoints/panel-data/index.js
export default (router, { services, database }) => {
  router.get('/:panelId', async (req, res) => {
    const { panelId } = req.params;
    const { ItemsService, PanelsService } = services;

    // Get panel config
    const panelsService = new PanelsService({ database, accountability: req.accountability });
    const panel = await panelsService.readOne(panelId);

    // Execute panel query
    const itemsService = new ItemsService(panel.collection, { database, accountability: req.accountability });
    const results = await itemsService.readByQuery(panel.query);

    res.json({ data: results });
  });
};
```

### 4. Add Variable Substitution (1 hour)
- [ ] Support panel filter variables
- [ ] Dynamic date ranges
- [ ] User context variables
- [ ] Custom variable values

### 5. Integrate into Node (30 min)
- [ ] Add insights resource to node
- [ ] Implement execute logic
- [ ] Format panel results

## Testing
- [ ] Create Insights dashboard in Directus
- [ ] Add panel with aggregation (e.g., count by status)
- [ ] List panels from n8n
- [ ] Execute panel query
- [ ] Verify data matches Directus UI
- [ ] Test with filter variables

## Expected Outcomes
- ✅ List Insights panels
- ✅ Get panel configurations
- ✅ Execute panel queries and return data
- ✅ Variable substitution support
- ✅ Documentation for custom endpoint setup

## Files Created/Modified
- New: `nodes/Directus/Descriptions/InsightsDescription.ts`
- `nodes/Directus/GenericFunctions.ts`
- `nodes/Directus/Directus.node.ts`
- README section on custom endpoint setup

## API Endpoints
- `GET /panels` - List panels
- `GET /panels/{id}` - Get panel config
- `GET /extensions/panel-data/{id}` - Execute panel (custom endpoint)

## Dependencies
**Can Run in Parallel With**: Tasks 002-012, 014-017

## Notes
- Custom endpoint is most reliable approach
- Provide clear setup instructions in README
- Panel queries can be complex (aggregations, joins)
- Consider security implications of custom endpoint

## Definition of Done
- [ ] Insights resource added
- [ ] Panel operations implemented
- [ ] Custom endpoint documented
- [ ] Tests passing
- [ ] Git commit: "feat: add Insights panel data access"
