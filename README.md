# TaskForge - Production-Grade Issue Tracker

**A modern, full-stack issue tracking system built with Next.js 15, TypeScript, and PostgreSQL**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Core Features](#-core-features)
- [Documentation](#-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🎯 Overview

TaskForge is a **production-grade issue tracking system** designed for modern development teams. It combines enterprise-level features with a clean, intuitive interface - offering a powerful alternative to tools like Jira, Linear, and Asana.

### Why TaskForge?

- **🚀 Production-Ready**: Clean architecture, comprehensive RBAC, and enterprise features
- **⚡ Fast & Responsive**: Built with Next.js 15 Server Components for optimal performance
- **🎨 Beautiful UI**: Modern design with full dark mode support and excellent UX
- **🔒 Secure**: OAuth authentication, role-based access control, and security best practices
- **📊 Data-Driven**: Rich dashboards, filtering, and overdue tracking
- **🔔 Notifications**: Email and Slack integration for real-time updates
- **💻 Open Source**: No vendor lock-in, fully customizable

---

## ✨ Key Features

### Core Functionality
- ✅ **Project Management** - Create, edit, and delete projects with deadlines
- ✅ **Issue Tracking** - Full CRUD operations with rich metadata and due dates
- ✅ **User Management** - Complete authentication and profile management
- ✅ **Comments System** - Threaded discussions with full timestamps
- ✅ **Activity Timeline** - Comprehensive audit trail with AI-powered insights
- ✅ **Analytics Dashboard** - Team performance metrics and AI recommendations

### Advanced Features
- 🎯 **Role-Based Access Control** (RBAC)
  - Admin, Manager, Developer, and Viewer roles
  - Granular permissions system
  - Project ownership controls

- 📊 **Smart Dashboards**
  - Personalized issue views
  - Real-time statistics (Assigned, Reported, Open, Closed, Overdue)
  - Clickable stat cards for instant filtering
  - Recent issues and projects

- 🔍 **Advanced Filtering**
  - Multi-parameter filtering (status, priority, project, assignee)
  - Scope-based filtering (All/My Issues/Assigned/Reported)
  - Overdue issues filter with visual indicator
  - Client-side search in title/description

- ⏰ **Due Date Management**
  - Issue-level due dates with past date validation
  - **Project-level deadlines** - Track overall project completion targets
  - Overdue tracking and alerts for both issues and projects
  - Visual indicators with pulsing badges
  - Risk detection (warns if issues extend beyond project deadline)
  - Days overdue/remaining calculation and display

- 🤖 **Activity Logging & AI Analytics**
  - Comprehensive audit trail of all system activities
  - Issue, project, and comment activity tracking
  - AI-powered insights using Anthropic Claude
  - Pattern detection and bottleneck identification
  - Predictive analytics for overdue risks
  - Performance metrics and team analytics
  - Admin/Manager dashboard with detailed metrics

- 🔔 **Notification System**
  - Email notifications via Nodemailer
  - Slack integration (Webhooks & Bot API)
  - Bulk overdue notifications
  - Beautiful HTML email templates
  - Customizable channels

- 🌓 **Dark Mode**
  - System-wide dark theme
  - Smooth transitions
  - Persistent preferences
  - Optimized color palette

- 📱 **Responsive Design**
  - Mobile-first approach
  - Tablet and desktop optimized
  - Touch-friendly interfaces

### User Experience
- ⌨️ **Keyboard Shortcuts** - Power user workflows
- 🔎 **Global Search** - Find anything instantly
- 🕒 **Smart Timestamps** - Relative time with full tooltips
- 👤 **User Avatars** - Visual identity throughout
- 📍 **Breadcrumb Navigation** - Clear page hierarchy

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5 (React 19)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Custom component library
- **Date Handling**: date-fns
- **Icons**: Heroicons (via SVG)

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Next.js API Routes & Server Actions
- **Database**: PostgreSQL 16+
- **ORM**: Raw SQL with pg (node-postgres)
- **Authentication**: NextAuth.js v4
- **Email**: Nodemailer
- **Notifications**: Slack API & Webhooks
- **AI**: Anthropic Claude API (Sonnet 4)

### Development
- **Package Manager**: npm
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript strict mode

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **PostgreSQL** 14.x or higher
- **npm** or **yarn**

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd issue-tracker-rebuilt
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/taskforge

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# OAuth Providers
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Slack (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_DEFAULT_CHANNEL=#issue-tracker

# AI Analytics (Optional)
ANTHROPIC_API_KEY=sk-ant-...
```

4. **Set up the database**
```bash
createdb taskforge
npm run migrate
```

5. **Start development**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
issue-tracker-rebuilt/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── api/               # API Routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard
│   │   ├── issues/            # Issue management
│   │   ├── projects/          # Project management
│   │   ├── admin/             # Admin panel
│   │   └── layout.tsx         # Root layout
│   │
│   ├── components/            # React components
│   │   ├── ui/               # UI components
│   │   ├── Navigation.tsx    # Main navigation
│   │   └── ...
│   │
│   ├── lib/                   # Utilities
│   │   ├── auth.ts           # Authentication
│   │   ├── db.ts             # Database connection
│   │   ├── notifications/    # Email & Slack
│   │   └── ...
│   │
│   ├── repositories/          # Data access layer
│   ├── services/              # Business logic
│   ├── controllers/           # API controllers
│   └── types/                 # TypeScript types
│
├── migrations/                # SQL migrations
├── scripts/                   # Utility scripts
└── docs/                      # Documentation
```

---

## 🎯 Core Features

### 1. Dashboard

**Statistics**:
- Assigned to Me (clickable)
- Reported by Me (clickable)
- Open Issues (clickable)
- Closed Issues (clickable)
- **Overdue Issues** (red, animated, clickable)

**Features**:
- Role-aware filtering (admin sees all, users see their own)
- Recent issues preview
- Quick project access
- Smart navigation via stat cards

### 2. Issue Management

**Create/Edit**:
- Title, description, type, priority, status
- Assign to team members
- Set due dates (prevents past dates)
- Link to projects
- Full validation

**Issue Details Page**:
- **Top Section**: 4-panel info card
  - Creator (who reported)
  - Assignee (who's working on it)
  - Current stage (status with icon)
  - Expected closure (due date with days remaining/overdue)
- Description
- Comment threads with full timestamps
- Activity timeline

**Issue List**:
- **Left**: Reporter & Assignee avatars, title, description, badges
- **Right Top**: Project name + Creation date/time
- **Right Bottom**: "Assigned to: [Name]"
- Overdue badges with animation

### 3. Filtering System

**Filters Available**:
- Status (All, Open, In Progress, Resolved, Closed)
- Priority (All, Low, Medium, High, Critical)
- Project (dropdown of all projects)
- Assignee (team members + Unassigned option)
- **Scope** (Admin/Manager only):
  - All Issues
  - Assigned to Me
  - Reported by Me
  - My Issues (Both)
- **Overdue** (checkbox/toggle)
- Search (text in title/description)

**Behavior**:
- Real-time filtering
- URL-based (shareable links)
- Clear filters button
- Visual indicator for overdue filter

### 4. Comments

- Add/edit comments
- Full timestamps (e.g., "Jan 15, 2026, 03:45 PM")
- Relative time ("2 minutes ago")
- Hover for exact timestamp
- User attribution with avatars

### 5. RBAC System

**Admin**:
- Full system access
- User management
- Role assignments
- All projects and issues

**Manager**:
- View all issues
- Manage team projects
- Assign issues
- View reports

**User**:
- Create/edit own issues
- Comment on issues
- View assigned/reported issues

### 6. Notifications

**Email**:
- Overdue issue alerts
- Beautiful HTML templates
- Individual or bulk sending
- Admin-triggered from admin panel

**Slack**:
- Real-time notifications
- Overdue summaries grouped by priority
- Webhook or Bot Token support
- Rich formatting with colors and emojis

### 7. Dark Mode

- System-wide toggle
- Persistent preferences
- Smooth transitions
- Optimized colors:
  - Backgrounds: gray-900, gray-800
  - Text: gray-300, white
  - Borders: gray-700

---

## 📚 Documentation

- **[FEATURES.md](FEATURES.md)** - Complete feature list
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - API reference
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Setup instructions
- **[ACTIVITY_LOGGING_AI_ANALYTICS_DESIGN.md](ACTIVITY_LOGGING_AI_ANALYTICS_DESIGN.md)** - Activity logging & AI features
- **[RBAC-SYSTEM.md](RBAC-SYSTEM.md)** - Access control
- **[EMAIL_SETUP.md](EMAIL_SETUP.md)** - Email config
- **[SLACK_SETUP.md](SLACK_SETUP.md)** - Slack integration
- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Database structure
- **[TEST_EXECUTION_RESULTS.md](TEST_EXECUTION_RESULTS.md)** - Test execution log

---

## 🧪 Testing

See [TESTING_REPORT.md](TESTING_REPORT.md) for complete test results.

**Test Coverage**:
- ✅ Authentication flows
- ✅ RBAC permissions
- ✅ Project CRUD
- ✅ Issue management
- ✅ Filtering system
- ✅ Dashboard statistics
- ✅ Dark mode
- ✅ Overdue tracking
- ✅ Comments system
- ✅ Notifications

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Set environment variables
4. Deploy!

### Manual

```bash
npm run build
npm start
```

---

## 🤝 Contributing

Contributions welcome!

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 📧 Contact

- **Issues**: [GitHub Issues](https://github.com/your-org/taskforge/issues)
- **Email**: support@taskforge.dev

---

**Built with ❤️ by the TaskForge Team**

⭐ Star us on GitHub!
