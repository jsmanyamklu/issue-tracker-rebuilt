# Clean Architecture - Issue Tracker

This document describes the clean architecture implementation of the Issue Tracker application.

## Architecture Overview

The application follows strict clean architecture principles with clear separation of concerns across layers.

```
┌─────────────────────────────────────────────────────────────┐
│                        Presentation Layer                    │
│  (Next.js Pages, React Components, UI)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                         API Layer                            │
│  (Next.js Route Handlers - HTTP Request/Response)           │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                      Controller Layer                        │
│  (HTTP Logic, Request Validation, Response Formatting)      │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                       Service Layer                          │
│  (Business Logic, Validation, Permissions, Orchestration)   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                     Repository Layer                         │
│  (Raw SQL Queries, Database Operations)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                       Data Layer                             │
│  (PostgreSQL Database)                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         AI Module                            │
│  (Separate, Optional, Pluggable)                            │
│  - LLM Client                                                │
│  - Issue Classification                                      │
│  - Root Cause Analysis                                       │
│  - Embeddings & Similarity Search                           │
└─────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Data Layer (PostgreSQL)

**Location**: Database

**Responsibilities**:
- Store data persistently
- Enforce data integrity via constraints
- Provide efficient querying via indexes

**Files**:
- `migrations/*.sql` - Database schema definitions

**Key Features**:
- UUID primary keys
- Foreign key constraints with cascade rules
- Automatic timestamp updates via triggers
- Full-text search indexes
- Enums for type safety

---

### 2. Repository Layer

**Location**: `src/repositories/`

**Responsibilities**:
- Execute raw SQL queries
- Transform database results to domain models
- Handle database errors
- NO business logic

**Files**:
- `UserRepository.ts`
- `ProjectRepository.ts`
- `IssueRepository.ts`
- `CommentRepository.ts`

**Principles**:
- ✅ Pure SQL queries (no ORM magic)
- ✅ Type-safe results
- ✅ Singleton pattern for easy import
- ✅ Database error handling
- ❌ No business logic
- ❌ No validation

**Example**:
```typescript
export class IssueRepository {
  async findById(id: string): Promise<Issue | null> {
    const result = await query<Issue>(
      'SELECT * FROM issues WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }
}
```

---

### 3. Service Layer

**Location**: `src/services/`

**Responsibilities**:
- Business logic implementation
- Data validation
- Permission checks
- Orchestrate multiple repositories
- Handle domain-specific rules

**Files**:
- `UserService.ts`
- `ProjectService.ts`
- `IssueService.ts`
- `CommentService.ts`

**Principles**:
- ✅ All business rules
- ✅ Input validation
- ✅ Permission checks
- ✅ Relationship verification
- ✅ Complex operations coordination
- ❌ No HTTP concerns
- ❌ No database queries (use repositories)

**Example**:
```typescript
export class IssueService {
  async create(data: CreateIssueDTO): Promise<Issue> {
    // Validation
    if (!data.title || data.title.trim().length === 0) {
      throw new ValidationError('Title is required');
    }

    // Relationship verification
    const project = await projectRepository.findById(data.project_id);
    if (!project) {
      throw new NotFoundError('Project');
    }

    // Create via repository
    return await issueRepository.create(data);
  }
}
```

---

### 4. Controller Layer

**Location**: `src/controllers/`

**Responsibilities**:
- Handle HTTP request/response logic
- Call appropriate service methods
- Format responses consistently
- Handle errors gracefully

**Files**:
- `IssueController.ts`
- `ProjectController.ts`
- `CommentController.ts`

**Principles**:
- ✅ HTTP concern handling
- ✅ Response formatting
- ✅ Error to HTTP status mapping
- ❌ No business logic
- ❌ No database access

**Example**:
```typescript
export class IssueController {
  async getById(id: string): Promise<ApiResponse> {
    try {
      const issue = await issueService.getById(id);
      return createSuccessResponse(issue);
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error.message);
      }
      return createErrorResponse('Internal server error');
    }
  }
}
```

---

### 5. API Layer

**Location**: `src/app/api/`

**Responsibilities**:
- Define HTTP endpoints
- Extract request data
- Authenticate requests
- Call controllers
- Return HTTP responses

**Structure**:
```
api/
├── projects/
│   ├── route.ts (GET, POST)
│   └── [id]/
│       ├── route.ts (GET, PUT, DELETE)
│       └── issues/
│           └── route.ts (GET)
├── issues/
│   ├── route.ts (GET, POST)
│   ├── [id]/
│   │   ├── route.ts (GET, PUT, DELETE)
│   │   ├── assign/route.ts (POST)
│   │   └── comments/route.ts (GET, POST)
│   ├── search/route.ts (GET)
│   └── stats/route.ts (GET)
├── comments/
│   └── [id]/route.ts (GET, PUT, DELETE)
└── ai/
    ├── classify/route.ts (POST)
    ├── root-cause/route.ts (POST)
    └── similar/route.ts (POST)
```

**Principles**:
- ✅ Authentication via `getCurrentUser()`
- ✅ Extract query params and body
- ✅ Call controller methods
- ✅ Return Next.js Response
- ❌ No business logic

---

### 6. Presentation Layer

**Location**: `src/app/`, `src/components/`

**Responsibilities**:
- Render UI
- Handle user interactions
- Call API endpoints
- Display data

**Structure**:
```
app/
├── (auth)/
│   └── signin/page.tsx
├── dashboard/page.tsx
├── projects/
│   ├── page.tsx (list)
│   ├── new/page.tsx (create)
│   └── [id]/page.tsx (detail)
├── issues/
│   ├── [id]/page.tsx (detail)
│   └── new/page.tsx (create)
└── my-issues/page.tsx

components/
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   └── Select.tsx
├── auth/
│   ├── SignInButton.tsx
│   ├── SignOutButton.tsx
│   ├── UserAvatar.tsx
│   └── AuthGuard.tsx
└── Navigation.tsx
```

**Principles**:
- ✅ Component-based UI
- ✅ Server components for data fetching
- ✅ Client components for interactivity
- ✅ Reusable UI components
- ❌ No business logic
- ❌ No direct database access

---

### 7. AI Module (Separate, Optional)

**Location**: `src/lib/ai/`

**Responsibilities**:
- LLM API interactions
- Issue classification
- Root cause analysis
- Vector embeddings
- Similarity search

**Files**:
- `llm-client.ts` - LLM API wrapper
- `issue-classifier.ts` - Auto-classify issues
- `root-cause-analyzer.ts` - Analyze root causes
- `embeddings-service.ts` - Generate and store embeddings
- `similar-issue-finder.ts` - Find similar issues

**Principles**:
- ✅ Completely optional (graceful degradation)
- ✅ Pluggable (easy to replace LLM provider)
- ✅ No dependencies on other layers
- ✅ Can be enabled/disabled via env var

---

## Dependency Flow

**The golden rule**: Dependencies flow INWARD only.

```
Presentation → API → Controller → Service → Repository → Database
                                      ↓
                                  AI Module (optional)
```

**What this means**:
- Presentation can depend on API
- API can depend on Controllers
- Controllers can depend on Services
- Services can depend on Repositories
- Services can depend on AI Module
- Repositories can only depend on Database
- AI Module depends on nothing (self-contained)

**What this prevents**:
- ❌ Repositories cannot depend on Services
- ❌ Services cannot depend on Controllers
- ❌ Controllers cannot depend on API routes
- ❌ Database cannot depend on anything

---

## Key Design Patterns

### 1. Singleton Pattern
All repositories and services are exported as singletons:

```typescript
export const issueRepository = new IssueRepository();
export const issueService = new IssueService();
```

### 2. DTO Pattern
Data Transfer Objects for type safety:

```typescript
interface CreateIssueDTO {
  project_id: string;
  title: string;
  description?: string;
  // ...
}
```

### 3. Error Handling
Custom error classes with status codes:

```typescript
class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}
```

### 4. Repository Pattern
Encapsulate database operations:

```typescript
class IssueRepository {
  findById(id: string): Promise<Issue | null>
  create(data: CreateIssueDTO): Promise<Issue>
  update(id: string, data: UpdateIssueDTO): Promise<Issue>
  delete(id: string): Promise<void>
}
```

---

## Data Flow Example

**User creates an issue:**

1. **Frontend** (`/projects/[id]` page):
   - User fills form and clicks "Create Issue"
   - Calls `POST /api/issues` with form data

2. **API Route** (`api/issues/route.ts`):
   - Extracts request body
   - Calls `getCurrentUser()` for authentication
   - Adds `reporter_id` from current user
   - Calls `issueController.create(data)`

3. **Controller** (`IssueController.ts`):
   - Receives data
   - Calls `issueService.create(data)`
   - Catches errors and formats response
   - Returns `ApiResponse`

4. **Service** (`IssueService.ts`):
   - Validates title is not empty
   - Verifies project exists via `projectRepository`
   - Verifies reporter exists via `userRepository`
   - Verifies assignee exists (if provided)
   - Calls `issueRepository.create(data)`
   - Optionally generates embedding via AI module

5. **Repository** (`IssueRepository.ts`):
   - Executes SQL INSERT query
   - Returns created Issue object

6. **Database** (PostgreSQL):
   - Inserts record
   - Returns inserted row

**Response flows back through the layers.**

---

## Testing Strategy

### Unit Tests
- Services: Test business logic in isolation
- Repositories: Test SQL queries against test DB
- Controllers: Test response formatting

### Integration Tests
- API routes: Test full request/response cycle
- Database: Test migrations and constraints

### E2E Tests
- Frontend: Test user flows with Playwright/Cypress

---

## Benefits of This Architecture

### ✅ Maintainability
- Clear responsibility for each layer
- Easy to find and fix bugs
- Changes isolated to specific layers

### ✅ Testability
- Each layer can be tested independently
- Mock dependencies easily
- Clear interfaces

### ✅ Scalability
- Easy to add new features
- Can replace any layer without affecting others
- Horizontal scaling possible

### ✅ No Vendor Lock-in
- Raw SQL queries (no ORM)
- Standard Next.js patterns
- Can swap LLM provider easily
- Can migrate from PostgreSQL if needed

### ✅ Security
- Permission checks in Service layer
- SQL injection prevention via parameterized queries
- Authentication middleware on API routes

### ✅ Performance
- Efficient raw SQL queries
- Proper database indexes
- Connection pooling
- Optional AI features

---

## Evolution Path

### Phase 1: Current (MVP)
- Basic CRUD operations
- Authentication
- Simple UI
- Optional AI features

### Phase 2: Enhanced
- Real-time updates (WebSockets)
- Advanced search and filtering
- Email notifications
- File attachments

### Phase 3: Scale
- Microservices (if needed)
- Event sourcing
- CQRS pattern
- Advanced caching

---

## Architecture Approach: BaaS vs Clean Architecture

| Aspect | Traditional BaaS Approach | TaskForge (Clean Architecture) |
|--------|--------------------------|-------------------------------|
| Backend | Third-party BaaS | Custom Next.js + PostgreSQL |
| Architecture | Monolithic BaaS | Layered clean architecture |
| Database Access | BaaS SDK | Raw SQL with pg driver |
| Business Logic | Mixed in components | Dedicated Service layer |
| Testing | Difficult | Easy (isolated layers) |
| Vendor Lock-in | High | None |
| Control | Limited | Full |
| Learning Curve | Low | Medium |
| Scalability | Limited by provider | Fully scalable |

---

## Conclusion

This architecture provides:
- **Clarity**: Each layer has a single, well-defined purpose
- **Flexibility**: Easy to modify or replace any part
- **Maintainability**: Simple to understand and extend
- **Quality**: Testable, performant, secure

The system is production-ready and can evolve with your needs without major rewrites.
