# API Reference

Complete reference for all n8n-nodes-directus operations.

## Table of Contents

- [Resources Overview](#resources-overview)
- [Users](#users)
- [Flows](#flows)
- [Presets](#presets)
- [Activity](#activity)
- [Items](#items)
- [Files](#files)
- [Roles](#roles)
- [Collections](#collections)
- [Revisions](#revisions)
- [Common Parameters](#common-parameters)
- [Filter Syntax](#filter-syntax)
- [Error Codes](#error-codes)

---

## Resources Overview

| Resource | Create | Read | Update | Delete | Special Operations |
|----------|--------|------|--------|--------|-------------------|
| Users | ✅ | ✅ | ✅ | ✅ | Invite |
| Flows | ✅ | ✅ | ✅ | ✅ | Trigger |
| Presets | ✅ | ✅ | ✅ | ✅ | Apply, Execute |
| Activity | ❌ | ✅ | ❌ | ❌ | Aggregate |
| Items | ✅ | ✅ | ✅ | ✅ | - |
| Files | ✅ | ✅ | ✅ | ✅ | Upload |
| Roles | ✅ | ✅ | ✅ | ✅ | - |
| Collections | ❌ | ✅ | ❌ | ❌ | - |
| Revisions | ❌ | ✅ | ❌ | ❌ | Compare |

---

## Users

### Get User

Retrieve a single user by ID.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userId` | string | Yes | User ID or "me" for current user |
| `fields` | array | No | Fields to return |

**Example**:
```javascript
Resource: Users
Operation: Get
User ID: "abc-123-def"
Fields: ["id", "email", "first_name", "last_name", "role"]
```

**Response**:
```json
{
  "id": "abc-123-def",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": {
    "id": "role-uuid",
    "name": "Editor"
  }
}
```

### Get All Users

Retrieve multiple users with optional filtering.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `returnAll` | boolean | No | Return all results |
| `limit` | number | No | Max results (if not returning all) |
| `fields` | array | No | Fields to return |
| `filter` | object | No | Filter criteria |
| `sort` | array | No | Sort fields |

**Example**:
```javascript
Resource: Users
Operation: Get All
Return All: false
Limit: 50
Filter: { "role": { "name": { "_eq": "Editor" } } }
Sort: ["-date_created"]
```

### Create User

Create a new user account.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `email` | string | Yes | User's email address |
| `password` | string | Yes | User's password (min 8 chars) |
| `role` | string | Yes | Role name or UUID |
| `first_name` | string | No | First name |
| `last_name` | string | No | Last name |
| `status` | string | No | active, invited, draft, suspended |

**Example**:
```javascript
Resource: Users
Operation: Create
Email: "newuser@example.com"
Password: "SecurePass123!"
Role: "Editor"  // Can use name or UUID
First Name: "Jane"
Last Name: "Smith"
Status: "active"
```

**Response**:
```json
{
  "id": "new-user-uuid",
  "email": "newuser@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "role-uuid",
  "status": "active"
}
```

### Update User

Update user properties.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userId` | string | Yes | User ID to update |
| `updateFields` | object | Yes | Fields to update |

**Example**:
```javascript
Resource: Users
Operation: Update
User ID: "user-uuid"
Update Fields: {
  "first_name": "Updated Name",
  "status": "suspended"
}
```

### Delete User

Delete a user account.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userId` | string | Yes | User ID to delete |

⚠️ **Warning**: This permanently deletes the user.

### Invite User

Send an invitation email to create an account.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `email` | string | Yes | Email address to invite |
| `role` | string | Yes | Role name or UUID |
| `invite_url` | string | No | Custom invitation URL |

**Example**:
```javascript
Resource: Users
Operation: Invite
Email: "invited@example.com"
Role: "Editor"
```

---

## Flows

### Get Flow

Retrieve a single flow by ID or name.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `flowId` | string | Yes | Flow ID or name |
| `fields` | array | No | Fields to return |

### Get All Flows

Retrieve all automation flows.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `returnAll` | boolean | No | Return all results |
| `limit` | number | No | Max results |
| `filter` | object | No | Filter criteria |

**Example**:
```javascript
Resource: Flows
Operation: Get All
Filter: { "status": { "_eq": "active" } }
```

### Trigger Flow

Execute a Directus Flow with custom payload.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `flowId` | string | Yes | Flow ID or name |
| `payload` | object | No | Data to pass to flow |
| `executionMode` | string | No | "sync" or "async" |

**Execution Modes**:
- **sync**: Wait for flow to complete, return results
- **async**: Return immediately with execution ID

**Example (Sync)**:
```javascript
Resource: Flows
Operation: Trigger
Flow ID: "send-welcome-email"
Payload: {
  "user_email": "newuser@example.com",
  "user_name": "Jane Smith"
}
Execution Mode: "sync"
```

**Response (Sync)**:
```json
{
  "execution_id": "exec-uuid",
  "status": "completed",
  "result": {
    "email_sent": true,
    "message_id": "msg-123"
  },
  "duration_ms": 1250
}
```

**Example (Async)**:
```javascript
Execution Mode: "async"
```

**Response (Async)**:
```json
{
  "execution_id": "exec-uuid",
  "status": "running"
}
```

### Create Flow

Create a new automation flow.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Flow name |
| `status` | string | No | active, inactive |
| `trigger` | string | Yes | manual, webhook, schedule, event |
| `options` | object | No | Trigger configuration |

**Example**:
```javascript
Resource: Flows
Operation: Create
Name: "Daily Report"
Status: "active"
Trigger: "schedule"
Options: {
  "cron": "0 9 * * *"
}
```

---

## Presets

### Get All Presets

List all available filter presets.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `collection` | string | No | Filter by collection |

**Example**:
```javascript
Resource: Presets
Operation: Get All
Collection: "articles"
```

**Response**:
```json
[
  {
    "id": "preset-1",
    "bookmark": "Published Articles",
    "collection": "articles",
    "filter": { "status": { "_eq": "published" } }
  }
]
```

### Apply Preset

Apply a preset and return filtered data.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `presetName` | string | Yes | Preset bookmark name |
| `collection` | string | Yes | Collection name |
| `additionalFilters` | object | No | Extra filters to apply |
| `limit` | number | No | Max results |

**Example**:
```javascript
Resource: Presets
Operation: Apply
Preset Name: "Published Articles"
Collection: "articles"
Additional Filters: {
  "date_published": { "_gte": "2025-01-01" }
}
Limit: 50
```

**Response**:
```json
{
  "data": [
    {
      "id": "article-1",
      "title": "Article Title",
      "status": "published"
    }
  ],
  "meta": {
    "preset_applied": "Published Articles",
    "total_count": 45
  }
}
```

### Execute Preset

Execute preset query and return only the data (no metadata).

Same parameters as Apply Preset, but returns raw data array.

---

## Activity

### Get Activity

Retrieve a single activity log entry.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `activityId` | string | Yes | Activity ID |

### Get All Activity

Query activity logs with filtering.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `returnAll` | boolean | No | Return all results |
| `limit` | number | No | Max results |
| `filter` | object | No | Filter criteria |
| `sort` | array | No | Sort fields |

**Example**:
```javascript
Resource: Activity
Operation: Get All
Filter: {
  "action": { "_eq": "create" },
  "collection": { "_eq": "articles" },
  "timestamp": { "_gte": "2025-01-01T00:00:00Z" }
}
Sort: ["-timestamp"]
Limit: 100
```

**Response**:
```json
[
  {
    "id": "activity-1",
    "action": "create",
    "user": "user-uuid",
    "timestamp": "2025-01-15T10:30:00Z",
    "collection": "articles",
    "item": "article-uuid",
    "comment": null
  }
]
```

### Aggregate Activity

Generate activity statistics and analytics.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `groupBy` | string | Yes | user, collection, action, day |
| `dateFrom` | string | No | Start date (ISO format) |
| `dateTo` | string | No | End date (ISO format) |
| `collection` | string | No | Filter by collection |

**Example**:
```javascript
Resource: Activity
Operation: Aggregate
Group By: "user"
Date From: "2025-01-01T00:00:00Z"
Date To: "2025-01-31T23:59:59Z"
```

**Response**:
```json
{
  "aggregations": [
    {
      "user_id": "user-1",
      "user_email": "user@example.com",
      "total_actions": 247,
      "actions_by_type": {
        "create": 89,
        "update": 145,
        "delete": 13
      },
      "collections": ["articles", "media", "users"],
      "most_active_collection": "articles"
    }
  ],
  "summary": {
    "total_users": 23,
    "total_actions": 2847,
    "date_range": {
      "from": "2025-01-01T00:00:00Z",
      "to": "2025-01-31T23:59:59Z"
    }
  }
}
```

---

## Items

Generic operations for any collection.

### Get Item

Retrieve a single item from any collection.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `collection` | string | Yes | Collection name |
| `itemId` | string | Yes | Item ID |
| `fields` | array | No | Fields to return |

**Example**:
```javascript
Resource: Items
Operation: Get
Collection: "articles"
Item ID: "article-uuid"
Fields: ["id", "title", "status", "date_published"]
```

### Get All Items

Query items from any collection.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `collection` | string | Yes | Collection name |
| `returnAll` | boolean | No | Return all results |
| `limit` | number | No | Max results |
| `filter` | object | No | Filter criteria |
| `sort` | array | No | Sort fields |
| `fields` | array | No | Fields to return |

**Example**:
```javascript
Resource: Items
Operation: Get All
Collection: "articles"
Filter: {
  "_and": [
    { "status": { "_eq": "published" } },
    { "featured": { "_eq": true } }
  ]
}
Sort: ["-date_published"]
Limit: 20
```

### Create Item

Create a new item in any collection.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `collection` | string | Yes | Collection name |
| `data` | object | Yes | Item data |

**Example**:
```javascript
Resource: Items
Operation: Create
Collection: "articles"
Data: {
  "title": "New Article",
  "content": "Article content here...",
  "status": "draft",
  "author": "{{ $json.user_id }}"
}
```

### Update Item

Update an existing item.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `collection` | string | Yes | Collection name |
| `itemId` | string | Yes | Item ID |
| `data` | object | Yes | Fields to update |

**Example**:
```javascript
Resource: Items
Operation: Update
Collection: "articles"
Item ID: "article-uuid"
Data: {
  "status": "published",
  "date_published": "{{ $now }}"
}
```

### Delete Item

Delete an item from a collection.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `collection` | string | Yes | Collection name |
| `itemId` | string | Yes | Item ID |

---

## Files

### Upload File

Upload a file to Directus.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `binaryData` | binary | Yes | File data |
| `fileName` | string | No | File name |
| `folder` | string | No | Folder ID |
| `title` | string | No | File title |

**Example**:
```javascript
Resource: Files
Operation: Upload
Binary Data: {{ $binary }}
File Name: "document.pdf"
Folder: "folder-uuid"
Title: "Important Document"
```

### Get File

Retrieve file metadata.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `fileId` | string | Yes | File ID |

### Get All Files

List files with filtering.

**Parameters**: Same as Get All Items

---

## Roles

### Get Role

Retrieve a single role.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `roleId` | string | Yes | Role ID or name |

**Example**:
```javascript
Resource: Roles
Operation: Get
Role ID: "Editor"  // Can use name
```

### Get All Roles

List all roles.

**Example**:
```javascript
Resource: Roles
Operation: Get All
```

**Response**:
```json
[
  {
    "id": "role-uuid",
    "name": "Editor",
    "icon": "edit",
    "description": "Can create and edit content"
  }
]
```

---

## Collections

### Get Collection

Retrieve collection metadata.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `collection` | string | Yes | Collection name |

### Get All Collections

List all collections in the project.

**Response**:
```json
[
  {
    "collection": "articles",
    "meta": {
      "icon": "article",
      "note": "Blog articles"
    },
    "schema": {
      "name": "articles"
    }
  }
]
```

---

## Revisions

### Get Revision

Retrieve a specific revision.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `revisionId` | string | Yes | Revision ID |

### Get All Revisions

List revisions for an item.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `collection` | string | No | Filter by collection |
| `itemId` | string | No | Filter by item |
| `limit` | number | No | Max results |

### Compare Revisions

Compare two revisions and generate a diff.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `collection` | string | Yes | Collection name |
| `itemId` | string | Yes | Item ID |
| `revisionA` | string | Yes | First revision ID |
| `revisionB` | string | Yes | Second revision ID |
| `outputFormat` | string | No | json, html, text |
| `includeUnchanged` | boolean | No | Include unchanged fields |

**Example**:
```javascript
Resource: Revisions
Operation: Compare
Collection: "articles"
Item ID: "article-uuid"
Revision A: "rev-1"
Revision B: "rev-2"
Output Format: "html"
Include Unchanged: false
```

**Response (HTML)**:
```html
<div class="diff">
  <div class="changed">
    <strong>title</strong>:
    <del>Old Title</del>
    <ins>New Title</ins>
  </div>
  <div class="changed">
    <strong>status</strong>:
    <del>draft</del>
    <ins>published</ins>
  </div>
</div>
```

---

## Common Parameters

### Fields

Specify which fields to return:

```javascript
Fields: ["id", "title", "status"]

// Nested fields
Fields: ["id", "title", "author.name", "author.email"]

// All fields
Fields: ["*"]
```

### Limit & Pagination

```javascript
// Return specific number
Return All: false
Limit: 50

// Return all (use with caution)
Return All: true

// Pagination
Limit: 50
Offset: 100  // Skip first 100 results
```

### Sort

```javascript
// Single field ascending
Sort: ["title"]

// Single field descending
Sort: ["-date_created"]

// Multiple fields
Sort: ["-featured", "title"]
```

---

## Filter Syntax

Directus uses a powerful filter syntax:

### Equality

```javascript
{ "field": { "_eq": "value" } }
{ "field": { "_neq": "value" } }
```

### Comparison

```javascript
{ "field": { "_gt": 100 } }    // Greater than
{ "field": { "_gte": 100 } }   // Greater than or equal
{ "field": { "_lt": 100 } }    // Less than
{ "field": { "_lte": 100 } }   // Less than or equal
```

### String Matching

```javascript
{ "field": { "_contains": "search" } }
{ "field": { "_starts_with": "prefix" } }
{ "field": { "_ends_with": "suffix" } }
```

### List Operations

```javascript
{ "field": { "_in": ["value1", "value2"] } }
{ "field": { "_nin": ["value1", "value2"] } }
```

### Logical Operators

```javascript
// AND
{
  "_and": [
    { "status": { "_eq": "published" } },
    { "featured": { "_eq": true } }
  ]
}

// OR
{
  "_or": [
    { "status": { "_eq": "published" } },
    { "status": { "_eq": "archived" } }
  ]
}
```

### Date Filters

```javascript
{
  "date_created": {
    "_gte": "2025-01-01T00:00:00Z",
    "_lte": "2025-01-31T23:59:59Z"
  }
}
```

---

## Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Invalid parameters, malformed filter |
| 401 | Unauthorized | Invalid token, expired credentials |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 422 | Validation Error | Invalid data, constraint violation |
| 500 | Server Error | Directus internal error |

### Error Response Format

```json
{
  "errors": [
    {
      "message": "Invalid token",
      "extensions": {
        "code": "INVALID_CREDENTIALS"
      }
    }
  ]
}
```

---

For troubleshooting, see [Troubleshooting Guide](./TROUBLESHOOTING.md).
For examples, see [Example Workflows](../examples/workflows/).
