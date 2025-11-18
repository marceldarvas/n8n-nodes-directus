# Example Conversations with Directus AI Agents

This document showcases example interactions with different types of Directus AI agents to demonstrate their capabilities and proper usage.

## Table of Contents

- [User Onboarding Agent](#user-onboarding-agent)
- [Data Analysis Agent](#data-analysis-agent)
- [Automation Control Agent](#automation-control-agent)
- [Content Management Agent](#content-management-agent)
- [Troubleshooting Examples](#troubleshooting-examples)

---

## User Onboarding Agent

### Example 1: Creating a New Editor Account

```
User: Create a new editor account for sarah@company.com

Agent: I'll create an Editor account for sarah@company.com.
       What password should I set for this account?

User: Use TempPass2024! and send her a welcome email

Agent: [Calls create_directus_user tool]
       ✓ User created successfully

       User Details:
       - Email: sarah@company.com
       - Role: Editor
       - User ID: f9a3c7e8-1234-5678-abcd-ef0123456789
       - Status: Active

       [Calls trigger_directus_flow with "Send Welcome Email" flow]
       ✓ Welcome email flow triggered
       - Execution ID: abc123xyz
       - Status: Completed

       Sarah's account is ready! She should receive the welcome
       email shortly. The password is TempPass2024! (I recommend
       asking her to change it on first login).
```

### Example 2: Bulk User Creation

```
User: I need to create 5 new viewer accounts for our interns

Agent: I'd be happy to help create 5 Viewer accounts. Could you
       provide the email addresses for the interns?

User: intern1@company.com, intern2@company.com, intern3@company.com,
      intern4@company.com, intern5@company.com

Agent: Thanks! I'll create all 5 accounts with the Viewer role.
       Should I:
       1. Generate temporary passwords for them?
       2. Send invitation emails instead?

User: Send invitation emails

Agent: [Calls create_directus_user tool for each email with invite mode]

       ✓ All 5 intern accounts created successfully:

       1. intern1@company.com - Invitation sent
       2. intern2@company.com - Invitation sent
       3. intern3@company.com - Invitation sent
       4. intern4@company.com - Invitation sent
       5. intern5@company.com - Invitation sent

       The interns will receive invitation emails with links to
       set their own passwords. The invitations expire in 7 days.
```

### Example 3: Checking User Activity

```
User: Has the new user sarah@company.com logged in yet?

Agent: [Calls query_directus_activity tool]

       Let me check Sarah's activity...

       ✓ Yes, sarah@company.com has logged in!

       Activity Summary:
       - First login: 2 hours ago (14:32 UTC)
       - Total logins: 2
       - Last action: Viewed articles collection (14:45 UTC)
       - Status: Currently active

       She's gotten started and is already exploring the articles.
       Everything looks good!
```

---

## Data Analysis Agent

### Example 1: Querying Published Articles

```
User: Show me recently published articles

Agent: I'll query the published articles using our preset.
       How recent would you like - last 7 days, 30 days, or all time?

User: Last 7 days

Agent: [Calls query_with_preset tool with "Published Articles" preset
       and additional date filter]

       Found 15 published articles in the last 7 days:

       Top Articles by Views:
       1. "Introduction to Directus" - 125 views (Published 2 days ago)
       2. "Advanced Workflows" - 98 views (Published 5 days ago)
       3. "API Best Practices" - 87 views (Published 3 days ago)
       4. "Security Guide" - 76 views (Published 1 day ago)
       5. "Getting Started" - 65 views (Published 6 days ago)

       ... and 10 more articles.

       Summary:
       - Total views: 847
       - Average views per article: 56
       - Most active day: Wednesday (6 articles)

       Would you like me to export this data or filter it further?
```

### Example 2: Analyzing User Activity

```
User: Which users have been most active this week?

Agent: [Calls aggregate_activity tool grouped by user]

       Here are the top 10 most active users this week:

       1. john@company.com (Administrator)
          - 247 actions
          - Top actions: 89 updates, 76 creates, 52 views
          - Collections: articles (145), media (67), users (35)

       2. sarah@company.com (Editor)
          - 189 actions
          - Top actions: 95 updates, 62 creates, 32 views
          - Collections: articles (156), media (33)

       3. mike@company.com (Editor)
          - 134 actions
          - Top actions: 78 creates, 45 updates, 11 deletes
          - Collections: articles (99), categories (35)

       ... and 7 more users.

       Insights:
       - John is unusually active - possibly doing bulk operations?
       - Sarah is very focused on articles - good productivity!
       - Mike has some deletes - worth reviewing?
```

### Example 3: Comparing Time Periods

```
User: How does this month compare to last month?

Agent: [Calls query_directus_activity with two date ranges]

       Here's the comparison:

       This Month (Nov):
       - Total actions: 2,847
       - Unique users: 23
       - New content: 156 items
       - Updates: 891
       - Deletions: 12

       Last Month (Oct):
       - Total actions: 2,134
       - Unique users: 21
       - New content: 128 items
       - Updates: 723
       - Deletions: 8

       Changes:
       - ↑ Activity up 33% (713 more actions)
       - ↑ 2 more active users
       - ↑ Content creation up 22%
       - ↑ Updates up 23%
       - ⚠️ Deletions up 50% (but still low numbers)

       Overall trend: Healthy growth in activity and content creation!
```

---

## Automation Control Agent

### Example 1: Triggering a Report

```
User: Trigger the daily report flow

Agent: [Calls trigger_directus_flow with "Daily Report" flow]

       ✓ Daily report flow triggered successfully

       Execution Details:
       - Flow: Daily Report
       - Execution ID: xyz789
       - Mode: Asynchronous
       - Status: Running

       The flow is currently executing. Would you like me to wait
       for completion and show the results?

User: Yes, wait for it

Agent: [Monitors execution status...]

       Waiting for flow to complete... (checking every 2 seconds)

       [After 3.2 seconds]
       ✓ Flow completed successfully!

       Results:
       - Execution time: 3.2 seconds
       - Records processed: 150
       - Report generated: daily_report_2025-01-15.pdf
       - Email sent to: admin@company.com

       The daily report has been generated and emailed. You can find
       it in the reports collection.
```

### Example 2: Investigating a Failed Flow

```
User: The welcome email flow failed for sarah@company.com. Can you check why?

Agent: Let me investigate that failure...

       [Calls list_flow_executions for "Send Welcome Email" flow]
       [Calls get_flow_logs for the failed execution]

       Found the failed execution. Here's what happened:

       Execution Details:
       - Execution ID: abc123fail
       - Timestamp: 2025-01-15 10:32:15 UTC
       - Duration: 2.1 seconds
       - Status: Failed

       Error Analysis:
       - Error: SMTP connection timeout
       - Step failed: "Send Email" operation
       - Error message: "Could not connect to SMTP server at smtp.company.com:587"

       Likely Cause:
       The email server appears to be unreachable. This could be:
       1. Temporary network issue
       2. SMTP server down
       3. Firewall blocking connection

       Recommendation:
       Let me retry the flow. [Calls trigger_directus_flow]

       ✓ Retry successful!
       - New execution ID: abc124success
       - Status: Completed
       - Email sent successfully

       The email has now been sent to Sarah. The initial failure was
       likely a temporary network issue.
```

### Example 3: Flow Performance Analysis

```
User: How has the data sync flow been performing?

Agent: [Calls analyze_flow_performance for "Sync External Data" flow]

       Performance analysis for "Sync External Data" (last 7 days):

       Execution Summary:
       - Total executions: 168 (24 per day)
       - Successful: 164 (97.6%)
       - Failed: 4 (2.4%)
       - Average duration: 4.2 seconds
       - Fastest: 2.1 seconds
       - Slowest: 12.8 seconds

       Trend Analysis:
       - Success rate improving (was 95% last week)
       - Duration stable (avg was 4.3s last week)
       - No concerning patterns

       Failed Executions:
       1. Jan 12, 03:00 - API rate limit exceeded
       2. Jan 13, 15:30 - Network timeout
       3. Jan 14, 09:15 - API rate limit exceeded
       4. Jan 15, 18:00 - Invalid API response

       Recommendations:
       - Consider adding retry logic for rate limits
       - Monitor the 3:00 AM execution - API might be doing maintenance
       - Overall performance is good!
```

---

## Content Management Agent

### Example 1: Publishing Multiple Articles

```
User: Publish all articles in review status

Agent: Let me check how many articles are in review status...

       [Calls query with filter for status = "in_review"]

       Found 8 articles in review status:

       1. "Q4 Financial Results" by john@company.com
       2. "New Product Launch" by sarah@company.com
       3. "Team Expansion" by mike@company.com
       4. "Office Relocation" by jane@company.com
       5. "Partnership Announcement" by john@company.com
       6. "Sustainability Report" by sarah@company.com
       7. "Customer Success Story" by mike@company.com
       8. "Industry Trends 2025" by jane@company.com

       Should I publish all 8 articles immediately, or would you
       like to review them first?

User: Publish all 8

Agent: [Calls bulk_update to set status = "published" for all 8 articles]

       ✓ Successfully published 8 articles!

       Published:
       - "Q4 Financial Results" → live
       - "New Product Launch" → live
       - "Team Expansion" → live
       - "Office Relocation" → live
       - "Partnership Announcement" → live
       - "Sustainability Report" → live
       - "Customer Success Story" → live
       - "Industry Trends 2025" → live

       All articles are now visible to the public. Publication
       notifications have been triggered.
```

### Example 2: Finding Related Content

```
User: Find articles related to "API security"

Agent: [Calls search with filters for title and content containing "API security"]

       Found 12 articles related to "API security":

       Most Relevant:
       1. "API Security Best Practices" (Published, 234 views)
          - Tags: security, api, development
          - Author: john@company.com
          - Last updated: 2 weeks ago

       2. "Securing Your REST APIs" (Published, 189 views)
          - Tags: security, api, rest
          - Author: sarah@company.com
          - Last updated: 1 month ago

       3. "OAuth2 Implementation Guide" (Published, 156 views)
          - Tags: security, oauth, authentication
          - Author: mike@company.com
          - Last updated: 3 weeks ago

       Related Topics:
       - Authentication (8 articles)
       - Authorization (6 articles)
       - Rate Limiting (4 articles)

       Would you like me to show more results or filter by a
       specific aspect of API security?
```

---

## Troubleshooting Examples

### Example 1: Permission Error

```
User: Create a user with email test@example.com

Agent: [Attempts to call create_directus_user tool]

       ❌ Error: Permission denied

       I don't have permission to create users. This could be because:

       1. The API token I'm using doesn't have user creation permissions
       2. Your role doesn't allow user management
       3. There's a role-based access control policy blocking this

       What you can do:
       - Check that my credentials have "Create" permission for the Users collection
       - Verify your role has administrative privileges
       - Contact your Directus administrator to grant the necessary permissions

       Would you like me to try a different operation or help you
       troubleshoot the permissions?
```

### Example 2: Not Found Error

```
User: Trigger the "Monthly Report" flow

Agent: [Calls trigger_directus_flow with "Monthly Report"]

       ❌ Error: Flow not found

       I couldn't find a flow named "Monthly Report".

       Let me check what flows are available...
       [Calls list_flows]

       Available flows:
       1. Send Welcome Email
       2. Daily Report
       3. Weekly Digest
       4. Data Sync
       5. Process Upload

       Did you mean:
       - "Daily Report" (runs daily reports)?
       - "Weekly Digest" (might include monthly option)?

       Or would you like me to help you create a new "Monthly Report" flow?
```

### Example 3: Rate Limiting

```
User: Query all activity logs from the last year

Agent: [Attempts to query large dataset]

       ⚠️ Warning: This query would return ~50,000 records

       To avoid performance issues and rate limiting, I recommend:

       1. Filter by specific months or quarters
       2. Aggregate the data instead of getting raw records
       3. Export to file for offline analysis

       Which would you prefer?

User: Aggregate by month

Agent: [Calls aggregate_activity grouped by month]

       ✓ Activity aggregated by month (last 12 months):

       Month       Actions    Users    Collections
       --------    -------    -----    -----------
       Jan 2025      2,847       23          12
       Dec 2024      2,634       22          11
       Nov 2024      2,456       21          10
       Oct 2024      2,289       20          10
       ...

       This is much more manageable! Would you like me to:
       - Drill down into a specific month?
       - Show trend analysis?
       - Export this summary?
```

---

## Tips for Effective Conversations

### Be Specific
```
❌ "Get some articles"
✓ "Show me the 10 most recent published articles"
```

### Provide Context
```
❌ "Check the logs"
✓ "Check the logs for the failed email flow execution from this morning"
```

### Confirm Destructive Actions
```
User: Delete all draft articles
Agent: ⚠️ This will permanently delete 45 draft articles.
       Are you sure you want to continue?
```

### Ask for Clarification
```
User: Update the user
Agent: I found 234 users. Which user would you like to update?
       Please provide an email address or user ID.
```

---

## Best Practices for Users

1. **Start Simple**: Begin with basic queries before complex operations
2. **Verify Results**: Always check the output before proceeding
3. **Use Filters**: Narrow down results with specific criteria
4. **Ask Questions**: The agent can explain what it's doing
5. **Provide Feedback**: Let the agent know if results aren't what you expected

---

## Best Practices for Agent Developers

1. **Provide Clear Feedback**: Always confirm what action was taken
2. **Include IDs**: Return execution IDs, user IDs, etc. for tracking
3. **Suggest Next Steps**: Guide users on what they can do next
4. **Handle Errors Gracefully**: Explain errors in plain language
5. **Confirm Destructive Actions**: Always ask before deleting or major changes
