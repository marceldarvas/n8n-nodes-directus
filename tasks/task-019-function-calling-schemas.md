# Task 019: OpenAI Function Calling Schemas

## Priority: HIGH
**Effort**: 4-5 hours
**Developer**: AI/Agent specialist
**Phase**: 6 - AI Agent Integration

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- ✅ Task 001: Fix Syntax Errors
- ✅ Task 018: Tool Wrapper Architecture (MUST BE COMPLETED FIRST)

## Description
Create OpenAI-compatible function calling schemas for all Directus agent tools, ensuring proper parameter definitions, validation rules, and clear descriptions that AI models can understand.

## Implementation Steps

### 1. Define Core Tool Schemas (2 hours)
Create schemas for the 4 main agent tools:

**User Management Tool**
```typescript
{
  name: "create_directus_user",
  description: "Creates a new user in Directus CMS with specified role and details",
  parameters: {
    type: "object",
    properties: {
      email: {
        type: "string",
        description: "User's email address (must be unique)",
        format: "email"
      },
      password: {
        type: "string",
        description: "User's password (min 8 characters)",
        minLength: 8
      },
      role_name: {
        type: "string",
        description: "Role name (e.g., 'Administrator', 'Editor')",
        enum: ["Administrator", "Editor", "User"] // populated dynamically
      },
      first_name: {
        type: "string",
        description: "User's first name (optional)"
      },
      last_name: {
        type: "string",
        description: "User's last name (optional)"
      }
    },
    required: ["email", "password", "role_name"]
  }
}
```

**Flow Trigger Tool**
```typescript
{
  name: "trigger_directus_flow",
  description: "Triggers a Directus Flow automation with optional payload",
  parameters: {
    type: "object",
    properties: {
      flow_name: {
        type: "string",
        description: "Name of the flow to trigger"
      },
      payload: {
        type: "object",
        description: "Data to pass to the flow (optional)",
        additionalProperties: true
      },
      wait_for_completion: {
        type: "boolean",
        description: "Whether to wait for flow to complete (default: false)",
        default: false
      }
    },
    required: ["flow_name"]
  }
}
```

**Activity Query Tool**
```typescript
{
  name: "query_directus_activity",
  description: "Retrieves Directus activity logs with filters",
  parameters: {
    type: "object",
    properties: {
      collection: {
        type: "string",
        description: "Filter by collection name (optional)"
      },
      user_id: {
        type: "string",
        description: "Filter by user ID (optional)"
      },
      action: {
        type: "string",
        enum: ["create", "update", "delete", "login"],
        description: "Filter by action type (optional)"
      },
      date_from: {
        type: "string",
        format: "date-time",
        description: "Start date for filter (ISO 8601)"
      },
      date_to: {
        type: "string",
        format: "date-time",
        description: "End date for filter (ISO 8601)"
      },
      limit: {
        type: "number",
        description: "Maximum number of results (default: 50)",
        default: 50,
        minimum: 1,
        maximum: 1000
      }
    },
    required: []
  }
}
```

**Preset Query Tool**
```typescript
{
  name: "query_with_preset",
  description: "Queries Directus collection using saved filter preset",
  parameters: {
    type: "object",
    properties: {
      collection: {
        type: "string",
        description: "Collection to query"
      },
      preset_name: {
        type: "string",
        description: "Name of the saved preset"
      },
      additional_filters: {
        type: "object",
        description: "Additional filters to apply (optional)",
        additionalProperties: true
      },
      limit: {
        type: "number",
        description: "Maximum results (default: 100)",
        default: 100
      }
    },
    required: ["collection", "preset_name"]
  }
}
```

### 2. Add Schema Validation (1 hour)
```typescript
import Ajv from 'ajv';

class SchemaValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
  }

  validate(schema: any, data: any): { valid: boolean; errors?: string[] } {
    const valid = this.ajv.validate(schema.parameters, data);

    if (!valid) {
      return {
        valid: false,
        errors: this.ajv.errors?.map((e) => `${e.dataPath} ${e.message}`),
      };
    }

    return { valid: true };
  }
}
```

### 3. Add Dynamic Schema Generation (1 hour)
- [ ] Generate enum values from Directus (roles, collections)
- [ ] Update schemas with current system state
- [ ] Cache schemas for performance

### 4. Create Schema Documentation (1 hour)
- [ ] Generate markdown docs from schemas
- [ ] Include example requests/responses
- [ ] Add troubleshooting tips

## Testing
- [ ] Validate each schema with valid data
- [ ] Test with invalid data (missing required fields)
- [ ] Test with wrong data types
- [ ] Test with n8n OpenAI Functions Agent
- [ ] Verify AI understands tool descriptions

## Expected Outcomes
- ✅ OpenAI function schemas for all 4 core tools
- ✅ Schema validation working
- ✅ Dynamic enum population
- ✅ Clear descriptions for AI understanding
- ✅ Comprehensive parameter documentation

## Files Created/Modified
- New: `nodes/Directus/AgentTools/schemas/`
- New: `nodes/Directus/AgentTools/SchemaValidator.ts`
- Modified: `nodes/Directus/AgentTools/ToolRegistry.ts`

## Example AI Agent Usage
```javascript
// In n8n AI Agent node
const tools = directusToolRegistry.getOpenAIFunctions();

// AI agent can now call:
// - create_directus_user
// - trigger_directus_flow
// - query_directus_activity
// - query_with_preset
```

## Dependencies
**Blocks**: Task 020-023 (specific tool implementations)
**Blocked By**: Task 018 (tool architecture)

## Definition of Done
- [ ] All 4 core tool schemas defined
- [ ] Schema validation implemented
- [ ] Dynamic enum generation working
- [ ] Documentation generated
- [ ] Tests passing with OpenAI format
- [ ] Git commit: "feat: add OpenAI function calling schemas for agent tools"
