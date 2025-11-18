# Video Tutorial Script: Setting Up Directus AI Agents in n8n

**Duration**: ~15 minutes
**Target Audience**: n8n users familiar with basic workflows
**Prerequisites**: n8n instance, Directus instance, OpenAI API key

---

## Video Outline

1. **Introduction** (1 min)
2. **Installing n8n-nodes-directus** (2 min)
3. **Setting Up Credentials** (2 min)
4. **Importing Example Workflow** (2 min)
5. **Configuring the AI Agent** (3 min)
6. **Testing the Agent** (3 min)
7. **Customization Tips** (2 min)
8. **Wrap-up** (1 min)

---

## Script

### 1. Introduction (1 min)

**[SCREEN: Title slide with n8n and Directus logos]**

**Narrator**:
> "Welcome! In this tutorial, we'll show you how to set up AI agents in n8n that can interact with your Directus CMS. By the end of this video, you'll have a working AI agent that can create users, trigger workflows, and query data - all through natural language conversation."

**[SCREEN: Quick demo of agent in action]**

**Narrator**:
> "Here's what we'll build: an AI agent that can respond to requests like 'Create a new editor account for sarah@company.com' and automatically handle user creation and welcome email automation. Let's get started!"

---

### 2. Installing n8n-nodes-directus (2 min)

**[SCREEN: n8n interface, Settings menu]**

**Narrator**:
> "First, we need to install the n8n-nodes-directus community package. In your n8n instance, click on 'Settings' in the left sidebar."

**[ACTION: Click Settings]**

**Narrator**:
> "Now, navigate to 'Community Nodes'."

**[ACTION: Click Community Nodes]**

**[SCREEN: Community Nodes page with Install button]**

**Narrator**:
> "Click the 'Install' button and enter 'n8n-nodes-directus' in the package name field."

**[ACTION: Type package name, click Install]**

**Narrator**:
> "The installation will take about 30 seconds. Once it's complete, you'll see a success message. You may need to restart n8n if prompted."

**[SCREEN: Success notification]**

**Narrator**:
> "Great! The Directus nodes are now available in your n8n instance."

---

### 3. Setting Up Credentials (2 min)

**[SCREEN: Switch to Directus admin panel]**

**Narrator**:
> "Before we can use the Directus nodes, we need to create an API token. In your Directus admin panel, go to Settings, then Access Tokens."

**[ACTION: Navigate to Settings → Access Tokens]**

**Narrator**:
> "Click 'Create New Token', give it a descriptive name like 'n8n AI Agent', and make sure it has the permissions needed for user management and flow operations."

**[ACTION: Create token, show permissions panel]**

**[IMPORTANT: Highlight/blur the token]**

**Narrator**:
> "Copy the token - you won't be able to see it again! Keep this secure."

**[SCREEN: Return to n8n, Credentials menu]**

**Narrator**:
> "Back in n8n, go to 'Credentials' and click 'Create New'. Search for 'Directus API' and select it."

**[ACTION: Search and select Directus API credential]**

**[SCREEN: Credential configuration form]**

**Narrator**:
> "Enter your Directus instance URL - that's the full URL including https - and paste the API token we just created."

**[ACTION: Fill in URL and token fields]**

**Narrator**:
> "Click 'Save' and you're all set! Your n8n instance can now communicate with Directus."

---

### 4. Importing Example Workflow (2 min)

**[SCREEN: GitHub repository page with example workflows]**

**Narrator**:
> "To get started quickly, we'll import a pre-built example workflow. Head to the n8n-nodes-directus GitHub repository and navigate to the 'examples/workflows' folder."

**[ACTION: Show folder with three workflow JSON files]**

**Narrator**:
> "We'll use the 'user-onboarding-agent.json' workflow. Download this file to your computer."

**[ACTION: Click download]**

**[SCREEN: Back to n8n, Workflows page]**

**Narrator**:
> "In n8n, click on 'Workflows', then 'Import from File'."

**[ACTION: Click Import from File button]**

**[SCREEN: File upload dialog]**

**Narrator**:
> "Select the 'user-onboarding-agent.json' file you just downloaded."

**[ACTION: Select file, click Open]**

**[SCREEN: Imported workflow appears]**

**Narrator**:
> "Perfect! The workflow is now imported. You can see it includes a chat trigger, an AI agent node, and several Directus tool nodes."

**[ACTION: Pan across the workflow]**

---

### 5. Configuring the AI Agent (3 min)

**[SCREEN: Workflow canvas with imported workflow]**

**Narrator**:
> "Now we need to configure the credentials for each node. First, let's click on one of the Directus nodes."

**[ACTION: Click a Directus node]**

**[SCREEN: Node configuration panel]**

**Narrator**:
> "In the 'Credential to connect with' dropdown, select the Directus API credential we created earlier."

**[ACTION: Select credential from dropdown]**

**Narrator**:
> "We need to do this for each Directus node in the workflow. I'll do this quickly..."

**[ACTION: Fast-forward montage of clicking each Directus node and selecting credential]**

**[SCREEN: AI Agent node selected]**

**Narrator**:
> "Now, let's configure the AI Agent node. This is where the magic happens. Click on the 'AI Agent' node."

**[ACTION: Click AI Agent node]**

**[SCREEN: AI Agent configuration]**

**Narrator**:
> "First, you'll need to select or create an OpenAI credential. If you haven't already, click 'Create New' and enter your OpenAI API key."

**[ACTION: Show credential selection/creation]**

**Narrator**:
> "Next, let's look at the system message. This tells the agent what it can do and how to behave."

**[ACTION: Scroll through system prompt]**

**Narrator**:
> "The system prompt is already configured with instructions for user onboarding. It tells the agent about available roles, password requirements, and to trigger welcome emails after creating users. You can customize this for your specific needs."

**[SCREEN: Scroll to tools section]**

**Narrator**:
> "Below, you can see the tools connected to this agent: create user, trigger flow, and query activity. These are what the agent can actually do in Directus."

**[ACTION: Highlight connected tools]**

**Narrator**:
> "Everything looks good! Let's save the workflow."

**[ACTION: Click Save button]**

---

### 6. Testing the Agent (3 min)

**[SCREEN: Workflow canvas]**

**Narrator**:
> "Time to test our agent! First, we need to activate the workflow."

**[ACTION: Toggle workflow to Active]**

**Narrator**:
> "Now, click on the 'When chat message received' node and then click 'Test workflow'."

**[ACTION: Click test button]**

**[SCREEN: Chat interface appears]**

**Narrator**:
> "The chat interface is now open. Let's try a simple request: 'Create a new editor account for sarah@example.com'"

**[ACTION: Type message and send]**

**[SCREEN: Show agent thinking, then response]**

**Narrator**:
> "The agent is processing... and it's asking for a password! That's exactly what we want - it's following the instructions in the system prompt."

**[ACTION: Type "Use TempPass2024!"]**

**[SCREEN: Agent executes tools]**

**Narrator**:
> "Watch the workflow execution panel on the right. You can see the agent is calling the 'create_directus_user' tool, which triggers the Directus node."

**[ACTION: Highlight execution flow]**

**[SCREEN: Success response from agent]**

**Narrator**:
> "Excellent! The agent successfully created the user and even provided the user ID. Let's verify this in Directus."

**[SCREEN: Switch to Directus admin panel]**

**[ACTION: Navigate to Users collection]**

**Narrator**:
> "And there she is! Sarah's account was created with the Editor role, exactly as requested."

**[SCREEN: Back to n8n chat]**

**Narrator**:
> "Let's try another command: 'Trigger the Send Welcome Email flow for sarah@example.com'"

**[ACTION: Send message]**

**[SCREEN: Agent response]**

**Narrator**:
> "Perfect! The agent triggered the flow and provided an execution ID. This is really powerful - we're controlling our entire Directus system through natural language!"

---

### 7. Customization Tips (2 min)

**[SCREEN: Split screen - workflow and code editor]**

**Narrator**:
> "Now that you have a working agent, let's talk about customization. You can easily adapt this to your needs."

**[SCREEN: System prompt editor]**

**Narrator**:
> "First, customize the system prompt to match your organization. Update the role names to match your Directus setup, add company-specific guidelines, or change the agent's personality."

**[ACTION: Highlight editable sections]**

**[SCREEN: Show new tool node being added]**

**Narrator**:
> "You can also add new tools. For example, let's say you want the agent to be able to publish articles. You'd create a new Tool Workflow node with a description like 'Publish an article by changing its status to published'."

**[ACTION: Show adding node and connecting it]**

**Narrator**:
> "Connect it to a Directus node configured to update an article's status, mention the new capability in the system prompt, and you're done!"

**[SCREEN: Examples folder]**

**Narrator**:
> "We also have two other example workflows - one for data analysis and one for automation control. You can import these the same way and customize them for your use case."

---

### 8. Wrap-up (1 min)

**[SCREEN: Return to working agent interface]**

**Narrator**:
> "And that's it! You now have a fully functional AI agent that can interact with your Directus CMS through natural language."

**[SCREEN: Montage of different agent interactions]**

**Narrator**:
> "This agent can create users, trigger workflows, query data, and much more. And because it's all in n8n, you can extend it with any of n8n's 400+ integrations."

**[SCREEN: Resources slide]**

**Narrator**:
> "For more information, check out the documentation in the GitHub repository. You'll find more example workflows, system prompt templates, and detailed setup guides."

**[SCREEN: Call to action slide]**

**Narrator**:
> "If you found this helpful, please star the repository on GitHub and share your own agent creations with the community. Happy automating!"

**[SCREEN: End card with links]**

---

## B-Roll Suggestions

Throughout the video, intersperse:
- Close-ups of code/configuration
- Wide shots of the full workflow
- Quick cuts of execution logs
- Success notifications and checkmarks
- Directus admin panel showing created data

---

## On-Screen Text/Annotations

Add helpful annotations:
- **Arrows** pointing to important UI elements
- **Highlights** around credentials and API keys (with blur)
- **Tooltips** explaining technical terms
- **Timestamps** for different sections
- **Links** to documentation in description

---

## Video Editing Notes

### Pacing
- Keep it moving - no dead air
- Speed up repetitive tasks (e.g., configuring multiple nodes)
- Pause briefly after important points

### Music
- Light, upbeat background music
- Lower volume during explanations
- Fade out during code/configuration sections

### Transitions
- Simple cuts between sections
- Use subtle zoom effects for emphasis
- Highlight cursor for important clicks

---

## Video Description Template

```
🤖 Learn how to set up AI agents in n8n that can control your Directus CMS!

In this tutorial, you'll learn:
✅ Installing n8n-nodes-directus
✅ Setting up Directus API credentials
✅ Importing pre-built agent workflows
✅ Configuring AI agents with OpenAI
✅ Testing your agent with real requests
✅ Customizing agents for your needs

🔗 Resources:
- GitHub Repository: [link]
- Documentation: [link]
- Example Workflows: [link]
- System Prompt Templates: [link]

⏱️ Timestamps:
0:00 Introduction
1:00 Installing n8n-nodes-directus
3:00 Setting Up Credentials
5:00 Importing Example Workflow
7:00 Configuring the AI Agent
10:00 Testing the Agent
13:00 Customization Tips
15:00 Wrap-up

💬 Questions? Drop them in the comments!
⭐ Star the repo if you find this useful!

#n8n #Directus #AI #Automation #NoCode
```

---

## Alternative Cuts

Consider creating shorter versions:

### **Quick Start (5 min)**
- Skip detailed explanations
- Focus on import and configure
- Perfect for experienced users

### **Deep Dive (30 min)**
- Detailed explanation of each tool
- Advanced customization examples
- Troubleshooting common issues
- Building custom tools from scratch

### **Use Case Focused (10 min each)**
- User Onboarding Agent walkthrough
- Data Analysis Agent walkthrough
- Automation Control Agent walkthrough

---

## Accessibility

### Captions
- Include full transcript as closed captions
- Highlight technical terms
- Spell out URLs and package names

### Audio
- Clear narration, moderate pace
- Describe visual actions
- Mention what's being clicked/typed

---

## Post-Production Checklist

- [ ] All credentials blurred/redacted
- [ ] Captions synced correctly
- [ ] Links in description work
- [ ] Timestamps accurate
- [ ] Music levels appropriate
- [ ] No dead air or awkward pauses
- [ ] Branding consistent
- [ ] End card with next videos
- [ ] Thumbnail eye-catching
- [ ] Title SEO-optimized

---

## Thumbnail Ideas

**Option 1**: Split screen
- Left: n8n workflow
- Right: Chat interface with agent response
- Text overlay: "AI Agents + Directus"

**Option 2**: Before/After
- Before: Manual Directus admin panel
- After: Chat with AI agent
- Text overlay: "Automate Directus with AI"

**Option 3**: Feature highlight
- Large chat bubble with example request
- n8n and Directus logos
- Text overlay: "Build Smart CMS Agents"

---

## Follow-up Content Ideas

After this video, consider creating:

1. **Advanced Agent Customization** - Deep dive into system prompts
2. **Multi-Agent Systems** - Connecting multiple specialized agents
3. **Production Deployment** - Scaling and monitoring agents
4. **Real-World Use Cases** - Customer success stories
5. **Building Custom Tools** - Creating Directus tools from scratch

---

Good luck with your video production! 🎥
