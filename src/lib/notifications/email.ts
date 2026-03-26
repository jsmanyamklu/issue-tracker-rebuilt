import nodemailer from 'nodemailer';
import { IssueWithRelations } from '@/types';
import { notifyOverdueIssues as notifyOverdueIssuesSlack } from './slack';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Calculate days overdue for an issue
 */
function calculateDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Send overdue issue notification to assignee
 */
export async function notifyOverdueIssue(issue: IssueWithRelations): Promise<void> {
  // Check if email is configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('Email notifications are not configured. Set SMTP_USER and SMTP_PASSWORD environment variables.');
    return;
  }

  // Check if issue has an assignee
  if (!issue.assignee || !issue.assignee.email) {
    console.log(`Issue ${issue.id} has no assignee to notify`);
    return;
  }

  const daysOverdue = calculateDaysOverdue(issue.due_date!);
  const issueUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/issues/${issue.id}`;

  const mailOptions = {
    from: `"TaskForge" <${process.env.SMTP_USER}>`,
    to: issue.assignee.email,
    subject: `🚨 Overdue Issue: ${issue.title}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .issue-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: bold; width: 120px; color: #6b7280; }
            .detail-value { flex: 1; color: #111827; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
            .badge-priority-high, .badge-priority-critical { background: #fee2e2; color: #dc2626; }
            .badge-priority-medium { background: #fef3c7; color: #d97706; }
            .badge-priority-low { background: #e0e7ff; color: #4f46e5; }
            .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
            .btn:hover { background: #5568d3; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">⚠️ Overdue Issue Alert</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Action Required</p>
            </div>

            <div class="content">
              <div class="alert">
                <strong>🚨 This issue is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue!</strong>
                <p style="margin: 5px 0 0 0;">The expected closure date has passed. Please review and update the status.</p>
              </div>

              <div class="issue-details">
                <h2 style="margin-top: 0; color: #111827;">${issue.title}</h2>

                <div class="detail-row">
                  <div class="detail-label">Project:</div>
                  <div class="detail-value">${issue.project.name}</div>
                </div>

                <div class="detail-row">
                  <div class="detail-label">Priority:</div>
                  <div class="detail-value">
                    <span class="badge badge-priority-${issue.priority}">${issue.priority.toUpperCase()}</span>
                  </div>
                </div>

                <div class="detail-row">
                  <div class="detail-label">Type:</div>
                  <div class="detail-value">${issue.type}</div>
                </div>

                <div class="detail-row">
                  <div class="detail-label">Status:</div>
                  <div class="detail-value">${issue.status.replace('_', ' ')}</div>
                </div>

                <div class="detail-row">
                  <div class="detail-label">Due Date:</div>
                  <div class="detail-value" style="color: #dc2626; font-weight: 600;">
                    ${new Date(issue.due_date!).toLocaleDateString()} (${daysOverdue} days ago)
                  </div>
                </div>

                <div class="detail-row" style="border-bottom: none;">
                  <div class="detail-label">Reporter:</div>
                  <div class="detail-value">${issue.reporter.name}</div>
                </div>
              </div>

              ${issue.description ? `
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #374151;">Description:</h3>
                  <p style="color: #6b7280; white-space: pre-wrap;">${issue.description}</p>
                </div>
              ` : ''}

              <div style="text-align: center;">
                <a href="${issueUrl}" class="btn">View Issue Details →</a>
              </div>

              <div style="background: #fff; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #667eea;">
                <h4 style="margin-top: 0; color: #111827;">Next Steps:</h4>
                <ul style="color: #6b7280; margin: 10px 0;">
                  <li>Review the issue and update its status if work is in progress</li>
                  <li>If completed, mark the issue as resolved or closed</li>
                  <li>If more time is needed, update the due date with a new estimate</li>
                  <li>Add a comment to communicate any blockers or delays</li>
                </ul>
              </div>
            </div>

            <div class="footer">
              <p>You received this email because you're assigned to this issue in TaskForge.</p>
              <p style="margin-top: 5px;">
                <a href="${issueUrl}" style="color: #667eea;">View Issue</a> |
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/my-issues" style="color: #667eea;">My Issues</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Overdue notification sent to ${issue.assignee.email} for issue ${issue.id}`);
  } catch (error) {
    console.error(`❌ Failed to send overdue notification for issue ${issue.id}:`, error);
    throw error;
  }
}

/**
 * Send batch overdue notifications for multiple issues
 */
export async function notifyOverdueIssues(issues: IssueWithRelations[]): Promise<{ sent: number; failed: number; slackSent: boolean }> {
  let sent = 0;
  let failed = 0;
  let slackSent = false;

  // Send individual email notifications to assignees
  for (const issue of issues) {
    try {
      await notifyOverdueIssue(issue);
      sent++;
    } catch (error) {
      failed++;
    }
  }

  // Send consolidated Slack notification
  if (issues.length > 0) {
    try {
      // Filter issues with due_date for Slack notification
      const issuesWithDueDate = issues.filter((issue): issue is IssueWithRelations & { due_date: string } =>
        issue.due_date !== undefined && issue.due_date !== null
      );
      if (issuesWithDueDate.length > 0) {
        await notifyOverdueIssuesSlack(issuesWithDueDate);
        slackSent = true;
        console.log('✅ Slack notification sent for overdue issues');
      }
    } catch (error) {
      console.error('❌ Failed to send Slack notification for overdue issues:', error);
      // Don't fail the entire operation if Slack fails
    }
  }

  return { sent, failed, slackSent };
}
