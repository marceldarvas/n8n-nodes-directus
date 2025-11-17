# Task 009: Bulk User Operations

## Priority: MEDIUM
**Effort**: 3-4 hours
**Developer**: Any
**Phase**: 3 - User Management Enhancement

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- ✅ Task 001: Fix Syntax Errors
- ✅ Task 008: Role Lookup Helper (recommended for bulk create with role names)

## Description
Add bulk create, update, and delete operations for users to efficiently manage multiple users at once. This is useful for onboarding teams, syncing from external systems, or batch operations.

## Implementation Steps

### 1. Add Bulk Create Operation (1.5 hours)
- [ ] Accept array of user objects
- [ ] Validate each user data
- [ ] Use Directus batch create endpoint
- [ ] Return created user IDs
- [ ] Handle partial failures gracefully

```typescript
async function bulkCreateUsers(
  this: IExecuteFunctions,
  users: IUserCreateData[],
): Promise<IBulkCreateResult> {
  // Resolve role names to UUIDs
  for (const user of users) {
    if (user.role && !isUUID(user.role)) {
      user.role = await getRoleIdByName.call(this, user.role);
    }
  }

  const response = await directusApiRequest.call(
    this,
    'POST',
    '/users',
    users, // Send array for bulk create
  );

  return {
    created: response.data.length,
    users: response.data,
    errors: response.errors || [],
  };
}
```

### 2. Add Bulk Update Operation (1 hour)
- [ ] Accept array of user updates (ID + fields)
- [ ] Use batch update endpoint
- [ ] Support partial field updates
- [ ] Return update results

### 3. Add Bulk Delete Operation (30 min)
- [ ] Accept array of user IDs
- [ ] Use batch delete endpoint
- [ ] Confirm deletion count
- [ ] Handle errors

### 4. Add Bulk Parameters (1 hour)
- [ ] Add bulk operation type to Users resource
- [ ] Input for user array (JSON or CSV)
- [ ] CSV parsing support
- [ ] Error handling options (stop/continue)

## Testing
- [ ] Create 10 users in one operation
- [ ] Update 5 users with different fields
- [ ] Delete multiple users
- [ ] Test CSV import functionality
- [ ] Verify partial failure handling

## Expected Outcomes
- ✅ Bulk create users from array
- ✅ Bulk update users
- ✅ Bulk delete users
- ✅ CSV import support
- ✅ Clear error reporting for failed operations

## Files Modified
- `nodes/Directus/Descriptions/UsersDescription.ts`
- `nodes/Directus/GenericFunctions.ts`
- `nodes/Directus/Directus.node.ts`

## API Endpoints
- `POST /users` with array payload
- `PATCH /users` with array payload
- `DELETE /users` with ID array

## Dependencies
**Blocks**: Task 020 (AI Agent User Management Tool)
**Can Run in Parallel With**: Tasks 002-007, 010-014

## Definition of Done
- [ ] Bulk operations implemented
- [ ] CSV import working
- [ ] Tests passing
- [ ] Git commit: "feat: add bulk user operations for efficient user management"
