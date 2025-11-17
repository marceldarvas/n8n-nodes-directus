# Task 017: Enhanced Revision Comparison

## Priority: LOW
**Effort**: 2-3 hours
**Developer**: Any
**Phase**: 5 - Activity & Logging Enhancement

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- ✅ Task 001: Fix Syntax Errors

## Description
Enhance Revisions operations with field-by-field diff viewing, version comparison, and rollback data extraction capabilities.

## Implementation Steps

### 1. Add Compare Revisions Operation (1 hour)
```typescript
async function compareRevisions(
  this: IExecuteFunctions,
  revisionId1: string,
  revisionId2: string,
): Promise<IRevisionDiff> {
  const [rev1, rev2] = await Promise.all([
    directusApiRequest.call(this, 'GET', `/revisions/${revisionId1}`),
    directusApiRequest.call(this, 'GET', `/revisions/${revisionId2}`),
  ]);

  const diff = generateFieldDiff(rev1.data.data, rev2.data.data);

  return {
    revision1: revisionId1,
    revision2: revisionId2,
    changes: diff,
    changedFields: Object.keys(diff),
  };
}
```

### 2. Add Diff Visualization (1 hour)
- [ ] Field-level changes
- [ ] Old vs new values
- [ ] Change type (added, removed, modified)
- [ ] HTML diff output option

### 3. Add Rollback Helper (30 min)
- [ ] Extract rollback data from revision
- [ ] Generate update payload
- [ ] Preview rollback changes

## Testing
- [ ] Create item, update twice
- [ ] Compare first and second revision
- [ ] View field-by-field diff
- [ ] Extract rollback data

## Expected Outcomes
- ✅ Compare two revisions
- ✅ Field-level diff display
- ✅ Rollback data extraction
- ✅ Change visualization

## Files Modified
- `nodes/Directus/Descriptions/RevisionsDescription.ts`
- `nodes/Directus/GenericFunctions.ts`
- `nodes/Directus/Directus.node.ts`

## Dependencies
**Can Run in Parallel With**: All tasks except 001

## Definition of Done
- [ ] Revision comparison implemented
- [ ] Diff generation working
- [ ] Rollback helper functional
- [ ] Tests passing
- [ ] Git commit: "feat: add enhanced revision comparison and diff viewing"
