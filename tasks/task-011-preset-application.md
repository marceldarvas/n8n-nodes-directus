# Task 011: Apply Presets to Data Queries

## Priority: HIGH
**Effort**: 4-5 hours
**Developer**: Any
**Phase**: 4 - Filter Presets & Insights

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- ✅ Task 001: Fix Syntax Errors

## Description
Enable applying saved filter presets to Items queries, making it easy to use Directus's user-friendly filter UI from n8n workflows. This addresses the requirement: "n8n should be able to access these filter presets for calling data."

## Background
Directus Presets store saved filters, search parameters, and view configurations. Currently:
- ✅ Presets can be retrieved (CRUD exists)
- ❌ Cannot apply preset filters to data queries
- ❌ No helper to execute queries with preset parameters

## Implementation Steps

### 1. Add Preset Application Helper (2 hours)
```typescript
async function applyPresetToQuery(
  this: IExecuteFunctions,
  collection: string,
  presetId: string,
): Promise<any> {
  // Get preset configuration
  const preset = await directusApiRequest.call(
    this,
    'GET',
    `/presets/${presetId}`,
  );

  // Extract filter rules and query params
  const queryParams: any = {};

  if (preset.data.filter) {
    queryParams.filter = preset.data.filter;
  }
  if (preset.data.search) {
    queryParams.search = preset.data.search;
  }
  if (preset.data.layout_query?.fields) {
    queryParams.fields = preset.data.layout_query.fields;
  }
  if (preset.data.layout_query?.sort) {
    queryParams.sort = preset.data.layout_query.sort;
  }

  // Query items with preset parameters
  return await directusApiRequest.call(
    this,
    'GET',
    `/items/${collection}`,
    {},
    queryParams,
  );
}
```

### 2. Add Preset Lookup by Name (1 hour)
- [ ] Query presets by collection and name
- [ ] Handle user-specific vs global presets
- [ ] Cache preset IDs for performance

```typescript
async function getPresetByName(
  this: IExecuteFunctions,
  collection: string,
  presetName: string,
): Promise<string> {
  const presets = await directusApiRequest.call(
    this,
    'GET',
    '/presets',
    {},
    {
      filter: {
        _and: [
          { collection: { _eq: collection } },
          { bookmark: { _eq: presetName } },
        ],
      },
    },
  );

  if (presets.data.length === 0) {
    throw new Error(`Preset "${presetName}" not found for collection "${collection}"`);
  }

  return presets.data[0].id;
}
```

### 3. Extend Items Operation (1 hour)
- [ ] Add "Use Preset" option to Items > Get All
- [ ] Preset selection parameter
- [ ] Option to override preset filters
- [ ] Merge additional filters with preset

### 4. Add Filter Merging (1 hour)
- [ ] Combine preset filters with custom filters
- [ ] Support AND/OR logic
- [ ] Allow overriding specific preset fields

## Testing
- [ ] Create preset in Directus with complex filter
- [ ] Query items using preset from n8n
- [ ] Verify filter applied correctly
- [ ] Test preset by name resolution
- [ ] Merge custom filter with preset
- [ ] Test with different collections

## Expected Outcomes
- ✅ Apply presets to Items queries by ID or name
- ✅ Automatic extraction of filter/search/fields from preset
- ✅ Merge additional filters with preset filters
- ✅ Support global and user-specific presets
- ✅ Clear error messages for missing presets

## Files Modified
- `nodes/Directus/Descriptions/ItemsDescription.ts`
- `nodes/Directus/GenericFunctions.ts`
- `nodes/Directus/Directus.node.ts`

## Example Usage
```json
{
  "resource": "items",
  "operation": "getAll",
  "collection": "articles",
  "usePreset": true,
  "presetName": "Published Articles",
  "additionalFilters": {
    "date_created": { "_gte": "$NOW(-7d)" }
  }
}
```

## Dependencies
**Blocks**: Task 023 (AI Agent Preset Query Tool)
**Can Run in Parallel With**: Tasks 002-010, 012-014

## Definition of Done
- [ ] Preset application helper implemented
- [ ] Items operation supports presets
- [ ] Preset name lookup working
- [ ] Filter merging functional
- [ ] Tests passing
- [ ] Git commit: "feat: add preset application to Items queries"
