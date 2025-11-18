# AI Agent Setup Guide for n8n-nodes-directus

This guide will walk you through setting up AI agents in n8n that can interact with your Directus instance using the n8n-nodes-directus package.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Importing Example Workflows](#importing-example-workflows)
4. [Configuring Directus Credentials](#configuring-directus-credentials)
5. [Setting Up AI Agent Tools](#setting-up-ai-agent-tools)
6. [Testing Your Agent](#testing-your-agent)
7. [Customization](#customization)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before setting up AI agents with Directus, ensure you have:

### Required
- **n8n instance** (v1.0.0 or higher)
- **Directus instance** (v10.0.0 or higher)
- **n8n-nodes-directus** package installed
- **AI provider** configured (OpenAI, Anthropic Claude, or compatible)

### Recommended
- Basic understanding of n8n workflows
- Familiarity with Directus collections and permissions
- API access token with appropriate permissions

---

## Quick Start

### Step 1: Install n8n-nodes-directus

If you haven't already installed the package:

```bash
# Using n8n GUI
# Navigate to Settings → Community Nodes → Install
# Enter: n8n-nodes-directus

# Or using npm (for self-hosted)
cd ~/.n8n/nodes
npm install n8n-nodes-directus
```

Restart n8n after installation.

### Step 2: Set Up Directus Credentials

1. In n8n, go to **Credentials** → **New**
2. Search for "Directus API"
3. Choose your authentication method:

#### Option A: Static Token (Recommended for agents)
- **URL**: Your Directus instance URL (e.g., `https://your-directus.com`)
- **Static Token**: Your Directus API token

To create a token in Directus:
1. Log into Directus admin panel
2. Go to Settings → Access Tokens
3. Create new token with required permissions
4. Copy the token (you won't see it again!)

#### Option B: OAuth2
- Follow the OAuth2 setup in the main README
- Note: OAuth2 may require user interaction, less suitable for autonomous agents

### Step 3: Install AI Agent Prerequisites

In n8n, ensure you have:

1. **LangChain nodes** (usually pre-installed)
2. **AI model credentials** configured:
   - OpenAI API key, OR
   - Anthropic API key, OR
   - Other LangChain-compatible model

---

## Importing Example Workflows

We provide three ready-to-use example workflows:

### 1. User Onboarding Agent
**File**: `examples/workflows/user-onboarding-agent.json`

Import steps:
1. Download the workflow JSON file
2. In n8n, click **Workflows** → **Import from File**
3. Select `user-onboarding-agent.json`
4. Update credentials (see below)
5. Activate the workflow

### 2. Data Analysis Agent
**File**: `examples/workflows/data-analysis-agent.json`

Import steps:
1. Download the workflow JSON file
2. Import via **Workflows** → **Import from File**
3. Update credentials
4. Configure presets (see [Configuring Presets](#configuring-presets))

### 3. Automation Control Agent
**File**: `examples/workflows/automation-control-agent.json`

Import steps:
1. Download the workflow JSON file
2. Import via **Workflows** → **Import from File**
3. Update credentials
4. Ensure flows exist in Directus

### After Importing

For each imported workflow:

1. Click on each Directus node
2. Select your **Directus API** credential from the dropdown
3. Click on the AI Agent node
4. Select your **OpenAI** (or other AI provider) credential
5. Review and customize the system prompt if needed
6. Save the workflow
7. Activate it

---

## Configuring Directus Credentials

### Setting Up API Token Permissions

Your Directus API token needs appropriate permissions for the tools you're using:

#### For User Management Agent
```
Permissions needed:
- directus_users: Create, Read, Update
- directus_roles: Read
- directus_invitations: Create
- directus_activity: Read
```

#### For Data Analysis Agent
```
Permissions needed:
- directus_presets: Read
- directus_activity: Read
- Your collections: Read (e.g., articles, products)
```

#### For Automation Control Agent
```
Permissions needed:
- directus_flows: Read, Execute
- directus_activity: Read
```

### Testing Credentials

To verify your credentials work:

1. Create a simple workflow with a Directus node
2. Choose operation: **Get Server Info**
3. Execute the node
4. You should see your Directus server information

---

## Setting Up AI Agent Tools

### Understanding Tool Architecture

AI agent tools in n8n work by:

1. **AI Agent node** receives user message
2. **Agent decides** which tool to use based on system prompt
3. **Tool node** executes the Directus operation
4. **Result** is returned to the agent
5. **Agent formulates** a natural language response

### Creating Custom Tools

To create a custom Directus tool:

1. Add a **Tool Workflow** node to your agent
2. Configure the tool schema:

```json
{
  "name": "create_article",
  "description": "Create a new article in Directus",
  "schema": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "Article title"
      },
      "content": {
        "type": "string",
        "description": "Article content"
      },
      "status": {
        "type": "string",
        "enum": ["draft", "published"],
        "description": "Publication status"
      }
    },
    "required": ["title", "content"]
  }
}
```

3. Connect the tool to a **Directus node**
4. Configure the Directus operation (e.g., Create Item)
5. Map tool parameters to Directus fields:
   - Collection: `articles`
   - Title: `={{ $json.title }}`
   - Content: `={{ $json.content }}`
   - Status: `={{ $json.status || 'draft' }}`

### Tool Best Practices

#### Good Tool Descriptions
```
✓ "Create a new user in Directus with email, password, and role"
✓ "Query published articles from the last 7 days"
✓ "Trigger a Directus Flow and return execution status"

✗ "Create user"
✗ "Get articles"
✗ "Run flow"
```

#### Schema Guidelines
- Use descriptive parameter names
- Provide clear descriptions
- Mark required vs optional parameters
- Use enums for limited choices
- Include examples in descriptions

#### Error Handling
Always wrap Directus operations in error handling:

1. Add an **Error Trigger** node after each Directus operation
2. Format error messages to be agent-friendly
3. Include suggestions for common errors

---

## Testing Your Agent

### Interactive Testing

1. Activate your agent workflow
2. Open the **Chat** interface (if using Chat Trigger)
3. Try these test queries:

For **User Onboarding Agent**:
```
"Create a new editor account for test@example.com"
"List all users with the Editor role"
"Send a welcome email to the new user"
```

For **Data Analysis Agent**:
```
"Show me published articles from last week"
"Which users have been most active?"
"Aggregate activity by collection"
```

For **Automation Control Agent**:
```
"Trigger the daily report flow"
"Check the status of execution xyz123"
"Show me failed flow executions from today"
```

### Debugging Tips

#### Agent Not Using Tools
- Check that tools are connected to the agent node
- Verify tool descriptions are clear and relevant
- Review system prompt - does it mention the tools?

#### Tool Execution Failing
- Check Directus credentials are correct
- Verify API token permissions
- Test the Directus operation independently
- Check parameter mapping (e.g., `{{ $json.field }}`)

#### Agent Giving Wrong Answers
- Review and refine system prompt
- Add more specific instructions
- Include examples in the prompt
- Check tool response formatting

---

## Customization

### Customizing System Prompts

Edit the system prompt in the AI Agent node to:

1. **Add Domain Knowledge**:
```
Your Directus instance manages:
- Articles: Blog posts and news
- Products: E-commerce catalog
- Users: Customer accounts
```

2. **Set Boundaries**:
```
You can:
- Create and update content
- Query data and generate reports

You cannot:
- Delete users
- Modify system settings
```

3. **Include Company-Specific Terms**:
```
Roles in our organization:
- Content Manager (can edit all content)
- Writer (can create drafts only)
- Reviewer (can publish content)
```

### Adding New Tools

To extend your agent with custom Directus operations:

1. Identify the Directus operation needed
2. Create a tool schema that matches your use case
3. Connect to appropriate Directus node
4. Update agent system prompt to mention the new tool
5. Test thoroughly

Example: Adding a "Publish Article" tool

```json
{
  "name": "publish_article",
  "description": "Publish a draft article by ID",
  "schema": {
    "type": "object",
    "properties": {
      "article_id": {
        "type": "string",
        "description": "The ID of the article to publish"
      }
    },
    "required": ["article_id"]
  }
}
```

Connected to:
- Directus node: Update Item
- Collection: `articles`
- ID: `={{ $json.article_id }}`
- Fields: `{ "status": "published" }`

### Configuring Presets

For the Data Analysis Agent, configure Directus presets:

1. In Directus admin, go to the collection (e.g., Articles)
2. Apply filters you want to save
3. Click **Save Preset**
4. Give it a descriptive name (e.g., "Published Articles")
5. Choose role or user assignment
6. Update agent prompt to mention available presets

---

## Troubleshooting

### Common Issues

#### "Permission denied" errors
**Problem**: API token lacks required permissions

**Solution**:
1. Check token permissions in Directus
2. Ensure role has access to collections
3. Verify system fields access if needed

#### "Flow not found" errors
**Problem**: Flow name or ID incorrect

**Solution**:
1. Verify flow exists in Directus
2. Use exact flow name or UUID
3. Check flow is active
4. Ensure flow has webhook trigger

#### Agent not responding
**Problem**: Chat trigger not properly configured

**Solution**:
1. Check workflow is activated
2. Verify AI model credentials valid
3. Check n8n logs for errors
4. Test AI provider separately

#### Tool calls failing
**Problem**: Schema mismatch or parameter errors

**Solution**:
1. Validate JSON schema syntax
2. Check required vs optional fields
3. Test Directus operation directly
4. Review parameter mapping expressions

### Getting Help

If you encounter issues:

1. **Check the logs**: n8n execution logs often show the exact error
2. **Test components separately**: Verify Directus node works without agent
3. **Review examples**: Compare with provided example workflows
4. **Check documentation**: Refer to [Directus API docs](https://docs.directus.io)
5. **Community support**: Ask in [n8n community](https://community.n8n.io)
6. **GitHub issues**: Report bugs at [project repository](https://github.com/arladmin/n8n-nodes-directus/issues)

---

## Next Steps

Once your agent is running:

1. **Monitor usage**: Check Directus activity logs
2. **Gather feedback**: Ask users about agent performance
3. **Iterate on prompts**: Refine based on real usage
4. **Add capabilities**: Extend with more tools as needed
5. **Implement safeguards**: Add approval steps for critical operations
6. **Document custom tools**: Help future maintainers

---

## Additional Resources

- [Example Workflows](../examples/workflows/)
- [System Prompt Templates](../examples/prompts/system-prompts.md)
- [Example Conversations](../examples/conversations.md)
- [API Reference](./API_REFERENCE.md)
- [Directus Documentation](https://docs.directus.io)
- [n8n LangChain Nodes](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.ai/)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)

---

## Support

For questions or issues with the AI agent setup:

- **Documentation**: Check this guide and other docs in `/docs`
- **Examples**: Review example workflows in `/examples`
- **Issues**: Report problems on GitHub
- **Community**: Join n8n community forums

Happy automating with AI! 🤖
