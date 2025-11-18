# n8n-nodes-directus

Community node for integrating n8n with Directus CMS, now with full AI agent support.

[![npm version](https://badge.fury.io/js/n8n-nodes-directus.svg)](https://badge.fury.io/js/n8n-nodes-directus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/marceldarvas/n8n-nodes-directus/workflows/CI/badge.svg)](https://github.com/marceldarvas/n8n-nodes-directus/actions/workflows/ci.yml)
[![Security Scan](https://github.com/marceldarvas/n8n-nodes-directus/workflows/Security%20Scan/badge.svg)](https://github.com/marceldarvas/n8n-nodes-directus/actions/workflows/security.yml)

## Features

- ✅ **Complete Directus API Coverage** - Access all 19 Directus resources
- ✅ **Flow Operations** - Trigger and monitor Directus automation workflows
- ✅ **AI Agent Tools** - Pre-built tools for n8n AI agents to interact with Directus
- ✅ **Preset Queries** - Leverage Directus filter presets in your workflows
- ✅ **Enhanced Activity Logging** - Track, analyze, and aggregate operations
- ✅ **User Management** - Create users with role name lookup (no UUID required)
- ✅ **Bulk Operations** - Efficiently process multiple items at once
- ✅ **OAuth2 Authentication** - Secure authentication with token refresh
- ✅ **Revision Tracking** - Compare revisions and generate diffs
- ✅ **Insights Integration** - Access and execute Insights panel queries

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Operations](#operations)
- [AI Agent Integration](#ai-agent-integration)
- [Flow Automation](#flow-automation)
- [Examples](#examples)
- [Documentation](#documentation)
- [Migration Guide](#migration-guide)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

## Installation

### Via n8n GUI (Recommended)

1. Go to **Settings** → **Community Nodes**
2. Select **Install a community node**
3. Type `n8n-nodes-directus` and click **Install**
4. Restart n8n if prompted

### Via npm (Self-hosted)

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-directus
```

For more information, visit the [Community Nodes documentation](https://docs.n8n.io/integrations/community-nodes/).

## Quick Start

### 1. Create Directus Credentials

1. In n8n, go to **Credentials** → **New**
2. Search for **Directus API**
3. Enter your Directus URL and authentication details

#### Static Token (Recommended)
```
URL: https://your-directus-instance.com
Static Token: your-api-token
```

#### OAuth2
```
URL: https://your-directus-instance.com
Client ID: your-client-id
Client Secret: your-client-secret
```

### 2. Add Directus Node to Workflow

1. Create a new workflow
2. Add a **Directus** node
3. Select your credentials
4. Choose a resource and operation
5. Configure parameters
6. Execute!

### 3. Example: Create a User

```
Resource: Users
Operation: Create
Email: newuser@example.com
Password: SecurePassword123!
Role: Editor  ← Use role name (not UUID!)
Status: active
```

## Authentication

### Creating a Directus API Token

1. Log into your Directus admin panel
2. Go to **Settings** → **Access Tokens**
3. Click **Create New Token**
4. Set permissions as needed
5. Copy the token (you won't see it again!)
6. Use this token in your n8n credentials

### Recommended Permissions

For AI agents and automation:
- **directus_users**: Create, Read, Update
- **directus_roles**: Read
- **directus_flows**: Read, Execute
- **directus_activity**: Read
- **Your collections**: As needed

## Operations

### Resources (19 Total)

| Resource | Operations | Description |
|----------|------------|-------------|
| **Items** | Get, Get All, Create, Update, Delete | Manage items in any collection |
| **Users** | Get, Get All, Create, Update, Delete, Invite | User management with role lookup |
| **Roles** | Get, Get All | Role information |
| **Files** | Get, Get All, Upload | File and media management |
| **Folders** | Get, Get All, Create, Update, Delete | Folder organization |
| **Collections** | Get, Get All | Collection metadata |
| **Fields** | Get, Get All | Field information |
| **Relations** | Get, Get All | Relationship data |
| **Permissions** | Get, Get All | Permission rules |
| **Presets** | Get, Get All, Apply, Execute | Filter presets |
| **Activity** | Get, Get All, Aggregate | Activity logs and analytics |
| **Revisions** | Get, Get All, Compare | Revision tracking and diffs |
| **Flows** | Get, Get All, Create, Update, Delete, Trigger | Automation workflows |
| **Operations** | Get, Get All | Flow operations |
| **Webhooks** | Get, Get All, Create, Update, Delete | Webhook management |
| **Notifications** | Get, Get All, Create | User notifications |
| **Shares** | Get, Get All | Public shares |
| **Dashboards** | Get, Get All | Insights dashboards |
| **Panels** | Get, Get All, Execute | Insights panels |

### Key Operations

#### User Management
- **Create with Role Name**: No need for role UUIDs - use friendly names like "Editor"
- **Bulk Operations**: Create/update multiple users at once
- **Invite Users**: Send invitation emails directly

#### Flow Operations
- **Trigger Flows**: Execute Directus automations from n8n
- **Monitor Execution**: Track flow status and results
- **Chain Flows**: Connect multiple automations
- **Loop Through Data**: Process arrays with flows

#### Preset Queries
- **Apply Presets**: Use Directus filter UI presets
- **Execute & Extract**: Run preset and return data
- **Additional Filters**: Layer filters on top of presets

#### Activity & Analytics
- **Query Logs**: Filter by user, collection, action, date
- **Aggregate Data**: Group by user, collection, or time
- **Track Flows**: Monitor flow executions
- **Revision Comparison**: View changes between versions

## AI Agent Integration

### Pre-built AI Tools

This package includes ready-to-use tools for n8n AI agents:

1. **User Management Tools**
   - `create_directus_user` - Create users with role names
   - `query_directus_users` - Search and filter users
   - `update_directus_user` - Modify user details

2. **Flow Automation Tools**
   - `trigger_directus_flow` - Execute flows with payload
   - `monitor_flow_execution` - Check flow status
   - `get_flow_logs` - Retrieve execution logs

3. **Data Query Tools**
   - `query_with_preset` - Use saved filter presets
   - `query_activity_logs` - Access activity data
   - `aggregate_activity` - Generate statistics

### Quick Agent Setup

1. Import an [example workflow](./examples/workflows/)
2. Configure Directus credentials
3. Connect to your AI model (OpenAI, Claude, etc.)
4. Customize the system prompt
5. Test with natural language commands!

Example interaction:
```
User: "Create an editor account for sarah@company.com"
Agent: [Creates user, triggers welcome email flow]
       "Done! User created with ID xyz. Welcome email sent."
```

See the [AI Agent Setup Guide](./docs/agent-setup-guide.md) for detailed instructions.

## Flow Automation

### Triggering Flows

Execute Directus automation workflows from n8n:

```
Resource: Flows
Operation: Trigger
Flow ID: welcome-email  ← Can use name or UUID
Payload: {
  "user_email": "newuser@example.com",
  "user_name": "New User"
}
Execution Mode: sync  ← Wait for completion
```

### Monitoring Flows

Track flow execution status:

```
Resource: Activity
Operation: Get
Activity ID: {{ execution_id }}
```

### Flow Examples

- **User Onboarding**: Create user → Trigger welcome email → Add to CRM
- **Content Publishing**: Update status → Trigger notification → Post to social media
- **Data Sync**: Fetch external data → Process → Update Directus

## Examples

### Example Workflows

- [User Onboarding Agent](./examples/workflows/user-onboarding-agent.json) - AI agent for user management
- [Data Analysis Agent](./examples/workflows/data-analysis-agent.json) - AI agent for querying data
- [Automation Control Agent](./examples/workflows/automation-control-agent.json) - AI agent for managing flows

### Example Conversations

See realistic AI agent interactions in [Example Conversations](./examples/conversations.md).

### System Prompts

Pre-written prompts for different agent types in [System Prompts](./examples/prompts/system-prompts.md).

## Documentation

- **[Migration Guide](./MIGRATION.md)** - Upgrading from v1.x to v2.0
- **[API Reference](./docs/API_REFERENCE.md)** - Complete operation documentation
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Architecture](./docs/ARCHITECTURE.md)** - Technical design overview
- **[Contributing](./docs/CONTRIBUTING.md)** - Development guidelines
- **[AI Agent Setup](./docs/agent-setup-guide.md)** - AI agent integration guide

## Migration Guide

Upgrading from v1.x? See the [Migration Guide](./MIGRATION.md) for:

- Breaking changes (none! Full backward compatibility)
- New features walkthrough
- Upgrade checklist
- Configuration updates

## Version History

### v2.0.0 (Current)
- ✨ Added Flow operations (trigger, monitor, chain, loop)
- ✨ Added AI agent tools with OpenAI/Claude function calling
- ✨ Added Preset query operations
- ✨ Added Activity log aggregation and analytics
- ✨ Added Revision comparison with diff generation
- ✨ Added User management with role name lookup
- ✨ Added Bulk operations support
- ✨ Added OAuth2 authentication
- ✨ Enhanced error handling with detailed messages
- 📚 Comprehensive documentation and examples
- 🧪 Full integration test suite

### v1.x
- Basic Directus API operations
- Static token authentication

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for:

- Development setup
- Code standards
- Testing requirements
- Pull request process

### Quick Start for Contributors

```bash
# Clone the repository
git clone https://github.com/arladmin/n8n-nodes-directus.git

# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm run test

# Start development mode
npm run dev
```

## Support

### Getting Help

- **Documentation**: Check the [docs](./docs/) folder
- **Examples**: Review [example workflows](./examples/workflows/)
- **Issues**: [Report bugs](https://github.com/arladmin/n8n-nodes-directus/issues) on GitHub
- **Discussions**: [Ask questions](https://github.com/arladmin/n8n-nodes-directus/discussions)
- **n8n Community**: [Community forum](https://community.n8n.io)

### Reporting Issues

When reporting issues, please include:

1. n8n version
2. Directus version
3. Node package version
4. Steps to reproduce
5. Expected vs actual behavior
6. Error messages (with sensitive data redacted)

## Roadmap

Planned features:

- [ ] GraphQL support
- [ ] Real-time subscriptions
- [ ] Advanced flow control (conditionals, loops)
- [ ] More AI agent tools
- [ ] Performance optimizations
- [ ] Visual workflow templates

## Related Projects

- [n8n](https://n8n.io) - Workflow automation tool
- [Directus](https://directus.io) - Open-source data platform
- [Directus SDK](https://docs.directus.io/reference/sdk/) - JavaScript SDK

## Credits

Built with:
- [@directus/sdk](https://www.npmjs.com/package/@directus/sdk)
- [n8n workflow automation](https://n8n.io)

Maintained by the community.

## License

[MIT](./LICENSE.md)

---

## Star History

If you find this package useful, please ⭐ star the repository!

---

**Made with ❤️ for the n8n and Directus communities**
