# Task 020: AI Agent User Management Tool

## Priority: HIGH
**Effort**: 3-4 hours
**Developer**: AI/Agent specialist
**Phase**: 6 - AI Agent Integration

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- ✅ Task 018: Tool Wrapper Architecture
- ✅ Task 019: Function Calling Schemas
- ✅ Task 008: Role Lookup Helper

## Description
Implement the user management tool for AI agents, enabling creation, querying, and management of Directus users through natural language commands.

## Implementation

### 1. Create User Management Tool Class (2 hours)
```typescript
class CreateDirectusUserTool extends DirectusAgentTool {
  name = 'create_directus_user';
  description = 'Creates a new user in Directus CMS';
  parameters = {
    type: 'object',
    properties: {
      email: { type: 'string', description: 'User email' },
      password: { type: 'string', description: 'User password' },
      role_name: { type: 'string', description: 'Role name' },
      first_name: { type: 'string', description: 'First name (optional)' },
      last_name: { type: 'string', description: 'Last name (optional)' },
    },
    required: ['email', 'password', 'role_name'],
  };

  async run(context: IExecuteFunctions, params: any): Promise<any> {
    // Lookup role by name
    const roleId = await getRoleIdByName.call(context, params.role_name);

    // Create user
    const user = await directusApiRequest.call(
      context,
      'POST',
      '/users',
      {
        email: params.email,
        password: params.password,
        role: roleId,
        first_name: params.first_name,
        last_name: params.last_name,
      },
    );

    return {
      user_id: user.data.id,
      email: user.data.email,
      role: params.role_name,
      role_id: roleId,
    };
  }
}
```

### 2. Add Query User Tool (1 hour)
- [ ] Query users by email, name, or role
- [ ] Return user list with key fields
- [ ] Support for pagination

### 3. Add Update User Tool (30 min)
- [ ] Update user fields
- [ ] Role reassignment
- [ ] Status changes

### 4. Register Tools (30 min)
```typescript
// In tool initialization
const userManagementTools = [
  new CreateDirectusUserTool(),
  new QueryDirectusUsersTool(),
  new UpdateDirectusUserTool(),
];

userManagementTools.forEach((tool) => {
  directusToolRegistry.register(tool);
});
```

## Testing with AI Agent
```
User: "Create a new user with email john@example.com,
       password SecurePass123, and make them an Administrator"

AI Agent: [Calls create_directus_user with parameters]

Response: {
  "success": true,
  "data": {
    "user_id": "abc123",
    "email": "john@example.com",
    "role": "Administrator"
  }
}
```

## Expected Outcomes
- ✅ Create user tool functional
- ✅ Query users tool working
- ✅ Update user tool operational
- ✅ AI can create users via natural language
- ✅ Clear success/error responses

## Files Created
- New: `nodes/Directus/AgentTools/CreateDirectusUserTool.ts`
- New: `nodes/Directus/AgentTools/QueryDirectusUsersTool.ts`
- New: `nodes/Directus/AgentTools/UpdateDirectusUserTool.ts`

## Dependencies
**Blocked By**: Tasks 018, 019, 008
**Can Run in Parallel With**: Tasks 021-023

## Definition of Done
- [ ] All user management tools implemented
- [ ] Registered in tool registry
- [ ] Tests passing with AI agent
- [ ] Natural language commands working
- [ ] Git commit: "feat: add AI agent user management tool"
