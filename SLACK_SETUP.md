# Slack Integration Setup Guide

## Overview
TaskForge includes comprehensive Slack integration for real-time issue notifications. Get instant alerts in Slack for:

- 🆕 New issues created
- 👤 Issues assigned
- 🔄 Status changes
- 💬 New comments
- 🚨 **Overdue issues** (bulk notification with all details)

## Quick Setup (Webhook - Recommended for Beginners)

### Step 1: Create a Slack Webhook
1. Go to https://api.slack.com/messaging/webhooks
2. Click **"Create your Slack app"**
3. Choose **"From scratch"**
4. Enter app name: `TaskForge` and select your workspace
5. Click **"Incoming Webhooks"** in the left sidebar
6. Toggle **"Activate Incoming Webhooks"** to ON
7. Click **"Add New Webhook to Workspace"**
8. Select the channel where you want notifications (e.g., `#issue-tracker`)
9. Click **"Allow"**
10. Copy the webhook URL (looks like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`)

### Step 2: Configure TaskForge
Add to your `.env` file:
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
SLACK_DEFAULT_CHANNEL=#issue-tracker
```

### Step 3: Restart Server
```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

That's it! 🎉 You'll now receive Slack notifications for all issue events.

---

## Advanced Setup (Bot Token - For More Features)

If you need more control (like updating messages, thread replies, etc.), use a Bot Token instead.

### Step 1: Create a Slack App
1. Go to https://api.slack.com/apps
2. Click **"Create New App"** → **"From scratch"**
3. App Name: `TaskForge`
4. Select your workspace → Click **"Create App"**

### Step 2: Configure Bot Token Scopes
1. In the left sidebar, click **"OAuth & Permissions"**
2. Scroll to **"Scopes"** → **"Bot Token Scopes"**
3. Add these scopes:
   - `chat:write` - Send messages
   - `chat:write.public` - Send to public channels without joining
   - `links:write` - Unfurl links

### Step 3: Install App to Workspace
1. Scroll up to **"OAuth Tokens for Your Workspace"**
2. Click **"Install to Workspace"**
3. Review permissions → Click **"Allow"**
4. Copy the **"Bot User OAuth Token"** (starts with `xoxb-`)

### Step 4: Invite Bot to Channel
1. In Slack, go to your notifications channel (e.g., `#issue-tracker`)
2. Type: `/invite @TaskForge`
3. This allows the bot to post messages

### Step 5: Configure TaskForge
Add to your `.env` file:
```env
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_DEFAULT_CHANNEL=#issue-tracker
```

### Step 6: Restart Server
```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

---

## Notification Types

### 1. Issue Created
```
🆕 New Issue Created
Jane Doe created a new issue

Issue: Fix login bug
Project: TaskForge
Status: 🟢 Open
Priority: 🟥 Critical

[View Issue] [Assign to Me]
```

### 2. Issue Assigned
```
👤 Issue Assigned
John Smith assigned this issue

Issue: Implement dark mode
Project: TaskForge
Status: 🟡 In Progress
Priority: 🟨 Medium

[View Issue] [Assign to Me]
```

### 3. Status Changed
```
🔄 Status Changed
Jane Doe changed status from Open to In Progress

Issue: Add search feature
Project: TaskForge
Status: 🟡 In Progress
Priority: 🟧 High

[View Issue] [Assign to Me]
```

### 4. Comment Added
```
💬 New Comment
John Smith commented on this issue

> "I think we should consider using Elasticsearch for..."

Issue: Add search feature
Project: TaskForge
Status: 🟡 In Progress
Priority: 🟧 High

[View Issue] [Assign to Me]
```

### 5. Overdue Issues (Bulk Notification)
```
🚨 5 Overdue Issues
Attention Required: The following issues have passed their due date and need immediate attention.

─────────────────────────
🔴 Critical Priority Issues:

Fix production database connection
🟥 Critical • 🟡 In Progress • TaskForge
⚠️ 3 days overdue • Assigned to John Smith
[View Issue]

─────────────────────────
🟠 High Priority Issues:

Implement user authentication
🟧 High • 🟢 Open • TaskForge
⚠️ 2 days overdue • Unassigned
[View Issue]

Add payment integration
🟧 High • 🟡 In Progress • TaskForge
⚠️ 1 day overdue • Assigned to Jane Doe
[View Issue]

─────────────────────────
💡 Please review these issues and update their status or due dates accordingly.
```

---

## Testing Slack Integration

### 1. Test Issue Creation
1. Go to http://localhost:3000/issues/new
2. Create a new issue
3. Check your Slack channel for the notification

### 2. Test Overdue Notifications
1. Make sure you have issues with past due dates (use the test script)
2. Go to Admin Panel → http://localhost:3000/admin
3. Click **"Send Notifications to Assignees"**
4. Check your Slack channel for the overdue issues notification

### 3. Check Logs
If notifications aren't appearing:
```bash
# Check server console for logs
# You should see:
✅ Slack notification sent for overdue issues
# or
⚠️ Slack not configured, skipping notification
```

---

## Troubleshooting

### "Slack not configured" Warning
**Problem**: Server logs show "Slack integration is not configured"

**Solution**:
- Verify you've added `SLACK_WEBHOOK_URL` or `SLACK_BOT_TOKEN` to `.env`
- Restart the dev server after editing `.env`

### Webhook Returns "invalid_payload"
**Problem**: Webhook URL works but returns error

**Solution**:
- Make sure the webhook URL is complete and correct
- Check that the channel still exists
- Regenerate the webhook if it was deleted

### Bot Can't Post Messages
**Problem**: Using bot token but no messages appear

**Solution**:
- Verify the bot has `chat:write` permission
- Invite the bot to your channel: `/invite @TaskForge`
- Check the channel name in `.env` matches Slack (include `#`)

### Messages Not Formatted Correctly
**Problem**: Messages appear as plain text instead of rich blocks

**Solution**:
- This is expected for webhook URLs in some cases
- Buttons and formatting work best with bot tokens
- Messages are still readable, just less pretty

---

## Channel Configuration

### Send to Different Channels
You can send notifications to different channels:

```env
# Default channel for all notifications
SLACK_DEFAULT_CHANNEL=#issue-tracker

# Or change it per environment
SLACK_DEFAULT_CHANNEL=#dev-issues  # for development
SLACK_DEFAULT_CHANNEL=#prod-issues # for production
```

### Multiple Channels (Future Enhancement)
Currently, all notifications go to one channel. To send to multiple channels:
1. Create multiple webhooks (one per channel)
2. Modify `src/lib/notifications/slack.ts` to post to multiple webhooks

---

## Security Best Practices

### 1. Never Commit Tokens
```bash
# .env is already in .gitignore
# Never add tokens to version control
```

### 2. Use Environment Variables in Production
```bash
# On your server/hosting platform
export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
export SLACK_BOT_TOKEN=xoxb-...
```

### 3. Rotate Tokens Regularly
- Regenerate webhooks every 6-12 months
- Regenerate bot tokens if exposed
- Update `.env` and restart server

### 4. Limit Bot Permissions
- Only grant required OAuth scopes
- Don't give admin permissions
- Review permissions quarterly

---

## Advanced Features

### Customize Notification Format
Edit `src/services/slack.service.ts` → `buildOverdueNotification()`

### Add More Notification Types
Edit `src/lib/notifications/slack.ts` and add new functions like:
```typescript
export async function notifyIssueDueSoon(issue: Issue) {
  // Send reminder 1 day before due date
}
```

### Automated Daily Overdue Checks
Set up a cron job to automatically check for overdue issues daily:

See `EMAIL_SETUP.md` for cron job setup instructions.

---

## Comparison: Webhook vs Bot Token

| Feature | Webhook | Bot Token |
|---------|---------|-----------|
| **Setup Difficulty** | ⭐ Easy | ⭐⭐ Moderate |
| **Send Messages** | ✅ Yes | ✅ Yes |
| **Rich Formatting** | ✅ Yes | ✅ Yes |
| **Interactive Buttons** | ⚠️ View only | ✅ Fully interactive |
| **Update Messages** | ❌ No | ✅ Yes |
| **Thread Replies** | ❌ No | ✅ Yes |
| **Multiple Channels** | ❌ One per webhook | ✅ Any channel |
| **No Channel Join** | ❌ Must configure | ✅ Can post anywhere |

**Recommendation**: Start with Webhook, upgrade to Bot Token if needed.

---

## Support

- GitHub Issues: https://github.com/your-org/taskforge/issues
- Slack API Docs: https://api.slack.com/
- Webhook Guide: https://api.slack.com/messaging/webhooks

---

## Summary

✅ **Webhook Setup**: 5 minutes, easiest option
✅ **Bot Token Setup**: 10 minutes, more features
✅ **Overdue Notifications**: Automatic with admin trigger
✅ **Real-time Updates**: Get notified instantly in Slack
✅ **Beautiful Messages**: Rich formatting with buttons and colors

Start receiving Slack notifications now! 🚀
