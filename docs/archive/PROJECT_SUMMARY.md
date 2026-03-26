# Issue Tracker - Project Summary

## Overview

TaskForge is a **production-grade task and issue tracking system** built with **clean architecture principles** and **zero vendor lock-in**. Built from the ground up as an explicit, maintainable, and scalable application with modern best practices.

## Key Features

### ✅ Core Functionality
- **User Authentication** - Google & GitHub OAuth via NextAuth
- **Project Management** - Create, organize, and manage projects
- **Issue Tracking** - Full CRUD operations with status, priority, type
- **Issue Assignment** - Assign issues to team members
- **Comments** - Collaborate on issues with comments
- **Dashboard** - Overview of your work
- **My Issues** - Personalized view of assigned issues

### ✅ AI-Powered Features (Optional)
- **Issue Classification** - Auto-detect issue type and priority
- **Root Cause Analysis** - AI-powered debugging assistance
- **Similar Issues** - Find duplicate or related issues using embeddings
- **Graceful Degradation** - Works perfectly without AI

### ✅ Production-Ready
- **Type Safe** - Full TypeScript throughout
- **Secure** - Permission checks, SQL injection prevention
- **Performant** - Raw SQL, connection pooling, proper indexes
- **Scalable** - Clean architecture allows easy scaling
- **Testable** - Isolated layers for unit/integration testing

## Architecture

### Clean Layered Architecture

```
Frontend (Next.js 15)
    ↓
API Layer (Route Handlers)
    ↓
Controller Layer
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Raw SQL)
    ↓
PostgreSQL Database

AI Module (Optional, Separate)
```

### Key Principles

1. **Separation of Concerns** - Each layer has ONE responsibility
2. **Dependency Inversion** - Dependencies flow inward only
3. **No Vendor Lock-in** - Raw SQL, standard Next.js patterns
4. **Explicit Over Implicit** - No ORM magic, clear code
5. **Testability** - Mock any layer easily

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| API | Next.js Route Handlers |
| Authentication | NextAuth (OAuth: Google, GitHub) |
| Database | PostgreSQL 14+ with `pg` driver |
| AI (Optional) | OpenAI API (or compatible) |
| Deployment | Any Node.js platform (Vercel, AWS, etc.) |

## Project Structure

```
issue-tracker-rebuilt/
├── src/
│   ├── app/                    # Next.js pages & API routes
│   │   ├── api/                # REST API endpoints
│   │   ├── dashboard/          # Dashboard UI
│   │   ├── projects/           # Projects UI
│   │   └── my-issues/          # User issues UI
│   ├── controllers/            # HTTP request/response handling
│   │   ├── IssueController.ts
│   │   ├── ProjectController.ts
│   │   └── CommentController.ts
│   ├── services/               # Business logic
│   │   ├── IssueService.ts
│   │   ├── ProjectService.ts
│   │   ├── CommentService.ts
│   │   └── UserService.ts
│   ├── repositories/           # Database operations (raw SQL)
│   │   ├── IssueRepository.ts
│   │   ├── ProjectRepository.ts
│   │   ├── CommentRepository.ts
│   │   └── UserRepository.ts
│   ├── lib/                    # Utilities
│   │   ├── db/                 # Database connection & pooling
│   │   ├── auth/               # NextAuth configuration
│   │   ├── ai/                 # AI module (optional)
│   │   ├── errors.ts           # Custom error classes
│   │   └── utils.ts            # Helper functions
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components
│   │   ├── auth/               # Authentication components
│   │   └── Navigation.tsx      # Main navigation
│   └── types/                  # TypeScript type definitions
├── migrations/                 # SQL migration files
│   ├── 001_create_users_table.sql
│   ├── 002_create_projects_table.sql
│   ├── 003_create_issues_table.sql
│   ├── 004_create_comments_table.sql
│   └── 005_create_issue_embeddings_table.sql
├── scripts/                    # Utility scripts
│   ├── migrate.js              # Run database migrations
│   ├── db-reset.js             # Reset database
│   └── seed.js                 # Seed sample data
├── .env.example                # Environment variables template
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── middleware.ts               # Authentication middleware
├── README.md                   # Project overview
├── SETUP_GUIDE.md              # Setup instructions
├── ARCHITECTURE.md             # Architecture deep-dive
├── API_DOCUMENTATION.md        # API reference
├── AUTHENTICATION_GUIDE.md     # Auth setup details
├── DATABASE_SCHEMA.md          # Database documentation
└── PROJECT_SUMMARY.md          # This file
```

## Database Schema

### Tables

- **users** - User accounts with OAuth info
- **projects** - Project information
- **issues** - Issues/tickets with status, priority, type
- **comments** - Comments on issues
- **issue_embeddings** - Vector embeddings for AI similarity
- **migrations** - Migration tracking

### Key Features

- UUID primary keys
- Foreign key constraints with cascade rules
- Automatic timestamp updates via triggers
- Full-text search indexes (GIN)
- Enums for type safety (status, priority, type)

See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for full schema.

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/issues` - Get project issues

### Issues
- `GET /api/issues` - List issues (with filters)
- `POST /api/issues` - Create issue
- `GET /api/issues/:id` - Get issue details
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue
- `POST /api/issues/:id/assign` - Assign issue
- `GET /api/issues/search?q=term` - Search issues
- `GET /api/issues/stats` - Get statistics

### Comments
- `GET /api/issues/:id/comments` - Get issue comments
- `POST /api/issues/:id/comments` - Add comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### AI (Optional)
- `POST /api/ai/classify` - Auto-classify issue
- `POST /api/ai/root-cause` - Analyze root cause
- `POST /api/ai/similar` - Find similar issues

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for full API reference.

## Authentication

- **Providers**: Google OAuth, GitHub OAuth
- **Strategy**: NextAuth with JWT sessions
- **Security**: HTTP-only cookies, CSRF protection
- **Middleware**: Automatic route protection
- **Session**: 30-day expiration

See [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) for setup.

## AI Features

### Issue Classifier
Automatically determines issue type (bug, feature, task, improvement) and priority (low, medium, high, critical) using LLM analysis.

### Root Cause Analyzer
Analyzes issue descriptions and suggests likely root causes and fixes.

### Similar Issue Finder
Uses vector embeddings and cosine similarity to find duplicate or related issues.

### Architecture
- **Modular**: Separate from main application
- **Optional**: Works without AI (fallback logic)
- **Pluggable**: Easy to swap LLM providers
- **Graceful**: Fails gracefully if unavailable

## Setup Instructions

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Run migrations
npm run migrate

# 4. (Optional) Seed data
npm run db:seed

# 5. Start development server
npm run dev
```

### Requirements

- Node.js 18+
- PostgreSQL 14+
- Google OAuth credentials
- GitHub OAuth credentials
- OpenAI API key (optional for AI)

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions.

## Code Quality

### TypeScript
- ✅ Strict mode enabled
- ✅ Full type coverage
- ✅ No `any` types
- ✅ DTOs for all data transfers

### Error Handling
- ✅ Custom error classes with status codes
- ✅ Consistent error responses
- ✅ Proper HTTP status codes
- ✅ User-friendly error messages

### Security
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention (React escaping)
- ✅ CSRF protection (NextAuth)
- ✅ Permission checks in Service layer
- ✅ Authentication middleware

### Performance
- ✅ Database connection pooling
- ✅ Proper indexes (composite, GIN)
- ✅ Efficient queries (JOINs, filtering)
- ✅ No N+1 query problems

## Testing Strategy

### Unit Tests
- Test services in isolation
- Mock repositories
- Test business logic

### Integration Tests
- Test API endpoints
- Test database operations
- Test authentication flow

### E2E Tests
- Test user flows
- Test UI interactions
- Test full stack

## Deployment

### Supported Platforms
- Vercel (recommended)
- Netlify
- AWS (EC2, ECS, Lambda)
- Google Cloud Run
- Any Node.js hosting

### Database Options
- AWS RDS (PostgreSQL)
- Google Cloud SQL
- Azure Database
- Supabase (database only)
- Railway
- Neon

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for deployment details.

## Architecture Approach Comparison

| Aspect | Traditional BaaS | TaskForge (Clean Architecture) |
|--------|------------------|-------------------------------|
| **Backend** | Third-party BaaS | Custom Next.js + PostgreSQL |
| **Architecture** | Monolithic BaaS | Layered clean architecture |
| **Database Access** | BaaS SDK | Raw SQL with pg driver |
| **Business Logic** | Mixed in UI | Dedicated Service layer |
| **Vendor Lock-in** | High | None |
| **Control** | Limited | Full |
| **Testability** | Difficult | Easy |
| **Scalability** | Limited by provider | Fully scalable |
| **Maintainability** | Medium | High |
| **Learning Curve** | Low | Medium |
| **Production Ready** | Yes | Yes |

## Benefits of Clean Architecture

### 1. Maintainability
- Clear separation of concerns
- Easy to find and fix bugs
- Changes isolated to specific layers

### 2. Testability
- Each layer testable independently
- Easy to mock dependencies
- Clear interfaces

### 3. Scalability
- Easy to add features
- Can replace any layer
- Horizontal scaling ready

### 4. No Vendor Lock-in
- Standard PostgreSQL
- Standard Next.js patterns
- Can migrate to any database/framework

### 5. Team Collaboration
- Clear boundaries between layers
- Multiple developers can work simultaneously
- Easy onboarding with clear structure

## Future Enhancements

### Planned Features
- Real-time updates (WebSockets)
- Email notifications
- File attachments
- Advanced search & filtering
- Issue templates
- Custom fields
- Time tracking
- Sprint management

### Infrastructure
- Redis caching
- Message queue (RabbitMQ/Kafka)
- Microservices (if needed)
- Event sourcing
- CQRS pattern

## Learning Resources

### Documentation
- [README.md](README.md) - Project overview
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Setup instructions
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture deep-dive
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
- [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) - Auth setup
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Database docs

### Key Files to Study
- `src/repositories/IssueRepository.ts` - Raw SQL examples
- `src/services/IssueService.ts` - Business logic examples
- `src/controllers/IssueController.ts` - HTTP handling examples
- `src/app/api/issues/route.ts` - API route examples
- `src/lib/ai/issue-classifier.ts` - AI integration example

## License

MIT

## Conclusion

This project demonstrates:
- ✅ Clean architecture principles in practice
- ✅ Production-grade code structure
- ✅ Separation of concerns
- ✅ No vendor lock-in
- ✅ Full control over your stack
- ✅ Scalable and maintainable codebase

**Ready for production. Ready to scale. Ready to evolve.**

---

Built with ❤️ using clean architecture principles.
