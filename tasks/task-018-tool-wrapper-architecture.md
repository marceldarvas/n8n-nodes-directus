# Task 018: AI Agent Tool Wrapper Architecture

## Priority: CRITICAL
**Effort**: 6-8 hours
**Developer**: AI/Agent specialist
**Phase**: 6 - AI Agent Integration

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- ✅ Task 001: Fix Syntax Errors
- ✅ Task 004: Flow Trigger Operation
- ✅ Task 008: Role Lookup Helper
- ✅ Task 011: Apply Presets

## Description
Design and implement the architecture for wrapping Directus operations as n8n agent tools with standardized input/output schemas, error handling, and function calling interfaces. This is CRITICAL for "make this node ready for use with an n8n agent workflow."

## Background
n8n AI agents use tools to perform actions. Each tool needs:
- Clear function description
- Standardized input schema (OpenAI function format)
- Predictable output format
- Error handling that AI can understand
- Success/failure indicators

## Implementation Steps

### 1. Define Tool Interface Standard (2 hours)
```typescript
interface IAgentToolConfig {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, IParameterSchema>;
    required: string[];
  };
  returns: {
    success: boolean;
    data?: any;
    error?: string;
    metadata?: any;
  };
}

interface IParameterSchema {
  type: string;
  description: string;
  enum?: any[];
  default?: any;
}
```

### 2. Create Tool Wrapper Base Class (3 hours)
```typescript
abstract class DirectusAgentTool {
  abstract name: string;
  abstract description: string;
  abstract parameters: any;

  async execute(
    context: IExecuteFunctions,
    params: any,
  ): Promise<IAgentToolResult> {
    try {
      // Validate parameters
      this.validateParameters(params);

      // Execute operation
      const result = await this.run(context, params);

      return {
        success: true,
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
          operation: this.name,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        metadata: {
          timestamp: new Date().toISOString(),
          operation: this.name,
        },
      };
    }
  }

  abstract run(context: IExecuteFunctions, params: any): Promise<any>;

  validateParameters(params: any): void {
    // Validate required parameters
    for (const field of this.parameters.required) {
      if (!(field in params)) {
        throw new Error(`Missing required parameter: ${field}`);
      }
    }
  }

  toOpenAIFunction(): any {
    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters,
    };
  }
}
```

### 3. Create Standardized Response Format (1 hour)
```typescript
interface IAgentToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    timestamp: string;
    operation: string;
    executionTime?: number;
    itemCount?: number;
  };
}
```

### 4. Add Tool Registry (1 hour)
```typescript
class DirectusToolRegistry {
  private tools: Map<string, DirectusAgentTool> = new Map();

  register(tool: DirectusAgentTool): void {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): DirectusAgentTool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): DirectusAgentTool[] {
    return Array.from(this.tools.values());
  }

  getOpenAIFunctions(): any[] {
    return this.getAllTools().map((tool) => tool.toOpenAIFunction());
  }
}
```

### 5. Add Tool Documentation Generator (1 hour)
- [ ] Generate markdown docs for each tool
- [ ] Include usage examples
- [ ] Parameter descriptions
- [ ] Return value schemas

## Testing
- [ ] Create example tool implementation
- [ ] Test parameter validation
- [ ] Test error handling
- [ ] Test success response format
- [ ] Generate OpenAI function schema
- [ ] Test with n8n AI agent

## Expected Outcomes
- ✅ Standardized tool interface
- ✅ Base tool wrapper class
- ✅ Consistent response format
- ✅ Tool registry system
- ✅ OpenAI function schema generation
- ✅ Documentation generation
- ✅ Ready for specific tool implementations

## Files Created
- New: `nodes/Directus/AgentTools/BaseAgentTool.ts`
- New: `nodes/Directus/AgentTools/ToolRegistry.ts`
- New: `nodes/Directus/AgentTools/types.ts`
- New: `nodes/Directus/AgentTools/index.ts`

## Tool Response Examples

### Success
```json
{
  "success": true,
  "data": {
    "userId": "abc123",
    "email": "user@example.com",
    "role": "Administrator"
  },
  "metadata": {
    "timestamp": "2025-01-15T10:30:00Z",
    "operation": "create_directus_user",
    "executionTime": 150
  }
}
```

### Error
```json
{
  "success": false,
  "error": "User with email user@example.com already exists",
  "metadata": {
    "timestamp": "2025-01-15T10:30:00Z",
    "operation": "create_directus_user"
  }
}
```

## Dependencies
**Blocks**:
- Task 019: Function Calling Schemas (needs architecture)
- Task 020-023: Specific tool implementations

**Blocked By**:
- Task 001: Syntax errors
- Task 004, 008, 011: Core operations needed for tools

## Notes
- Keep tool interfaces simple and clear for AI
- Error messages should be actionable
- Return data should be JSON-serializable
- Consider rate limiting at tool level
- Document expected behavior clearly
- Make tools stateless where possible

## Concurrency
⚠️ **Must be completed BEFORE Tasks 019-023** (other agent tasks depend on this)

## Related Documentation
- n8n AI Agents: https://docs.n8n.io/advanced-ai/
- OpenAI Function Calling: https://platform.openai.com/docs/guides/function-calling

## Definition of Done
- [ ] Tool interface defined
- [ ] Base wrapper class implemented
- [ ] Response format standardized
- [ ] Tool registry functional
- [ ] OpenAI schema generation working
- [ ] Example tool created and tested
- [ ] Documentation generator implemented
- [ ] Unit tests passing
- [ ] Git commit: "feat: add AI agent tool wrapper architecture"
