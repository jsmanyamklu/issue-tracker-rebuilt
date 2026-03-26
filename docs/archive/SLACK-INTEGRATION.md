# 📢 Slack Integration Guide

Complete guide to setting up Slack integration for your Issue Tracker.

---

## 🎯 Features

✅ **Slash Commands**
- `/issue list` - List recent issues
- `/issue help` - Show available commands

✅ **Automatic Notifications**
- 🆕 New issue created
- 👤 Issue assigned
- 🔄 Status changed
- 💬 New comment added

✅ **Link Unfurling**
- Automatic rich previews of issue URLs
- Shows status, priority, type, and project

✅ **Interactive Buttons**
- "View Issue" - Opens issue in browser
- "Assign to Me" - Quick assignment (requires setup)

---

## 🚀 Quick Setup

### 1. Create a Slack App

1. Go to https://api.slack.com/apps
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. Enter app name: `Issue Tracker`
5. Select your workspace

### 2. Configure OAuth & Permissions

Navigate to **OAuth & Permissions** in the sidebar:

#### Add Bot Token Scopes:
```
chat:write          - Send messages
chat:write.public   - Send to public channels
links:read          - Detect shared links
links:write         - Unfurl issue links
commands            - Slash commands
```

#### Install App to Workspace:
1. Click **"Install to Workspace"**
2. Authorize the app
3. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

### 3. Enable Event Subscriptions

Navigate to **Event Subscriptions**:

1. Enable Events: **ON**
2. Request URL: `https://your-domain.com/api/slack/events`
3. Subscribe to bot events:
   - `link_shared` - For link unfurling
4. Add App Unfurl Domain:
   - `your-domain.com`

### 4. Create Slash Command

Navigate to **Slash Commands**:

1. Click **"Create New Command"**
2. Command: `/issue`
3. Request URL: `https://your-domain.com/api/slack/commands`
4. Short Description: `Issue Tracker commands`
5. Usage Hint: `list | help`

### 5. Enable Interactivity

Navigate to **Interactivity & Shortcuts**:

1. Enable Interactivity: **ON**
2. Request URL: `https://your-domain.com/api/slack/interactions`

### 6. Get Your Credentials

Navigate to **Basic Information**:

1. Copy **Signing Secret** (under App Credentials)
2. Already have Bot Token from step 2

---

## 🔧 Configure Environment Variables

Add these to your `.env` file:

```bash
# Slack Integration
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SLACK_DEFAULT_CHANNEL=#issue-tracker

# Application URL (required for links)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Option 2: Using Incoming Webhooks (Simpler)

If you only need **outgoing notifications** without commands:

1. Navigate to **Incoming Webhooks**
2. Activate Webhooks: **ON**
3. Click **"Add New Webhook to Workspace"**
4. Select channel (e.g., `#issue-tracker`)
5. Copy the Webhook URL

```bash
# Simpler setup - only outgoing notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 📝 Usage

### Slash Commands

#### List Issues
```
/issue list
```
Shows the 10 most recent issues with status and priority.

#### Get Help
```
/issue help
```
Displays available commands.

### Automatic Notifications

Notifications are sent automatically to your configured channel:

**New Issue Created:**
```
🆕 New Issue Created
John Doe created a new issue

Issue: Fix login bug
Project: Mobile App
Status: 🟢 Open
Priority: 🟧 High

[View Issue] [Assign to Me]
```

**Issue Assigned:**
```
👤 Issue Assigned
Jane Smith assigned this issue

Issue: Implement dark mode
Project: Web App
Status: 🟡 In Progress
Priority: 🟨 Medium
```

**Status Changed:**
```
🔄 Status Changed
Bob Johnson changed status from In Progress to Resolved

Issue: Fix authentication bug
Project: API
Status: 🔵 Resolved
Priority: 🟥 Critical
```

**New Comment:**
```
💬 New Comment
Alice Lee commented on this issue

Issue: Update dependencies
Project: Backend
> I've reviewed the dependencies and we should...
```

### Link Unfurling

When someone shares an issue link in Slack:

```
https://your-domain.com/issues/abc-123
```

Slack automatically shows:

```
┌─────────────────────────────────────┐
│ Fix critical security vulnerability │
│ No description                       │
│                                      │
│ Status: 🟢 Open                     │
│ Priority: 🟥 Critical               │
│ Type: bug                           │
│ Project: Backend API                │
│                                      │
│ Issue Tracker • 2 hours ago         │
└─────────────────────────────────────┘
```

---

## 🔍 Testing

### 1. Test Notifications

Create an issue in your app and verify notification appears in Slack:

```bash
# Should appear in your #issue-tracker channel
🆕 New Issue Created
```

### 2. Test Slash Commands

In Slack, type:
```
/issue list
```

Should return a list of recent issues.

### 3. Test Link Unfurling

Paste an issue URL in a Slack message:
```
Check out this issue: https://your-domain.com/issues/abc-123
```

URL should expand with issue details.

---

## 🐛 Troubleshooting

### Notifications Not Appearing

**Check:**
1. ✅ `SLACK_BOT_TOKEN` or `SLACK_WEBHOOK_URL` is set
2. ✅ `SLACK_DEFAULT_CHANNEL` exists and bot is invited
3. ✅ Bot has `chat:write` permission
4. ✅ Check application logs for errors

**Fix:**
```bash
# Invite bot to channel
/invite @Issue Tracker

# Check logs
npm run dev
# Look for "Slack notification sent successfully"
```

### Slash Commands Not Working

**Check:**
1. ✅ Request URL is correct and accessible
2. ✅ Command is created in Slack App settings
3. ✅ App is installed to workspace

**Fix:**
- Reinstall app from OAuth & Permissions
- Verify URL returns 200 OK
- Check Slack App event logs

### Link Unfurling Not Working

**Check:**
1. ✅ `link_shared` event is subscribed
2. ✅ Domain is added to App Unfurl Domains
3. ✅ Bot has `links:read` and `links:write` permissions
4. ✅ Event URL is verified

**Fix:**
- Re-verify Event Subscriptions URL
- Add your domain to unfurl domains
- Reinstall app

### Interactive Buttons Not Responding

**Check:**
1. ✅ Interactivity is enabled
2. ✅ Request URL is correct
3. ✅ Payload is being received

**Debug:**
```bash
# Check application logs
npm run dev

# Look for "Received Slack interaction"
```

---

## 🔐 Security Best Practices

### 1. Verify Requests (Production)

Uncomment verification in `/api/slack/commands/route.ts`:

```typescript
// Verify signing secret
const isValid = await verifySlackRequest(request, command.token);
if (!isValid) {
  return NextResponse.json({ text: 'Invalid request' }, { status: 401 });
}
```

Implement verification function:

```typescript
import crypto from 'crypto';

async function verifySlackRequest(request: NextRequest, token: string): Promise<boolean> {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) return false;

  const timestamp = request.headers.get('X-Slack-Request-Timestamp');
  const signature = request.headers.get('X-Slack-Signature');

  if (!timestamp || !signature) return false;

  // Prevent replay attacks
  const time = Math.floor(Date.now() / 1000);
  if (Math.abs(time - parseInt(timestamp)) > 300) return false;

  const body = await request.text();
  const sigBasestring = `v0:${timestamp}:${body}`;
  const mySignature = 'v0=' + crypto
    .createHmac('sha256', signingSecret)
    .update(sigBasestring)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(mySignature),
    Buffer.from(signature)
  );
}
```

### 2. Use Environment Variables

Never hardcode secrets:
```bash
# ❌ DON'T
const token = 'xoxb-1234567890-...';

# ✅ DO
const token = process.env.SLACK_BOT_TOKEN;
```

### 3. Limit Permissions

Only request the scopes you actually need.

---

## 🎨 Customization

### Change Notification Channel

```bash
# .env
SLACK_DEFAULT_CHANNEL=#engineering
```

### Customize Notification Format

Edit `src/services/slack.service.ts`:

```typescript
buildIssueNotification(notification: IssueNotification): SlackMessage {
  // Customize the message format here
  // Add custom fields, colors, buttons, etc.
}
```

### Add More Slash Commands

Edit `src/app/api/slack/commands/route.ts`:

```typescript
case 'create':
  return await handleIssueCreate(command, args.slice(1).join(' '));

case 'mine':
  return await handleMyIssues(command);

case 'search':
  return await handleIssueSearch(command, args.slice(1).join(' '));
```

---

## 📊 Notification Examples

### High Priority Issue

```
🟥 CRITICAL PRIORITY
🆕 New Issue Created

Security vulnerability in authentication

Issue: SQL injection in login endpoint
Project: Backend API
Status: 🟢 Open
Priority: 🟥 Critical
Type: bug

[View Issue] [Assign to Me]
```

### Issue Resolved

```
✅ Issue Resolved
Alice Lee changed status from In Progress to Resolved

Issue: Implement user profiles
Project: Web App
Status: 🔵 Resolved
Priority: 🟨 Medium
Type: feature

Great work team! 🎉
```

---

## 🚀 Advanced Features (Future)

### Coming Soon:
- [ ] Create issues directly from Slack
- [ ] Assign issues to Slack users
- [ ] Comment on issues from Slack
- [ ] Custom workflow triggers
- [ ] Scheduled digests
- [ ] Team mentions
- [ ] Emoji reactions sync

---

## 📞 Support

### Need Help?

1. **Check Logs:** Look for `Slack notification sent successfully`
2. **Test Endpoint:** `curl https://your-domain.com/api/slack/events`
3. **Slack API Logs:** https://api.slack.com/apps → Your App → Event Subscriptions

### Common Issues:

| Issue | Solution |
|-------|----------|
| 404 on webhook URL | Deploy your app and update URL in Slack |
| "channel_not_found" | Invite bot to channel with `/invite @Issue Tracker` |
| Notifications not sending | Check bot token and permissions |
| Commands not appearing | Reinstall app to workspace |

---

## 📝 Checklist

Before going to production:

- [ ] Slack app created and configured
- [ ] Bot token and signing secret added to `.env`
- [ ] App installed to workspace
- [ ] Bot invited to notification channel
- [ ] Event subscriptions verified
- [ ] Slash commands working
- [ ] Test notifications sent successfully
- [ ] Link unfurling tested
- [ ] Request verification enabled
- [ ] Error logging configured

---

## 🎉 You're Done!

Your Issue Tracker is now integrated with Slack! 🚀

**Next Steps:**
1. Invite your team to the Slack channel
2. Create a test issue to see notifications
3. Try the `/issue list` command
4. Share an issue link to see unfurling

---

**Built with:** Slack Bolt Framework + Next.js API Routes
**Status:** ✅ Production Ready
**Part of:** Phase 1 Integrations from the Jira-beating roadmap
