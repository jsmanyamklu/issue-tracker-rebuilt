# Database Schema

## Overview

This document describes the complete database schema for the Issue Tracker application.

## Tables

### 1. users
Stores user account information from OAuth providers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | User unique identifier |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User email address |
| name | VARCHAR(255) | NOT NULL | User display name |
| avatar_url | TEXT | NULLABLE | URL to user's avatar image |
| provider | VARCHAR(50) | NOT NULL | OAuth provider (google/github) |
| provider_id | VARCHAR(255) | NOT NULL | Unique ID from OAuth provider |
| role | user_role | NOT NULL, DEFAULT 'developer' | User role for access control |
| created_at | TIMESTAMP | DEFAULT now() | Account creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

**Enums:**
- `user_role`: admin, manager, developer, viewer

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_provider` on `provider, provider_id`

**Constraints:**
- `UNIQUE(provider, provider_id)` - One account per OAuth provider

---

### 2. projects
Stores project information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Project unique identifier |
| name | VARCHAR(255) | NOT NULL | Project name |
| description | TEXT | NULLABLE | Project description |
| owner_id | UUID | NOT NULL, FK → users.id | Project creator/owner |
| due_date | TIMESTAMP | NULLABLE | Project deadline/target completion date |
| created_at | TIMESTAMP | DEFAULT now() | Project creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_projects_owner_id` on `owner_id`
- `idx_projects_name` on `name`
- `idx_projects_created_at` on `created_at DESC`
- `idx_projects_due_date` on `due_date`

**Foreign Keys:**
- `owner_id` → `users.id` (CASCADE on delete)

---

### 3. issues
Stores issues/tickets within projects.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Issue unique identifier |
| project_id | UUID | NOT NULL, FK → projects.id | Parent project |
| title | VARCHAR(500) | NOT NULL | Issue title |
| description | TEXT | NULLABLE | Detailed description |
| status | issue_status | NOT NULL, DEFAULT 'open' | Current status |
| priority | issue_priority | NOT NULL, DEFAULT 'medium' | Priority level |
| type | issue_type | NOT NULL, DEFAULT 'task' | Issue type |
| assignee_id | UUID | NULLABLE, FK → users.id | Assigned user |
| reporter_id | UUID | NOT NULL, FK → users.id | User who reported |
| due_date | TIMESTAMP | NULLABLE | Issue due date |
| created_at | TIMESTAMP | DEFAULT now() | Issue creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

**Enums:**
- `issue_status`: open, in_progress, resolved, closed
- `issue_priority`: low, medium, high, critical
- `issue_type`: bug, feature, task, improvement

**Indexes:**
- `idx_issues_project_id` on `project_id`
- `idx_issues_assignee_id` on `assignee_id`
- `idx_issues_reporter_id` on `reporter_id`
- `idx_issues_status` on `status`
- `idx_issues_priority` on `priority`
- `idx_issues_type` on `type`
- `idx_issues_created_at` on `created_at DESC`
- `idx_issues_updated_at` on `updated_at DESC`
- `idx_issues_project_status` on `project_id, status` (composite)
- `idx_issues_assignee_status` on `assignee_id, status` (composite, filtered)
- `idx_issues_search` - Full-text search on title + description (GIN index)

**Foreign Keys:**
- `project_id` → `projects.id` (CASCADE on delete)
- `assignee_id` → `users.id` (SET NULL on delete)
- `reporter_id` → `users.id` (CASCADE on delete)

---

### 4. comments
Stores comments on issues.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Comment unique identifier |
| issue_id | UUID | NOT NULL, FK → issues.id | Parent issue |
| user_id | UUID | NOT NULL, FK → users.id | Comment author |
| content | TEXT | NOT NULL | Comment text content |
| created_at | TIMESTAMP | DEFAULT now() | Comment creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_comments_issue_id` on `issue_id`
- `idx_comments_user_id` on `user_id`
- `idx_comments_created_at` on `created_at DESC`

**Foreign Keys:**
- `issue_id` → `issues.id` (CASCADE on delete)
- `user_id` → `users.id` (CASCADE on delete)

**Constraints:**
- `check_content_not_empty` - Content must not be empty

---

### 5. issue_embeddings
Stores vector embeddings for AI similarity search.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Embedding unique identifier |
| issue_id | UUID | NOT NULL, UNIQUE, FK → issues.id | Related issue |
| embedding | FLOAT8[] | NOT NULL | Vector embedding array |
| model | VARCHAR(100) | NOT NULL, DEFAULT 'text-embedding-ada-002' | Embedding model used |
| created_at | TIMESTAMP | DEFAULT now() | Embedding creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_issue_embeddings_issue_id` on `issue_id`

**Foreign Keys:**
- `issue_id` → `issues.id` (CASCADE on delete)

---

### 6. activity_logs
Stores comprehensive audit trail of all system activities.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Activity log unique identifier |
| user_id | UUID | NULLABLE, FK → users.id | User who performed the action |
| action_type | VARCHAR(100) | NOT NULL | Type of action performed |
| resource_type | VARCHAR(50) | NOT NULL | Type of resource affected |
| resource_id | UUID | NOT NULL | ID of affected resource |
| details | JSONB | DEFAULT '{}' | Additional context and metadata |
| ip_address | VARCHAR(45) | NULLABLE | IP address of user |
| user_agent | TEXT | NULLABLE | Browser/client user agent |
| created_at | TIMESTAMP | DEFAULT now() | Activity timestamp |

**Action Types:**
- Issue: `issue_created`, `issue_updated`, `issue_status_changed`, `issue_assigned`, `issue_deleted`
- Project: `project_created`, `project_updated`, `project_deleted`
- Comment: `comment_created`, `comment_updated`, `comment_deleted`

**Indexes:**
- `idx_activity_logs_user_id` on `user_id`
- `idx_activity_logs_action_type` on `action_type`
- `idx_activity_logs_created_at` on `created_at DESC`
- `idx_activity_logs_resource` on `resource_type, resource_id` (composite)
- `idx_activity_logs_user_action` on `user_id, action_type` (composite)

**Foreign Keys:**
- `user_id` → `users.id` (SET NULL on delete)

---

## Relationships

```
users (1) ──────< (N) projects (owner_id)
users (1) ──────< (N) issues (reporter_id)
users (1) ──────< (N) issues (assignee_id, optional)
users (1) ──────< (N) comments (user_id)

projects (1) ───< (N) issues (project_id)

issues (1) ─────< (N) comments (issue_id)
issues (1) ─────< (1) issue_embeddings (issue_id, optional)
```

## Automatic Triggers

All tables have an `update_updated_at_column()` trigger that automatically updates the `updated_at` timestamp on any UPDATE operation.

## Full-Text Search

The `issues` table includes a GIN index for full-text search on the combined `title` and `description` fields using PostgreSQL's `to_tsvector` function with English language support.

## Migration Tracking

A special `migrations` table tracks executed migration files:

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Auto-incrementing ID |
| filename | VARCHAR(255) | Migration filename |
| executed_at | TIMESTAMP | Execution timestamp |

---

## Design Decisions

1. **UUIDs over integers**: Better for distributed systems and prevents enumeration attacks
2. **Timestamps with timezone**: Consistent time handling across different regions
3. **Enums for constrained values**: Type safety and validation at database level
4. **Composite indexes**: Optimize common query patterns (project + status, assignee + status)
5. **Full-text search**: Enable fast search without external search engines
6. **Cascade deletes**: Maintain referential integrity automatically
7. **Vector embeddings**: Support AI-powered similarity search with float arrays
