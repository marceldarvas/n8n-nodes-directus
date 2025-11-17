# Task 014: Dynamic Filter Builder Helpers

## Priority: LOW
**Effort**: 3-4 hours
**Developer**: Any
**Phase**: 4 - Filter Presets & Insights

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- ✅ Task 001: Fix Syntax Errors

## Description
Add helper functions to programmatically build complex Directus filters without manually writing JSON, making filter construction more accessible to users.

## Background
Directus filters use complex nested JSON syntax:
```json
{
  "_and": [
    { "status": { "_eq": "published" } },
    { "date_created": { "_gte": "$NOW(-7d)" } },
    { "_or": [
      { "author": { "name": { "_contains": "John" } } },
      { "featured": { "_eq": true } }
    ]}
  ]
}
```

This task makes building such filters easier.

## Implementation Steps

### 1. Create Filter Builder Class (2 hours)
```typescript
class DirectusFilterBuilder {
  private filters: any[] = [];

  equals(field: string, value: any) {
    this.filters.push({ [field]: { _eq: value } });
    return this;
  }

  greaterThan(field: string, value: any) {
    this.filters.push({ [field]: { _gt: value } });
    return this;
  }

  contains(field: string, value: string) {
    this.filters.push({ [field]: { _contains: value } });
    return this;
  }

  in(field: string, values: any[]) {
    this.filters.push({ [field]: { _in: values } });
    return this;
  }

  dateRange(field: string, from: string, to: string) {
    this.filters.push({
      _and: [
        { [field]: { _gte: from } },
        { [field]: { _lte: to } },
      ],
    });
    return this;
  }

  or(...conditions: any[]) {
    this.filters.push({ _or: conditions });
    return this;
  }

  and(...conditions: any[]) {
    this.filters.push({ _and: conditions });
    return this;
  }

  build() {
    if (this.filters.length === 1) {
      return this.filters[0];
    }
    return { _and: this.filters };
  }
}
```

### 2. Add Utility Operation (1 hour)
- [ ] Add "Build Filter" to Utils resource
- [ ] Input for filter conditions
- [ ] Output filter JSON
- [ ] Preview filter syntax

### 3. Add Common Filter Templates (1 hour)
- [ ] Recent items (last N days)
- [ ] Published items
- [ ] User's own items
- [ ] Search across multiple fields
- [ ] Date range presets

## Testing
- [ ] Build simple filter: `status = published`
- [ ] Build complex filter with OR conditions
- [ ] Build date range filter
- [ ] Use filter in Items query
- [ ] Verify correct data returned

## Expected Outcomes
- ✅ Programmatic filter building
- ✅ Chainable filter API
- ✅ Common filter templates
- ✅ Filter validation
- ✅ Easier filter construction for users

## Files Modified
- `nodes/Directus/Descriptions/UtilsDescription.ts`
- New: `nodes/Directus/FilterBuilder.ts`
- `nodes/Directus/GenericFunctions.ts`
- `nodes/Directus/Directus.node.ts`

## Example Usage
```javascript
const filter = new DirectusFilterBuilder()
  .equals('status', 'published')
  .greaterThan('views', 100)
  .dateRange('date_created', '$NOW(-7d)', '$NOW')
  .build();
```

## Dependencies
**Can Run in Parallel With**: All tasks except 001

## Definition of Done
- [ ] Filter builder class implemented
- [ ] Build filter operation added
- [ ] Templates available
- [ ] Tests passing
- [ ] Git commit: "feat: add dynamic filter builder helpers"
