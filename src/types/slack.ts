// ==================== Slack Message Types ====================

export interface SlackMessage {
  text?: string;
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
  thread_ts?: string;
  channel?: string;
}

export interface SlackBlock {
  type: string;
  text?: SlackText;
  elements?: SlackElement[];
  accessory?: SlackElement;
  fields?: SlackText[];
}

export interface SlackText {
  type: 'plain_text' | 'mrkdwn';
  text: string;
  emoji?: boolean;
}

export interface SlackElement {
  type: string;
  text?: SlackText;
  value?: string;
  url?: string;
  action_id?: string;
  style?: 'primary' | 'danger';
}

export interface SlackAttachment {
  color?: string;
  blocks?: SlackBlock[];
}

// ==================== Slash Command Types ====================

export interface SlackSlashCommand {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  api_app_id: string;
  response_url: string;
  trigger_id: string;
}

// ==================== Interactive Message Types ====================

export interface SlackInteraction {
  type: 'block_actions' | 'view_submission';
  user: {
    id: string;
    username: string;
    name: string;
  };
  api_app_id: string;
  token: string;
  container: {
    type: string;
    message_ts: string;
    channel_id: string;
  };
  trigger_id: string;
  team: {
    id: string;
    domain: string;
  };
  channel: {
    id: string;
    name: string;
  };
  message?: {
    type: string;
    ts: string;
    text: string;
  };
  response_url: string;
  actions?: SlackAction[];
  view?: SlackView;
}

export interface SlackAction {
  type: string;
  action_id: string;
  block_id: string;
  value: string;
  action_ts: string;
}

export interface SlackView {
  id: string;
  type: string;
  title: SlackText;
  blocks: SlackBlock[];
  state: {
    values: Record<string, Record<string, { type: string; value: string }>>;
  };
}

// ==================== Event Types ====================

export interface SlackEvent {
  token: string;
  team_id: string;
  api_app_id: string;
  event: {
    type: string;
    user?: string;
    text?: string;
    ts: string;
    channel?: string;
    event_ts: string;
  };
  type: 'url_verification' | 'event_callback';
  challenge?: string;
  event_id: string;
  event_time: number;
}

// ==================== Link Unfurling Types ====================

export interface SlackLinkUnfurlingEvent {
  type: 'link_shared';
  user: string;
  channel: string;
  message_ts: string;
  links: Array<{
    domain: string;
    url: string;
  }>;
}

export interface SlackUnfurl {
  [url: string]: {
    color?: string;
    title?: string;
    title_link?: string;
    text?: string;
    fields?: Array<{
      title: string;
      value: string;
      short: boolean;
    }>;
    footer?: string;
    ts?: number;
  };
}

// ==================== Notification Types ====================

export interface SlackNotificationConfig {
  channel: string;
  userId?: string;
  threadTs?: string;
}

export interface IssueNotification {
  type: 'created' | 'assigned' | 'status_changed' | 'commented';
  issue: {
    id: string;
    title: string;
    status: string;
    priority: string;
    type: string;
    project_name: string;
  };
  actor: {
    name: string;
    email: string;
  };
  oldValue?: string;
  newValue?: string;
  comment?: string;
}
