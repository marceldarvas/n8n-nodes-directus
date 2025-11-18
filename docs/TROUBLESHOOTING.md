# Troubleshooting Guide

Common issues and solutions for n8n-nodes-directus.

## Table of Contents

- [Connection Issues](#connection-issues)
- [Authentication Errors](#authentication-errors)
- [Flow Operations](#flow-operations)
- [User Management](#user-management)
- [Preset Queries](#preset-queries)
- [Activity Logs](#activity-logs)
- [AI Agent Tools](#ai-agent-tools)
- [Performance Issues](#performance-issues)
- [Error Messages](#error-messages)

---

## Connection Issues

### Cannot Connect to Directus Instance

**Symptoms**:
- `ECONNREFUSED` errors
- `Network timeout` errors
- `Unable to reach server` messages

**Solutions**:

1. **Verify Directus URL**:
   - Ensure URL includes protocol (`https://` or `http://`)
   - Check for typos
   - Verify port if non-standard

2. **Check Network Access**:
   - Can you ping the Directus server?
   - Is n8n behind a firewall?
   - Are there proxy settings needed?

3. **Verify Directus is Running**:
   ```bash
   curl https://your-directus.com/server/info
   ```

4. **Check SSL/TLS**:
   - For self-signed certificates, you may need to configure n8n to accept them
   - Ensure your certificate is valid

---

## Authentication Errors

### Invalid Token / 401 Unauthorized

**Symptoms**:
- `Invalid token` error
- `401 Unauthorized` responses
- `Authentication failed` messages

**Solutions**:

1. **Verify Token is Valid**:
   - Check token hasn't expired
   - Ensure token is correctly copied (no extra spaces)
   - Test token with curl:
     ```bash
     curl -H "Authorization: Bearer YOUR_TOKEN" \
          https://your-directus.com/users/me
     ```

2. **Check Token Permissions**:
   - Token needs appropriate permissions for operations
   - Verify in Directus: Settings → Access Tokens
   - Ensure role has collection access

3. **Recreate Token**:
   - Sometimes tokens become corrupted
   - Create a new token in Directus
   - Update n8n credentials

### OAuth2 Authentication Failing

**Symptoms**:
- Redirect loop
- `Invalid client` error
- Authorization not completing

**Solutions**:

1. **Check OAuth2 Configuration**:
   - Verify Client ID and Secret
   - Ensure redirect URI is correctly configured in Directus
   - Check OAuth2 provider settings

2. **Verify Callback URL**:
   - Must match exactly what's configured in Directus
   - Include protocol and port

3. **Clear OAuth2 Cache**:
   - In n8n, delete and recreate the OAuth2 credential
   - Re-authorize from scratch

---

## Flow Operations

### Flow Trigger Returns 404

**Symptoms**:
- `Flow not found` error
- `404 Not Found` when triggering flow

**Solutions**:

1. **Verify Flow Exists**:
   - Check flow is created in Directus
   - Ensure flow status is "active"
   - Verify flow ID/name is correct

2. **Use Correct Identifier**:
   ```javascript
   // Try both:
   Flow ID: "flow-name"  // Flow name
   Flow ID: "uuid-here"  // Flow UUID
   ```

3. **Check Flow Trigger Type**:
   - Flow must have a compatible trigger
   - Webhook trigger recommended for n8n
   - Manual trigger also works

### Flow Execution Timeout

**Symptoms**:
- Flow times out before completing
- No execution result returned

**Solutions**:

1. **Use Async Mode**:
   ```javascript
   Execution Mode: "async"  // Don't wait for completion
   ```

2. **Increase Timeout**:
   - Check n8n workflow timeout settings
   - Increase if needed for long-running flows

3. **Poll for Completion**:
   ```javascript
   // Step 1: Trigger async
   [Trigger Flow]

   // Step 2: Wait
   [Wait Node: 5 seconds]

   // Step 3: Check status
   [Get Activity/Execution Status]
   ```

### Flow Returns No Data

**Symptoms**:
- Flow executes but returns empty result
- Missing execution data

**Solutions**:

1. **Check Flow Configuration**:
   - Ensure flow returns data
   - Verify return operation exists in flow

2. **Use Correct Execution Mode**:
   - Async mode returns execution ID only
   - Sync mode returns actual results

3. **Query Execution Results**:
   ```javascript
   Resource: Activity
   Operation: Get
   Activity ID: "{{ execution_id }}"
   ```

---

## User Management

### User Creation Fails with Role Error

**Symptoms**:
- `Invalid role` error
- `Role not found` message
- `UUID validation failed`

**Solutions**:

1. **Use Exact Role Name**:
   ```javascript
   // Case-sensitive!
   Role: "Editor"  ✓
   Role: "editor"  ✗ (might not work)
   ```

2. **Verify Role Exists**:
   - Check role in Directus admin
   - Ensure role is active
   - Try using UUID directly if name fails

3. **Check Permissions**:
   - Token user must have permission to assign role
   - Some roles may be restricted

### Duplicate Email Error

**Symptoms**:
- `Email already exists` error
- Unique constraint violation

**Solutions**:

1. **Check for Existing User First**:
   ```javascript
   [Directus - Get Users]
   Filter: { email: { _eq: "user@example.com" } }

   [If Node: {{ $json.data.length > 0 }}]
     → User exists (skip creation)
     → User doesn't exist (create)
   ```

2. **Handle Duplicate Gracefully**:
   - Use error handling nodes
   - Return existing user if found

### Invitation Email Not Sent

**Symptoms**:
- User created but no invitation email
- Invitation status unclear

**Solutions**:

1. **Check Directus Email Configuration**:
   - Verify SMTP settings in Directus
   - Test email sending in Directus admin

2. **Use Invitation Operation**:
   ```javascript
   Resource: Users
   Operation: Invite
   Email: "user@example.com"
   Role: "Editor"
   ```

3. **Trigger Email Flow**:
   ```javascript
   // Alternative: Use Directus Flow
   [Create User]
   [Trigger Flow: "Send Welcome Email"]
   ```

---

## Preset Queries

### Preset Not Found

**Symptoms**:
- `Preset not found` error
- Empty results when applying preset

**Solutions**:

1. **Verify Preset Exists**:
   - Check in Directus admin
   - Look for preset in correct collection
   - Verify bookmark name

2. **Check Preset Visibility**:
   - Preset may be user-specific or role-specific
   - Ensure API token user has access

3. **Use Correct Collection**:
   ```javascript
   Preset Name: "Published Articles"
   Collection: "articles"  // Must match preset's collection
   ```

### Preset Returns Unexpected Results

**Symptoms**:
- Different results than Directus UI
- Missing filters or sorting

**Solutions**:

1. **Review Preset Definition**:
   - Check preset in Directus admin
   - Verify filters, sort, and fields

2. **Apply Additional Filters Carefully**:
   ```javascript
   // Additional filters combine with preset filters
   Additional Filters: {
     date: { _gte: "2025-01-01" }  // ANDed with preset
   }
   ```

3. **Check Field Selection**:
   - Preset may limit fields returned
   - Specify additional fields if needed

---

## Activity Logs

### Missing Activity Data

**Symptoms**:
- Query returns empty array
- Expected activities not found

**Solutions**:

1. **Check Date Range**:
   ```javascript
   // Make sure date range includes activity
   Date From: "2025-01-01T00:00:00Z"
   Date To: "2025-01-31T23:59:59Z"
   ```

2. **Verify Filter Syntax**:
   ```javascript
   // Correct Directus filter format
   Filter: {
     user: { _eq: "user-id" },
     collection: { _eq: "articles" }
   }
   ```

3. **Check Permissions**:
   - API token needs read access to `directus_activity`

### Aggregation Errors

**Symptoms**:
- Aggregation returns error
- Incorrect grouping

**Solutions**:

1. **Use Valid Group By Values**:
   ```javascript
   // Valid options:
   Group By: "user"
   Group By: "collection"
   Group By: "action"
   Group By: "day"
   ```

2. **Provide Sufficient Data**:
   - Aggregation needs data to aggregate
   - Check date range includes records

---

## AI Agent Tools

### Agent Not Using Tools

**Symptoms**:
- Agent responds without calling tools
- Tools never execute

**Solutions**:

1. **Check Tool Descriptions**:
   - Must be clear and relevant
   - Should describe when to use tool
   - Include examples in description

2. **Verify Tool Connection**:
   - Tools must be connected to agent node
   - Check tool node configuration

3. **Review System Prompt**:
   - Mention tools in system prompt
   - Provide examples of tool usage
   - Be specific about capabilities

### Tool Execution Failing

**Symptoms**:
- Tool called but errors occur
- Agent receives error response

**Solutions**:

1. **Check Parameter Mapping**:
   ```javascript
   // Ensure expressions are correct
   Email: {{ $json.email }}  ✓
   Email: $json.email        ✗ (missing braces)
   ```

2. **Validate Required Parameters**:
   - All required schema parameters provided
   - Correct data types

3. **Test Tool Independently**:
   - Execute Directus operation without agent
   - Verify operation works standalone

### Agent Gives Wrong Answers

**Symptoms**:
- Agent provides incorrect information
- Misunderstands requests

**Solutions**:

1. **Refine System Prompt**:
   - Add more specific instructions
   - Include domain knowledge
   - Provide examples

2. **Improve Tool Descriptions**:
   - Be more specific about tool purpose
   - Clarify parameter meanings
   - Add usage examples

3. **Format Tool Responses**:
   - Return human-readable messages
   - Include context in responses

---

## Performance Issues

### Slow Query Execution

**Symptoms**:
- Queries take long time
- Timeout errors

**Solutions**:

1. **Use Pagination**:
   ```javascript
   Limit: 100  // Don't fetch thousands of records
   Offset: 0
   ```

2. **Optimize Filters**:
   - Index fields used in filters (in Directus)
   - Use specific filters vs broad searches

3. **Limit Fields**:
   ```javascript
   Fields: ["id", "title", "status"]  // Only needed fields
   ```

### Bulk Operations Slow

**Symptoms**:
- Bulk create/update takes very long

**Solutions**:

1. **Batch Requests**:
   - Process in chunks of 50-100 items
   - Use loop with delay between batches

2. **Use Directus Batch Endpoints**:
   - Some operations support batch mode
   - More efficient than individual requests

---

## Error Messages

### Common Error Codes

| Error Code | Meaning | Common Solution |
|------------|---------|-----------------|
| 400 | Bad Request | Check parameter format |
| 401 | Unauthorized | Verify token/credentials |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Verify resource ID/name |
| 422 | Unprocessable | Validation failed, check data |
| 500 | Server Error | Check Directus logs |

### Debugging Steps

1. **Enable Verbose Logging**:
   - In n8n workflow settings
   - Check execution logs

2. **Test with curl**:
   ```bash
   curl -X POST \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}' \
     https://your-directus.com/users
   ```

3. **Check Directus Logs**:
   - Server logs often show more details
   - Look for validation errors

4. **Simplify Workflow**:
   - Remove complexity
   - Test one operation at a time
   - Isolate the failing component

---

## Still Having Issues?

If this guide doesn't solve your problem:

1. **Search GitHub Issues**: [n8n-nodes-directus/issues](https://github.com/arladmin/n8n-nodes-directus/issues)
2. **Ask in Discussions**: [n8n-nodes-directus/discussions](https://github.com/arladmin/n8n-nodes-directus/discussions)
3. **n8n Community**: [community.n8n.io](https://community.n8n.io)
4. **Report a Bug**: Create a detailed issue on GitHub

### When Reporting Issues

Please include:
- n8n version
- Directus version
- Package version
- Complete error message
- Steps to reproduce
- Expected vs actual behavior
- Workflow JSON (with sensitive data removed)
