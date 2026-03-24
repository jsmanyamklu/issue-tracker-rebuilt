# API Documentation

Complete REST API documentation for the Issue Tracker application.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API endpoints require authentication via NextAuth session. Include the session cookie in all requests.

## Response Format

All endpoints return JSON in the following format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Projects

### Get All Projects

```
GET /api/projects
```

**Query Parameters:**
- `includeOwner` (boolean, optional) - Include owner information

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Project Name",
      "description": "Description",
      "owner_id": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Project by ID

```
GET /api/projects/:id
```

**Query Parameters:**
- `includeOwner` (boolean, optional) - Include owner information

**Response:** `200 OK` or `404 Not Found`

### Create Project

```
POST /api/projects
```

**Body:**

```json
{
  "name": "Project Name",
  "description": "Optional description"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": { ... },
  "message": "Project created successfully"
}
```

### Update Project

```
PUT /api/projects/:id
```

**Body:**

```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response:** `200 OK` or `403 Forbidden` (if not owner)

### Delete Project

```
DELETE /api/projects/:id
```

**Response:** `200 OK` or `403 Forbidden` (if not owner)

### Get Project Issues

```
GET /api/projects/:id/issues
```

**Response:** `200 OK`

---

## Issues

### Get All Issues

```
GET /api/issues
```

**Query Parameters (all optional):**
- `project_id` (string) - Filter by project
- `status` (string) - Filter by status: `open`, `in_progress`, `resolved`, `closed`
- `priority` (string) - Filter by priority: `low`, `medium`, `high`, `critical`
- `type` (string) - Filter by type: `bug`, `feature`, `task`, `improvement`
- `assignee_id` (string) - Filter by assignee
- `reporter_id` (string) - Filter by reporter

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "title": "Issue Title",
      "description": "Description",
      "status": "open",
      "priority": "high",
      "type": "bug",
      "assignee_id": "uuid",
      "reporter_id": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "project": {
        "id": "uuid",
        "name": "Project Name"
      },
      "assignee": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar_url": "..."
      },
      "reporter": {
        "id": "uuid",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "avatar_url": "..."
      }
    }
  ]
}
```

### Get Issue by ID

```
GET /api/issues/:id
```

**Response:** `200 OK` or `404 Not Found`

### Create Issue

```
POST /api/issues
```

**Body:**

```json
{
  "project_id": "uuid",
  "title": "Issue Title",
  "description": "Detailed description",
  "status": "open",
  "priority": "medium",
  "type": "bug",
  "assignee_id": "uuid (optional)"
}
```

**Response:** `201 Created`

### Update Issue

```
PUT /api/issues/:id
```

**Body:**

```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "high",
  "type": "feature",
  "assignee_id": "uuid"
}
```

All fields are optional.

**Response:** `200 OK`

### Delete Issue

```
DELETE /api/issues/:id
```

Only project owner or issue reporter can delete.

**Response:** `200 OK` or `403 Forbidden`

### Assign Issue

```
POST /api/issues/:id/assign
```

**Body:**

```json
{
  "assignee_id": "uuid"
}
```

**Response:** `200 OK`

### Search Issues

```
GET /api/issues/search?q=search+term
```

**Query Parameters:**
- `q` (string, required) - Search term

Uses PostgreSQL full-text search on title and description.

**Response:** `200 OK`

### Get Issue Statistics

```
GET /api/issues/stats
```

**Query Parameters:**
- `project_id` (string, optional) - Filter by project

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "byStatus": {
      "open": 10,
      "in_progress": 5,
      "resolved": 15,
      "closed": 20
    },
    "byPriority": {
      "low": 5,
      "medium": 20,
      "high": 15,
      "critical": 10
    }
  }
}
```

---

## Comments

### Get Issue Comments

```
GET /api/issues/:id/comments
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "issue_id": "uuid",
      "user_id": "uuid",
      "content": "Comment text",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "avatar_url": "..."
      }
    }
  ]
}
```

### Create Comment

```
POST /api/issues/:id/comments
```

**Body:**

```json
{
  "content": "Comment text"
}
```

**Response:** `201 Created`

### Get Comment by ID

```
GET /api/comments/:id
```

**Response:** `200 OK`

### Update Comment

```
PUT /api/comments/:id
```

Only comment author can update.

**Body:**

```json
{
  "content": "Updated comment text"
}
```

**Response:** `200 OK` or `403 Forbidden`

### Delete Comment

```
DELETE /api/comments/:id
```

Only comment author can delete.

**Response:** `200 OK` or `403 Forbidden`

---

## Dashboard

### Get Dashboard Summary

```
GET /api/dashboard
```

Returns summary for the current authenticated user.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "assignedToMe": 10,
    "reportedByMe": 5,
    "openIssues": 7,
    "closedIssues": 3
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Not authenticated |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Example Usage

### Using fetch (JavaScript)

```javascript
// Get all issues
const response = await fetch('/api/issues');
const data = await response.json();

// Create an issue
const response = await fetch('/api/issues', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    project_id: 'uuid',
    title: 'New Issue',
    description: 'Description',
    priority: 'high',
    type: 'bug',
  }),
});
const data = await response.json();

// Update issue status
const response = await fetch('/api/issues/uuid', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    status: 'in_progress',
  }),
});
```

### Using curl

```bash
# Get all projects
curl http://localhost:3000/api/projects

# Create a project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"New Project","description":"Description"}'

# Search issues
curl "http://localhost:3000/api/issues/search?q=login+bug"

# Get issue statistics
curl "http://localhost:3000/api/issues/stats?project_id=uuid"
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production use.

## Pagination

Pagination is not yet implemented. All endpoints return full result sets. For production, implement pagination using `limit` and `offset` query parameters.

---

## Next Steps

- Implement pagination for large result sets
- Add rate limiting
- Add API versioning (/api/v1/...)
- Add WebSocket support for real-time updates
- Add bulk operations endpoints
