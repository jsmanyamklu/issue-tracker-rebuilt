# TaskForge - Clean Architecture

> A production-grade task and issue management platform built with clean architecture principles and zero vendor lock-in.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Overview

TaskForge is a **modern, enterprise-grade task and issue management platform** built from the ground up with **clean architecture principles**. No ORM magic, no vendor lock-in, just clean, production-ready code with complete control over your stack.

### Key Features

✅ **User Authentication** - Google & GitHub OAuth
✅ **Project Management** - Create and organize projects
✅ **Issue Tracking** - Full CRUD with status, priority, type
✅ **Comments** - Collaborate on issues
✅ **Dashboard** - Personalized overview
✅ **AI-Powered** - Auto-classification, root cause analysis, similarity search (optional)
✅ **Production-Ready** - Type-safe, secure, performant, testable

## Architecture

```
┌─────────────────────────────────────────────┐
│         Frontend (Next.js 15)               │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│         API Layer (Route Handlers)          │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│         Controller Layer                    │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│    Service Layer (Business Logic)           │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│    Repository Layer (Raw SQL)               │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│         PostgreSQL Database                 │
└─────────────────────────────────────────────┘

         AI Module (Optional, Separate)
```

**Key Principles:**
- ✅ Separation of Concerns
- ✅ Dependency Inversion
- ✅ Explicit over Implicit
- ✅ No Vendor Lock-in
- ✅ Testable & Maintainable

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Run database migrations
npm run migrate

# 4. (Optional) Seed sample data
npm run db:seed

# 5. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

👉 **Detailed setup:** [SETUP_GUIDE.md](SETUP_GUIDE.md)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, PostgreSQL, pg driver |
| Auth | NextAuth (Google, GitHub OAuth) |
| AI (Optional) | OpenAI API |
| Testing | Jest, React Testing Library |

## Project Structure

```
issue-tracker-rebuilt/
├── src/
│   ├── app/                 # Next.js pages & API routes
│   ├── controllers/         # HTTP request/response handling
│   ├── services/            # Business logic
│   ├── repositories/        # Database operations (raw SQL)
│   ├── lib/                 # Utilities (db, auth, ai)
│   ├── components/          # React components
│   └── types/               # TypeScript definitions
├── migrations/              # SQL migration files
├── scripts/                 # Utility scripts
├── .env.example             # Environment template
└── [documentation files]
```

## Documentation

📚 **Complete documentation available:**

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup instructions
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture deep-dive
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - REST API reference
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Database schema
- [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) - Auth setup
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Complete project overview

## API Overview

### Projects
```
GET    /api/projects           # List all projects
POST   /api/projects           # Create project
GET    /api/projects/:id       # Get project
PUT    /api/projects/:id       # Update project
DELETE /api/projects/:id       # Delete project
```

### Issues
```
GET    /api/issues             # List issues (with filters)
POST   /api/issues             # Create issue
GET    /api/issues/:id         # Get issue
PUT    /api/issues/:id         # Update issue
DELETE /api/issues/:id         # Delete issue
GET    /api/issues/search      # Search issues
```

### AI Features
```
POST   /api/ai/classify        # Auto-classify issue
POST   /api/ai/root-cause      # Analyze root cause
POST   /api/ai/similar         # Find similar issues
```

👉 **Full API docs:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## Features

### Core Functionality

#### Project Management
- Create and organize multiple projects
- View project details and statistics
- Track issues per project

#### Issue Tracking
- Create, edit, and delete issues
- Set status, priority, and type
- Assign issues to team members
- Search and filter issues
- Full-text search support

#### Comments
- Add comments to issues
- Edit and delete own comments
- Collaborative discussions

#### Dashboard
- Personalized issue overview
- Statistics and metrics
- Recent activity

### AI Features (Optional)

#### Auto-Classification
Automatically determines issue type (bug, feature, task, improvement) and priority (low, medium, high, critical) using LLM analysis.

```typescript
POST /api/ai/classify
{
  "title": "Login page crashes on mobile",
  "description": "Users cannot log in from mobile devices"
}

Response:
{
  "type": "bug",
  "priority": "high",
  "confidence": 0.92,
  "reasoning": "Critical user-facing functionality is broken"
}
```

#### Root Cause Analysis
AI-powered debugging assistance that suggests likely causes and fixes.

```typescript
POST /api/ai/root-cause
{
  "title": "Database connection timeout",
  "description": "API returning 500 errors intermittently",
  "logs": "Error: connection timeout after 5000ms"
}

Response:
{
  "likely_cause": "Connection pool exhausted",
  "suggested_fixes": [
    "Increase connection pool size",
    "Implement connection retry logic",
    "Add query timeout limits"
  ],
  "confidence": 0.85
}
```

#### Similar Issue Detection
Find duplicate or related issues using vector embeddings.

```typescript
POST /api/ai/similar
{
  "title": "User login fails with 500 error",
  "description": "Cannot authenticate users"
}

Response:
{
  "similar_issues": [
    {
      "issue": { ... },
      "similarity_score": 0.89,
      "matching_aspects": ["Same symptoms", "Related component"]
    }
  ]
}
```

## Database Schema

### Tables
- **users** - User accounts (OAuth)
- **projects** - Project information
- **issues** - Issues/tickets
- **comments** - Comments on issues
- **issue_embeddings** - Vector embeddings for AI

### Features
- UUID primary keys
- Foreign key constraints
- Automatic timestamps
- Full-text search indexes
- Type-safe enums

👉 **Full schema:** [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

## Development

### Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking

npm run migrate      # Run database migrations
npm run db:reset     # Reset database (careful!)
npm run db:seed      # Seed sample data
```

### Testing

```bash
npm run test         # Run tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

## Deployment

### Environment Variables

Required for production:

```bash
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
OPENAI_API_KEY=...  # Optional
```

### Platforms

Deploy to:
- **Vercel** (recommended) - One-click deploy
- **Netlify** - Serverless functions
- **AWS** - EC2, ECS, or Lambda
- **Google Cloud Run** - Containerized
- Any Node.js hosting platform

### Database

Use managed PostgreSQL:
- AWS RDS
- Google Cloud SQL
- Azure Database
- Supabase (database only)
- Railway, Neon

👉 **Deployment guide:** [SETUP_GUIDE.md](SETUP_GUIDE.md#production-deployment)

## Why Clean Architecture?

### Benefits

✅ **Maintainable** - Clear separation of concerns
✅ **Testable** - Each layer tested independently
✅ **Scalable** - Easy to add features and scale
✅ **No Lock-in** - Can swap any technology
✅ **Team-Friendly** - Clear structure for collaboration

### Key Advantages

| Approach | TaskForge (Clean Architecture) |
|----------|-------------------------------|
| Architecture | Layered clean architecture |
| Vendor Lock-in | None - use any database/framework |
| Code Style | Explicit, readable, maintainable |
| Control | Full control over entire stack |
| Separation | Clean separation of concerns |
| Testing | Easy - isolated testable layers |
| Scaling | Fully scalable horizontally |

## Contributing

Contributions welcome! This project demonstrates:

1. **Clean Architecture** principles
2. **Explicit over Implicit** coding
3. **Production-ready** patterns
4. **No vendor lock-in** approach

Please open issues or pull requests.

## License

MIT License - see [LICENSE](LICENSE) file

## Learn More

### Resources
- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Support

- 📖 Read the documentation in this repo
- 🐛 Report bugs via GitHub Issues
- 💡 Request features via GitHub Issues
- 📧 Questions? Open a discussion

---

**Built with ❤️ using clean architecture principles**

[⭐ Star this repo](https://github.com/yourusername/issue-tracker-rebuilt) if you find it helpful!
