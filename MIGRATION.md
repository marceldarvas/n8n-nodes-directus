# Migration Guide: v1.x → v2.0

This guide helps you upgrade from v1.x to v2.0 of n8n-nodes-directus.

**Good News**: Full backward compatibility is maintained! Your existing workflows will continue to work without changes.

## Table of Contents

- [Overview](#overview)
- [What's New](#whats-new)
- [Breaking Changes](#breaking-changes)
- [Enhanced Features](#enhanced-features)
- [New Features](#new-features)
- [Upgrade Steps](#upgrade-steps)
- [Configuration Updates](#configuration-updates)
- [Testing Your Migration](#testing-your-migration)
- [Rollback Plan](#rollback-plan)
- [Getting Help](#getting-help)

---

## Overview

### Version Comparison

| Feature | v1.x | v2.0 |
|---------|------|------|
| Basic CRUD Operations | ✅ | ✅ |
| Static Token Auth | ✅ | ✅ |
| OAuth2 Auth | ❌ | ✅ |
| Flow Operations | ❌ | ✅ |
| AI Agent Tools | ❌ | ✅ |
| Preset Queries | ❌ | ✅ |
| Activity Aggregation | ❌ | ✅ |
| Role Name Lookup | ❌ | ✅ |
| Bulk Operations | ❌ | ✅ |
| Revision Comparison | ❌ | ✅ |

### Should You Upgrade?

**Upgrade if you want:**
- Flow automation capabilities
- AI agent integration
- Advanced activity analytics
- Easier user management (role names vs UUIDs)
- Better error handling

**Stay on v1.x if:**
- You only need basic CRUD operations
- You want to avoid any potential upgrade issues
- Your workflows are stable and you don't need new features

---

## What's New

### 1. Flow Operations ✨

**NEW**: Trigger and monitor Directus automation workflows

```javascript
// NEW in v2.0
Resource: Flows
Operation: Trigger
Flow ID: "welcome-email"
Payload: { user_email: "new@example.com" }
```

**Use Cases:**
- Trigger welcome emails after user creation
- Execute data processing workflows
- Chain multiple automations
- Monitor flow execution status

### 2. AI Agent Tools ✨

**NEW**: Pre-built tools for n8n AI agents

```javascript
// NEW in v2.0 - AI agent can now use Directus tools
Tool: create_directus_user
Tool: trigger_directus_flow
Tool: query_with_preset
```

**Use Cases:**
- Build conversational interfaces for Directus
- Automate user onboarding via chat
- Natural language data queries

### 3. Preset Queries ✨

**NEW**: Leverage Directus filter presets

```javascript
// NEW in v2.0
Resource: Presets
Operation: Apply
Preset Name: "Published Articles"
Collection: "articles"
```

**Use Cases:**
- Reuse complex filters across workflows
- Maintain consistency with Directus UI
- Simplify workflow configuration

### 4. Activity Log Enhancements ✨

**NEW**: Advanced activity analytics

```javascript
// NEW in v2.0
Resource: Activity
Operation: Aggregate
Group By: "user"
Date Range: last 7 days
```

**Use Cases:**
- User activity reports
- Usage pattern analysis
- Performance monitoring

### 5. User Management Improvements ✨

**ENHANCED**: Create users with role names

```javascript
// v1.x - Required UUID
Role: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

// v2.0 - Can use friendly name
Role: "Editor"  // Much easier!
```

---

## Breaking Changes

### None! 🎉

**v2.0 maintains full backward compatibility with v1.x**

All existing workflows will continue to work without modification.

---

## Enhanced Features

### User Operations

#### v1.x Approach
```javascript
// Had to look up role UUID first
Resource: Roles
Operation: Get All
Filter: { name: { _eq: "Editor" } }

// Then create user with UUID
Resource: Users
Operation: Create
Role: "uuid-from-previous-step"
```

#### v2.0 Approach
```javascript
// Direct role name usage
Resource: Users
Operation: Create
Role: "Editor"  ← Automatic lookup!
```

**Migration**: Existing UUID-based workflows still work, but you can simplify them.

### Authentication

#### v1.x
- Static token only

#### v2.0
- Static token (unchanged)
- OAuth2 (NEW)

**Migration**: Existing credentials work unchanged. OAuth2 is optional.

---

## New Features

### Flow Operations

#### Triggering Flows

**Example**: Send welcome email after user creation

```javascript
// Step 1: Create user (same as v1.x)
Resource: Users
Operation: Create
Email: "{{ $json.email }}"
Password: "{{ $json.password }}"
Role: "Editor"

// Step 2: Trigger flow (NEW in v2.0)
Resource: Flows
Operation: Trigger
Flow ID: "send-welcome-email"
Payload: {
  user_email: "{{ $json.email }}",
  user_id: "{{ $json.id }}"
}
```

#### Monitoring Flows

```javascript
// Get flow execution status
Resource: Activity
Operation: Get
Activity ID: "{{ $json.execution_id }}"
```

### Preset Queries

**Before (v1.x)**: Manually construct filters

```javascript
Resource: Items
Collection: "articles"
Filter: {
  _and: [
    { status: { _eq: "published" } },
    { date_published: { _gte: "2025-01-01" } }
  ]
}
```

**After (v2.0)**: Use saved presets

```javascript
Resource: Presets
Operation: Apply
Preset Name: "Published Articles 2025"
Collection: "articles"
```

### Activity Aggregation

**NEW**: Get insights from activity logs

```javascript
// Aggregate by user
Resource: Activity
Operation: Aggregate
Group By: "user"
Date From: "2025-01-01"
Date To: "2025-01-31"

// Returns: User activity statistics
```

### Revision Comparison

**NEW**: Compare item versions

```javascript
Resource: Revisions
Operation: Compare
Item ID: "abc123"
Revision A: "rev1"
Revision B: "rev2"
Output Format: "html"  // or "text", "json"
```

---

## Upgrade Steps

### 1. Backup Your Workflows

Before upgrading, export all workflows:

1. In n8n, go to **Workflows**
2. For each workflow using Directus nodes, click **⋮** → **Download**
3. Save JSON files to a safe location

### 2. Update the Package

#### Via n8n GUI

1. Go to **Settings** → **Community Nodes**
2. Find `n8n-nodes-directus`
3. Click **Update** (if available)
4. Restart n8n if prompted

#### Via npm

```bash
cd ~/.n8n/nodes
npm update n8n-nodes-directus
```

### 3. Verify Installation

1. Create a test workflow
2. Add a Directus node
3. Verify new resources appear (Flows, Presets, etc.)
4. Test a simple operation (e.g., Get Server Info)

### 4. Test Existing Workflows

1. Activate one workflow at a time
2. Execute a test run
3. Verify output is as expected
4. Check for any errors

### 5. Optimize Workflows (Optional)

Take advantage of new features:

- Replace UUID role lookups with role names
- Use presets instead of manual filters
- Add flow automation where applicable

---

## Configuration Updates

### Credentials

**No changes required** - existing credentials work as-is.

**Optional**: Add OAuth2 credentials if desired

1. Go to **Credentials** → **New**
2. Select **Directus OAuth2 API**
3. Enter Client ID and Secret
4. Authorize

### Permissions

**If using new features**, update API token permissions:

For **Flow Operations**:
```
directus_flows: Read, Execute
```

For **AI Agents**:
```
directus_users: Create, Read, Update
directus_flows: Read, Execute
directus_activity: Read
```

---

## Testing Your Migration

### Test Checklist

- [ ] Existing workflows execute successfully
- [ ] Credentials still work
- [ ] Data retrieval is correct
- [ ] User creation works
- [ ] Error handling functions properly
- [ ] New features are accessible (if desired)

### Test Workflow

Create a simple test workflow:

```javascript
1. Trigger: Manual
2. Directus Node:
   Resource: Server
   Operation: Info
3. Directus Node:
   Resource: Users
   Operation: Get All
   Limit: 5
```

**Expected**: Should retrieve server info and user list

### Troubleshooting Tests

If issues occur:

1. Check n8n version (v1.0.0+)
2. Verify Directus version (v10.0.0+)
3. Check credential configuration
4. Review error messages
5. Consult [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)

---

## Example Migrations

### Example 1: User Creation with Role Lookup

**Before (v1.x)**:
```
[Manual Trigger]
     ↓
[Directus - Get Roles]
Filter: { name: { _eq: "Editor" } }
     ↓
[Set Variable: roleId = {{ $json.id }}]
     ↓
[Directus - Create User]
Role: {{ $node.variableName.json.roleId }}
```

**After (v2.0)**:
```
[Manual Trigger]
     ↓
[Directus - Create User]
Role: "Editor"  ← Direct usage!
```

### Example 2: Adding Flow Automation

**Before (v1.x)**:
```
[Create User]
     ↓
[Send Email via SMTP]  ← Manual email setup
```

**After (v2.0)**:
```
[Create User]
     ↓
[Trigger Directus Flow: "Welcome Email"]  ← Reuse Directus flow!
```

### Example 3: Query Simplification

**Before (v1.x)**:
```
[Directus - Get Items]
Collection: "articles"
Filter: {
  _and: [
    { status: { _eq: "published" } },
    { featured: { _eq: true } },
    { date_published: { _gte: "{{ $now.minus(7, 'days') }}" } }
  ]
}
Sort: ["-date_published"]
Limit: 10
```

**After (v2.0)**:
```
[Directus - Apply Preset]
Preset: "Featured Articles - Recent"  ← Configured in Directus UI
Collection: "articles"
```

---

## Rollback Plan

If you need to rollback:

### Option 1: Reinstall Previous Version

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-directus@1.x
```

### Option 2: Restore from Backup

1. Deactivate affected workflows
2. Import backed-up workflow JSON files
3. Reactivate workflows

### Option 3: Run Both Versions

- Keep v1.x workflows on old nodes
- Create new workflows with v2.0 features
- Gradual migration as needed

---

## FAQ

### Q: Will my existing workflows break?
**A**: No! v2.0 is fully backward compatible.

### Q: Do I need to update my credentials?
**A**: No, existing credentials work without changes.

### Q: Can I use role names in existing workflows?
**A**: Yes! You can update workflows to use role names instead of UUIDs for simplicity.

### Q: Are there any performance changes?
**A**: Performance is similar or improved. Some operations (like role lookup) are now cached.

### Q: What if I encounter errors?
**A**: Check the [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) or report issues on GitHub.

### Q: Can I mix v1.x and v2.0 features?
**A**: Absolutely! Use new features where helpful, keep existing patterns where they work.

### Q: Is there a downgrade path?
**A**: Yes, you can reinstall v1.x if needed (see Rollback Plan above).

---

## Getting Help

### Resources

- **[Troubleshooting Guide](./docs/TROUBLESHOOTING.md)** - Common issues
- **[API Reference](./docs/API_REFERENCE.md)** - Complete documentation
- **[Examples](./examples/)** - Sample workflows
- **[GitHub Issues](https://github.com/arladmin/n8n-nodes-directus/issues)** - Report problems

### Support Channels

- **GitHub Discussions**: Ask questions
- **n8n Community**: General n8n help
- **Directus Discord**: Directus-specific questions

---

## Next Steps

After successful migration:

1. **Explore New Features**: Try flow operations, presets, AI agents
2. **Optimize Workflows**: Simplify with new capabilities
3. **Share Feedback**: Let us know how the upgrade went
4. **Star the Repo**: Show your support ⭐

---

**Happy migrating! 🚀**
