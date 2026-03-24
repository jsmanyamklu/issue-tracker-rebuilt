import { NextRequest, NextResponse } from 'next/server';
import { slackService } from '@/services/slack.service';
import { issueController } from '@/controllers';
import { SlackEvent, SlackLinkUnfurlingEvent } from '@/types/slack';
import log from '@/lib/logger';

/**
 * POST /api/slack/events
 * Handle Slack events (URL verification, link_shared, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const event: SlackEvent = await request.json();

    log.info('Received Slack event', {
      type: event.type,
      eventType: event.event?.type,
    });

    // Handle URL verification challenge
    if (event.type === 'url_verification') {
      return NextResponse.json({
        challenge: event.challenge,
      });
    }

    // Handle event callbacks
    if (event.type === 'event_callback') {
      // Respond immediately to avoid timeout
      // Process event asynchronously
      processEvent(event).catch((error) => {
        log.error('Error processing Slack event', {
          error: error instanceof Error ? error.message : 'Unknown error',
          eventType: event.event?.type,
        });
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    log.error('Error handling Slack event', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Process Slack events asynchronously
 */
async function processEvent(event: SlackEvent) {
  switch (event.event.type) {
    case 'link_shared':
      await handleLinkShared(event.event as any as SlackLinkUnfurlingEvent);
      break;

    default:
      log.info('Unhandled event type', { type: event.event.type });
  }
}

/**
 * Handle link_shared event (unfurl issue links)
 */
async function handleLinkShared(event: SlackLinkUnfurlingEvent) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const unfurls: Record<string, any> = {};

    for (const link of event.links) {
      // Check if link is an issue URL
      const issueMatch = link.url.match(/\/issues\/([a-f0-9-]+)/);

      if (issueMatch) {
        const issueId = issueMatch[1];

        try {
          const response = await issueController.getById(issueId);

          if (response.success && response.data) {
            const issue = response.data;

            unfurls[link.url] = {
              color: getPriorityColor(issue.priority),
              title: issue.title,
              title_link: link.url,
              text: issue.description || 'No description',
              fields: [
                {
                  title: 'Status',
                  value: formatStatus(issue.status),
                  short: true,
                },
                {
                  title: 'Priority',
                  value: formatPriority(issue.priority),
                  short: true,
                },
                {
                  title: 'Type',
                  value: issue.type,
                  short: true,
                },
                {
                  title: 'Project',
                  value: issue.project?.name || 'Unknown',
                  short: true,
                },
              ],
              footer: 'Issue Tracker',
              ts: Math.floor(new Date(issue.created_at).getTime() / 1000),
            };
          }
        } catch (error) {
          log.error('Error fetching issue for unfurl', {
            issueId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    // Send unfurls if we have any
    if (Object.keys(unfurls).length > 0) {
      await slackService.unfurlLinks(
        event.channel,
        event.message_ts,
        unfurls
      );
    }
  } catch (error) {
    log.error('Error handling link_shared event', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get color based on priority
 */
function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: '#4CAF50',
    medium: '#FF9800',
    high: '#F44336',
    critical: '#D32F2F',
  };
  return colors[priority] || '#2196F3';
}

/**
 * Format status with emoji
 */
function formatStatus(status: string): string {
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
function formatPriority(priority: string): string {
  const priorityMap: Record<string, string> = {
    low: '🟦 Low',
    medium: '🟨 Medium',
    high: '🟧 High',
    critical: '🟥 Critical',
  };
  return priorityMap[priority] || priority;
}
