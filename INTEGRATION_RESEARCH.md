<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Research the Directus API and its capabilities around API extensions and Flow operations. I am creating a plan to update an n8n community node that hasn't been updated in 2-3 years.

I want to make this node ready for use with an n8n agent workflow so it can access n8n with tooling capabilities.

I want to create users in Directus, trigger flows, and log activity.

For Collections/Table Data, I will stick to PostgreSQL with Supabase. I know Supabase also has a great REST API and webhooks; however, I would like these to be available in Directus as well.

I find Directus to be very user friendly for Data Filters which can be used in Insight Panels, which is why we are using it alongside Supabase.

n8n should be able to access these filter presets for calling data. I don't need you to write any code, create references, and a feature dev plan for me!

Now I have comprehensive information about Directus API capabilities, n8n agent workflows, and the integration possibilities. Let me create a detailed feature development plan and references.

# Directus n8n Community Node Update: Feature Development Plan \& API References

## Executive Summary

This plan outlines the modernization of an outdated n8n community node for Directus to support AI agent workflows, user management, Flow operations, and activity logging. The updated node will leverage Directus's extensive API capabilities while maintaining compatibility with your Supabase PostgreSQL database setup for collection data and enabling access to Directus's user-friendly filter presets for Insight Panels.

## Directus API Capabilities Overview

### Core API Architecture

Directus provides **behavior parity between REST and GraphQL APIs**, meaning both endpoints support identical features with no functional differences. The platform uses a **dynamic API** that automatically generates endpoints based on your database schema, making it highly adaptable to your PostgreSQL database via Supabase.[^1][^2][^3][^4][^5]

**Key API Features:**

- REST and GraphQL endpoints with identical capabilities[^2][^6]
- WebSocket support for real-time updates[^7]
- Comprehensive authentication system with token-based and OAuth support[^8][^9]
- Rate limiting (default 25 requests/second, configurable)[^10][^11]
- Sandboxed extension environment for security[^12][^13]


### Authentication \& User Management

**User Creation API**[^14][^15]

- Create users via `/users` endpoint with POST requests
- Supports all fields in `directus_users` collection
- Requires appropriate permissions for public role or authenticated user
- Role assignment during user creation via `role` field UUID
- Supports email/password and SSO authentication flows

**Token Management**[^9][^16]

- Static API tokens for service accounts
- Dynamic access/refresh token pairs for user sessions
- Bearer token authentication via `Authorization` header
- Token refresh endpoints for maintaining sessions[^17]


### Flow Operations \& Triggers

**Directus Flows** enable event-driven automation with multiple trigger types:[^18][^19]

1. **Event Hook Triggers** - Database events (create, update, delete)[^20]
2. **Webhook Triggers** - External HTTP requests with GET/POST support[^21][^22]
3. **Schedule Triggers** - Cron-based automation
4. **Manual Triggers** - User-initiated from Data Studio[^23]
5. **Another Flow Trigger** - Chain flows together[^19][^24]

**Flow Operations Available**:[^25][^19]

- **Run Script** - Execute JavaScript (no node modules for security)[^19]
- **Trigger Flow** - Start another flow with payload passing[^24][^19]
- **Request URL** - Make HTTP requests to external APIs
- **Create/Read/Update/Delete Items** - CRUD operations on collections
- **Condition** - Branching logic with success/failure paths
- **Transform** - Data manipulation
- **Custom Operations** - npm package extensions[^26][^27]

**Activity Tracking**:[^28][^29][^18]

- Flow execution creates activity logs with operation input/output
- Configurable tracking levels (activity log only, flow logs, or both)
- Revisions system tracks item-level changes
- External database changes (direct SQL) are not tracked[^28]


### API Extensions

**Extension Types Available**:[^30][^31]

1. **Endpoints** - Custom REST API routes at `/<extension-name>/*`[^32]
2. **Hooks** - Event listeners for database and lifecycle events[^20]
3. **Operations** - Custom Flow operation blocks[^25]
4. **Panels** - Dashboard widgets for Insights module[^33]
5. **Interfaces** - Custom field input components
6. **Displays** - Custom field output formats

**Custom Endpoints**:[^34][^32]

```typescript
// TypeScript endpoint example
import type { SandboxEndpointRouter } from 'directus:api';

export default (router: SandboxEndpointRouter) => {
  router.get('/', () => ({
    status: 200,
    body: { data: 'response' }
  }));
};
```

**Custom Operations with npm Packages**:[^26][^19]

- Can use external npm libraries (unlike Run Script operation)
- Full access to Directus services via `@directus/extensions-sdk`
- Supports TypeScript and JavaScript
- Examples: Stripe integration, email operations, AI integrations[^35][^13][^27][^36][^26]


### Filter Presets \& Insights

**Presets API**:[^37][^38][^39]

- Presets store saved filters, search parameters, and view configurations
- Can be global (null user), role-based, or user-specific
- Accessible via `/presets` endpoint with permission filtering
- Include collection, filter rules, field selections, sort order

**Insights Panels**:[^40][^41][^33]

- Panel configurations stored in database with query parameters
- Support for filter variables that can be shared across panels
- Query options include: collection, filters, limits, aggregations
- Currently no direct API to retrieve panel result data (requires custom endpoint)[^42]

**Filter Rules \& Query Parameters**:[^43][^44][^45][^46]

- Complex nested filters with logical operators (`_and`, `_or`, `_eq`, `_neq`, etc.)
- Relational filtering across Many-to-One, One-to-Many, Many-to-Many relationships
- Field selection with `fields` parameter (supports wildcards and nested relations)
- Pagination with `limit`, `offset`, and `page` parameters
- Sorting, searching, and aggregation capabilities
- Deep queries for nested relational data[^47]


### Collections \& CRUD Operations

**Items API**:[^48][^49][^50][^44]

- Standard CRUD at `/items/{collection}` endpoints
- Supports bulk operations for creating/updating multiple items
- Query parameters: fields, filter, search, sort, limit, offset, deep
- Relational data handling with nested queries
- Field-level permissions and validation rules[^51][^52]


## n8n Agent Workflow Integration

### AI Agent Architecture in n8n

**Agent Capabilities**:[^53][^54][^55]

- Use any LLM (OpenAI, Claude, Gemini, etc.) as reasoning engine
- Tool-based architecture where agents can call functions/workflows
- Support for multi-agent systems with hierarchical or mesh structures
- Context retention through memory nodes
- Decision-making with branching logic and error handling

**n8n as Tools**:[^56][^57]

- **Call n8n Workflow Tool** - Expose any workflow as an agent tool
- **HTTP Request Tool** - Make API calls to external services
- **Custom Code Tool** - Execute JavaScript/Python code
- Built-in tools: Wikipedia, SerpAPI, Vector Store, Date/Time, etc.

**Function Calling**:[^58][^59][^60]

- OpenAI Functions Agent node for structured function calls
- Tools Agent (recommended) uses n8n nodes as callable functions
- Auto-detection of when tools should be invoked
- Structured input/output passing between agent and tools


### Integration Strategy for Directus

**Workflow Design Pattern:**

1. **Chat Trigger** → Receives user input
2. **AI Agent Node** → Processes request with LLM
3. **Tools (Multiple)**:
    - Call n8n Workflow Tool → Directus User Creation workflow
    - Call n8n Workflow Tool → Directus Flow Trigger workflow
    - Call n8n Workflow Tool → Directus Activity Query workflow
    - HTTP Request Tool → Direct Directus API calls
4. **Output Formatting** → Return structured responses

**Tool-Specific Workflows:**

- Each Directus operation becomes a separate reusable workflow
- Workflows accept parameters from AI agent
- Return structured JSON responses
- Error handling and validation at workflow level


## Feature Development Plan

### Phase 1: Core Node Infrastructure Update

**Objective:** Modernize the base node architecture to current n8n standards

**Tasks:**

1. **Update Node Structure**[^61][^62][^63]
    - Migrate to TypeScript for type safety
    - Update to latest `@directus/sdk` (v17+)[^64][^65]
    - Implement proper error handling and validation
    - Add linter compliance (`npx @n8n/scan-community-package`)
2. **Authentication Improvements**[^9][^17]
    - Support for static tokens (API keys)
    - Dynamic token authentication with refresh
    - OAuth2 flow support
    - Credential validation and error messaging
3. **Connection Management**[^4][^5]
    - Connection pooling for PostgreSQL via Supabase
    - Configurable rate limiting awareness
    - Timeout and retry logic
    - Health check endpoints

**Deliverables:**

- Updated TypeScript node package
- Comprehensive credential types
- Connection configuration options
- Unit tests for core functionality


### Phase 2: User Management Operations

**Objective:** Enable AI agents to create and manage Directus users

**Features:**

1. **Create User Operation**[^15][^14]
    - Email and password fields
    - Role assignment via UUID
    - Custom field support (first_name, last_name, etc.)
    - Avatar upload option
    - Return user object with generated ID
2. **User Query Operations**
    - List users with filtering
    - Get user by ID or email
    - Search users by fields
    - Support for relational data (roles, permissions)
3. **User Update Operations**
    - Update user fields
    - Role reassignment
    - Status changes (active/suspended)
    - Password reset triggers
4. **User Management Helpers**
    - Invite user workflow (sends email)
    - Role lookup by name
    - Permission validation
    - Bulk user creation from arrays

**API References:**

- `POST /users` - Create user[^14]
- `GET /users` - List users with query parameters[^44]
- `PATCH /users/{id}` - Update user
- `GET /users/me` - Current user info
- `POST /users/invite` - Send invitation[^14]

**n8n Agent Integration:**

- Create "User Management Tool" workflow
- Accept parameters: email, password, role_name, custom_fields
- Return success/failure with user_id
- Error handling for duplicate emails


### Phase 3: Flow Operations

**Objective:** Enable triggering and managing Directus Flows from n8n

**Features:**

1. **Trigger Flow Operation**[^21][^24][^19]
    - Flow selection by UUID or name lookup
    - Payload passing (JSON object)
    - Async/sync execution options
    - Return flow execution ID
2. **Webhook Flow Creation**
    - Dynamic webhook URL generation
    - Method configuration (GET/POST/PUT/DELETE)
    - Query parameter passing[^22]
    - Header configuration
3. **Flow Status Monitoring**
    - Query flow execution status
    - Retrieve flow logs
    - Error tracking
    - Execution time metrics
4. **Flow Chain Management**[^66][^24]
    - Trigger multiple flows in sequence
    - Pass data between flows
    - Loop through arrays with "Trigger Flow" operation[^24]
    - Conditional flow execution

**API References:**

- `POST /flows/trigger/{flow_id}` - Webhook trigger[^22][^21]
- `GET /flows` - List flows
- `GET /operations` - Flow operations[^67]
- Activity logs for flow execution tracking[^29]

**n8n Agent Integration:**

- Create "Flow Trigger Tool" workflow
- Parameters: flow_name/flow_id, payload_data, execution_mode
- Return execution_id and status
- Polling option for sync execution results


### Phase 4: Activity Logging \& Monitoring

**Objective:** Query and analyze Directus activity logs

**Features:**

1. **Activity Log Query**[^68][^29][^28]
    - Filter by user, collection, action, timestamp
    - Date range queries
    - IP address tracking
    - Event type filtering (create/update/delete)
2. **Revision History Access**
    - Item-level change tracking
    - Field-by-field diff viewing
    - Version comparison
    - Rollback data extraction
3. **Flow Execution Logs**[^69][^18]
    - Operation-level tracking
    - Input/output payload viewing
    - Error log extraction
    - Performance metrics (execution time)
4. **Custom Log Aggregation**
    - User activity summaries
    - Collection usage statistics
    - Error frequency analysis
    - Peak usage time detection

**API References:**

- `GET /activity` - Activity feed[^28]
- `GET /revisions` - Revision history
- Query parameters: filter, sort, limit, fields[^45][^44]
- Flow-specific logs via activity collection filtering

**n8n Agent Integration:**

- Create "Activity Query Tool" workflow
- Parameters: user_id, collection, action_type, date_range
- Return formatted activity array
- Support for aggregated statistics


### Phase 5: Filter Presets \& Insights Access

**Objective:** Expose Directus filter presets for use in n8n workflows

**Features:**

1. **Preset Query Operations**[^38][^39][^37]
    - List presets by collection
    - Filter by user/role/global
    - Retrieve preset configurations
    - Extract filter rules and parameters
2. **Apply Presets to Queries**
    - Load preset filter rules
    - Execute queries with preset parameters
    - Support for dynamic value substitution
    - Combine multiple preset filters
3. **Preset-Based Data Extraction**
    - Execute preset query against collection
    - Return filtered results
    - Support for pagination
    - Export capabilities
4. **Insights Dashboard Data**[^40][^33][^42]
    - Retrieve panel configurations
    - Execute panel queries via custom endpoint
    - Dashboard data aggregation
    - Variable substitution for dynamic panels

**API References:**

- `GET /presets` - List presets[^37]
- `GET /presets?filter[collection][_eq]={collection}` - Collection presets
- `GET /items/{collection}` with preset filter rules[^44]
- Custom endpoint for panel result data[^42]

**Implementation Notes:**

- Presets API returns filter objects that can be applied to items queries
- May require custom Directus endpoint to execute panel queries and return results[^42]
- Filter syntax supports complex nested logic[^46]

**n8n Agent Integration:**

- Create "Preset Query Tool" workflow
- Parameters: preset_name/preset_id, collection, additional_filters
- Return filtered data results
- Support for preset discovery by collection


### Phase 6: PostgreSQL/Supabase Integration

**Objective:** Optimize for Supabase-hosted PostgreSQL while maintaining Directus benefits

**Features:**

1. **Hybrid Data Access**[^70][^71][^4]
    - Direct Supabase API access for complex queries
    - Directus API for user-friendly filtering
    - Transaction coordination between systems
    - Connection pooling optimization
2. **Supabase Trigger Integration**[^70]
    - Database triggers for transactional operations
    - Webhook callbacks to n8n
    - Event synchronization
    - Data consistency validation
3. **Directus Filter UI Mapping**
    - Convert Directus filter presets to Supabase queries
    - REST API compatibility layer
    - GraphQL query generation
    - Real-time subscription mapping
4. **Performance Optimization**
    - Query result caching
    - Connection pooling management[^5]
    - Batch operation support
    - Index utilization hints

**Integration Strategy:**

- Use Directus for: User management, activity logging, filter UI, Insight Panels
- Use Supabase for: Complex transactional queries, real-time subscriptions, edge functions
- Use n8n for: Orchestration, AI agent workflows, cross-system automation


### Phase 7: AI Agent Tooling Enablement

**Objective:** Make all Directus operations accessible as n8n agent tools

**Features:**

1. **Tool Workflow Library**[^57][^56]
    - Pre-built workflows for each operation type
    - Standardized input/output schemas
    - Error handling templates
    - Documentation generation
2. **Function Calling Configuration**[^59][^58]
    - OpenAI function schemas for each tool
    - Parameter validation rules
    - Required vs optional field definitions
    - Response format specifications
3. **Agent Prompt Templates**
    - Context-aware system prompts
    - Operation-specific instructions
    - Error handling guidance
    - Example queries and responses
4. **Multi-Step Workflow Support**
    - Chained operation sequences
    - Conditional logic based on results
    - Rollback mechanisms
    - State management between calls

**Tool Specifications:**

**User Creation Tool:**

```json
{
  "name": "create_directus_user",
  "description": "Creates a new user in Directus CMS",
  "parameters": {
    "email": "string (required)",
    "password": "string (required)",
    "role_name": "string (required)",
    "first_name": "string (optional)",
    "last_name": "string (optional)"
  },
  "returns": "user_id, email, role_id"
}
```

**Flow Trigger Tool:**

```json
{
  "name": "trigger_directus_flow",
  "description": "Triggers a Directus Flow automation",
  "parameters": {
    "flow_name": "string (required)",
    "payload": "object (optional)",
    "wait_for_completion": "boolean (optional)"
  },
  "returns": "execution_id, status, result_data"
}
```

**Activity Query Tool:**

```json
{
  "name": "query_directus_activity",
  "description": "Retrieves Directus activity logs",
  "parameters": {
    "collection": "string (optional)",
    "user_id": "string (optional)",
    "action": "string (optional: create|update|delete)",
    "date_from": "string (optional)",
    "date_to": "string (optional)",
    "limit": "number (optional)"
  },
  "returns": "array of activity objects"
}
```

**Preset Query Tool:**

```json
{
  "name": "query_with_preset",
  "description": "Queries Directus collection using saved filter preset",
  "parameters": {
    "collection": "string (required)",
    "preset_name": "string (required)",
    "additional_filters": "object (optional)",
    "limit": "number (optional)"
  },
  "returns": "array of filtered items"
}
```


## Technical Architecture

### Node Structure

```
n8n-nodes-directus/
├── credentials/
│   ├── DirectusApi.credentials.ts        # API token auth
│   └── DirectusOAuth2Api.credentials.ts  # OAuth2 auth
├── nodes/
│   └── Directus/
│       ├── Directus.node.ts              # Main node definition
│       ├── GenericFunctions.ts           # Shared utilities
│       ├── operations/
│       │   ├── user/                     # User operations
│       │   ├── flow/                     # Flow operations
│       │   ├── activity/                 # Activity operations
│       │   ├── preset/                   # Preset operations
│       │   └── collection/               # Collection CRUD
│       └── descriptions/
│           ├── UserDescription.ts        # User op params
│           ├── FlowDescription.ts        # Flow op params
│           └── ...
├── package.json
├── tsconfig.json
└── README.md
```


### SDK Integration

```typescript
// Using latest @directus/sdk
import { createDirectus, rest, authentication } from '@directus/sdk';

// Initialize client with token auth
const client = createDirectus(url)
  .with(authentication('json'))
  .with(rest());

// User creation example
const user = await client.request(
  createUser({
    email: email,
    password: password,
    role: roleId,
    first_name: firstName
  })
);

// Flow trigger example
const result = await client.request(() => ({
  path: `/flows/trigger/${flowId}`,
  method: 'POST',
  body: payload
}));

// Activity query with filters
const activities = await client.request(
  readActivities({
    filter: {
      collection: { _eq: 'articles' },
      action: { _in: ['create', 'update'] }
    },
    limit: 50,
    sort: ['-timestamp']
  })
);
```


### Error Handling Strategy

```typescript
// Comprehensive error catching
try {
  const result = await directusOperation();
  return result;
} catch (error) {
  // Rate limit errors
  if (error.status === 429) {
    throw new Error('Rate limit exceeded. Try again later.');
  }
  
  // Authentication errors
  if (error.status === 401) {
    throw new Error('Invalid authentication token.');
  }
  
  // Permission errors
  if (error.status === 403) {
    throw new Error('Insufficient permissions for this operation.');
  }
  
  // Validation errors
  if (error.status === 400) {
    throw new Error(`Validation failed: ${error.message}`);
  }
  
  // Generic error
  throw new Error(`Directus API error: ${error.message}`);
}
```


## Testing \& Validation

### Test Coverage Requirements

1. **Unit Tests**
    - Credential validation
    - Parameter parsing
    - Error handling
    - Response formatting
2. **Integration Tests**
    - Directus API connectivity
    - User CRUD operations
    - Flow triggering and monitoring
    - Activity log queries
    - Preset application
3. **n8n Agent Tests**
    - Tool workflow execution
    - Function calling accuracy
    - Parameter validation
    - Response parsing

### Linter Compliance

```bash
# Run n8n community node linter
npx @n8n/scan-community-package n8n-nodes-directus

# TypeScript compilation
npm run build

# Code linting
npm run lint
npm run lint:fix
```


## Migration Path

### From Old Node to Updated Node

1. **Backward Compatibility**
    - Maintain existing operation names where possible
    - Provide migration guide for breaking changes
    - Support deprecated parameters with warnings
2. **New Credential Setup**
    - Document token generation in Directus
    - OAuth2 configuration guide
    - Rate limit recommendations
3. **Workflow Updates**
    - Operation mapping guide (old → new)
    - New feature adoption examples
    - Agent workflow templates

## Documentation Requirements

### README Sections

1. **Installation**
    - npm installation instructions
    - n8n Cloud vs self-hosted
    - Credential configuration
2. **Operations Reference**
    - Complete list of available operations
    - Parameter descriptions with types
    - Example requests and responses
    - Common use cases
3. **AI Agent Integration Guide**
    - Setting up workflows as tools
    - Function calling configuration
    - Example agent prompts
    - Multi-step workflow patterns
4. **Supabase Integration**
    - Connection configuration
    - Hybrid data access patterns
    - Performance optimization tips
    - Transaction coordination
5. **Troubleshooting**
    - Common errors and solutions
    - Rate limiting strategies
    - Permission configuration
    - Debug logging

## Key API References

### Essential Endpoints

**Authentication:**

- `POST /auth/login` - Obtain access token[^8]
- `POST /auth/refresh` - Refresh access token[^17]
- `POST /auth/logout` - Invalidate session

**Users:**

- `POST /users` - Create user[^14]
- `GET /users` - List users
- `GET /users/{id}` - Get user by ID
- `PATCH /users/{id}` - Update user
- `POST /users/invite` - Invite user[^14]

**Flows:**

- `GET /flows` - List flows
- `POST /flows/trigger/{id}` - Trigger flow via webhook[^21]
- `GET /operations` - List flow operations[^67]

**Activity:**

- `GET /activity` - Activity logs[^28]
- `GET /revisions` - Revision history

**Presets:**

- `GET /presets` - List presets[^37]
- `GET /presets/{id}` - Get preset by ID

**Collections/Items:**

- `GET /collections` - List collections[^48]
- `GET /items/{collection}` - Query items[^44]
- `POST /items/{collection}` - Create item[^50]
- `PATCH /items/{collection}/{id}` - Update item
- `DELETE /items/{collection}/{id}` - Delete item

**Query Parameters:**[^45][^44]

- `fields` - Select fields (supports wildcards, nested relations)
- `filter` - Filter rules with operators
- `sort` - Sorting specification
- `limit` - Result limit (default 100, -1 for all)
- `offset` - Pagination offset
- `page` - Page number
- `search` - Full-text search
- `deep` - Nested relational queries[^47]
- `meta` - Include metadata (total_count, filter_count)


### SDK Methods

```typescript
// User operations
import { createUser, readUsers, updateUser } from '@directus/sdk';

// Item operations  
import { createItem, readItems, updateItem, deleteItem } from '@directus/sdk';

// Authentication
import { login, refresh, logout } from '@directus/sdk';

// Custom requests
client.request(() => ({
  path: '/custom/endpoint',
  method: 'POST',
  body: data
}));
```


## Success Metrics

### Node Performance

- < 500ms average response time for simple operations
- < 2s for complex queries with filters
- 99.5% uptime compatibility
- Support for 25+ requests/second (Directus default rate limit)


### Agent Integration

- 95%+ tool calling accuracy
- < 3s end-to-end agent workflow execution
- Error rate < 2%
- Support for 10+ concurrent agent sessions


### Developer Experience

- Installation time < 5 minutes
- Setup guide completion < 15 minutes
- 80%+ test coverage
- Zero linter warnings


## Next Steps

1. **Week 1-2:** Update core node infrastructure and authentication
2. **Week 3-4:** Implement user management operations
3. **Week 5-6:** Build flow operations and activity logging
4. **Week 7-8:** Add filter preset and insights access
5. **Week 9-10:** Create AI agent tool workflows
6. **Week 11-12:** Testing, documentation, and publishing

This comprehensive plan provides all the references and structure needed to successfully update your n8n community node for Directus with modern AI agent capabilities while maintaining seamless integration with your Supabase PostgreSQL setup.
<span style="display:none">[^100][^101][^102][^103][^104][^105][^106][^107][^108][^109][^110][^111][^112][^113][^114][^115][^116][^117][^118][^119][^120][^121][^122][^123][^124][^125][^126][^127][^128][^129][^130][^131][^132][^133][^134][^135][^136][^137][^138][^139][^140][^141][^142][^143][^72][^73][^74][^75][^76][^77][^78][^79][^80][^81][^82][^83][^84][^85][^86][^87][^88][^89][^90][^91][^92][^93][^94][^95][^96][^97][^98][^99]</span>

<div align="center">⁂</div>

[^1]: https://directus.io/docs/api

[^2]: https://directus.io/blog/directus-feature-spotlight-rest-and-graph-ql-behavior-party

[^3]: https://github.com/directus/directus/discussions/16889

[^4]: https://supabase.com/partners/integrations/directus

[^5]: https://github.com/directus/directus/issues/24280

[^6]: https://www.linkedin.com/posts/directus-io_is-your-api-lying-to-you-every-time-activity-7338588432258019329-ElAc

[^7]: https://directus.io/docs/configuration/realtime

[^8]: https://directus.io/docs/api/authentication

[^9]: https://learndirectus.com/how-to-use-api-authentication/

[^10]: https://directus.io/docs/configuration/security-limits

[^11]: https://github.com/directus/directus/discussions/7134

[^12]: https://directus.io/blog/feedback-powers-extensions-directus-marketplace

[^13]: https://community.directus.io/t/transform-your-directus-cms-with-intelligent-automation-smart-data-interpretation-and-natural-language-processing/639

[^14]: https://directus.io/docs/guides/auth/creating-users

[^15]: https://directus.io/blog/rest-api

[^16]: https://stackoverflow.com/questions/60396114/directus-access-token-for-each-user

[^17]: https://directus.io/docs/tutorials/getting-started/using-authentication-in-next-js

[^18]: https://directus.io/docs/guides/automate/flows

[^19]: https://directus.io/docs/guides/automate/operations

[^20]: https://directus.io/docs/guides/extensions/api-extensions/hooks

[^21]: https://learndirectus.com/how-to-trigger-a-flow/

[^22]: https://rphl.dev/blog/sending-params-to-directus-flow

[^23]: https://directus.io/tv/directus-academy/directus-automate

[^24]: https://learndirectus.com/how-to-loop-through-data-in-flows/

[^25]: https://directus.io/docs/guides/extensions/api-extensions/operations

[^26]: https://www.npmjs.com/package/@directus-labs/liquidjs-operation?activeTab=readme

[^27]: https://www.npmjs.com/package/@directus-labs/ai-image-generation-operation?activeTab=readme

[^28]: https://directus.io/docs/guides/auth/accountability

[^29]: https://directus.io/docs/tutorials/tips-and-tricks/build-a-monitoring-pipeline-for-flows-and-extensions

[^30]: https://directus.io/docs/api/extensions

[^31]: https://directus.io/docs/guides/extensions/overview

[^32]: https://directus.io/docs/guides/extensions/api-extensions/endpoints

[^33]: https://directus.io/docs/guides/extensions/app-extensions/panels

[^34]: https://directus.io/docs/tutorials/extensions/check-permissions-in-a-custom-endpoint

[^35]: https://www.dirextensions.com/details/directus-extension-stripe/

[^36]: https://www.jsdelivr.com/package/npm/directus-extension-mailer-operation

[^37]: https://directus.io/docs/api/presets

[^38]: https://docs.directus.io/user-guide/settings/presets-bookmarks

[^39]: https://github.com/directus/directus/discussions/13056

[^40]: https://directus.io/docs/guides/insights/panels

[^41]: https://directus.io/docs/tutorials/extensions/display-external-api-data-from-vonage-in-custom-panels

[^42]: https://github.com/directus/directus/discussions/18837

[^43]: https://stackoverflow.com/questions/74123511/filter-in-the-url-of-a-rest-api-in-directus

[^44]: https://directus.io/docs/api/items

[^45]: https://directus.io/docs/guides/connect/query-parameters

[^46]: https://directus.io/docs/guides/connect/filter-rules

[^47]: https://github.com/directus/directus/issues/13252

[^48]: https://directus.io/docs/api/collections

[^49]: https://directus.io/features/crud-operations

[^50]: https://stackoverflow.com/questions/76212486/how-to-create-custom-endpoint-to-insert-to-database-in-directus-cms

[^51]: https://directus.io/docs/guides/auth/access-control

[^52]: https://github.com/directus/directus/discussions/7476

[^53]: https://n8n.io/integrations/agent/

[^54]: https://blog.n8n.io/ai-agentic-workflows/

[^55]: https://n8n.io/ai-agents/

[^56]: https://docs.n8n.io/advanced-ai/examples/understand-tools/

[^57]: https://n8n.io/workflows/2713-using-external-workflows-as-tools-in-n8n/

[^58]: https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/openai-functions-agent/

[^59]: https://community.n8n.io/t/function-call-in-ai-agent/87907

[^60]: https://community.n8n.io/t/how-to-use-openai-functions-agent-and-openai-structured-output-in-n8n/75010

[^61]: https://www.c-sharpcorner.com/article/n8n-custom-node-development-guide/

[^62]: https://lumadock.com/blog/tutorials/custom-n8n-nodes-guide/

[^63]: https://github.com/n8n-io/n8n-nodes-starter

[^64]: https://directus.io/docs/guides/connect/sdk

[^65]: https://www.npmjs.com/package/@directus/sdk

[^66]: https://github.com/directus/directus/discussions/19675

[^67]: https://directus.io/docs/api/operations

[^68]: https://directus.io/features/activity-log

[^69]: https://www.youtube.com/watch?v=Lhv3j9gesfo

[^70]: https://community.directus.io/t/adding-supabase-to-existing-directus-project-with-postgis-for-transactions/489

[^71]: https://university.tenten.co/t/tutorial-deploying-directus-with-supabase-and-next-js-on-vercel/1643

[^72]: https://rphl.dev/blog/create-stripe-webhook-listener-directus

[^73]: https://github.com/directus/directus/discussions/17407

[^74]: https://directus.io/blog/january-2025-directus-updates-releases-more

[^75]: https://community.directus.io/t/stripe-webhook-possible-to-access-raw-body-in-custom-extension-endpoint/408

[^76]: https://github.com/directus/directus/discussions/23507

[^77]: https://www.youtube.com/watch?v=Rlof69dpZSo

[^78]: https://stackoverflow.com/questions/72380698/how-to-create-and-deploy-an-endpoint-with-directus

[^79]: https://7span.com/blog/future-of-directus

[^80]: https://directus.io/docs/tutorials

[^81]: https://github.com/directus/directus/discussions/3083

[^82]: https://github.com/directus/directus/discussions/2993

[^83]: https://directus.io/features/user-management

[^84]: https://github.com/directus/directus/issues/22826

[^85]: https://directus.io/docs/api/permissions

[^86]: https://github.com/directus/directus/discussions/4463

[^87]: https://stackoverflow.com/questions/55776637/best-way-to-retrieve-and-filter-a-directus-collection-inside-a-custom-endpoint

[^88]: https://community.n8n.io/t/put-data-to-directus-rest-api-authentication/7415

[^89]: https://directus.io/docs/getting-started/use-the-api

[^90]: https://blog.elest.io/directus-roles-permissions-with-common-use-case/

[^91]: https://github.com/arladmin/n8n-nodes-directus

[^92]: https://community.n8n.io/t/directus-node/3673/4

[^93]: https://community.n8n.io/t/has-anyone-tried-the-directus-community-node/53168

[^94]: https://pegotec.net/n8n-ai-agent-to-agent-feature-is-reshaping-workflow-automation/

[^95]: https://github.com/restyler/awesome-n8n

[^96]: https://empathyfirstmedia.com/12-best-n8n-ai-agents-to-build-ai-workflows-2025/

[^97]: https://community.n8n.io/t/directus-node/3673

[^98]: https://www.jsdelivr.com/package/npm/@flagbit/n8n-nodes-directus

[^99]: https://docs.n8n.io/advanced-ai/intro-tutorial/

[^100]: https://directus.io/docs/configuration/logging

[^101]: https://github.com/nerding-io/n8n-nodes-mcp

[^102]: https://www.reddit.com/r/n8n/comments/1n0lvf9/we_built_an_ai_agent_that_creates_n8n_workflows/

[^103]: https://github.com/bryantgillespie/directus-sdk-typegen

[^104]: https://learndirectus.com/graphql-vs-rest-api/

[^105]: https://www.reddit.com/r/Directus/comments/1igxhme/directus_typeforge_a_new_typescript_type/

[^106]: https://directus.io/docs/guides/content/explore

[^107]: https://news.ycombinator.com/item?id=43150116

[^108]: https://community.directus.io/t/what-is-the-best-typescript-approach-for-relational-collections-using-sdk/315

[^109]: https://www.youtube.com/watch?v=e5PurMrJeKg

[^110]: https://directus.io/blog/rest-graphql-tprc

[^111]: https://github.com/craigharman/directus-sdk

[^112]: https://directus.io/docs/api/dashboards

[^113]: https://www.reddit.com/r/graphql/comments/144esgy/graphql_vs_rest_in_the_real_world/

[^114]: https://github.com/directus/directus/discussions/11798

[^115]: https://dev.to/rodik/building-an-instagram-ai-agent-with-n8n-5d8n

[^116]: https://directus.io/features/outgoing-webhooks

[^117]: https://www.reddit.com/r/n8n/comments/1llwn70/new_guide_integrating_llm_agents_with_n8n_using/

[^118]: https://github.com/directus/directus/discussions/15259

[^119]: https://pipedream.com/apps/directus/integrations/http

[^120]: https://www.youtube.com/watch?v=dY96SwsR_3Y

[^121]: https://n8n.io

[^122]: https://n8n.io/ai/

[^123]: https://www.youtube.com/watch?v=JEIyQgLHNL4

[^124]: https://community.directus.io/t/how-to-bypass-rate-limiting-for-admin-in-a-custom-directus-extension/203

[^125]: https://www.reddit.com/r/n8n/comments/1nilses/how_i_convert_n8n_workflows_into_typescript_code/

[^126]: https://pipedream.com/apps/supabase/integrations/directus

[^127]: https://docs.n8n.io/integrations/creating-nodes/build/reference/verification-guidelines/

[^128]: https://supabase.com/docs/guides/functions/connect-to-postgres

[^129]: https://docs.n8n.io/integrations/creating-nodes/overview/

[^130]: https://docs.n8n.io/integrations/community-nodes/build-community-nodes/

[^131]: https://directus.io/docs/guides/extensions/app-extensions/composables

[^132]: https://bryntum.com/blog/manage-data-using-bryntum-grid-and-directus/

[^133]: https://dev.to/debs_obrien/i-built-my-own-ai-agent-and-you-can-too-56l1

[^134]: https://directus.io/tv/short-hops/looping-flows

[^135]: https://www.freecodecamp.org/news/how-to-build-ai-workflows-with-n8n/

[^136]: https://www.youtube.com/watch?v=K5fjV3YY5y0

[^137]: https://directus.io/docs/guides/data-model/collections

[^138]: https://mcpmarket.com/server/directus-1

[^139]: https://www.youtube.com/watch?v=mjiSY3LZggc

[^140]: https://docs.n8n.io/1-0-migration-checklist/

[^141]: https://community.n8n.io/t/update-a-node-to-last-version-without-modifying-all-the-others/70211

[^142]: https://directus.io/docs/tutorials/extensions/create-collection-items-in-custom-panels

[^143]: https://docs.n8n.io/release-notes/

