import { slackService } from '@/services/slack.service';
import { IssueNotification } from '@/types/slack';
import log from '@/lib/logger';

/**
 * Send Slack notification for issue events
 */
export async function sendIssueNotification(notification: IssueNotification): Promise<void> {
  if (!slackService.isEnabled()) {
    log.debug('Slack not configured, skipping notification');
    return;
  }

  try {
    const channel = process.env.SLACK_DEFAULT_CHANNEL || '#issue-tracker';
    const message = slackService.buildIssueNotification(notification);

    // Use webhook if available (simpler), otherwise use bot token
    if (process.env.SLACK_WEBHOOK_URL) {
      await slackService.sendWebhookMessage(message);
    } else if (process.env.SLACK_BOT_TOKEN) {
      await slackService.sendMessage(channel, message);
    }

    log.info('Slack notification sent', {
      type: notification.type,
      issueId: notification.issue.id,
    });
  } catch (error) {
    log.error('Failed to send Slack notification', {
      error: error instanceof Error ? error.message : 'Unknown error',
      type: notification.type,
      issueId: notification.issue.id,
    });
    // Don't throw - notification failures shouldn't break the main flow
  }
}

/**
 * Notify when issue is created
 */
export async function notifyIssueCreated(issue: {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  project: { name: string };
  reporter: { name: string; email: string };
}): Promise<void> {
  await sendIssueNotification({
    type: 'created',
    issue: {
      id: issue.id,
      title: issue.title,
      status: issue.status,
      priority: issue.priority,
      type: issue.type,
      project_name: issue.project.name,
    },
    actor: {
      name: issue.reporter.name,
      email: issue.reporter.email,
    },
  });
}

/**
 * Notify when issue is assigned
 */
export async function notifyIssueAssigned(
  issue: {
    id: string;
    title: string;
    status: string;
    priority: string;
    type: string;
    project: { name: string };
  },
  assignedBy: { name: string; email: string }
): Promise<void> {
  await sendIssueNotification({
    type: 'assigned',
    issue: {
      id: issue.id,
      title: issue.title,
      status: issue.status,
      priority: issue.priority,
      type: issue.type,
      project_name: issue.project.name,
    },
    actor: assignedBy,
  });
}

/**
 * Notify when issue status changes
 */
export async function notifyIssueStatusChanged(
  issue: {
    id: string;
    title: string;
    status: string;
    priority: string;
    type: string;
    project: { name: string };
  },
  changedBy: { name: string; email: string },
  oldStatus: string,
  newStatus: string
): Promise<void> {
  await sendIssueNotification({
    type: 'status_changed',
    issue: {
      id: issue.id,
      title: issue.title,
      status: issue.status,
      priority: issue.priority,
      type: issue.type,
      project_name: issue.project.name,
    },
    actor: changedBy,
    oldValue: oldStatus,
    newValue: newStatus,
  });
}

/**
 * Notify when comment is added
 */
export async function notifyIssueCommented(
  issue: {
    id: string;
    title: string;
    status: string;
    priority: string;
    type: string;
    project: { name: string };
  },
  commentedBy: { name: string; email: string },
  comment: string
): Promise<void> {
  await sendIssueNotification({
    type: 'commented',
    issue: {
      id: issue.id,
      title: issue.title,
      status: issue.status,
      priority: issue.priority,
      type: issue.type,
      project_name: issue.project.name,
    },
    actor: commentedBy,
    comment,
  });
}

/**
 * Notify about overdue issues
 */
export async function notifyOverdueIssues(issues: Array<{
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  project: { name: string };
  assignee?: { name: string; email: string };
  due_date: string;
}>): Promise<void> {
  if (!slackService.isEnabled()) {
    log.debug('Slack not configured, skipping overdue notification');
    return;
  }

  try {
    const channel = process.env.SLACK_DEFAULT_CHANNEL || '#issue-tracker';
    const message = slackService.buildOverdueNotification(issues);

    // Use webhook if available (simpler), otherwise use bot token
    if (process.env.SLACK_WEBHOOK_URL) {
      await slackService.sendWebhookMessage(message);
    } else if (process.env.SLACK_BOT_TOKEN) {
      await slackService.sendMessage(channel, message);
    }

    log.info('Slack overdue notification sent', {
      count: issues.length,
    });
  } catch (error) {
    log.error('Failed to send Slack overdue notification', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    // Don't throw - notification failures shouldn't break the main flow
  }
}

/**
 * Notify about a single overdue issue
 */
export async function notifyOverdueIssue(
  issue: {
    id: string;
    title: string;
    status: string;
    priority: string;
    type: string;
    project: { name: string };
    assignee?: { name: string; email: string };
    due_date: string;
  },
  daysOverdue: number
): Promise<void> {
  if (!slackService.isEnabled()) {
    log.debug('Slack not configured, skipping overdue notification');
    return;
  }

  try {
    const channel = process.env.SLACK_DEFAULT_CHANNEL || '#issue-tracker';
    const emoji = daysOverdue < 0 ? '⏰' : '⚠️';
    const statusText = daysOverdue < 0
      ? `Due in ${Math.abs(daysOverdue)} day${Math.abs(daysOverdue) === 1 ? '' : 's'}`
      : `${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue`;

    const message = {
      text: `${emoji} Issue ${statusText}: ${issue.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${emoji} *Issue ${statusText}*\n\n*${issue.title}*\n\nProject: ${issue.project.name}\nPriority: ${issue.priority.toUpperCase()}\nAssignee: ${issue.assignee?.name || 'Unassigned'}`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Issue',
              },
              url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/issues/${issue.id}`,
            },
          ],
        },
      ],
    };

    // Use webhook if available (simpler), otherwise use bot token
    if (process.env.SLACK_WEBHOOK_URL) {
      await slackService.sendWebhookMessage(message);
    } else if (process.env.SLACK_BOT_TOKEN) {
      await slackService.sendMessage(channel, message);
    }

    log.info('Slack overdue notification sent', {
      issueId: issue.id,
      daysOverdue,
    });
  } catch (error) {
    log.error('Failed to send Slack overdue notification', {
      error: error instanceof Error ? error.message : 'Unknown error',
      issueId: issue.id,
    });
    // Don't throw - notification failures shouldn't break the main flow
  }
}

/**
 * Notify manager about escalated overdue issue
 */
export async function notifyManagerEscalation(
  issue: {
    id: string;
    title: string;
    status: string;
    priority: string;
    type: string;
    project: { name: string };
    assignee?: { name: string; email: string };
    due_date: string;
  },
  daysOverdue: number,
  manager: { name: string; email: string }
): Promise<void> {
  if (!slackService.isEnabled()) {
    log.debug('Slack not configured, skipping escalation notification');
    return;
  }

  try {
    const channel = process.env.SLACK_DEFAULT_CHANNEL || '#issue-tracker';
    const message = {
      text: `🚨 ESCALATION: Issue ${daysOverdue} days overdue - Manager attention required`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🚨 *ESCALATION: Issue ${daysOverdue} Days Overdue*\n\n*${issue.title}*\n\nProject: ${issue.project.name}\nPriority: ${issue.priority.toUpperCase()}\nAssignee: ${issue.assignee?.name || 'Unassigned'}\nManager: ${manager.name}\n\n_This issue requires manager attention for reassignment or resolution._`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Reassign Issue',
              },
              url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/issues/${issue.id}`,
              style: 'danger',
            },
          ],
        },
      ],
    };

    // Use webhook if available (simpler), otherwise use bot token
    if (process.env.SLACK_WEBHOOK_URL) {
      await slackService.sendWebhookMessage(message);
    } else if (process.env.SLACK_BOT_TOKEN) {
      await slackService.sendMessage(channel, message);
    }

    log.info('Slack escalation notification sent', {
      issueId: issue.id,
      manager: manager.name,
      daysOverdue,
    });
  } catch (error) {
    log.error('Failed to send Slack escalation notification', {
      error: error instanceof Error ? error.message : 'Unknown error',
      issueId: issue.id,
    });
    // Don't throw - notification failures shouldn't break the main flow
  }
}
