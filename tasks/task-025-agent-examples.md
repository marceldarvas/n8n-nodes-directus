# Task 025: AI Agent Example Workflows

## Priority: MEDIUM
**Effort**: 4-6 hours
**Developer**: Technical writer / AI specialist
**Phase**: 7 - Documentation & Testing

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- ✅ Task 018-023: AI Agent Tools completed

## Description
Create example n8n workflows demonstrating AI agent integration with Directus tools, including complete use cases, prompt templates, and best practices.

## Implementation Steps

### 1. Create Example Workflows (3 hours)

**Example 1: User Onboarding Agent**
```json
{
  "name": "User Onboarding AI Agent",
  "nodes": [
    {
      "type": "n8n-nodes-langchain.chatTrigger",
      "name": "Chat Trigger"
    },
    {
      "type": "n8n-nodes-langchain.agent",
      "name": "AI Agent",
      "parameters": {
        "systemMessage": "You are a user onboarding assistant. Create users in Directus and trigger welcome workflows.",
        "tools": [
          "create_directus_user",
          "trigger_directus_flow",
          "query_directus_activity"
        ]
      }
    }
  ]
}
```

**Example 2: Data Analysis Agent**
```json
{
  "name": "Data Analysis AI Agent",
  "nodes": [
    {
      "type": "n8n-nodes-langchain.chatTrigger"
    },
    {
      "type": "n8n-nodes-langchain.agent",
      "parameters": {
        "systemMessage": "You help users analyze Directus data using presets and activity logs.",
        "tools": [
          "query_with_preset",
          "query_directus_activity"
        ]
      }
    }
  ]
}
```

**Example 3: Automation Control Agent**
```json
{
  "name": "Automation Control AI Agent",
  "systemMessage": "You manage Directus Flows - trigger, monitor, and report on automation.",
  "tools": [
    "trigger_directus_flow",
    "query_directus_activity"
  ]
}
```

### 2. Create Prompt Templates (1 hour)
```markdown
# System Prompts for Directus AI Agents

## User Management Agent
You are a Directus user management assistant. You can:
- Create new users with appropriate roles
- Search for existing users
- Update user information
- Monitor user activity

Always confirm role assignments before creating users.
Use strong passwords (minimum 12 characters).

## Flow Automation Agent
You manage Directus automation flows. You can:
- Trigger flows with custom payloads
- Monitor flow execution status
- Check flow logs for errors
- Report on flow performance

Always provide execution IDs when triggering flows.
Wait for completion when user needs results.

## Data Query Agent
You help users extract data from Directus. You can:
- Use saved presets for common queries
- Apply additional filters
- Aggregate and summarize data
- Export results

Always ask which preset to use for collections.
Limit results to reasonable amounts (≤100 by default).
```

### 3. Create Usage Documentation (1.5 hours)
- [ ] Complete workflow setup guide
- [ ] Tool configuration instructions
- [ ] Example conversations
- [ ] Troubleshooting tips

### 4. Create Video Tutorial Script (30 min)
- [ ] Workflow import instructions
- [ ] Agent configuration walkthrough
- [ ] Example interactions
- [ ] Common use cases

## Example Conversations

### User Onboarding
```
User: Create a new editor account for sarah@company.com

Agent: I'll create an Editor account for sarah@company.com.
       What password should I set?

User: Use TempPass2024! and send her a welcome email

Agent: [Calls create_directus_user]
       ✓ User created: sarah@company.com (Role: Editor)
       [Calls trigger_directus_flow with "Send Welcome Email" flow]
       ✓ Welcome email sent (Execution ID: abc123)

       Sarah's account is ready! I've sent the welcome email.
```

### Data Analysis
```
User: Show me recently published articles

Agent: I'll query using the "Published Articles" preset.
       [Calls query_with_preset]

       Found 15 published articles in the last 7 days:
       1. "Introduction to Directus" (125 views)
       2. "Advanced Workflows" (98 views)
       ...

       Would you like me to filter further or export the data?
```

### Flow Monitoring
```
User: Trigger the daily report flow

Agent: [Calls trigger_directus_flow]
       ✓ Daily report flow triggered (Execution ID: xyz789)

       The flow is running. Would you like me to wait for
       completion and show the results?

User: Yes, wait for it

Agent: [Monitors execution]
       ✓ Flow completed successfully in 3.2 seconds
       Report generated with 150 records processed.
```

## Expected Outcomes
- ✅ 3+ complete example workflows
- ✅ System prompt templates
- ✅ Usage documentation
- ✅ Example conversations
- ✅ Video tutorial script
- ✅ Troubleshooting guide

## Files Created
- New: `examples/workflows/user-onboarding-agent.json`
- New: `examples/workflows/data-analysis-agent.json`
- New: `examples/workflows/automation-control-agent.json`
- New: `examples/prompts/system-prompts.md`
- New: `examples/conversations.md`
- New: `docs/agent-setup-guide.md`
- New: `docs/video-tutorial-script.md`

## Dependencies
**Blocked By**: Tasks 018-023 (agent tools)
**Can Run in Parallel With**: Tasks 024, 026

## Definition of Done
- [ ] Example workflows created and tested
- [ ] Prompt templates documented
- [ ] Usage guide complete
- [ ] Example conversations written
- [ ] Video script ready
- [ ] All examples verified functional
- [ ] Git commit: "docs: add AI agent example workflows and guides"
