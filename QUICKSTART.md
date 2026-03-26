# 🚀 TaskForge - Quick Start Guide

Get TaskForge running in 5 minutes!

---

## Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 15+
- **GitHub Account** (for OAuth)

---

## Step 1: Clone & Install (1 min)

```bash
git clone <your-repo-url>
cd issue-tracker-rebuilt
npm install
```

---

## Step 2: Database Setup (2 min)

### Create Database

```bash
# Using createdb command
createdb taskforge

# OR using psql
psql -U postgres
CREATE DATABASE taskforge;
\q
```

### Set Database URL

Create `.env.local` in project root:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/taskforge
```

Replace `postgres:password` with your PostgreSQL credentials.

### Run Migrations

```bash
node scripts/migrate.js
```

You should see:
```
✅ Successfully executed migrations
```

---

## Step 3: GitHub OAuth Setup (1 min)

### Create GitHub OAuth App

1. Go to: https://github.com/settings/applications/new
2. Fill in:
   - **Application name**: TaskForge Dev
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Click "Register application"
4. Copy **Client ID** and **Client Secret**

### Add to `.env.local`

```env
# Add these lines to your .env.local
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here

NEXTAUTH_SECRET=your-random-secret-key-minimum-32-characters
NEXTAUTH_URL=http://localhost:3000
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## Step 4: Start Development Server (30 sec)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 5: Sign In & Test (30 sec)

1. Click **"Sign In"**
2. Authenticate with GitHub
3. You're in! 🎉

---

## ✅ Your `.env.local` Should Look Like This:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/taskforge

# NextAuth
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

---

## 🎯 First Steps After Sign In

### 1. Create Your First Project
- Go to **Projects** → **+ New Project**
- Name: "My First Project"
- Click **Create Project**

### 2. Create Your First Issue
- Go to your project
- Click **+ New Issue**
- Fill in details:
  - Title: "Test Issue"
  - Priority: High
  - Type: Task
- Click **Create Issue**

### 3. Explore Features
- ✅ Click on stat boxes to filter
- ✅ Add a comment to your issue
- ✅ Change issue status
- ✅ Try dark mode toggle (top-right)
- ✅ Press `?` for keyboard shortcuts

---

## 🔧 Optional: Enable Notifications

### Slack Notifications (Optional)

```env
# Add to .env.local
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Email Notifications (Optional)

```env
# Add to .env.local
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@taskforge.com
```

---

## 🛠️ Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_ctl status

# OR on Windows
sc query postgresql-x64-15
```

### Port 3000 Already in Use
```bash
# Use a different port
PORT=3001 npm run dev
```

### GitHub OAuth Not Working
- Check callback URL matches exactly
- Ensure `.env.local` has no extra spaces
- Restart dev server after changing `.env.local`

---

## 📚 Next Steps

### Learn More
- Read [User Guide](docs/guides/USER_GUIDE.md)
- Check [Features List](FEATURES_COMPLETE.md)
- Explore [Analytics Guide](docs/guides/ANALYTICS_GUIDE.md)

### Admin Features
First user is automatically an Admin. You can:
- Go to **Admin** in navigation
- Manage user roles
- View **Analytics & Performance**
- Send overdue notifications

---

## 🎉 You're Ready!

**TaskForge is now running.**

Start tracking issues, managing projects, and collaborating with your team!

---

**Need Help?**
- Check [README.md](README.md)
- See [Documentation](docs/)
- Review [API Docs](docs/technical/API_DOCUMENTATION.md)

**Happy tracking! 🚀**
