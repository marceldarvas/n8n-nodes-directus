# Task 012: Preset-Based Data Extraction

## Priority: MEDIUM
**Effort**: 2-3 hours
**Developer**: Any
**Phase**: 4 - Filter Presets & Insights

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- ✅ Task 001: Fix Syntax Errors
- ✅ Task 011: Apply Presets to Queries (RECOMMENDED)

## Description
Create dedicated operation to execute preset queries and return filtered results, simplifying data extraction using Directus filter UI.

## Implementation Steps

### 1. Add Preset Query Operation (1 hour)
- [ ] Add to Presets resource
- [ ] "Execute Preset" operation
- [ ] Return filtered data results
- [ ] Support pagination

```typescript
{
  name: 'Execute',
  value: 'execute',
  description: 'Execute a preset and return filtered data',
  action: 'Execute preset query',
}
```

### 2. Implement Execute Preset Function (1.5 hours)
```typescript
async function executePreset(
  this: IExecuteFunctions,
  presetId: string,
  options: IPresetExecuteOptions,
): Promise<any> {
  const preset = await directusApiRequest.call(
    this,
    'GET',
    `/presets/${presetId}`,
  );

  const collection = preset.data.collection;
  const queryParams = extractQueryParamsFromPreset(preset.data);

  // Apply pagination overrides
  if (options.limit) queryParams.limit = options.limit;
  if (options.offset) queryParams.offset = options.offset;
  if (options.page) queryParams.page = options.page;

  return await directusApiRequest.call(
    this,
    'GET',
    `/items/${collection}`,
    {},
    queryParams,
  );
}
```

### 3. Add Export Capabilities (30 min)
- [ ] CSV export option
- [ ] JSON export
- [ ] Field selection override
- [ ] Custom filename

## Testing
- [ ] Create preset for "Recent Articles"
- [ ] Execute preset from n8n
- [ ] Verify correct data returned
- [ ] Test pagination with limit/offset
- [ ] Export as CSV

## Expected Outcomes
- ✅ Execute preset queries with one operation
- ✅ Return filtered data results
- ✅ Pagination support
- ✅ Export capabilities
- ✅ Simplified data extraction workflow

## Files Modified
- `nodes/Directus/Descriptions/PresetsDescription.ts`
- `nodes/Directus/GenericFunctions.ts`
- `nodes/Directus/Directus.node.ts`

## Dependencies
**Can Run in Parallel With**: All tasks except 001, 011

## Definition of Done
- [ ] Execute preset operation implemented
- [ ] Data extraction working
- [ ] Pagination functional
- [ ] Tests passing
- [ ] Git commit: "feat: add preset execution for data extraction"
