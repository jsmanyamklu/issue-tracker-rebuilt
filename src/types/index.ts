// ==================== Database Models ====================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  provider: 'google' | 'github';
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Issue {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  type: IssueType;
  assignee_id?: string;
  reporter_id: string;
  due_date?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Comment {
  id: string;
  issue_id: string;
  user_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

// ==================== Enums ====================

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  DEVELOPER = 'developer',
  VIEWER = 'viewer',
}

export enum IssueStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum IssuePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum IssueType {
  BUG = 'bug',
  FEATURE = 'feature',
  TASK = 'task',
  IMPROVEMENT = 'improvement',
}

// ==================== DTOs (Data Transfer Objects) ====================

export interface CreateProjectDTO {
  name: string;
  description?: string;
  owner_id: string;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
}

export interface CreateIssueDTO {
  project_id: string;
  title: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  type?: IssueType;
  assignee_id?: string;
  reporter_id: string;
  due_date?: string;
}

export interface UpdateIssueDTO {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  type?: IssueType;
  assignee_id?: string;
  due_date?: string;
}

export interface CreateCommentDTO {
  issue_id: string;
  user_id: string;
  content: string;
}

export interface UpdateUserRoleDTO {
  role: UserRole;
}

// ==================== Extended Types (with relations) ====================

export interface ProjectWithOwner extends Project {
  owner: Pick<User, 'id' | 'name' | 'email' | 'avatar_url'>;
}

export interface IssueWithRelations extends Issue {
  project: Pick<Project, 'id' | 'name'>;
  assignee?: Pick<User, 'id' | 'name' | 'email' | 'avatar_url'>;
  reporter: Pick<User, 'id' | 'name' | 'email' | 'avatar_url'>;
}

export interface CommentWithUser extends Comment {
  user: Pick<User, 'id' | 'name' | 'avatar_url'>;
}

// ==================== Filter Types ====================

export interface IssueFilters {
  project_id?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  type?: IssueType;
  assignee_id?: string;
  reporter_id?: string;
  user_id?: string; // For filtering issues where user is either assignee or reporter
}

// ==================== AI Types ====================

export interface IssueClassification {
  type: IssueType;
  priority: IssuePriority;
  confidence: number;
  reasoning: string;
}

export interface RootCauseAnalysis {
  likely_cause: string;
  suggested_fixes: string[];
  related_components: string[];
  confidence: number;
}

export interface SimilarIssue {
  issue: Issue;
  similarity_score: number;
  matching_aspects: string[];
}

// ==================== Activity Log Types ====================

export interface ActivityLog {
  id: string;
  user_id?: string;
  action_type: ActivityActionType;
  resource_type: ResourceType;
  resource_id: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface ActivityLogWithUser extends ActivityLog {
  user?: Pick<User, 'id' | 'name' | 'email' | 'avatar_url'>;
}

export enum ActivityActionType {
  // Issue actions
  ISSUE_CREATED = 'issue_created',
  ISSUE_UPDATED = 'issue_updated',
  ISSUE_DELETED = 'issue_deleted',
  ISSUE_STATUS_CHANGED = 'issue_status_changed',
  ISSUE_ASSIGNED = 'issue_assigned',
  ISSUE_UNASSIGNED = 'issue_unassigned',
  ISSUE_PRIORITY_CHANGED = 'issue_priority_changed',
  ISSUE_DUE_DATE_SET = 'issue_due_date_set',
  ISSUE_DUE_DATE_CHANGED = 'issue_due_date_changed',

  // Project actions
  PROJECT_CREATED = 'project_created',
  PROJECT_UPDATED = 'project_updated',
  PROJECT_DELETED = 'project_deleted',

  // Comment actions
  COMMENT_CREATED = 'comment_created',
  COMMENT_UPDATED = 'comment_updated',
  COMMENT_DELETED = 'comment_deleted',

  // User actions
  USER_LOGGED_IN = 'user_logged_in',
  USER_LOGGED_OUT = 'user_logged_out',
  USER_ROLE_CHANGED = 'user_role_changed',

  // System actions
  SYSTEM_MIGRATION = 'system_migration',
  SYSTEM_ERROR = 'system_error',
}

export enum ResourceType {
  ISSUE = 'issue',
  PROJECT = 'project',
  COMMENT = 'comment',
  USER = 'user',
  DATABASE = 'database',
  SYSTEM = 'system',
}

export interface CreateActivityLogDTO {
  user_id?: string;
  action_type: ActivityActionType;
  resource_type: ResourceType;
  resource_id: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export interface ActivityLogFilters {
  user_id?: string;
  action_type?: ActivityActionType;
  resource_type?: ResourceType;
  resource_id?: string;
  start_date?: Date;
  end_date?: Date;
  limit?: number;
  offset?: number;
}

// ==================== AI Analytics Types ====================

export interface ActivityInsights {
  summary: InsightSummary;
  patterns: ActivityPattern[];
  predictions: Prediction[];
  recommendations: Recommendation[];
  generated_at: Date;
}

export interface InsightSummary {
  total_actions: number;
  active_users: number;
  most_common_action: string;
  busiest_hour: number;
  busiest_day: string;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface ActivityPattern {
  pattern_type: string;
  description: string;
  frequency: number;
  impact: 'high' | 'medium' | 'low';
  affected_resources: string[];
}

export interface Prediction {
  prediction_type: string;
  description: string;
  confidence: number;
  timeframe: string;
  affected_items: string[];
}

export interface Recommendation {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action_items: string[];
}

export interface AnalyticsMetrics {
  issue_metrics: IssueMetrics;
  user_metrics: UserMetrics;
  project_metrics: ProjectMetrics;
  performance_metrics: PerformanceMetrics;
}

export interface IssueMetrics {
  total_issues: number;
  open_issues: number;
  in_progress_issues: number;
  resolved_issues: number;
  closed_issues: number;
  overdue_issues: number;
  average_resolution_time_hours: number;
  issues_by_priority: Record<IssuePriority, number>;
  issues_by_type: Record<IssueType, number>;
  issue_velocity: number; // issues resolved per day
}

export interface UserMetrics {
  total_users: number;
  active_users_last_7_days: number;
  active_users_last_30_days: number;
  most_active_users: Array<{
    user_id: string;
    user_name: string;
    action_count: number;
  }>;
  top_resolvers: Array<{
    user_id: string;
    user_name: string;
    resolved_count: number;
    average_resolution_hours: number;
  }>;
}

export interface ProjectMetrics {
  total_projects: number;
  active_projects: number;
  projects_with_overdue_issues: number;
  project_health_scores: Array<{
    project_id: string;
    project_name: string;
    health_score: number; // 0-100
    open_issues: number;
    overdue_issues: number;
  }>;
}

export interface PerformanceMetrics {
  average_time_to_assign_hours: number;
  average_time_to_first_response_hours: number;
  average_time_in_progress_hours: number;
  reassignment_rate: number; // percentage of issues that get reassigned
  bottlenecks: Array<{
    stage: string;
    average_time_hours: number;
    issue_count: number;
  }>;
}

// ==================== Response Types ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
