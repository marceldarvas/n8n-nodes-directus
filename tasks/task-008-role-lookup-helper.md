# Task 008: Role Lookup Helper

## Priority: MEDIUM
**Effort**: 2-3 hours
**Developer**: Any
**Phase**: 3 - User Management Enhancement

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- ✅ Task 001: Fix Syntax Errors

## Description
Add helper function to resolve role names to UUIDs, making user creation more intuitive. Currently, users must provide role UUID when creating users - this adds the ability to use human-readable role names instead.

## Current Limitation
```json
// Current - requires UUID
{
  "email": "user@example.com",
  "role": "8cbb43fe-4cdf-4991-8352-c461779cad5f"
}

// Desired - allow role name
{
  "email": "user@example.com",
  "role": "Administrator"
}
```

## Implementation Steps

### 1. Add Role Lookup Function (1.5 hours)
```typescript
async function getRoleIdByName(
  this: IExecuteFunctions,
  roleName: string,
): Promise<string> {
  const roles = await directusApiRequest.call(
    this,
    'GET',
    '/roles',
    {},
    { filter: { name: { _eq: roleName } } },
  );

  if (roles.data.length === 0) {
    throw new Error(`Role "${roleName}" not found`);
  }

  return roles.data[0].id;
}
```

### 2. Update User Create Parameters (30 min)
- [ ] Add role selection mode (UUID or Name)
- [ ] Conditional input based on selection
- [ ] Auto-detect if input is UUID or name

### 3. Integrate into User Operations (1 hour)
- [ ] Modify user create operation
- [ ] Check if role is UUID or name
- [ ] Call lookup if name provided
- [ ] Cache role mappings for performance

## Testing
- [ ] Create user with role name "Administrator"
- [ ] Verify role UUID resolved correctly
- [ ] Test non-existent role name (should error)
- [ ] Test with role UUID (should pass through)

## Expected Outcomes
- ✅ Create users with role names instead of UUIDs
- ✅ Automatic role name → UUID resolution
- ✅ Clear error for invalid role names
- ✅ Backward compatible with UUID input

## Files Modified
- `nodes/Directus/GenericFunctions.ts`
- `nodes/Directus/Descriptions/UsersDescription.ts`
- `nodes/Directus/Directus.node.ts`

## Dependencies
**Blocks**: Task 020 (AI Agent User Management Tool)
**Can Run in Parallel With**: Tasks 002-007, 009-014

## Definition of Done
- [ ] Role lookup function implemented
- [ ] User create accepts role names
- [ ] Tests passing
- [ ] Git commit: "feat: add role name lookup helper for user management"
