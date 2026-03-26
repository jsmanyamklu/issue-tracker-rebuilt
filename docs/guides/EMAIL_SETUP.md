# Email Notification Setup for Overdue Issues

## Overview
TaskForge now includes automatic email notifications for overdue issues. When an issue passes its due date and is not yet closed or resolved, you can send email notifications to the assignee.

## Features
- 📧 Beautiful HTML email templates
- ⚠️ Shows exact days overdue
- 🎯 Direct links to issues
- 📊 Displays all issue details (priority, status, project)
- 🔔 Admin-controlled manual notifications
- 📈 Dashboard showing all overdue issues

## Email Configuration

### Option 1: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "TaskForge"
   - Copy the 16-character password

3. **Update .env file**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
```

### Option 2: Other Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

#### Office 365
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@company.com
SMTP_PASSWORD=your-password
```

#### Custom SMTP Server
```env
SMTP_HOST=smtp.yourserver.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASSWORD=your-password
```

## How to Use

### 1. Set Due Dates on Issues
- When creating or editing an issue, set the "Expected Closure Date"
- This field is optional but required for overdue tracking

### 2. Check for Overdue Issues
Navigate to **Admin Panel** (requires admin role):
- You'll see a section "📧 Overdue Issue Notifications"
- Lists all issues that are:
  - Past their due date
  - Not yet closed or resolved
  - Have an assignee

### 3. Send Notifications
- Click "Send Notifications to Assignees" button
- System will send an email to each assignee
- Shows confirmation of sent emails

### 4. Email Content
Assignees receive an email containing:
- Issue title and description
- Project name
- Days overdue (highlighted in red)
- Priority and status
- Direct link to the issue
- Suggested next steps

## API Endpoints

### Get Overdue Issues
```bash
GET /api/notifications/overdue
```
Returns list of all overdue issues without sending notifications.

### Send Overdue Notifications
```bash
POST /api/notifications/overdue
```
Sends email notifications to all assignees of overdue issues. Requires admin role.

## Automation (Optional)

To automatically check and send notifications daily, you can set up a cron job:

### Using Windows Task Scheduler
1. Create a PowerShell script:
```powershell
# check-overdue.ps1
$uri = "http://localhost:3000/api/notifications/overdue"
$headers = @{
    "Cookie" = "your-session-cookie"
}
Invoke-RestMethod -Uri $uri -Method Post -Headers $headers
```

2. Schedule it to run daily at 9 AM

### Using Node Cron (Alternative)
Add to your project:
```bash
npm install node-cron
```

Create `src/lib/cron/overdue-checker.ts`:
```typescript
import cron from 'node-cron';
import { issueRepository } from '@/repositories';
import { notifyOverdueIssues } from '@/lib/notifications/email';

// Run every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('🔍 Checking for overdue issues...');

  const overdueIssues = await issueRepository.findOverdueIssues();

  if (overdueIssues.length > 0) {
    const result = await notifyOverdueIssues(overdueIssues);
    console.log(`📧 Sent ${result.sent} notifications, ${result.failed} failed`);
  }
});
```

## Troubleshooting

### Email Not Sending
1. Check .env configuration
2. Verify SMTP credentials are correct
3. Check server logs for error messages
4. Ensure assignee has a valid email address

### Gmail "Less Secure Apps" Error
- Use App Password instead of your regular password
- Enable 2-Factor Authentication first

### Port Already in Use
- Try SMTP_PORT=465 with SMTP_SECURE=true
- Or use SMTP_PORT=2525 (alternative)

## Security Notes
- Never commit .env file to git
- Use environment variables in production
- App passwords are safer than regular passwords
- Rotate credentials regularly

## Testing
1. Create a test issue with a past due date
2. Assign it to yourself
3. Go to Admin Panel
4. Click "Send Notifications"
5. Check your email inbox

## Next Steps
- Set up automated daily checks
- Customize email template in `src/lib/notifications/email.ts`
- Add more notification triggers (assigned, status changed, etc.)
