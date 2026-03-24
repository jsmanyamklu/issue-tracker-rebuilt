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
