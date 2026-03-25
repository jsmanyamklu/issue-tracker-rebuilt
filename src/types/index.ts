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
