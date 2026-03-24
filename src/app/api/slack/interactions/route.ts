import { NextRequest, NextResponse } from 'next/server';
import { slackService } from '@/services/slack.service';
import { issueController } from '@/controllers';
import { SlackInteraction } from '@/types/slack';
import log from '@/lib/logger';

/**
 * POST /api/slack/interactions
 * Handle Slack interactive components (buttons, modals, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data (Slack sends as application/x-www-form-urlencoded)
    const formData = await request.formData();
    const payloadString = formData.get('payload') as string;

    if (!payloadString) {
      return NextResponse.json(
        { error: 'Missing payload' },
        { status: 400 }
      );
    }

    const interaction: SlackInteraction = JSON.parse(payloadString);

    log.info('Received Slack interaction', {
      type: interaction.type,
      user: interaction.user.username,
      actions: interaction.actions?.map((a) => a.action_id),
    });

    // Handle different interaction types
    switch (interaction.type) {
      case 'block_actions':
        return await handleBlockActions(interaction);

      case 'view_submission':
        return await handleViewSubmission(interaction);

      default:
        log.warn('Unhandled interaction type', { type: interaction.type });
        return NextResponse.json({ ok: true });
    }
  } catch (error) {
    log.error('Error handling Slack interaction', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle block actions (button clicks)
 */
async function handleBlockActions(interaction: SlackInteraction) {
  if (!interaction.actions || interaction.actions.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const action = interaction.actions[0];

  switch (action.action_id) {
    case 'assign_to_me':
      return await handleAssignToMe(interaction, action.value);

    case 'view_issue':
      // This is a URL button, no action needed
      return NextResponse.json({ ok: true });

    default:
      log.warn('Unhandled action', { actionId: action.action_id });
      return NextResponse.json({ ok: true });
  }
}

/**
 * Handle view submission (modal forms)
 */
async function handleViewSubmission(interaction: SlackInteraction) {
  // Handle modal form submissions here
  // For now, just acknowledge
  return NextResponse.json({ ok: true });
}

/**
 * Handle "Assign to Me" button click
 */
async function handleAssignToMe(interaction: SlackInteraction, issueId: string) {
  try {
    // In a real implementation, you would:
    // 1. Map Slack user ID to your app user ID
    // 2. Assign the issue to that user

    // For now, just update the message to show it was clicked
    const updatedMessage = slackService.buildSimpleResponse(
      `✅ To assign issues from Slack, please link your Slack account in your Issue Tracker settings.`
    );

    // Update the original message
    if (interaction.message && interaction.container) {
      await slackService.updateMessage(
        interaction.container.channel_id,
        interaction.container.message_ts,
        updatedMessage
      );
    }

    return NextResponse.json({
      response_type: 'ephemeral',
      text: 'Please link your Slack account first to assign issues.',
    });
  } catch (error) {
    log.error('Error handling assign_to_me action', {
      error: error instanceof Error ? error.message : 'Unknown error',
      issueId,
    });

    return NextResponse.json({
      response_type: 'ephemeral',
      text: 'Failed to assign issue. Please try again.',
    });
  }
}
