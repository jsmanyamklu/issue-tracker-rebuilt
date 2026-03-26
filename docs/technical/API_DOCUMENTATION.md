# TaskForge - API Documentation

**Last Updated:** March 25, 2026
**Version:** 1.0.0

Complete REST API reference for TaskForge issue tracking system.

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [Issues API](#issues-api)
6. [Projects API](#projects-api)
7. [Comments API](#comments-api)
8. [Users API](#users-api)
9. [Admin API](#admin-api)
10. [Dashboard API](#dashboard-api)
11. [Examples](#examples)

---

## 🎯 Overview

### Base URL

```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
```

### API Characteristics

- **Protocol**: REST over HTTPS (production)
- **Format**: JSON request/response
- **Authentication**: Session-based via NextAuth.js
- **Authorization**: Role-Based Access Control (RBAC)
- **Versioning**: Not yet implemented (planned for v2)

### Rate Limiting

**Current**: No rate limiting
**Future**: 100 requests per minute per user

---

## 🔐 Authentication

All API endpoints require authentication via NextAuth session cookies.

### Authentication Flow

1. User signs in via OAuth (GitHub/Google)
2. Session cookie is set automatically
3. Include session cookie in all API requests
4. Session expires after 30 days

### Session Check

**Endpoint**: `GET /api/auth/session`

**Response**:
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://avatar.url",
    "role": "user"
  },
  "expires": "2026-04-25T00:00:00.000Z"
}
```

### Sign Out

**Endpoint**: `GET /api/auth/signout`

**Response**: Redirects to sign-in page

---

## 📤 Response Format

### Success Response

All successful responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### List Response

```json
{
  "success": true,
  "data": [ ... ],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Description | Example |
|------|-------------|---------|
| 200 | OK | Successful request |
| 201 | Created | Resource created |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 500 | Internal Server Error | Server error |

### Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Not authenticated |
| `FORBIDDEN` | No permission |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Input validation failed |
| `DUPLICATE_ENTRY` | Resource already exists |
| `DATABASE_ERROR` | Database operation failed |

---

## 🎯 Issues API

### List Issues

**Endpoint**: `GET /api/issues`

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (`open`, `in_progress`, `resolved`, `closed`) |
| `priority` | string | Filter by priority (`low`, `medium`, `high`, `critical`) |
| `type` | string | Filter by type (`bug`, `feature`, `task`, `improvement`) |
| `project_id` | string (UUID) | Filter by project |
| `assignee_id` | string (UUID) | Filter by assignee |
| `reporter_id` | string (UUID) | Filter by reporter |
| `scope` | string | Filter scope (`all`, `assigned`, `reported`, `mine`) - Admin/Manager only |
| `overdue` | boolean | Show only overdue issues |
| `search` | string | Search in title and description |

**Response**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "project_id": "223e4567-e89b-12d3-a456-426614174000",
      "title": "Login button not working",
      "description": "When users click the login button, nothing happens",
      "status": "open",
      "priority": "high",
      "type": "bug",
      "assignee_id": "323e4567-e89b-12d3-a456-426614174000",
      "reporter_id": "423e4567-e89b-12d3-a456-426614174000",
      "due_date": "2026-04-01T00:00:00.000Z",
      "is_overdue": false,
      "days_overdue": 0,
      "created_at": "2026-03-01T10:30:00.000Z",
      "updated_at": "2026-03-15T14:45:00.000Z",
      "project": {
        "id": "223e4567-e89b-12d3-a456-426614174000",
        "name": "Web Application"
      },
      "assignee": {
        "id": "323e4567-e89b-12d3-a456-426614174000",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "image": "https://avatar.url"
      },
      "reporter": {
        "id": "423e4567-e89b-12d3-a456-426614174000",
        "name": "John Doe",
        "email": "john@example.com",
        "image": "https://avatar.url"
      },
      "comment_count": 5
    }
  ]
}
```

### Get Issue by ID

**Endpoint**: `GET /api/issues/:id`

**URL Parameters**:
- `id` (UUID, required) - Issue ID

**Response**: `200 OK` or `404 Not Found`

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "project_id": "223e4567-e89b-12d3-a456-426614174000",
    "title": "Login button not working",
    "description": "Detailed description of the issue...",
    "status": "open",
    "priority": "high",
    "type": "bug",
    "assignee_id": "323e4567-e89b-12d3-a456-426614174000",
    "reporter_id": "423e4567-e89b-12d3-a456-426614174000",
    "due_date": "2026-04-01T00:00:00.000Z",
    "is_overdue": false,
    "days_overdue": 0,
    "created_at": "2026-03-01T10:30:00.000Z",
    "updated_at": "2026-03-15T14:45:00.000Z",
    "project": { ... },
    "assignee": { ... },
    "reporter": { ... },
    "comments": [ ... ]
  }
}
```

### Create Issue

**Endpoint**: `POST /api/issues`

**Request Body**:
```json
{
  "project_id": "223e4567-e89b-12d3-a456-426614174000",
  "title": "Login button not working",
  "description": "When users click the login button, nothing happens",
  "status": "open",
  "priority": "high",
  "type": "bug",
  "assignee_id": "323e4567-e89b-12d3-a456-426614174000",
  "due_date": "2026-04-01"
}
```

**Required Fields**:
- `project_id` (UUID)
- `title` (string, min 3 characters)

**Optional Fields**:
- `description` (string)
- `status` (string, default: `open`)
- `priority` (string, default: `medium`)
- `type` (string, default: `task`)
- `assignee_id` (UUID, nullable)
- `due_date` (ISO date, cannot be in the past)

**Validation Rules**:
- Title must be at least 3 characters
- Due date cannot be in the past (on creation)
- Project must exist
- Assignee must exist (if provided)

**Response**: `201 Created`

```json
{
  "success": true,
  "data": { ... },
  "message": "Issue created successfully"
}
```

### Update Issue

**Endpoint**: `PUT /api/issues/:id`

**URL Parameters**:
- `id` (UUID, required) - Issue ID

**Request Body**: (all fields optional)
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "critical",
  "type": "feature",
  "assignee_id": "323e4567-e89b-12d3-a456-426614174000",
  "due_date": "2026-05-01"
}
```

**Permissions**:
- User: Can edit own issues (reporter or assignee)
- Manager: Can edit any issue
- Admin: Can edit any issue

**Response**: `200 OK` or `403 Forbidden`

```json
{
  "success": true,
  "data": { ... },
  "message": "Issue updated successfully"
}
```

### Delete Issue

**Endpoint**: `DELETE /api/issues/:id`

**URL Parameters**:
- `id` (UUID, required) - Issue ID

**Permissions**:
- User: Can delete own issues (reporter)
- Manager: Can delete any issue
- Admin: Can delete any issue

**Response**: `200 OK` or `403 Forbidden`

```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

### Get Issue Statistics

**Endpoint**: `GET /api/issues/stats`

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `project_id` | string (UUID) | Filter by project |
| `user_id` | string (UUID) | Filter by user (assigned/reported) |

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "total": 50,
    "assigned_to_me": 10,
    "reported_by_me": 5,
    "open": 15,
    "in_progress": 8,
    "resolved": 12,
    "closed": 15,
    "overdue": 3,
    "by_priority": {
      "low": 10,
      "medium": 20,
      "high": 15,
      "critical": 5
    },
    "by_type": {
      "bug": 20,
      "feature": 15,
      "task": 10,
      "improvement": 5
    }
  }
}
```

---

## 📁 Projects API

### List Projects

**Endpoint**: `GET /api/projects`

**Query Parameters**: None

**Response**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "223e4567-e89b-12d3-a456-426614174000",
      "name": "Web Application",
      "description": "Main web application project",
      "owner_id": "423e4567-e89b-12d3-a456-426614174000",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-03-01T00:00:00.000Z",
      "owner": {
        "id": "423e4567-e89b-12d3-a456-426614174000",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "issue_count": 25,
      "open_issues": 10,
      "overdue_issues": 2
    }
  ]
}
```

### Get Project by ID

**Endpoint**: `GET /api/projects/:id`

**URL Parameters**:
- `id` (UUID, required) - Project ID

**Response**: `200 OK` or `404 Not Found`

```json
{
  "success": true,
  "data": {
    "id": "223e4567-e89b-12d3-a456-426614174000",
    "name": "Web Application",
    "description": "Main web application project",
    "owner_id": "423e4567-e89b-12d3-a456-426614174000",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-03-01T00:00:00.000Z",
    "owner": { ... },
    "stats": {
      "total": 25,
      "open": 10,
      "in_progress": 5,
      "resolved": 7,
      "closed": 3,
      "overdue": 2
    }
  }
}
```

### Create Project

**Endpoint**: `POST /api/projects`

**Request Body**:
```json
{
  "name": "New Project",
  "description": "Project description",
  "owner_id": "423e4567-e89b-12d3-a456-426614174000"
}
```

**Required Fields**:
- `name` (string, min 3 characters)

**Optional Fields**:
- `description` (string)
- `owner_id` (UUID, defaults to current user)

**Response**: `201 Created`

```json
{
  "success": true,
  "data": { ... },
  "message": "Project created successfully"
}
```

### Update Project

**Endpoint**: `PUT /api/projects/:id`

**URL Parameters**:
- `id` (UUID, required) - Project ID

**Request Body**: (all fields optional)
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "owner_id": "523e4567-e89b-12d3-a456-426614174000"
}
```

**Permissions**:
- User: Can edit own projects (owner)
- Manager: Can edit own projects
- Admin: Can edit any project

**Response**: `200 OK` or `403 Forbidden`

### Delete Project

**Endpoint**: `DELETE /api/projects/:id`

**URL Parameters**:
- `id` (UUID, required) - Project ID

**Permissions**:
- User: Can delete own projects (owner)
- Manager: Can delete own projects
- Admin: Can delete any project

**Note**: Deleting a project will also delete all associated issues and comments.

**Response**: `200 OK` or `403 Forbidden`

```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

### Get Project Issues

**Endpoint**: `GET /api/projects/:id/issues`

**URL Parameters**:
- `id` (UUID, required) - Project ID

**Query Parameters**: Same as [List Issues](#list-issues)

**Response**: `200 OK`

```json
{
  "success": true,
  "data": [ ... ]
}
```

---

## 💬 Comments API

### Get Issue Comments

**Endpoint**: `GET /api/issues/:issueId/comments`

**URL Parameters**:
- `issueId` (UUID, required) - Issue ID

**Response**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "623e4567-e89b-12d3-a456-426614174000",
      "issue_id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "423e4567-e89b-12d3-a456-426614174000",
      "content": "This is a comment on the issue",
      "created_at": "2026-03-10T15:30:00.000Z",
      "updated_at": "2026-03-10T15:30:00.000Z",
      "user": {
        "id": "423e4567-e89b-12d3-a456-426614174000",
        "name": "John Doe",
        "email": "john@example.com",
        "image": "https://avatar.url",
        "role": "user"
      }
    }
  ]
}
```

### Create Comment

**Endpoint**: `POST /api/issues/:issueId/comments`

**URL Parameters**:
- `issueId` (UUID, required) - Issue ID

**Request Body**:
```json
{
  "content": "This is a new comment"
}
```

**Required Fields**:
- `content` (string, min 1 character)

**Response**: `201 Created`

```json
{
  "success": true,
  "data": { ... },
  "message": "Comment added successfully"
}
```

### Get Comment by ID

**Endpoint**: `GET /api/comments/:id`

**URL Parameters**:
- `id` (UUID, required) - Comment ID

**Response**: `200 OK` or `404 Not Found`

### Update Comment

**Endpoint**: `PUT /api/comments/:id`

**URL Parameters**:
- `id` (UUID, required) - Comment ID

**Request Body**:
```json
{
  "content": "Updated comment text"
}
```

**Permissions**:
- User: Can edit own comments
- Manager: Can edit any comment
- Admin: Can edit any comment

**Response**: `200 OK` or `403 Forbidden`

### Delete Comment

**Endpoint**: `DELETE /api/comments/:id`

**URL Parameters**:
- `id` (UUID, required) - Comment ID

**Permissions**:
- User: Can delete own comments
- Manager: Can delete any comment
- Admin: Can delete any comment

**Response**: `200 OK` or `403 Forbidden`

```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

---

## 👥 Users API

### List Users

**Endpoint**: `GET /api/users`

**Query Parameters**: None

**Response**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "423e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john@example.com",
      "image": "https://avatar.url",
      "role": "user",
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Current User

**Endpoint**: `GET /api/users/me`

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "423e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://avatar.url",
    "role": "user",
    "created_at": "2026-01-01T00:00:00.000Z",
    "stats": {
      "assigned_issues": 10,
      "reported_issues": 5,
      "projects_owned": 2,
      "comments_made": 25
    }
  }
}
```

### Get User by ID

**Endpoint**: `GET /api/users/:id`

**URL Parameters**:
- `id` (UUID, required) - User ID

**Response**: `200 OK` or `404 Not Found`

```json
{
  "success": true,
  "data": {
    "id": "423e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://avatar.url",
    "role": "user",
    "created_at": "2026-01-01T00:00:00.000Z"
  }
}
```

### Update User

**Endpoint**: `PUT /api/users/:id`

**URL Parameters**:
- `id` (UUID, required) - User ID

**Request Body**: (all fields optional)
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

**Permissions**:
- User: Can edit own profile
- Admin: Can edit any profile

**Note**: Only Admin can change roles via Admin API

**Response**: `200 OK` or `403 Forbidden`

---

## 👨‍💼 Admin API

**Note**: All Admin API endpoints require `admin` role.

### List All Users (Admin)

**Endpoint**: `GET /api/admin/users`

**Response**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "423e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john@example.com",
      "image": "https://avatar.url",
      "role": "user",
      "created_at": "2026-01-01T00:00:00.000Z",
      "last_login": "2026-03-25T10:00:00.000Z",
      "stats": {
        "assigned_issues": 10,
        "reported_issues": 5,
        "projects_owned": 2,
        "comments_made": 25
      }
    }
  ]
}
```

### Update User Role

**Endpoint**: `PUT /api/admin/users/:id/role`

**URL Parameters**:
- `id` (UUID, required) - User ID

**Request Body**:
```json
{
  "role": "manager"
}
```

**Allowed Roles**:
- `user` - Standard user
- `manager` - Team manager
- `admin` - System administrator

**Response**: `200 OK` or `403 Forbidden`

```json
{
  "success": true,
  "data": { ... },
  "message": "User role updated successfully"
}
```

### Get System Statistics

**Endpoint**: `GET /api/admin/stats`

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 50,
      "admins": 2,
      "managers": 5,
      "users": 43
    },
    "projects": {
      "total": 10,
      "active": 8
    },
    "issues": {
      "total": 150,
      "open": 40,
      "in_progress": 30,
      "resolved": 50,
      "closed": 30,
      "overdue": 5
    },
    "activity": {
      "issues_created_today": 5,
      "comments_added_today": 12,
      "issues_closed_today": 3
    }
  }
}
```

### Send Overdue Notifications

**Endpoint**: `POST /api/admin/notifications/overdue`

**Request Body**: (all fields optional)
```json
{
  "channel": "both",
  "priority_filter": "high"
}
```

**Parameters**:
- `channel` (string): `email`, `slack`, or `both` (default: `both`)
- `priority_filter` (string): Filter by priority level (optional)

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "overdue_count": 5,
    "notifications_sent": {
      "email": 5,
      "slack": 1
    },
    "issues": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Login button not working",
        "assignee": "Jane Smith",
        "days_overdue": 3
      }
    ]
  },
  "message": "Overdue notifications sent successfully"
}
```

---

## 📊 Dashboard API

### Get Dashboard Summary

**Endpoint**: `GET /api/dashboard`

**Description**: Returns personalized dashboard data for the current user

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "stats": {
      "assigned_to_me": 10,
      "reported_by_me": 5,
      "open_issues": 15,
      "closed_issues": 8,
      "overdue_issues": 2
    },
    "recent_issues": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Login button not working",
        "status": "open",
        "priority": "high",
        "project": "Web Application",
        "created_at": "2026-03-20T10:00:00.000Z"
      }
    ],
    "recent_projects": [
      {
        "id": "223e4567-e89b-12d3-a456-426614174000",
        "name": "Web Application",
        "issue_count": 25,
        "open_issues": 10
      }
    ]
  }
}
```

---

## 💻 Examples

### JavaScript (fetch)

#### Get All Issues
```javascript
const response = await fetch('/api/issues');
const { data } = await response.json();
console.log(data);
```

#### Create Issue
```javascript
const response = await fetch('/api/issues', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    project_id: '223e4567-e89b-12d3-a456-426614174000',
    title: 'New Bug Report',
    description: 'Detailed bug description',
    priority: 'high',
    type: 'bug',
    due_date: '2026-04-15',
  }),
});

const { data } = await response.json();
console.log('Created issue:', data);
```

#### Update Issue Status
```javascript
const issueId = '123e4567-e89b-12d3-a456-426614174000';
const response = await fetch(`/api/issues/${issueId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    status: 'in_progress',
  }),
});

const { data } = await response.json();
console.log('Updated issue:', data);
```

#### Filter Issues
```javascript
const params = new URLSearchParams({
  status: 'open',
  priority: 'high',
  overdue: 'true',
});

const response = await fetch(`/api/issues?${params}`);
const { data } = await response.json();
console.log('Filtered issues:', data);
```

#### Add Comment
```javascript
const issueId = '123e4567-e89b-12d3-a456-426614174000';
const response = await fetch(`/api/issues/${issueId}/comments`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: 'This is my comment on the issue',
  }),
});

const { data } = await response.json();
console.log('Comment added:', data);
```

### cURL

#### Get All Projects
```bash
curl http://localhost:3000/api/projects \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

#### Create Project
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "name": "New Project",
    "description": "Project description"
  }'
```

#### Get Overdue Issues
```bash
curl "http://localhost:3000/api/issues?overdue=true&priority=high" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

#### Send Overdue Notifications (Admin)
```bash
curl -X POST http://localhost:3000/api/admin/notifications/overdue \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "channel": "both",
    "priority_filter": "high"
  }'
```

### TypeScript (with type safety)

```typescript
// types/api.ts
interface Issue {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'bug' | 'feature' | 'task' | 'improvement';
  project_id: string;
  assignee_id?: string;
  reporter_id: string;
  due_date?: string;
  is_overdue: boolean;
  days_overdue: number;
  created_at: string;
  updated_at: string;
}

interface CreateIssueDTO {
  project_id: string;
  title: string;
  description?: string;
  status?: Issue['status'];
  priority?: Issue['priority'];
  type?: Issue['type'];
  assignee_id?: string;
  due_date?: string;
}

// api/issueService.ts
async function createIssue(data: CreateIssueDTO): Promise<Issue> {
  const response = await fetch('/api/issues', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create issue');
  }

  const result = await response.json();
  return result.data;
}
```

---

## 🔄 Pagination

**Status**: Not yet implemented

**Planned Implementation**:
```
GET /api/issues?page=1&pageSize=20
```

**Planned Response**:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

## 🚀 Future Enhancements

### Phase 2
- Pagination for large result sets
- Rate limiting (100 req/min per user)
- API versioning (`/api/v1/...`)
- Bulk operations
- Advanced search with filters
- Webhook support

### Phase 3
- GraphQL API
- WebSocket for real-time updates
- File upload for attachments
- Export data (CSV, PDF)
- API analytics dashboard
- Public API with tokens

---

## 📚 Related Documentation

- **[README.md](README.md)** - Project overview
- **[FEATURES.md](FEATURES.md)** - Complete feature list
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture
- **[USER_GUIDE.md](USER_GUIDE.md)** - End-user guide
- **[RBAC-SYSTEM.md](RBAC-SYSTEM.md)** - Access control details

---

**For API support, report issues at: https://github.com/your-org/taskforge/issues**

*Last updated: March 25, 2026*
