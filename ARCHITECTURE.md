# TaskForge - System Architecture

**Last Updated:** March 25, 2026
**Version:** 1.0.0

This document describes the system architecture, design patterns, and technical implementation of TaskForge.

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Architecture Pattern](#architecture-pattern)
3. [Technology Stack](#technology-stack)
4. [System Layers](#system-layers)
5. [Database Architecture](#database-architecture)
6. [Authentication & Authorization](#authentication--authorization)
7. [API Structure](#api-structure)
8. [Component Architecture](#component-architecture)
9. [Data Flow](#data-flow)
10. [Security Architecture](#security-architecture)
11. [Performance Optimization](#performance-optimization)
12. [Deployment Architecture](#deployment-architecture)

---

## 🎯 Overview

TaskForge follows **Clean Architecture** principles with clear separation of concerns across multiple layers. The system is built as a monolithic Next.js application with server-side rendering and API routes.

### Design Principles

1. **Separation of Concerns** - Each layer has a single, well-defined responsibility
2. **Dependency Inversion** - High-level modules don't depend on low-level modules
3. **Testability** - Each component can be tested in isolation
4. **Scalability** - Architecture supports horizontal scaling
5. **Security First** - Security considerations at every layer

### System Characteristics

- **Type**: Monolithic web application
- **Rendering**: Server-Side Rendering (SSR) with React Server Components
- **Database**: PostgreSQL with raw SQL queries
- **Authentication**: OAuth 2.0 (GitHub, Google)
- **Deployment**: Containerized (Docker) or Serverless (Vercel)

---

## 🏗️ Architecture Pattern

TaskForge implements **Clean Architecture** with the following layers:

```
┌─────────────────────────────────────────────────────┐
│                    Presentation                      │
│         (Next.js Pages, Components, UI)             │
│                                                      │
│  ┌────────────────────────────────────────────┐   │
│  │            API Controllers                  │   │
│  │  (Request validation, Response formatting)  │   │
│  │                                              │   │
│  │  ┌──────────────────────────────────────┐ │   │
│  │  │        Business Services             │ │   │
│  │  │  (Business logic, Authorization)     │ │   │
│  │  │                                       │ │   │
│  │  │  ┌───────────────────────────────┐  │ │   │
│  │  │  │      Repositories             │  │ │   │
│  │  │  │  (Data access, SQL queries)   │  │ │   │
│  │  │  │                                │  │ │   │
│  │  │  │  ┌─────────────────────────┐ │  │ │   │
│  │  │  │  │     Database Layer      │ │  │ │   │
│  │  │  │  │   (PostgreSQL + pg)     │ │  │ │   │
│  │  │  │  └─────────────────────────┘ │  │ │   │
│  │  │  └───────────────────────────────┘  │ │   │
│  │  └──────────────────────────────────────┘ │   │
│  └────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Layer Responsibilities

#### 1. Presentation Layer (`src/app/`, `src/components/`)
- **Purpose**: User interface and user interaction
- **Components**:
  - Next.js App Router pages
  - React Server Components
  - Client Components for interactivity
  - UI component library
- **Responsibilities**:
  - Render UI
  - Handle user input
  - Display data
  - Client-side routing
  - Form validation (client-side)

#### 2. Controller Layer (`src/controllers/`)
- **Purpose**: Request/response handling and routing
- **Files**:
  - `issueController.ts` - Issue operations
  - `projectController.ts` - Project operations
  - `userController.ts` - User management
  - `commentController.ts` - Comment operations
- **Responsibilities**:
  - Parse HTTP requests
  - Validate request data
  - Call appropriate services
  - Format responses
  - Handle HTTP errors
  - Session management

#### 3. Service Layer (`src/services/`)
- **Purpose**: Business logic and orchestration
- **Files**:
  - `issueService.ts` - Issue business logic
  - `projectService.ts` - Project business logic
  - `userService.ts` - User operations
  - `commentService.ts` - Comment management
  - `notificationService.ts` - Email/Slack notifications
- **Responsibilities**:
  - Implement business rules
  - Coordinate between repositories
  - Authorization checks
  - Data transformation
  - Transaction management
  - Error handling

#### 4. Repository Layer (`src/repositories/`)
- **Purpose**: Data access and persistence
- **Files**:
  - `issueRepository.ts` - Issue database operations
  - `projectRepository.ts` - Project database operations
  - `userRepository.ts` - User database operations
  - `commentRepository.ts` - Comment database operations
- **Responsibilities**:
  - Execute SQL queries
  - Map database rows to domain objects
  - Handle database connections
  - Query optimization
  - Data validation (database level)

#### 5. Database Layer
- **Purpose**: Data storage and persistence
- **Technology**: PostgreSQL 14+
- **Access**: Raw SQL via `pg` (node-postgres)
- **Responsibilities**:
  - Store data
  - Enforce constraints
  - Maintain indexes
  - Handle transactions

---

## 🛠️ Technology Stack

### Frontend Stack

```typescript
{
  "framework": "Next.js 15.5",
  "language": "TypeScript 5.0",
  "runtime": "React 19",
  "styling": "Tailwind CSS 3.4",
  "ui": "Custom component library",
  "icons": "Heroicons (SVG)",
  "dates": "date-fns 3.0"
}
```

**Key Libraries**:
- `next`: 15.5 - Framework
- `react`: 19.0 - UI library
- `typescript`: 5.0 - Type safety
- `tailwindcss`: 3.4 - Styling
- `next-auth`: 4.24 - Authentication
- `date-fns`: 3.0 - Date manipulation

### Backend Stack

```typescript
{
  "runtime": "Node.js 20+",
  "framework": "Next.js API Routes",
  "database": "PostgreSQL 14+",
  "dbClient": "pg (node-postgres)",
  "authentication": "NextAuth.js",
  "email": "Nodemailer",
  "notifications": "Slack API"
}
```

**Key Libraries**:
- `pg`: 8.11 - PostgreSQL client
- `next-auth`: 4.24 - OAuth authentication
- `nodemailer`: 6.9 - Email sending
- `@slack/web-api`: 7.0 - Slack integration

### Development Tools

```json
{
  "packageManager": "npm",
  "linter": "ESLint 8.x",
  "typeChecker": "TypeScript 5.0",
  "formatter": "Prettier (recommended)"
}
```

---

## 🗂️ System Layers

### Directory Structure

```
src/
├── app/                      # Next.js 15 App Router
│   ├── api/                 # API Routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── issues/         # Issue endpoints
│   │   ├── projects/       # Project endpoints
│   │   ├── comments/       # Comment endpoints
│   │   ├── users/          # User endpoints
│   │   └── admin/          # Admin endpoints
│   │
│   ├── dashboard/          # Dashboard pages
│   ├── issues/             # Issue management pages
│   ├── projects/           # Project management pages
│   ├── admin/              # Admin panel pages
│   ├── auth/               # Auth pages (signin)
│   │
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (redirects to dashboard)
│   ├── providers.tsx       # Context providers
│   └── globals.css         # Global styles
│
├── components/             # React components
│   ├── ui/                # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   │
│   ├── Navigation.tsx      # Main navigation
│   ├── UserMenu.tsx        # User dropdown
│   ├── DarkModeToggle.tsx  # Theme switcher
│   └── KeyboardShortcuts.tsx
│
├── controllers/            # Request handlers
│   ├── issueController.ts
│   ├── projectController.ts
│   ├── userController.ts
│   └── commentController.ts
│
├── services/               # Business logic
│   ├── issueService.ts
│   ├── projectService.ts
│   ├── userService.ts
│   ├── commentService.ts
│   └── notificationService.ts
│
├── repositories/           # Data access
│   ├── issueRepository.ts
│   ├── projectRepository.ts
│   ├── userRepository.ts
│   └── commentRepository.ts
│
├── lib/                    # Utilities & helpers
│   ├── auth.ts            # NextAuth config
│   ├── db.ts              # Database connection
│   ├── permissions.ts     # RBAC utilities
│   ├── utils.ts           # Helper functions
│   └── notifications/     # Email & Slack
│       ├── email.ts
│       └── slack.ts
│
└── types/                  # TypeScript types
    ├── index.ts           # Shared types
    ├── next-auth.d.ts     # NextAuth type extensions
    └── database.ts        # Database types
```

### Request Flow

```
User Action (Browser)
       ↓
Next.js Page/Component
       ↓
API Route (/app/api/*)
       ↓
Controller (src/controllers/*)
       ↓
Service (src/services/*)
       ↓
Repository (src/repositories/*)
       ↓
Database (PostgreSQL)
       ↓
Response flows back up the chain
```

**Example: Creating an Issue**

1. **User fills form** → Client-side validation
2. **Form submission** → POST to `/api/issues`
3. **API Route** → Calls `issueController.createIssue()`
4. **Controller** → Validates request, calls `issueService.createIssue()`
5. **Service** → Checks permissions, validates business rules
6. **Repository** → Executes `INSERT` query via `issueRepository.create()`
7. **Database** → Stores issue, returns ID
8. **Response** → Success response with new issue data
9. **Client** → Redirects to new issue page

---

## 🗄️ Database Architecture

### Schema Overview

TaskForge uses **PostgreSQL 14+** with the following main tables:

```sql
users
  ├── id (UUID, PK)
  ├── name
  ├── email (unique)
  ├── image
  ├── role (admin|manager|user)
  └── timestamps

projects
  ├── id (UUID, PK)
  ├── name
  ├── description
  ├── owner_id (FK → users)
  └── timestamps

issues
  ├── id (UUID, PK)
  ├── title
  ├── description
  ├── type (bug|feature|task|improvement)
  ├── priority (low|medium|high|critical)
  ├── status (open|in_progress|resolved|closed)
  ├── project_id (FK → projects)
  ├── reporter_id (FK → users)
  ├── assignee_id (FK → users, nullable)
  ├── due_date (nullable)
  └── timestamps

comments
  ├── id (UUID, PK)
  ├── content
  ├── issue_id (FK → issues)
  ├── user_id (FK → users)
  └── timestamps

accounts (NextAuth)
  └── OAuth account data

sessions (NextAuth)
  └── Session data
```

### Key Relationships

```
users (1) ──< (∞) projects [owner]
users (1) ──< (∞) issues [reporter]
users (1) ──< (∞) issues [assignee]
users (1) ──< (∞) comments [author]
projects (1) ──< (∞) issues
issues (1) ──< (∞) comments
```

### Indexes

Performance-critical indexes:
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Projects
CREATE INDEX idx_projects_owner_id ON projects(owner_id);

-- Issues
CREATE INDEX idx_issues_project_id ON issues(project_id);
CREATE INDEX idx_issues_reporter_id ON issues(reporter_id);
CREATE INDEX idx_issues_assignee_id ON issues(assignee_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_priority ON issues(priority);
CREATE INDEX idx_issues_due_date ON issues(due_date);

-- Comments
CREATE INDEX idx_comments_issue_id ON comments(issue_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
```

### Database Connection

**Connection Pool** (`src/lib/db.ts`):
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
```

**Query Execution Pattern**:
```typescript
// Repository method
async findById(id: string): Promise<Issue | null> {
  const result = await pool.query(
    'SELECT * FROM issues WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}
```

---

## 🔐 Authentication & Authorization

### Authentication Flow

TaskForge uses **NextAuth.js** with OAuth 2.0 providers:

```
User → Sign In Page
        ↓
      Select Provider (GitHub/Google)
        ↓
      OAuth Provider Login
        ↓
      Provider Authorization
        ↓
      Callback to NextAuth
        ↓
      User Created/Updated in DB
        ↓
      Session Created
        ↓
      JWT Token Issued
        ↓
      User Redirected to Dashboard
```

**Configuration** (`src/lib/auth.ts`):
```typescript
export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Create user in database if first time
      // First user gets admin role
    },
    async jwt({ token, user }) {
      // Add user role to JWT token
    },
    async session({ session, token }) {
      // Add user info to session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};
```

### Authorization (RBAC)

**Role Hierarchy**:
```
Admin (Full access)
  ↓
Manager (Team management)
  ↓
User (Basic access)
```

**Permission Matrix**:

| Resource | Operation | User | Manager | Admin |
|----------|-----------|------|---------|-------|
| Issues | View own | ✅ | ✅ | ✅ |
| Issues | View all | ❌ | ✅ | ✅ |
| Issues | Create | ✅ | ✅ | ✅ |
| Issues | Edit own | ✅ | ✅ | ✅ |
| Issues | Edit any | ❌ | ✅ | ✅ |
| Issues | Delete | ❌ | ✅ | ✅ |
| Issues | Assign | ❌ | ✅ | ✅ |
| Projects | Create | ✅ | ✅ | ✅ |
| Projects | Edit own | ✅ | ✅ | ✅ |
| Projects | Edit any | ❌ | ❌ | ✅ |
| Projects | Delete own | ✅ | ✅ | ✅ |
| Projects | Delete any | ❌ | ❌ | ✅ |
| Users | View | ✅ | ✅ | ✅ |
| Users | Manage roles | ❌ | ❌ | ✅ |
| Admin Panel | Access | ❌ | ❌ | ✅ |

**Permission Check Pattern** (`src/lib/permissions.ts`):
```typescript
export function canEditIssue(
  issue: Issue,
  userId: string,
  userRole: string
): boolean {
  // Admin can edit any issue
  if (userRole === 'admin') return true;

  // Manager can edit any issue
  if (userRole === 'manager') return true;

  // Users can edit their own issues (reporter or assignee)
  return issue.reporter_id === userId || issue.assignee_id === userId;
}
```

### Session Management

- **Storage**: JWT tokens (HTTP-only cookies)
- **Duration**: 30 days
- **Refresh**: Automatic on API calls
- **Security**: CSRF protection via NextAuth

---

## 🚀 API Structure

### API Routes Organization

```
/api/
├── auth/
│   └── [...nextauth]/     # NextAuth endpoints
│       └── route.ts
│
├── issues/
│   ├── route.ts          # GET (list), POST (create)
│   ├── [id]/
│   │   └── route.ts      # GET, PUT, DELETE
│   └── stats/
│       └── route.ts      # GET statistics
│
├── projects/
│   ├── route.ts          # GET (list), POST (create)
│   └── [id]/
│       ├── route.ts      # GET, PUT, DELETE
│       └── issues/
│           └── route.ts  # GET project issues
│
├── comments/
│   ├── route.ts          # POST (create)
│   └── [id]/
│       └── route.ts      # PUT, DELETE
│
├── users/
│   ├── route.ts          # GET (list)
│   ├── [id]/
│   │   └── route.ts      # GET, PUT
│   └── me/
│       └── route.ts      # GET current user
│
└── admin/
    ├── users/
    │   └── route.ts      # GET users, PUT roles
    └── notifications/
        └── route.ts      # POST send notifications
```

### API Endpoint Pattern

**Standard Structure**:
```typescript
// app/api/issues/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import * as issueController from '@/controllers/issueController';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const issues = await issueController.getIssues(
      session.user,
      request.nextUrl.searchParams
    );

    return NextResponse.json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Response Formats

**Success Response**:
```json
{
  "data": { ... },
  "message": "Operation successful" (optional)
}
```

**Error Response**:
```json
{
  "error": "Error message",
  "details": { ... } (optional)
}
```

**List Response**:
```json
{
  "data": [ ... ],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

---

## 🎨 Component Architecture

### Component Hierarchy

```
RootLayout
├── Providers (Session, Theme)
│   ├── Navigation
│   │   ├── Logo
│   │   ├── NavLinks
│   │   ├── DarkModeToggle
│   │   └── UserMenu
│   │
│   ├── KeyboardShortcuts
│   │
│   └── Page Content
│       ├── Dashboard
│       │   ├── StatCard × 5
│       │   ├── RecentIssues
│       │   └── RecentProjects
│       │
│       ├── Issues List
│       │   ├── FilterBar
│       │   ├── IssueCard × N
│       │   └── Pagination
│       │
│       ├── Issue Detail
│       │   ├── IssueHeader
│       │   ├── InfoGrid (4 panels)
│       │   ├── Description
│       │   ├── CommentList
│       │   │   └── CommentItem × N
│       │   └── ActivityTimeline
│       │
│       └── Project Detail
│           ├── ProjectHeader
│           ├── StatCards × 6
│           └── IssueList
```

### Component Types

#### 1. Server Components (Default)
- **Purpose**: Server-side rendering, data fetching
- **Examples**: Page components, layout components
- **Benefits**: No JavaScript sent to client, fast initial load

```typescript
// app/issues/[id]/page.tsx (Server Component)
export default async function IssuePage({ params }: Props) {
  const issue = await issueService.getById(params.id);
  return <IssueDetail issue={issue} />;
}
```

#### 2. Client Components
- **Purpose**: Interactivity, state management, browser APIs
- **Marker**: `'use client'` directive
- **Examples**: Forms, modals, toggles

```typescript
// components/DarkModeToggle.tsx (Client Component)
'use client';
import { useState, useEffect } from 'react';

export function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);
  // ... interactive logic
}
```

#### 3. UI Components (`src/components/ui/`)

Reusable, styled components:

- **Button**: Primary, secondary, danger, ghost variants
- **Card**: Container with shadow and padding
- **Badge**: Status, priority, type indicators
- **Input/Textarea**: Form inputs with validation
- **Select/Dropdown**: Selection controls
- **Modal**: Dialog overlays
- **Loading**: Spinner, skeleton states

**Example**:
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}
```

### State Management

**Approach**: Minimal, local state with React hooks

1. **Server State**: Fetched in Server Components, passed as props
2. **Form State**: `useState` for controlled inputs
3. **Theme State**: `localStorage` + `useEffect`
4. **Session State**: NextAuth `useSession` hook

**No global state library** (Redux, Zustand) - not needed for current scale.

---

## 🔄 Data Flow

### Read Operations (Issue Detail Page)

```
1. User navigates to /issues/[id]
         ↓
2. Server Component renders
   - Calls issueService.getById(id)
         ↓
3. Service layer
   - Checks permissions
   - Calls issueRepository.findById(id)
         ↓
4. Repository layer
   - Executes SELECT query
   - Joins users, projects tables
         ↓
5. Database
   - Returns issue data
         ↓
6. Data flows back up
   - Repository → Service → Component
         ↓
7. Server Component renders HTML
   - Sends to client as SSR content
         ↓
8. Client hydrates interactive parts
```

### Write Operations (Create Issue)

```
1. User fills form and clicks submit
         ↓
2. Client Component (form)
   - Validates input
   - POST to /api/issues
         ↓
3. API Route
   - Authenticates request
   - Calls issueController.create()
         ↓
4. Controller
   - Validates request body
   - Calls issueService.create()
         ↓
5. Service
   - Checks permissions (can user create?)
   - Validates business rules
   - Calls issueRepository.create()
         ↓
6. Repository
   - Executes INSERT query
         ↓
7. Database
   - Stores issue
   - Returns new ID
         ↓
8. Response flows back
   - Repository → Service → Controller → API Route
         ↓
9. API responds with JSON
         ↓
10. Client Component
    - Shows success message
    - Redirects to new issue page
```

### Real-Time Updates

**Current**: No real-time sync (page refresh required)

**Future Enhancement**: Consider WebSockets or Server-Sent Events for:
- New comment notifications
- Issue status updates
- Assignment changes

---

## 🔒 Security Architecture

### Threat Model

**Protected Against**:
1. ✅ SQL Injection - Parameterized queries
2. ✅ XSS - React auto-escaping
3. ✅ CSRF - NextAuth protection
4. ✅ Session hijacking - HTTP-only cookies
5. ✅ Unauthorized access - RBAC checks

### Security Layers

#### 1. Network Layer
- HTTPS only in production
- CORS configured
- Rate limiting (future)

#### 2. Authentication Layer
- OAuth 2.0 (no password storage)
- Secure token generation
- Session expiration

#### 3. Authorization Layer
- Role-based access control
- Permission checks in services
- Owner-based permissions

#### 4. Data Layer
- Parameterized SQL queries
- Input validation
- Output sanitization

#### 5. API Layer
- Request validation
- Error message sanitization
- Audit logging (future)

### SQL Injection Prevention

**Always use parameterized queries**:
```typescript
// ❌ BAD - SQL Injection vulnerable
const query = `SELECT * FROM issues WHERE id = '${id}'`;

// ✅ GOOD - Parameterized
const query = 'SELECT * FROM issues WHERE id = $1';
const result = await pool.query(query, [id]);
```

### XSS Prevention

- **React**: Automatically escapes output
- **User Input**: Sanitize before storing (future)
- **Markdown**: Use safe renderer (future)

### CSRF Protection

- **NextAuth**: Built-in CSRF tokens
- **API Routes**: Verify origin headers
- **Forms**: Include CSRF token (future enhancement)

---

## ⚡ Performance Optimization

### 1. Database Optimization

**Indexes**: On frequently queried columns
```sql
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_assignee_id ON issues(assignee_id);
```

**Query Optimization**:
- Use JOINs instead of N+1 queries
- Select only needed columns
- Limit result sets

**Connection Pooling**:
- Max 20 connections
- Reuse connections
- Auto-cleanup idle connections

### 2. Caching Strategy

**Current**:
- Static page caching (Next.js)
- React Server Component caching

**Future**:
- Redis for session storage
- CDN for static assets
- Query result caching

### 3. Rendering Strategy

**Server-Side Rendering** (SSR):
- Faster initial page load
- Better SEO
- Reduced JavaScript bundle

**Client-Side** (minimal):
- Only for interactive parts
- Form handling
- Theme toggle

### 4. Code Splitting

- Automatic by Next.js
- Dynamic imports for large components
- Route-based splitting

### 5. Image Optimization

- Use Next.js `<Image>` component
- Lazy loading
- Responsive images

---

## 🚀 Deployment Architecture

### Deployment Options

#### Option 1: Vercel (Recommended)

```
GitHub Repo
     ↓
  Vercel
     ↓
  ┌─────────────────┐
  │  Vercel Edge    │
  │   Functions     │
  │                 │
  │  Next.js App    │
  └─────────────────┘
         ↓
  ┌─────────────────┐
  │   PostgreSQL    │
  │  (Vercel DB)    │
  └─────────────────┘
```

**Benefits**:
- Zero config deployment
- Automatic HTTPS
- Edge CDN
- Serverless scaling

#### Option 2: Docker Container

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Deployment**:
```bash
docker build -t taskforge .
docker run -p 3000:3000 --env-file .env taskforge
```

#### Option 3: Traditional Server (VPS)

```
Load Balancer (Nginx)
         ↓
  ┌──────────────┐
  │  PM2 Process │
  │   Manager    │
  │              │
  │  Next.js × 4 │
  └──────────────┘
         ↓
  ┌──────────────┐
  │ PostgreSQL   │
  │   Server     │
  └──────────────┘
```

### Environment Variables

**Required**:
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Auth
NEXTAUTH_URL=https://app.domain.com
NEXTAUTH_SECRET=random-32-char-string

# OAuth
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

**Optional**:
```env
# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@gmail.com
SMTP_PASSWORD=app-password

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
SLACK_BOT_TOKEN=xoxb-...
SLACK_DEFAULT_CHANNEL=#issues
```

### Scaling Considerations

**Horizontal Scaling**:
- Multiple Next.js instances
- Load balancer
- Shared session storage (Redis)

**Vertical Scaling**:
- Increase database resources
- More CPU/memory for app servers

**Database Scaling**:
- Read replicas for queries
- Master for writes
- Connection pooling

---

## 📊 Monitoring & Observability

### Logging

**Current**:
- Console logs
- Error tracking in catch blocks

**Future**:
- Structured logging (Winston/Pino)
- Log aggregation (ELK, Datadog)
- Error tracking (Sentry)

### Metrics

**Track**:
- Response times
- Error rates
- Database query performance
- User activity

### Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  const dbHealth = await checkDatabase();
  return NextResponse.json({
    status: 'ok',
    database: dbHealth,
    timestamp: new Date().toISOString(),
  });
}
```

---

## 🔮 Future Architecture Enhancements

### Phase 2
1. **Caching Layer** - Redis for sessions and queries
2. **Background Jobs** - Bull/BullMQ for async tasks
3. **Real-Time** - WebSocket for live updates
4. **File Storage** - S3 for attachments
5. **Search** - Elasticsearch for advanced search

### Phase 3
1. **Microservices** - Break into smaller services
2. **Event Sourcing** - Audit trail with events
3. **GraphQL** - Alternative to REST API
4. **Mobile API** - Dedicated mobile endpoints
5. **Multi-Tenancy** - Support multiple organizations

---

## 📚 Related Documentation

- **[README.md](README.md)** - Project overview
- **[FEATURES.md](FEATURES.md)** - Complete feature list
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - API reference
- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Database details
- **[RBAC-SYSTEM.md](RBAC-SYSTEM.md)** - Access control
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Deployment instructions

---

**For technical questions or contributions, see [CONTRIBUTING.md](CONTRIBUTING.md)**

*Last updated: March 25, 2026*
