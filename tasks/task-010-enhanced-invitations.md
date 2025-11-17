# Task 010: Enhanced User Invitations

## Priority: LOW
**Effort**: 2-3 hours
**Developer**: Any
**Phase**: 3 - User Management Enhancement

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- ✅ Task 001: Fix Syntax Errors

## Description
Enhance the existing user invite operation with customizable email templates, invitation tracking, and resend functionality.

## Current Implementation
Basic `/users/invite` endpoint exists but lacks:
- Custom email templates
- Invitation status tracking
- Resend capability
- Batch invitations

## Implementation Steps

### 1. Enhance Invite Parameters (1 hour)
- [ ] Add custom email subject
- [ ] Add custom email body template
- [ ] Add invite expiration time
- [ ] Add custom redirect URL after acceptance

```typescript
{
  displayName: 'Email Subject',
  name: 'emailSubject',
  type: 'string',
  default: 'You have been invited to join',
  description: 'Custom email subject line',
},
{
  displayName: 'Email Template',
  name: 'emailTemplate',
  type: 'string',
  typeOptions: {
    rows: 5,
  },
  default: 'Hello {{first_name}}, you have been invited...',
  description: 'Custom email template (supports variables)',
},
```

### 2. Add Invitation Tracking (1 hour)
- [ ] Query pending invitations
- [ ] Check invitation status (sent, accepted, expired)
- [ ] List all invitations for a user

### 3. Add Resend Invitation (30 min)
- [ ] Resend invitation email
- [ ] Update expiration time
- [ ] Log resend attempts

### 4. Add Bulk Invitations (30 min)
- [ ] Accept array of email addresses
- [ ] Send invitations to all
- [ ] Return invitation statuses

## Testing
- [ ] Send invitation with custom template
- [ ] Track invitation status
- [ ] Resend expired invitation
- [ ] Bulk invite 5 users
- [ ] Verify email variables replaced

## Expected Outcomes
- ✅ Custom invitation email templates
- ✅ Invitation status tracking
- ✅ Resend functionality
- ✅ Bulk invitations
- ✅ Variable substitution in templates

## Files Modified
- `nodes/Directus/Descriptions/UsersDescription.ts`
- `nodes/Directus/GenericFunctions.ts`
- `nodes/Directus/Directus.node.ts`

## API Endpoints
- `POST /users/invite`
- `GET /users?filter[status][_eq]=invited`
- `POST /users/invite/resend`

## Dependencies
**Can Run in Parallel With**: All other tasks except 001

## Definition of Done
- [ ] Enhanced invite operation implemented
- [ ] Custom templates working
- [ ] Tracking and resend functional
- [ ] Tests passing
- [ ] Git commit: "feat: enhance user invitations with custom templates and tracking"
