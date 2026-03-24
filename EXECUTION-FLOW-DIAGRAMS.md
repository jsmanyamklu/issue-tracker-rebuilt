# Execution Flow Diagrams

Complete visual flow diagrams showing how data flows through the Issue Tracker application.

## Table of Contents

1. [Overall Architecture Flow](#overall-architecture-flow)
2. [Request/Response Flow](#requestresponse-flow)
3. [Issue Creation Flow](#issue-creation-flow)
4. [Authentication Flow](#authentication-flow)
5. [Database Query Flow](#database-query-flow)
6. [Slack Notification Flow](#slack-notification-flow)
7. [Assignee Tracking Flow](#assignee-tracking-flow)

---

## Overall Architecture Flow

```
┌────────────────────────────────────────────────────────────────┐
│                         USER/BROWSER                            │
│  (React Components, Forms, Buttons, UI Interactions)           │
└───────────────────────┬────────────────────────────────────────┘
                        │
                        │ HTTP Request
                        │ (GET, POST, PUT, DELETE)
                        ▼
┌────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APP ROUTER                          │
│         (src/app/api/*, Route Handlers)                        │
│  - Receives HTTP request                                       │
│  - Authenticates user (getCurrentUser)                         │
│  - Parses request body/query params                            │
└───────────────────────┬────────────────────────────────────────┘
                        │
                        │ Call Controller Method
                        │ (with parsed data)
                        ▼
┌────────────────────────────────────────────────────────────────┐
│                    CONTROLLER LAYER                             │
│       (src/controllers/*, IssueController, etc.)               │
│  - Handle HTTP concerns                                         │
│  - Format responses                                             │
│  - Map errors to HTTP status codes                             │
└───────────────────────┬────────────────────────────────────────┘
                        │
                        │ Call Service Method
                        │ (business logic)
                        ▼
┌────────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                               │
│       (src/services/*, IssueService, etc.)                     │
│  - Business logic & validation                                  │
│  - Permission checks                                            │
│  - Coordinate multiple repositories                             │
│  - Trigger notifications (Slack)                               │
└───────────────────────┬────────────────────────────────────────┘
                        │
                        │ Call Repository Methods
                        │ (database operations)
                        ▼
┌────────────────────────────────────────────────────────────────┐
│                   REPOSITORY LAYER                              │
│      (src/repositories/*, IssueRepository, etc.)               │
│  - Execute raw SQL queries                                      │
│  - Transform database results                                   │
│  - Handle database errors                                       │
└───────────────────────┬────────────────────────────────────────┘
                        │
                        │ SQL Query
                        │ (INSERT, SELECT, UPDATE, DELETE)
                        ▼
┌────────────────────────────────────────────────────────────────┐
│                   POSTGRESQL DATABASE                           │
│  - Store data persistently                                      │
│  - Enforce constraints                                          │
│  - Execute queries with indexes                                │
│  - Return results                                               │
└───────────────────────┬────────────────────────────────────────┘
                        │
                        │ Result Rows
                        │ (data returned)
                        ▼
              ┌─────────────────────┐
              │  Response flows     │
              │  back up through    │
              │  all layers to      │
              │  user's browser     │
              └─────────────────────┘
```

---

## Request/Response Flow

### Example: GET /api/issues/:id

```
┌─────────────┐
│   Browser   │
│             │
│  User clicks│
│  issue link │
└──────┬──────┘
       │
       │ 1. HTTP GET /api/issues/123
       │
       ▼
┌─────────────────────────────────────────────┐
│  Route Handler: src/app/api/issues/[id]/   │
│                 route.ts                     │
│                                              │
│  export async function GET(request, {       │
│    params: { id }                            │
│  }) {                                        │
│    const user = await getCurrentUser();     │ ◄── 2. Authenticate
│    const response =                          │
│      await issueController.getById(id);     │ ◄── 3. Call controller
│    return NextResponse.json(response);      │
│  }                                           │
└──────────────────┬──────────────────────────┘
                   │
                   │ 4. issueController.getById('123')
                   ▼
┌──────────────────────────────────────────────┐
│  Controller: IssueController.ts              │
│                                               │
│  async getById(id: string) {                 │
│    try {                                     │
│      const issue =                           │
│        await issueService.getById(id);      │ ◄── 5. Call service
│      return createSuccessResponse(issue);   │
│    } catch (error) {                         │
│      return createErrorResponse(...);       │
│    }                                         │
│  }                                           │
└──────────────────┬───────────────────────────┘
                   │
                   │ 6. issueService.getById('123')
                   ▼
┌──────────────────────────────────────────────┐
│  Service: IssueService.ts                    │
│                                               │
│  async getById(id: string) {                 │
│    const issue =                             │
│      await issueRepository                   │
│            .findByIdWithRelations(id);      │ ◄── 7. Call repository
│    if (!issue) {                             │
│      throw new NotFoundError('Issue');      │ ◄── 8. Validation
│    }                                         │
│    return issue;                             │
│  }                                           │
└──────────────────┬───────────────────────────┘
                   │
                   │ 9. issueRepository.findByIdWithRelations('123')
                   ▼
┌──────────────────────────────────────────────┐
│  Repository: IssueRepository.ts              │
│                                               │
│  async findByIdWithRelations(id: string) {   │
│    const result = await query(              │
│      `SELECT i.*, ... FROM issues i         │ ◄── 10. Execute SQL
│       JOIN projects p ON ...                 │
│       WHERE i.id = $1`,                      │
│      [id]                                    │
│    );                                        │
│    return result.rows[0] || null;           │
│  }                                           │
└──────────────────┬───────────────────────────┘
                   │
                   │ 11. SQL Query via pg driver
                   ▼
┌──────────────────────────────────────────────┐
│  PostgreSQL Database                         │
│                                               │
│  SELECT i.*, json_build_object(...) ...     │
│  FROM issues i                               │
│  JOIN projects p ON i.project_id = p.id     │
│  WHERE i.id = '123'                          │
│                                               │
│  Result: [ { id: '123', title: '...' } ]   │
└──────────────────┬───────────────────────────┘
                   │
                   │ 12. Returns row data
                   │
    ┌──────────────▼──────────────┐
    │  Response bubbles back up:   │
    │                               │
    │  Repository → Service →       │
    │  Controller → Route Handler → │
    │  HTTP Response                │
    └──────────────┬────────────────┘
                   │
                   │ 13. JSON Response
                   ▼
┌──────────────────────────────────────────────┐
│  Browser receives:                           │
│  {                                            │
│    "success": true,                          │
│    "data": {                                 │
│      "id": "123",                            │
│      "title": "Fix bug",                     │
│      "status": "open",                       │
│      "project": { ... },                     │
│      "assignee": { ... },                    │
│      "reporter": { ... }                     │
│    }                                         │
│  }                                           │
└──────────────────────────────────────────────┘
```

---

## Issue Creation Flow

### Complete flow from form submission to Slack notification

```
┌────────────────────────────────────────────────────────────────┐
│  STEP 1: USER INTERACTION                                      │
└────────────────────────────────────────────────────────────────┘

User fills form at /issues/new:
┌─────────────────────────────────────┐
│ New Issue Form                      │
│                                     │
│ Project: [Backend API      ▼]      │
│ Title:   [Fix login bug    ]       │
│ Desc:    [Users cannot...  ]       │
│ Type:    [Bug              ▼]      │
│ Priority:[High             ▼]      │
│ Assignee:[Jane Smith       ▼]      │
│ Status:  [Open             ▼]      │
│                                     │
│         [Create Issue]              │
└─────────────────────────────────────┘
           │
           │ onClick → handleSubmit()
           ▼
┌────────────────────────────────────────────────────────────────┐
│  STEP 2: FRONTEND VALIDATION & API CALL                        │
└────────────────────────────────────────────────────────────────┘

src/app/issues/new/page.tsx:

async function handleSubmit(e) {
  e.preventDefault();

  const response = await fetch('/api/issues', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: 'uuid-1',
      title: 'Fix login bug',
      description: 'Users cannot login...',
      type: 'bug',
      priority: 'high',
      assignee_id: 'user-uuid-jane',
      status: 'open',
      reporter_id: currentUser.id  // Added by API
    })
  });
}
           │
           │ POST /api/issues
           ▼
┌────────────────────────────────────────────────────────────────┐
│  STEP 3: API ROUTE HANDLER                                     │
└────────────────────────────────────────────────────────────────┘

src/app/api/issues/route.ts:

export async function POST(request: NextRequest) {
  // 3a. Authenticate
  const user = await getCurrentUser();

  // 3b. Parse body
  const body = await request.json();

  // 3c. Add reporter_id
  const data = { ...body, reporter_id: user.id };

  // 3d. Call controller
  const response = await issueController.create(data);

  // 3e. Return JSON
  return NextResponse.json(response, { status: 201 });
}
           │
           ▼
┌────────────────────────────────────────────────────────────────┐
│  STEP 4: CONTROLLER LAYER                                      │
└────────────────────────────────────────────────────────────────┘

src/controllers/IssueController.ts:

async create(data: CreateIssueDTO) {
  try {
    // 4a. Call service
    const issue = await issueService.create(data);

    // 4b. Format success response
    return createSuccessResponse(issue, 'Issue created');
  } catch (error) {
    // 4c. Handle errors
    return createErrorResponse(error.message);
  }
}
           │
           ▼
┌────────────────────────────────────────────────────────────────┐
│  STEP 5: SERVICE LAYER (Business Logic)                        │
└────────────────────────────────────────────────────────────────┘

src/services/IssueService.ts:

async create(data: CreateIssueDTO) {
  // 5a. Validate title
  if (!data.title || data.title.trim().length === 0) {
    throw new ValidationError('Title is required');
  }

  // 5b. Verify project exists
  const project = await projectRepository.findById(data.project_id);
  if (!project) {
    throw new NotFoundError('Project');
  }

  // 5c. Verify reporter exists
  const reporter = await userRepository.findById(data.reporter_id);
  if (!reporter) {
    throw new NotFoundError('Reporter');
  }

  // 5d. Verify assignee exists (if provided)
  if (data.assignee_id) {
    const assignee = await userRepository.findById(data.assignee_id);
    if (!assignee) {
      throw new NotFoundError('Assignee');
    }
  }

  // 5e. Create issue in database
  const issue = await issueRepository.create(data);

  // 5f. Get issue with relations for notification
  const issueWithRelations =
    await issueRepository.findByIdWithRelations(issue.id);

  // 5g. Send Slack notification (async, non-blocking)
  if (issueWithRelations) {
    notifyIssueCreated(issueWithRelations).catch(() => {
      // Silently ignore notification failures
    });
  }

  // 5h. Return created issue
  return issue;
}
           │
           ▼
┌────────────────────────────────────────────────────────────────┐
│  STEP 6: REPOSITORY LAYER (Database Operations)                │
└────────────────────────────────────────────────────────────────┘

src/repositories/IssueRepository.ts:

async create(data: CreateIssueDTO) {
  // 6a. Execute SQL INSERT
  const result = await query<Issue>(
    `INSERT INTO issues
     (project_id, title, description, status,
      priority, type, assignee_id, reporter_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.project_id,           // $1
      data.title,                // $2
      data.description,          // $3
      data.status || 'open',     // $4
      data.priority || 'medium', // $5
      data.type || 'task',       // $6
      data.assignee_id,          // $7
      data.reporter_id           // $8
    ]
  );

  // 6b. Return inserted row
  return result.rows[0];
}
           │
           ▼
┌────────────────────────────────────────────────────────────────┐
│  STEP 7: DATABASE EXECUTION                                    │
└────────────────────────────────────────────────────────────────┘

PostgreSQL Database:

INSERT INTO issues (
  id,                  -- Auto-generated UUID
  project_id,          -- 'uuid-1'
  title,               -- 'Fix login bug'
  description,         -- 'Users cannot login...'
  status,              -- 'open'
  priority,            -- 'high'
  type,                -- 'bug'
  assignee_id,         -- 'user-uuid-jane'
  reporter_id,         -- 'user-uuid-current'
  created_at,          -- NOW()
  updated_at           -- NOW()
) VALUES (...) RETURNING *;

Result: Issue row with id = 'new-issue-uuid-123'
           │
           ▼
┌────────────────────────────────────────────────────────────────┐
│  STEP 8: SLACK NOTIFICATION (Parallel, Non-Blocking)           │
└────────────────────────────────────────────────────────────────┘

src/lib/notifications/slack.ts:

export async function notifyIssueCreated(issue) {
  const slackService = new SlackService();

  if (!slackService.isEnabled()) return;

  // Build rich Slack message
  const message = slackService.buildIssueNotification({
    type: 'created',
    issue: {
      id: issue.id,
      title: issue.title,
      project: issue.project.name,
      priority: issue.priority,
      assignee: issue.assignee?.name,
      reporter: issue.reporter.name
    },
    url: `${process.env.NEXT_PUBLIC_APP_URL}/issues/${issue.id}`
  });

  // Send to Slack
  await slackService.sendMessage(
    process.env.SLACK_DEFAULT_CHANNEL,
    message
  );
}

Slack receives message:
┌──────────────────────────────────────────┐
│ 🆕 New Issue Created                    │
│                                          │
│ Fix login bug                            │
│ Type: Bug  Priority: High                │
│                                          │
│ Project: Backend API                     │
│ Assigned to: Jane Smith                  │
│ Reported by: John Doe                    │
│                                          │
│ [View Issue] [Assign to Me]             │
└──────────────────────────────────────────┘
           │
           │ (Notification sent in parallel,
           │  doesn't block main response)
           │
┌────────────────────────────────────────────────────────────────┐
│  STEP 9: RESPONSE RETURNS TO BROWSER                           │
└────────────────────────────────────────────────────────────────┘

Browser receives:
{
  "success": true,
  "data": {
    "id": "new-issue-uuid-123",
    "project_id": "uuid-1",
    "title": "Fix login bug",
    "description": "Users cannot login...",
    "status": "open",
    "priority": "high",
    "type": "bug",
    "assignee_id": "user-uuid-jane",
    "reporter_id": "user-uuid-current",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  },
  "message": "Issue created successfully"
}

Frontend shows success message and redirects:
router.push('/issues');
```

---

## Authentication Flow

### OAuth Sign-In Flow (Google/GitHub)

```
┌────────────────────────────────────────────────────────────────┐
│  STEP 1: User clicks "Sign in with Google"                     │
└────────────────────────────────────────────────────────────────┘

Browser: http://localhost:3000/auth/signin
           │
           │ Click "Continue with Google"
           ▼
┌────────────────────────────────────────────────────────────────┐
│  STEP 2: NextAuth initiates OAuth flow                         │
└────────────────────────────────────────────────────────────────┘

Redirects to Google OAuth:
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_CLIENT_ID
  &redirect_uri=http://localhost:3000/api/auth/callback/google
  &response_type=code
  &scope=openid%20profile%20email
           │
           ▼
┌────────────────────────────────────────────────────────────────┐
│  STEP 3: User authorizes on Google                             │
└────────────────────────────────────────────────────────────────┘

Google Login Page:
┌─────────────────────────────────┐
│  Sign in with Google            │
│                                 │
│  Email: john@example.com        │
│  Password: ••••••••             │
│                                 │
│  [Allow] [Deny]                 │
└─────────────────────────────────┘
           │
           │ User clicks "Allow"
           ▼
┌────────────────────────────────────────────────────────────────┐
│  STEP 4: Google redirects back with auth code                  │
└────────────────────────────────────────────────────────────────┘

Redirects to:
http://localhost:3000/api/auth/callback/google?code=ABC123
           │
           ▼
┌────────────────────────────────────────────────────────────────┐
│  STEP 5: NextAuth exchanges code for tokens                    │
└────────────────────────────────────────────────────────────────┘

NextAuth (behind the scenes):
1. Exchanges authorization code for access token
2. Uses access token to fetch user profile from Google
3. Receives user profile:
   {
     "id": "google-user-id-123",
     "email": "john@example.com",
     "name": "John Doe",
     "picture": "https://..."
   }
           │
           ▼
┌────────────────────────────────────────────────────────────────┐
│  STEP 6: NextAuth callback processes user                      │
└────────────────────────────────────────────────────────────────┘

src/lib/auth/config.ts:

callbacks: {
  async signIn({ user, account, profile }) {
    // Check if user exists in database
    const existingUser = await userRepository.findByProvider(
      account.provider,
      account.providerAccountId
    );

    if (existingUser) {
      // Update existing user
      await userRepository.update(existingUser.id, {
        name: user.name,
        avatar_url: user.image
      });
    } else {
      // Create new user
      await userRepository.create({
        email: user.email,
        name: user.name,
        avatar_url: user.image,
        provider: account.provider,
        provider_id: account.providerAccountId
      });
    }

    return true; // Allow sign in
  },

  async jwt({ token, user, account }) {
    // Add user ID to JWT token
    if (user) {
      const dbUser = await userRepository.findByEmail(user.email);
      token.userId = dbUser.id;
    }
    return token;
  },

  async session({ session, token }) {
    // Add user ID to session
    session.user.id = token.userId;
    return session;
  }
}
           │
           ▼
┌────────────────────────────────────────────────────────────────┐
│  STEP 7: Session created and user redirected                   │
└────────────────────────────────────────────────────────────────┘

NextAuth sets cookie:
next-auth.session-token=eyJhbGciOi...

Redirects user to: /dashboard

Session cookie contains:
{
  "user": {
    "id": "user-uuid-123",
    "email": "john@example.com",
    "name": "John Doe",
    "image": "https://..."
  },
  "expires": "2024-02-01T00:00:00Z"
}
           │
           ▼
┌────────────────────────────────────────────────────────────────┐
│  STEP 8: All subsequent requests include session               │
└────────────────────────────────────────────────────────────────┘

Every API request:
GET /api/issues
Cookie: next-auth.session-token=eyJhbGciOi...

API Route Handler:
const user = await getCurrentUser(); // Validates session
// user = { id: 'user-uuid-123', email: '...', name: '...' }

✅ User is authenticated for all protected routes
```

---

## Database Query Flow

### Example: Filter issues by assignee and status

```
┌────────────────────────────────────────────────────────────────┐
│  FRONTEND: User applies filters                                │
└────────────────────────────────────────────────────────────────┘

Issues List Page (/issues):
┌──────────────────────────────────────────┐
│ Filters:                                 │
│ Status:   [In Progress ▼]               │
│ Assignee: [Jane Smith  ▼]               │
│ [Apply]                                  │
└──────────────────────────────────────────┘
           │
           │ onChange → loadData()
           ▼
┌────────────────────────────────────────────────────────────────┐
│  API CALL: Build query parameters                              │
└────────────────────────────────────────────────────────────────┘

const params = new URLSearchParams();
params.append('status', 'in_progress');
params.append('assignee_id', 'user-uuid-jane');

fetch(`/api/issues?${params.toString()}`);
// GET /api/issues?status=in_progress&assignee_id=user-uuid-jane
           │
           ▼
┌────────────────────────────────────────────────────────────────┐
│  ROUTE HANDLER: Parse query params                             │
└────────────────────────────────────────────────────────────────┘

src/app/api/issues/route.ts:

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  // Extract query parameters
  const searchParams = request.nextUrl.searchParams;
  const filters: IssueFilters = {
    status: searchParams.get('status') || undefined,
    assignee_id: searchParams.get('assignee_id') || undefined,
    priority: searchParams.get('priority') || undefined,
    project_id: searchParams.get('project_id') || undefined,
  };

  // Call controller
  const response = await issueController.getWithFilters(filters);
  return NextResponse.json(response);
}
           │
           ▼
┌────────────────────────────────────────────────────────────────┐
│  CONTROLLER: Pass filters to service                           │
└────────────────────────────────────────────────────────────────┘

async getWithFilters(filters: IssueFilters) {
  const issues = await issueService.getWithFilters(filters);
  return createSuccessResponse(issues);
}
           │
           ▼
┌────────────────────────────────────────────────────────────────┐
│  SERVICE: Pass to repository (no business logic needed)        │
└────────────────────────────────────────────────────────────────┘

async getWithFilters(filters: IssueFilters) {
  return await issueRepository.findWithFilters(filters);
}
           │
           ▼
┌────────────────────────────────────────────────────────────────┐
│  REPOSITORY: Build dynamic SQL query                           │
└────────────────────────────────────────────────────────────────┘

async findWithFilters(filters: IssueFilters) {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  // Build WHERE conditions dynamically
  if (filters.status) {
    conditions.push(`i.status = $${paramIndex++}`);
    params.push(filters.status);
    // conditions = ["i.status = $1"]
    // params = ["in_progress"]
  }

  if (filters.assignee_id) {
    conditions.push(`i.assignee_id = $${paramIndex++}`);
    params.push(filters.assignee_id);
    // conditions = ["i.status = $1", "i.assignee_id = $2"]
    // params = ["in_progress", "user-uuid-jane"]
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';
  // whereClause = "WHERE i.status = $1 AND i.assignee_id = $2"

  // Execute SQL with dynamic WHERE clause
  const result = await query<IssueWithRelations>(
    `SELECT i.*,
            json_build_object('id', p.id, 'name', p.name) as project,
            json_build_object('id', a.id, 'name', a.name, ...) as assignee,
            json_build_object('id', r.id, 'name', r.name, ...) as reporter
     FROM issues i
     JOIN projects p ON i.project_id = p.id
     LEFT JOIN users a ON i.assignee_id = a.id
     JOIN users r ON i.reporter_id = r.id
     ${whereClause}
     ORDER BY i.created_at DESC`,
    params
  );

  return result.rows;
}
           │
           ▼
┌────────────────────────────────────────────────────────────────┐
│  DATABASE: Execute SQL with parameters                         │
└────────────────────────────────────────────────────────────────┘

Final SQL executed:
SELECT i.*,
       json_build_object('id', p.id, 'name', p.name) as project,
       json_build_object('id', a.id, 'name', a.name,
                        'email', a.email, 'avatar_url', a.avatar_url) as assignee,
       json_build_object('id', r.id, 'name', r.name,
                        'email', r.email, 'avatar_url', r.avatar_url) as reporter
FROM issues i
JOIN projects p ON i.project_id = p.id
LEFT JOIN users a ON i.assignee_id = a.id
JOIN users r ON i.reporter_id = r.id
WHERE i.status = 'in_progress' AND i.assignee_id = 'user-uuid-jane'
ORDER BY i.created_at DESC;

Query uses indexes:
- idx_issues_status (on status column)
- idx_issues_assignee_id (on assignee_id column)
- idx_issues_assignee_status (composite index)

Result: 5 rows returned in ~50ms
           │
           ▼
┌────────────────────────────────────────────────────────────────┐
│  RESPONSE: Filtered issues returned to frontend                │
└────────────────────────────────────────────────────────────────┘

Browser receives:
{
  "success": true,
  "data": [
    {
      "id": "issue-1",
      "title": "Implement feature X",
      "status": "in_progress",
      "priority": "high",
      "project": { "id": "proj-1", "name": "Backend API" },
      "assignee": { "id": "user-uuid-jane", "name": "Jane Smith", ... },
      "reporter": { "id": "user-uuid-john", "name": "John Doe", ... }
    },
    // ... 4 more issues
  ]
}

Frontend renders filtered list
```

---

## Slack Notification Flow

### Parallel, non-blocking notification system

```
┌────────────────────────────────────────────────────────────────┐
│  MAIN EXECUTION PATH (Continues immediately)                   │
└────────────────────────────────────────────────────────────────┘

Service Layer (IssueService.ts):

async create(data: CreateIssueDTO) {
  // ... validation and database operations ...

  const issue = await issueRepository.create(data);

  // Get issue with relations
  const issueWithRelations =
    await issueRepository.findByIdWithRelations(issue.id);

  // ┌──────────────────────────────────────────────┐
  // │ FORK: Notification sent in parallel          │
  // │ Main execution continues WITHOUT WAITING     │
  // └──────────────────────────────────────────────┘
  if (issueWithRelations) {
    notifyIssueCreated(issueWithRelations).catch(() => {
      // Silently ignore notification failures
      // (doesn't affect main response)
    });
  }

  return issue; // ◄── Returns immediately
}
           │
           │ Main thread continues
           │ (doesn't wait for Slack)
           ▼
    Response returned
    to user in ~200ms

    ═════════════════════════════════════════════
    PARALLEL EXECUTION (doesn't block main thread)
    ═════════════════════════════════════════════
           │
           │ Async notification execution
           ▼
┌────────────────────────────────────────────────────────────────┐
│  NOTIFICATION FLOW (Parallel execution)                        │
└────────────────────────────────────────────────────────────────┘

src/lib/notifications/slack.ts:

export async function notifyIssueCreated(issue) {
  // 1. Check if Slack is enabled
  const slackService = new SlackService();
  if (!slackService.isEnabled()) {
    return; // Exit early if Slack not configured
  }

  // 2. Build notification message
  const message = slackService.buildIssueNotification({
    type: 'created',
    issue: {
      id: issue.id,
      title: issue.title,
      project: issue.project.name,
      priority: issue.priority,
      type: issue.type,
      assignee: issue.assignee?.name || 'Unassigned',
      reporter: issue.reporter.name
    },
    url: `${process.env.NEXT_PUBLIC_APP_URL}/issues/${issue.id}`
  });

  // 3. Send to Slack
  await slackService.sendMessage(
    process.env.SLACK_DEFAULT_CHANNEL || '#issue-tracker',
    message
  );
}
           │
           ▼
┌────────────────────────────────────────────────────────────────┐
│  SLACK SERVICE: Build rich message with blocks                 │
└────────────────────────────────────────────────────────────────┘

src/services/slack.service.ts:

buildIssueNotification(notification) {
  return {
    text: `🆕 New Issue: ${notification.issue.title}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🆕 New Issue Created'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${notification.issue.title}*\n` +
                `Priority: ${notification.issue.priority}\n` +
                `Assigned to: ${notification.issue.assignee}`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View Issue' },
            url: notification.url
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Assign to Me' },
            action_id: 'assign_to_me',
            value: notification.issue.id
          }
        ]
      }
    ]
  };
}
           │
           ▼
┌────────────────────────────────────────────────────────────────┐
│  SLACK API: Post message to channel                            │
└────────────────────────────────────────────────────────────────┘

POST https://slack.com/api/chat.postMessage
Authorization: Bearer xoxb-your-bot-token
Content-Type: application/json

{
  "channel": "#issue-tracker",
  "text": "🆕 New Issue: Fix login bug",
  "blocks": [ ... rich formatting ... ]
}
           │
           │ ~500ms for Slack API call
           ▼
┌────────────────────────────────────────────────────────────────┐
│  SLACK CHANNEL: Message appears                                │
└────────────────────────────────────────────────────────────────┘

#issue-tracker channel:
┌──────────────────────────────────────────┐
│ IssueTracker Bot  10:30 AM              │
│                                          │
│ 🆕 New Issue Created                    │
│                                          │
│ Fix login bug                            │
│ Priority: High                           │
│ Type: Bug                                │
│ Assigned to: Jane Smith                  │
│ Project: Backend API                     │
│ Reported by: John Doe                    │
│                                          │
│ [View Issue] [Assign to Me]             │
└──────────────────────────────────────────┘

Team members notified!

TIMELINE:
─────────────────────────────────────────────────
t=0ms:    User submits form
t=50ms:   Database INSERT completes
t=200ms:  HTTP response sent to user ✅
t=300ms:  Slack notification starts (parallel)
t=800ms:  Slack message posted ✅
─────────────────────────────────────────────────

Key: User gets response in 200ms
     Slack notification completes in background
```

---

## Assignee Tracking Flow

### Complete flow from assignment to "My Issues" dashboard

```
┌────────────────────────────────────────────────────────────────┐
│  SCENARIO: Manager assigns issue to developer                  │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Step 1: Issue Creation with Assignee                        │
└─────────────────────────────────────────────────────────────┘

Manager at /issues/new:
┌────────────────────────────────┐
│ Create New Issue               │
│                                │
│ Title: [Fix API endpoint]     │
│ Assignee: [Jane Smith    ▼]  │◄─── Select assignee
│ Priority: [High          ▼]  │
│                                │
│ [Create Issue]                 │
└────────────────────────────────┘
           │
           ▼
POST /api/issues
{
  "title": "Fix API endpoint",
  "assignee_id": "user-uuid-jane",
  "reporter_id": "user-uuid-manager",
  ...
}
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Service Layer validates assignee                    │
└─────────────────────────────────────────────────────────────┘

IssueService.create():
  // Verify assignee exists
  const assignee = await userRepository.findById(data.assignee_id);
  if (!assignee) {
    throw new NotFoundError('Assignee user');
  }
  ✅ Assignee validated: Jane Smith exists
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Database stores assignment                          │
└─────────────────────────────────────────────────────────────┘

INSERT INTO issues (
  id,                  -- 'issue-123'
  title,               -- 'Fix API endpoint'
  assignee_id,         -- 'user-uuid-jane' ◄─── Stored
  reporter_id,         -- 'user-uuid-manager'
  status,              -- 'open'
  ...
) VALUES (...);

Database row:
┌──────────────────────────────────────────────────────────┐
│ id: issue-123                                            │
│ title: Fix API endpoint                                  │
│ assignee_id: user-uuid-jane  ◄─── Foreign key to users  │
│ reporter_id: user-uuid-manager                           │
│ status: open                                             │
└──────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Slack notification sent to Jane                     │
└─────────────────────────────────────────────────────────────┘

notifyIssueCreated(issue):
  Message includes: "Assigned to: Jane Smith"
  Sent to #issue-tracker channel
  Jane receives notification: "You've been assigned a new issue"
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Jane views "My Issues" dashboard                    │
└─────────────────────────────────────────────────────────────┘

Jane navigates to: /my-issues
           │
           ▼
GET /my-issues (Server Component):
  const user = await getCurrentUser(); // Jane's ID
  const issues = await issueService.getByAssigneeId(user.id);
           │
           ▼
Repository query:
SELECT i.*, p.name as project_name, ...
FROM issues i
JOIN projects p ON i.project_id = p.id
WHERE i.assignee_id = 'user-uuid-jane'  ◄─── Filter by Jane
ORDER BY i.created_at DESC;

Results:
┌──────────────────────────────────────────────────────────┐
│ My Issues (Jane Smith)                                   │
│                                                          │
│ Summary:                                                 │
│ [5 Open] [3 In Progress] [7 Resolved] [2 Closed]       │
│                                                          │
│ ▼ Open Issues (5)                                       │
│   ┌────────────────────────────────────────────┐       │
│   │ [HIGH] Fix API endpoint                    │       │
│   │ Backend API • Opened 2 mins ago            │◄──NEW│
│   └────────────────────────────────────────────┘       │
│   ┌────────────────────────────────────────────┐       │
│   │ [MEDIUM] Update documentation              │       │
│   │ Frontend • Opened 1 hour ago               │       │
│   └────────────────────────────────────────────┘       │
│   ...                                                    │
│                                                          │
│ ▼ In Progress (3)                                       │
│   ...                                                    │
└──────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 6: Team lead filters issues by assignee                │
└─────────────────────────────────────────────────────────────┘

Team Lead at /issues:
┌────────────────────────────────────┐
│ Filters:                           │
│ Assignee: [Jane Smith      ▼]    │◄─── Select Jane
│ Status:   [All             ▼]    │
│ [Apply]                            │
└────────────────────────────────────┘
           │
           ▼
GET /api/issues?assignee_id=user-uuid-jane
           │
           ▼
Repository query:
SELECT i.*, ...
FROM issues i
WHERE i.assignee_id = 'user-uuid-jane'  ◄─── Filter by Jane
ORDER BY i.created_at DESC;

Results shown:
┌──────────────────────────────────────────────────────────┐
│ Issues assigned to Jane Smith (17 total)                 │
│                                                          │
│ ┌────────────────────────────────────────────┐         │
│ │ [OPEN] [HIGH] Fix API endpoint             │         │
│ │ Backend API • Assigned to: Jane Smith      │         │
│ └────────────────────────────────────────────┘         │
│ ┌────────────────────────────────────────────┐         │
│ │ [IN PROGRESS] [MEDIUM] Update docs         │         │
│ │ Frontend • Assigned to: Jane Smith         │         │
│ └────────────────────────────────────────────┘         │
│ ...                                                      │
└──────────────────────────────────────────────────────────┘

Team Lead can see:
✅ Jane's workload (17 issues)
✅ Distribution by status
✅ Priority breakdown
✅ Project distribution
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 7: Jane updates issue status                           │
└─────────────────────────────────────────────────────────────┘

Jane clicks issue → Changes status to "In Progress"
           │
           ▼
PUT /api/issues/issue-123
{
  "status": "in_progress"
}
           │
           ▼
Database UPDATE:
UPDATE issues
SET status = 'in_progress', updated_at = NOW()
WHERE id = 'issue-123';
           │
           ▼
Slack notification sent:
"📊 Status Updated: Fix API endpoint
 Changed by: Jane Smith
 Status: Open → In Progress"
           │
           ▼
"My Issues" dashboard automatically updates:
- Moves from "Open (5)" to "In Progress (4)"
- Updated timestamp shown
- Team lead sees real-time progress
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 8: Jane completes and closes issue                     │
└─────────────────────────────────────────────────────────────┘

Jane changes status to "Resolved":
           │
           ▼
UPDATE issues
SET status = 'resolved', updated_at = NOW()
WHERE id = 'issue-123';
           │
           ▼
Issue moves to "Resolved (8)" section
Slack notification: "✅ Issue Resolved by Jane Smith"
Manager can verify and close
           │
           ▼
Complete audit trail maintained:
- Created: 10:00 AM by Manager
- Assigned: 10:00 AM to Jane
- Started: 10:30 AM by Jane
- Resolved: 11:45 AM by Jane
- Closed: 12:00 PM by Manager

DATABASE QUERIES USED:
═════════════════════════════════════════════════════════
1. Find assignee's issues:
   WHERE assignee_id = 'user-uuid-jane'
   Uses index: idx_issues_assignee_id

2. Filter by assignee + status:
   WHERE assignee_id = 'user-uuid-jane' AND status = 'open'
   Uses index: idx_issues_assignee_status (composite)

3. Count by status:
   SELECT status, COUNT(*) FROM issues
   WHERE assignee_id = 'user-uuid-jane'
   GROUP BY status;

All queries execute in <100ms due to strategic indexing
```

---

## Summary

This document covers all major execution flows in the Issue Tracker application:

1. ✅ **Overall Architecture** - How layers communicate
2. ✅ **Request/Response** - Complete HTTP lifecycle
3. ✅ **Issue Creation** - From form to database to Slack
4. ✅ **Authentication** - OAuth flow with NextAuth
5. ✅ **Database Queries** - Dynamic SQL with filters
6. ✅ **Slack Notifications** - Parallel, non-blocking
7. ✅ **Assignee Tracking** - Complete assignment workflow

All flows demonstrate:
- Clean separation of concerns
- Error handling at each layer
- Performance optimization (indexes, parallel execution)
- Security (authentication, validation)
- User experience (real-time updates, notifications)
