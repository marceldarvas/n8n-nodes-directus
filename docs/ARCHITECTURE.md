# Architecture Documentation

Technical design and architecture of n8n-nodes-directus.

## Table of Contents

- [Overview](#overview)
- [Architecture Diagram](#architecture-diagram)
- [Core Components](#core-components)
- [Data Flow](#data-flow)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [AI Agent Integration](#ai-agent-integration)
- [Design Decisions](#design-decisions)
- [Extension Points](#extension-points)

---

## Overview

n8n-nodes-directus is a community node package that provides comprehensive integration between n8n workflow automation and Directus headless CMS.

### Key Design Principles

1. **Modularity**: Operations are separated into discrete, testable modules
2. **Type Safety**: Full TypeScript implementation with strict typing
3. **Error Resilience**: Comprehensive error handling and user-friendly messages
4. **Extensibility**: Easy to add new operations and resources
5. **Performance**: Efficient API usage with caching where appropriate

### Technology Stack

- **Language**: TypeScript 5.3+
- **Runtime**: Node.js 18+
- **SDK**: @directus/sdk 20.0+
- **Framework**: n8n workflow automation
- **Testing**: Jest with integration tests

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     n8n Workflow                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │  Trigger   │→ │  Directus  │→ │ Other Node │       │
│  │    Node    │  │    Node    │  │            │       │
│  └────────────┘  └────────────┘  └────────────┘       │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│            n8n-nodes-directus Package                   │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Directus.node.ts (Main Entry)              │ │
│  │  • Resource/Operation selection                    │ │
│  │  • Parameter validation                            │ │
│  │  • Credential management                           │ │
│  └───────────────────┬────────────────────────────────┘ │
│                      │                                   │
│     ┌────────────────┴────────────────┐                 │
│     │                                  │                 │
│     ▼                                  ▼                 │
│  ┌──────────────┐           ┌──────────────────┐        │
│  │ Descriptions │           │ Generic          │        │
│  │ • Resources  │           │ Functions        │        │
│  │ • Operations │           │ • API Client     │        │
│  │ • Parameters │           │ • Error Handler  │        │
│  └──────────────┘           │ • Role Lookup    │        │
│                             │ • Request Builder│        │
│                             └───────┬──────────┘        │
│                                     │                    │
└─────────────────────────────────────┼────────────────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Directus SDK     │
                            │  • REST client    │
                            │  • Type safety    │
                            │  • Auto-refresh   │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Directus API     │
                            │  (REST/GraphQL)   │
                            └───────────────────┘
```

---

## Core Components

### 1. Main Node (Directus.node.ts)

**Responsibility**: Entry point for all Directus operations in n8n.

**Key Functions**:
- Resource and operation selection
- Parameter collection from UI
- Credential injection
- Result formatting

**Code Structure**:
```typescript
export class Directus implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Directus',
		name: 'directus',
		icon: 'file:directus.svg',
		group: ['transform'],
		version: 1,
		description: 'Interact with Directus API',
		defaults: { name: 'Directus' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [/*...*/],
		properties: [/*...*/],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Route to appropriate operation handler
		// Return formatted results
	}
}
```

### 2. Resource Descriptions

**Responsibility**: Define UI and parameters for each resource.

**Location**: `nodes/Directus/descriptions/`

**Example** (UserDescription.ts):
```typescript
export const userOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		options: [
			{ name: 'Create', value: 'create' },
			{ name: 'Get', value: 'get' },
			{ name: 'Get All', value: 'getAll' },
			{ name: 'Update', value: 'update' },
			{ name: 'Delete', value: 'delete' },
		],
	},
	// ... parameter definitions
];
```

### 3. Generic Functions

**Responsibility**: Shared utility functions for API interactions.

**Location**: `nodes/Directus/GenericFunctions.ts`

**Key Functions**:
- `directusApiRequest`: Make authenticated API calls
- `lookupRoleByName`: Convert role names to UUIDs
- `handleDirectusError`: Process and format errors
- `buildFilters`: Construct Directus filter objects

**Example**:
```typescript
export async function directusApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body?: any,
): Promise<any> {
	const credentials = await this.getCredentials('directusApi');
	const client = createDirectusClient(credentials.url);

	try {
		return await client.request(/*...*/);
	} catch (error) {
		throw handleDirectusError(error);
	}
}
```

### 4. Operations Implementation

**Responsibility**: Business logic for each operation.

**Location**: `nodes/Directus/operations/`

**Pattern**:
```typescript
export async function executeUserCreate(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const email = this.getNodeParameter('email', index) as string;
	const password = this.getNodeParameter('password', index) as string;
	const role = this.getNodeParameter('role', index) as string;

	// Handle role lookup if name provided
	const roleId = await lookupRoleByName.call(this, role);

	// Execute create operation
	const user = await directusApiRequest.call(
		this,
		'POST',
		'/users',
		{ email, password, role: roleId }
	);

	return [{ json: user }];
}
```

### 5. Credentials

**Responsibility**: Authentication configuration.

**Types**:
1. **DirectusApi** (Static Token)
2. **DirectusOAuth2Api** (OAuth2)

**Implementation**:
```typescript
export class DirectusApi implements ICredentialType {
	name = 'directusApi';
	displayName = 'Directus API';
	properties: INodeProperties[] = [
		{
			displayName: 'URL',
			name: 'url',
			type: 'string',
			default: 'https://your-directus-instance.com',
		},
		{
			displayName: 'Static Token',
			name: 'staticToken',
			type: 'string',
			typeOptions: { password: true },
		},
	];
}
```

---

## Data Flow

### Request Flow

```
User Input (n8n UI)
        ↓
Parameter Collection
        ↓
Validation & Type Conversion
        ↓
Credential Injection
        ↓
Generic Functions (Helper)
        ↓
Directus SDK Client
        ↓
HTTP Request to Directus API
        ↓
Response Processing
        ↓
Error Handling (if needed)
        ↓
Format for n8n
        ↓
Return to Workflow
```

### Example: Create User Flow

```typescript
// 1. User configures node in n8n
Resource: Users
Operation: Create
Email: {{ $json.email }}
Role: "Editor"

// 2. n8n calls execute()
execute() {
  const email = this.getNodeParameter('email', 0);
  const role = this.getNodeParameter('role', 0);

  // 3. Route to operation
  if (resource === 'users' && operation === 'create') {
    return await executeUserCreate.call(this, 0);
  }
}

// 4. Operation implementation
async executeUserCreate() {
  // 5. Helper: Lookup role
  const roleId = await lookupRoleByName('Editor');
  // Returns: "uuid-of-editor-role"

  // 6. Make API request
  const user = await directusApiRequest(
    'POST',
    '/users',
    { email, password, role: roleId }
  );

  // 7. Format and return
  return [{ json: user }];
}
```

---

## Authentication

### Static Token Flow

```
1. User creates token in Directus
2. User enters token in n8n credentials
3. Token stored securely by n8n
4. Each request includes:
   Authorization: Bearer <token>
```

### OAuth2 Flow

```
1. User configures OAuth2 client in Directus
2. User enters client ID/secret in n8n
3. User authorizes via OAuth2 redirect
4. n8n stores access/refresh tokens
5. Access token used for requests
6. Auto-refresh when token expires
```

### Credential Usage

```typescript
// Get credentials in operation
const credentials = await this.getCredentials('directusApi');

// Create authenticated client
const client = createDirectus(credentials.url)
  .with(authentication('bearer', credentials.staticToken))
  .with(rest());

// Make authenticated request
const result = await client.request(readItems('collection'));
```

---

## Error Handling

### Error Hierarchy

```
Error
  └─ NodeOperationError (n8n)
      └─ DirectusError (SDK)
          ├─ ValidationError
          ├─ AuthenticationError
          ├─ PermissionError
          └─ NotFoundError
```

### Error Processing

```typescript
export function handleDirectusError(error: any): NodeOperationError {
	// Extract meaningful information
	const statusCode = error.response?.status;
	const message = error.response?.data?.errors?.[0]?.message || error.message;

	// Provide user-friendly messages
	if (statusCode === 401) {
		return new NodeOperationError(
			node,
			'Authentication failed. Check your API token.',
		);
	}

	if (statusCode === 404) {
		return new NodeOperationError(
			node,
			`Resource not found: ${message}`,
		);
	}

	// Generic error with details
	return new NodeOperationError(
		node,
		`Directus API error (${statusCode}): ${message}`,
	);
}
```

### Error Context

Errors include:
- **Operation context**: What was being attempted
- **Status code**: HTTP status
- **User-friendly message**: Clear explanation
- **Suggestions**: How to fix (when possible)

---

## AI Agent Integration

### Tool Architecture

```
n8n AI Agent Node
        │
        ├─ Tool: create_directus_user
        │   │
        │   └─ Directus Node (Create User)
        │
        ├─ Tool: trigger_directus_flow
        │   │
        │   └─ Directus Node (Trigger Flow)
        │
        └─ Tool: query_with_preset
            │
            └─ Directus Node (Apply Preset)
```

### Tool Schema

Tools follow OpenAI Function Calling format:

```json
{
  "name": "create_directus_user",
  "description": "Create a new user in Directus",
  "parameters": {
    "type": "object",
    "properties": {
      "email": {
        "type": "string",
        "description": "User's email address"
      },
      "role_name": {
        "type": "string",
        "description": "Role name (e.g., 'Editor', 'Administrator')"
      }
    },
    "required": ["email", "role_name"]
  }
}
```

### Response Format

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "role": "Editor"
  },
  "metadata": {
    "timestamp": "2025-01-15T10:30:00Z",
    "execution_time_ms": 250
  }
}
```

---

## Design Decisions

### Why Directus SDK?

**Decision**: Use official @directus/sdk instead of raw HTTP

**Reasons**:
- Type safety
- Auto-completion in IDEs
- Built-in error handling
- Automatic token refresh (OAuth2)
- Maintained by Directus team

### Why Role Name Lookup?

**Decision**: Allow role names instead of requiring UUIDs

**Reasons**:
- Better user experience
- Matches Directus UI
- Reduces workflow complexity
- Cached for performance

**Implementation**:
```typescript
async function lookupRoleByName(roleName: string): Promise<string> {
	// Check cache first
	if (roleCache.has(roleName)) {
		return roleCache.get(roleName);
	}

	// Query Directus
	const roles = await client.request(
		readItems('directus_roles', {
			filter: { name: { _eq: roleName } },
			limit: 1,
		})
	);

	if (!roles.length) {
		throw new Error(`Role '${roleName}' not found`);
	}

	// Cache and return
	roleCache.set(roleName, roles[0].id);
	return roles[0].id;
}
```

### Why Separate Descriptions?

**Decision**: One file per resource for descriptions

**Reasons**:
- Modularity and maintainability
- Easier to find and update
- Clear separation of concerns
- Supports code splitting

### Why Integration Tests?

**Decision**: Focus on integration tests over unit tests

**Reasons**:
- Tests real Directus interactions
- Catches API changes
- Validates end-to-end flow
- More valuable for users

---

## Extension Points

### Adding a New Resource

1. **Create Description File**:
   ```typescript
   // descriptions/MyResourceDescription.ts
   export const myResourceOperations: INodeProperties[] = [/*...*/];
   export const myResourceFields: INodeProperties[] = [/*...*/];
   ```

2. **Import in Main Node**:
   ```typescript
   import { myResourceOperations, myResourceFields } from './descriptions/MyResourceDescription';
   ```

3. **Add to Resource List**:
   ```typescript
   {
     displayName: 'Resource',
     name: 'resource',
     type: 'options',
     options: [
       // ...
       { name: 'My Resource', value: 'myResource' },
     ],
   }
   ```

4. **Implement Operations**:
   ```typescript
   // operations/MyResourceOperations.ts
   export async function executeMyResourceGet(/*...*/) {/*...*/}
   ```

5. **Route in Execute**:
   ```typescript
   if (resource === 'myResource') {
     if (operation === 'get') {
       return await executeMyResourceGet.call(this, i);
     }
   }
   ```

### Adding a New Operation

Similar process, but only update the specific resource's description and add the operation handler.

### Adding AI Agent Tools

See [AI Agent Setup Guide](./agent-setup-guide.md) for creating custom tools.

---

## Performance Considerations

### Caching

- **Role Lookups**: Cached for workflow duration
- **Preset Definitions**: Cached per execution
- **API Responses**: Not cached (fresh data)

### Pagination

All list operations support:
- `limit`: Maximum items per request
- `offset`: Skip items
- `page`: Page number

### Batch Operations

Directus supports batch operations for efficiency:
```typescript
// Batch create
await client.request(
  createItems('collection', [item1, item2, item3])
);
```

---

## Security

### Credential Storage

- Never log credentials
- Use n8n's secure credential storage
- Support for environment variables

### Input Validation

- All user inputs validated
- Type checking via TypeScript
- Schema validation for complex inputs

### Error Messages

- Never expose sensitive data
- Sanitize error messages
- Log detailed errors server-side only

---

## Future Architecture Plans

- GraphQL support alongside REST
- WebSocket connections for real-time data
- Advanced caching strategies
- Query optimization
- Performance monitoring hooks

---

For implementation details, see:
- [API Reference](./API_REFERENCE.md)
- [Contributing Guide](./CONTRIBUTING.md)
