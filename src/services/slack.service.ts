import log from '@/lib/logger';
import {
  SlackMessage,
  SlackBlock,
  SlackText,
  IssueNotification,
  SlackUnfurl,
} from '@/types/slack';

/**
 * Slack Service
 * Handles all Slack API interactions
 */
export class SlackService {
  private botToken: string;
  private webhookUrl?: string;
  private enabled: boolean;

  constructor() {
    this.botToken = process.env.SLACK_BOT_TOKEN || '';
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL;
    this.enabled = !!(this.botToken || this.webhookUrl);

    if (!this.enabled) {
      log.warn('Slack integration is not configured. Set SLACK_BOT_TOKEN or SLACK_WEBHOOK_URL.');
    }
  }

  /**
   * Check if Slack is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Send a message to Slack using Web API
   */
  async sendMessage(channel: string, message: SlackMessage): Promise<void> {
    if (!this.enabled || !this.botToken) {
      log.warn('Slack bot token not configured, skipping message send');
      return;
    }

    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.botToken}`,
        },
        body: JSON.stringify({
          channel,
          ...message,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`);
      }

      log.info('Slack message sent successfully', { channel, messageType: message.blocks?.[0]?.type });
    } catch (error) {
      log.error('Failed to send Slack message', {
        error: error instanceof Error ? error.message : 'Unknown error',
        channel,
      });
      throw error;
    }
  }

  /**
   * Send a message using webhook URL (simpler, no auth required)
   */
  async sendWebhookMessage(message: SlackMessage): Promise<void> {
    if (!this.webhookUrl) {
      log.warn('Slack webhook URL not configured, skipping webhook message');
      return;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.statusText}`);
      }

      log.info('Slack webhook message sent successfully');
    } catch (error) {
      log.error('Failed to send Slack webhook message', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Update a message in Slack
   */
  async updateMessage(
    channel: string,
    messageTs: string,
    message: SlackMessage
  ): Promise<void> {
    if (!this.enabled || !this.botToken) {
      log.warn('Slack bot token not configured, skipping message update');
      return;
    }

    try {
      const response = await fetch('https://slack.com/api/chat.update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.botToken}`,
        },
        body: JSON.stringify({
          channel,
          ts: messageTs,
          ...message,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`);
      }

      log.info('Slack message updated successfully', { channel, messageTs });
    } catch (error) {
      log.error('Failed to update Slack message', {
        error: error instanceof Error ? error.message : 'Unknown error',
        channel,
        messageTs,
      });
      throw error;
    }
  }

  /**
   * Unfurl links in Slack
   */
  async unfurlLinks(
    channel: string,
    messageTs: string,
    unfurls: SlackUnfurl
  ): Promise<void> {
    if (!this.enabled || !this.botToken) {
      log.warn('Slack bot token not configured, skipping link unfurl');
      return;
    }

    try {
      const response = await fetch('https://slack.com/api/chat.unfurl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.botToken}`,
        },
        body: JSON.stringify({
          channel,
          ts: messageTs,
          unfurls,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`);
      }

      log.info('Slack links unfurled successfully', { channel, messageTs });
    } catch (error) {
      log.error('Failed to unfurl Slack links', {
        error: error instanceof Error ? error.message : 'Unknown error',
        channel,
        messageTs,
      });
      throw error;
    }
  }

  /**
   * Build issue notification message
   */
  buildIssueNotification(notification: IssueNotification): SlackMessage {
    const { type, issue, actor, oldValue, newValue, comment } = notification;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const issueUrl = `${baseUrl}/issues/${issue.id}`;

    let title = '';
    let color = '#2196F3';
    let description = '';

    switch (type) {
      case 'created':
        title = '🆕 New Issue Created';
        color = '#4CAF50';
        description = `*${actor.name}* created a new issue`;
        break;
      case 'assigned':
        title = '👤 Issue Assigned';
        color = '#2196F3';
        description = `*${actor.name}* assigned this issue`;
        break;
      case 'status_changed':
        title = '🔄 Status Changed';
        color = '#FF9800';
        description = `*${actor.name}* changed status from *${oldValue}* to *${newValue}*`;
        break;
      case 'commented':
        title = '💬 New Comment';
        color = '#9C27B0';
        description = `*${actor.name}* commented on this issue`;
        break;
    }

    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: title,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: description,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Issue:*\n<${issueUrl}|${issue.title}>`,
          },
          {
            type: 'mrkdwn',
            text: `*Project:*\n${issue.project_name}`,
          },
          {
            type: 'mrkdwn',
            text: `*Status:*\n${this.formatStatus(issue.status)}`,
          },
          {
            type: 'mrkdwn',
            text: `*Priority:*\n${this.formatPriority(issue.priority)}`,
          },
        ],
      },
    ];

    // Add comment if present
    if (comment) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `> ${comment.substring(0, 200)}${comment.length > 200 ? '...' : ''}`,
        },
      });
    }

    // Add action buttons
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Issue',
            emoji: true,
          },
          url: issueUrl,
          action_id: 'view_issue',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Assign to Me',
            emoji: true,
          },
          value: issue.id,
          action_id: 'assign_to_me',
          style: 'primary',
        },
      ],
    });

    return {
      blocks,
      attachments: [
        {
          color,
          blocks: [],
        },
      ],
    };
  }

  /**
   * Format status with emoji
   */
  private formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      open: '🟢 Open',
      in_progress: '🟡 In Progress',
      resolved: '🔵 Resolved',
      closed: '⚫ Closed',
    };
    return statusMap[status] || status;
  }

  /**
   * Format priority with emoji
   */
  private formatPriority(priority: string): string {
    const priorityMap: Record<string, string> = {
      low: '🟦 Low',
      medium: '🟨 Medium',
      high: '🟧 High',
      critical: '🟥 Critical',
    };
    return priorityMap[priority] || priority;
  }

  /**
   * Build simple text response for slash commands
   */
  buildSimpleResponse(text: string, ephemeral = true): SlackMessage {
    return {
      text,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text,
          },
        },
      ],
    };
  }

  /**
   * Build issue list message
   */
  buildIssueList(
    issues: Array<{
      id: string;
      title: string;
      status: string;
      priority: string;
      project_name: string;
    }>
  ): SlackMessage {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (issues.length === 0) {
      return this.buildSimpleResponse('No issues found.');
    }

    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `📋 Issues (${issues.length})`,
          emoji: true,
        },
      },
    ];

    issues.forEach((issue) => {
      const issueUrl = `${baseUrl}/issues/${issue.id}`;
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*<${issueUrl}|${issue.title}>*\n${this.formatStatus(issue.status)} • ${this.formatPriority(issue.priority)} • ${issue.project_name}`,
        },
      });
    });

    return { blocks };
  }

  /**
   * Build overdue issues notification
   */
  buildOverdueNotification(
    issues: Array<{
      id: string;
      title: string;
      status: string;
      priority: string;
      type: string;
      project: { name: string };
      assignee?: { name: string; email: string };
      due_date: string;
    }>
  ): SlackMessage {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🚨 ${issues.length} Overdue Issue${issues.length > 1 ? 's' : ''}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Attention Required:* The following issue${issues.length > 1 ? 's have' : ' has'} passed ${issues.length > 1 ? 'their' : 'its'} due date and need${issues.length === 1 ? 's' : ''} immediate attention.`,
        },
      },
      {
        type: 'divider',
      },
    ];

    // Group by priority
    const critical = issues.filter((i) => i.priority === 'critical');
    const high = issues.filter((i) => i.priority === 'high');
    const medium = issues.filter((i) => i.priority === 'medium');
    const low = issues.filter((i) => i.priority === 'low');

    const addIssueBlock = (issue: typeof issues[0]) => {
      const issueUrl = `${baseUrl}/issues/${issue.id}`;
      const dueDate = new Date(issue.due_date);
      const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*<${issueUrl}|${issue.title}>*\n${this.formatPriority(issue.priority)} • ${this.formatStatus(issue.status)} • ${issue.project.name}\n⚠️ *${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue* ${issue.assignee ? `• Assigned to *${issue.assignee.name}*` : '• *Unassigned*'}`,
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Issue',
            emoji: true,
          },
          url: issueUrl,
          action_id: `view_issue_${issue.id}`,
        },
      });
    };

    // Add issues by priority
    if (critical.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*🔴 Critical Priority Issues:*',
        },
      });
      critical.forEach(addIssueBlock);
      blocks.push({ type: 'divider' });
    }

    if (high.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*🟠 High Priority Issues:*',
        },
      });
      high.forEach(addIssueBlock);
      blocks.push({ type: 'divider' });
    }

    if (medium.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*🟡 Medium Priority Issues:*',
        },
      });
      medium.forEach(addIssueBlock);
      blocks.push({ type: 'divider' });
    }

    if (low.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*🟢 Low Priority Issues:*',
        },
      });
      low.forEach(addIssueBlock);
    }

    // Add action button to view all overdue issues
    blocks.push(
      { type: 'divider' as const },
      {
        type: 'context' as const,
        elements: [
          {
            type: 'mrkdwn' as const,
            text: '💡 _Please review these issues and update their status or due dates accordingly._',
          } as any,
        ],
      }
    );

    return {
      blocks,
      attachments: [
        {
          color: '#dc2626', // Red color for urgency
          blocks: [],
        },
      ],
    };
  }
}

// Export singleton instance
export const slackService = new SlackService();
