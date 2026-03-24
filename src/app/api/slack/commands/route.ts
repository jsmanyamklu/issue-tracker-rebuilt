import { NextRequest, NextResponse } from 'next/server';
import { slackService } from '@/services/slack.service';
import { issueController } from '@/controllers';
import { SlackSlashCommand } from '@/types/slack';
import log from '@/lib/logger';

/**
 * POST /api/slack/commands
 * Handle Slack slash commands
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data (Slack sends as application/x-www-form-urlencoded)
    const formData = await request.formData();
    const command: SlackSlashCommand = {
      token: formData.get('token') as string,
      team_id: formData.get('team_id') as string,
      team_domain: formData.get('team_domain') as string,
      channel_id: formData.get('channel_id') as string,
      channel_name: formData.get('channel_name') as string,
      user_id: formData.get('user_id') as string,
      user_name: formData.get('user_name') as string,
      command: formData.get('command') as string,
      text: formData.get('text') as string,
      api_app_id: formData.get('api_app_id') as string,
      response_url: formData.get('response_url') as string,
      trigger_id: formData.get('trigger_id') as string,
    };

    log.info('Received Slack command', {
      command: command.command,
      text: command.text,
      user: command.user_name,
    });

    // Verify signing secret (in production)
    // const isValid = await verifySlackRequest(request, command.token);
    // if (!isValid) {
    //   return NextResponse.json({ text: 'Invalid request' }, { status: 401 });
    // }

    // Handle different commands
    if (command.command === '/issue') {
      return await handleIssueCommand(command);
    }

    return NextResponse.json({
      text: 'Unknown command',
    });
  } catch (error) {
    log.error('Error handling Slack command', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        text: 'An error occurred processing your command',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle /issue command
 */
async function handleIssueCommand(command: SlackSlashCommand) {
  const args = command.text.trim().split(' ');
  const subcommand = args[0]?.toLowerCase();

  switch (subcommand) {
    case 'list':
      return await handleIssueList(command);

    case 'create':
      return await handleIssueCreate(command, args.slice(1).join(' '));

    case 'help':
    case '':
      return NextResponse.json(slackService.buildSimpleResponse(
        `*Issue Tracker Commands*\n\n` +
        `• \`/issue list\` - List recent issues\n` +
        `• \`/issue create [title]\` - Create a new issue\n` +
        `• \`/issue help\` - Show this help message`
      ));

    default:
      return NextResponse.json(slackService.buildSimpleResponse(
        `Unknown subcommand: \`${subcommand}\`. Use \`/issue help\` for available commands.`
      ));
  }
}

/**
 * Handle /issue list
 */
async function handleIssueList(command: SlackSlashCommand) {
  try {
    // Get recent issues (limit to 10)
    const response = await issueController.getAll();

    if (!response.success || !response.data) {
      return NextResponse.json(slackService.buildSimpleResponse(
        'Failed to fetch issues'
      ));
    }

    const issues = response.data.slice(0, 10).map((issue: any) => ({
      id: issue.id,
      title: issue.title,
      status: issue.status,
      priority: issue.priority,
      project_name: issue.project?.name || 'Unknown Project',
    }));

    return NextResponse.json(slackService.buildIssueList(issues));
  } catch (error) {
    log.error('Error listing issues', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(slackService.buildSimpleResponse(
      'Failed to list issues. Please try again.'
    ));
  }
}

/**
 * Handle /issue create
 */
async function handleIssueCreate(command: SlackSlashCommand, title: string) {
  if (!title) {
    return NextResponse.json(slackService.buildSimpleResponse(
      'Please provide an issue title: `/issue create [title]`'
    ));
  }

  try {
    // For now, return a message saying this feature requires setup
    // In a full implementation, you'd need to:
    // 1. Map Slack user to your app user
    // 2. Have a default project or ask user to specify
    // 3. Create the issue

    return NextResponse.json(slackService.buildSimpleResponse(
      `To create issues from Slack, please:\n` +
      `1. Link your Slack account to Issue Tracker\n` +
      `2. Set a default project in your settings\n` +
      `3. Or create issues directly at ${process.env.NEXT_PUBLIC_APP_URL}/issues/new`
    ));
  } catch (error) {
    log.error('Error creating issue', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(slackService.buildSimpleResponse(
      'Failed to create issue. Please try again.'
    ));
  }
}
