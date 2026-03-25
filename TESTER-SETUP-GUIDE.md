# TaskForge - Tester Setup Guide

## For Testing Team: How to Get Started

This guide will help testers set up TaskForge on their local machine for testing.

---

## Prerequisites (What Testers Need)

### Required Software

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version` (should show v18+)

2. **PostgreSQL** (v14 or higher)
   - **Windows**: https://www.postgresql.org/download/windows/
   - **Mac**: https://postgresapp.com/ or `brew install postgresql`
   - **Linux**: `sudo apt install postgresql`
   - Verify: `psql --version`

3. **Git**
   - Download: https://git-scm.com/downloads
   - Verify: `git --version`

4. **Code Editor** (Optional but recommended)
   - VS Code: https://code.visualstudio.com/
   - Or any text editor for viewing `.env` file

5. **Web Browser** (Modern browser required)
   - Chrome, Firefox, Safari, or Edge
   - Latest version recommended

---

## Quick Start (5 Steps)

### Step 1: Clone the Repository

```bash
# Clone the project
git clone https://github.com/jsmanyamklu/issue-tracker-rebuilt.git

# Navigate into folder
cd issue-tracker-rebuilt
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages (~2-3 minutes).

### Step 3: Set Up Database

#### Create PostgreSQL Database

**Option A: Using psql (Command Line)**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE taskforge;

# Exit
\q
```

**Option B: Using pgAdmin (GUI)**
1. Open pgAdmin
2. Right-click "Databases" → "Create" → "Database"
3. Name: `taskforge`
4. Click "Save"

### Step 4: Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env
```

**Edit `.env` file** (use any text editor):

```env
# Database - UPDATE THIS
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/taskforge

# NextAuth - KEEP THESE FOR NOW
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=test-secret-key-for-development-only

# OAuth - KEEP THESE (dummy values, auth will be skipped for testing)
GOOGLE_CLIENT_ID=dummy-for-testing
GOOGLE_CLIENT_SECRET=dummy-for-testing
GITHUB_CLIENT_ID=dummy-for-testing
GITHUB_CLIENT_SECRET=dummy-for-testing

# AI - LEAVE EMPTY (optional feature)
OPENAI_API_KEY=

# Environment
NODE_ENV=development
```

**Important**: Replace `your_password` with your PostgreSQL password.

### Step 5: Run Database Migrations

```bash
# Create database tables
npm run migrate
```

This creates all necessary tables.

### Step 6: (Optional) Seed Sample Data

```bash
# Add test data (projects, issues, users)
npm run db:seed
```

This adds sample data for testing.

### Step 7: Start the Application

```bash
npm run dev
```

You should see:
```
▲ Next.js 15.5.14
- Local:        http://localhost:3000
✓ Ready in 5.2s
```

**Open your browser**: http://localhost:3000

---

## Testing Without OAuth Setup

If you don't want to set up Google/GitHub OAuth, you can:

### Option 1: Direct Database User Creation

Create a test user directly in the database:

```sql
-- Connect to database
psql -U postgres -d taskforge

-- Create test user
INSERT INTO users (id, email, name, avatar_url, role)
VALUES (
  gen_random_uuid(),
  'tester@example.com',
  'Test User',
  'https://ui-avatars.com/api/?name=Test+User',
  'admin'
);

-- Exit
\q
```

Then modify the authentication check temporarily (for testing only).

### Option 2: Use Provided Test Credentials

If the developer has seeded data, use:
- **Admin**: admin@taskforge.com
- **Manager**: manager@taskforge.com
- **Developer**: developer@taskforge.com
- **Viewer**: viewer@taskforge.com

---

## What to Test

Use the provided testing checklist:
- **[TESTING-CHECKLIST.md](TESTING-CHECKLIST.md)** - Comprehensive test cases

### Quick Test Flow

1. **Sign In** (if auth is configured)
2. **Dashboard** - Check stats and charts
3. **Create Project** - Add a new project
4. **Create Issue** - Add issue to project
5. **Global Search** - Press `Ctrl+K` or `Cmd+K`
6. **Dark Mode** - Toggle theme (sun/moon icons)
7. **Kanban Board** - Drag and drop issues
8. **File Upload** - Attach files to issues
9. **Comments** - Add comments to issues
10. **Admin Panel** - Manage user roles (if admin)

---

## Common Issues & Solutions

### Issue 1: `npm install` fails
**Solution**:
```bash
# Clear npm cache
npm cache clean --force
# Try again
npm install
```

### Issue 2: Database connection error
**Error**: "Connection refused" or "authentication failed"

**Solution**:
- Check PostgreSQL is running: `pg_isready`
- Check username/password in `.env`
- Ensure database `taskforge` exists

### Issue 3: Port 3000 already in use
**Error**: "Port 3000 is already in use"

**Solution**:
```bash
# Use different port
PORT=3001 npm run dev
```
Or kill process using port 3000.

### Issue 4: Migration fails
**Error**: "Migration failed"

**Solution**:
```bash
# Reset database (WARNING: deletes all data)
npm run db:reset

# Run migrations again
npm run migrate
```

### Issue 5: OAuth not working
**Solution**: For testing, you can bypass OAuth by:
1. Using seeded test users
2. Creating user directly in database
3. Or ask developer for proper OAuth credentials

---

## System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Disk Space**: 500 MB (for Node.js + dependencies)
- **OS**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)
- **Internet**: Required for npm install

### Recommended Requirements
- **CPU**: 4 cores
- **RAM**: 8 GB
- **Disk Space**: 1 GB
- **SSD**: Recommended for better performance

---

## Testing Environment URLs

Once running, access these URLs:

- **Homepage**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **Projects**: http://localhost:3000/projects
- **Issues**: http://localhost:3000/issues
- **Admin Panel**: http://localhost:3000/admin (admin only)

---

## Test User Roles (If Seeded)

| Role | Username | Capabilities |
|------|----------|-------------|
| **Admin** | admin@taskforge.com | Full access, user management |
| **Manager** | manager@taskforge.com | Manage projects/issues |
| **Developer** | developer@taskforge.com | Create/edit own issues |
| **Viewer** | viewer@taskforge.com | Read-only access |

---

## Stopping the Application

```bash
# Press Ctrl+C in the terminal where npm run dev is running
```

---

## Uninstalling (Clean Up)

If you want to remove everything after testing:

```bash
# 1. Stop the server (Ctrl+C)

# 2. Drop the database
psql -U postgres -c "DROP DATABASE taskforge;"

# 3. Delete the project folder
cd ..
rm -rf issue-tracker-rebuilt  # Linux/Mac
# or manually delete folder on Windows
```

---

## Getting Help

### Documentation
- [SCREEN-BY-SCREEN-GUIDE.md](SCREEN-BY-SCREEN-GUIDE.md) - How to use each screen
- [TESTING-CHECKLIST.md](TESTING-CHECKLIST.md) - What to test
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup

### Report Issues
- GitHub Issues: https://github.com/jsmanyamklu/issue-tracker-rebuilt/issues
- Email developer: [Your Email]
- Include error messages and screenshots

---

## For Developer: Providing Test Access

### Option 1: Local Setup (Recommended for Testing)
Share this guide with testers and help them set up locally.

### Option 2: Deploy to Cloud (For Remote Testing)

**Quick Deploy Options**:

#### Vercel (Easiest - 5 minutes)
1. Push code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your GitHub repo
5. Add environment variables
6. Click "Deploy"

**Database**: Use Neon, Supabase, or Railway for PostgreSQL

#### Railway (Full Stack - 10 minutes)
1. Go to https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Select repo
4. Add PostgreSQL service
5. Set environment variables
6. Deploy

**Gives you**: https://your-app.railway.app

#### Docker (Self-hosted - 15 minutes)
```bash
# Build and run with Docker
docker-compose up -d
```

Access at: http://localhost:3000

---

## Test Data Examples

### Sample Projects
- "Mobile App Redesign"
- "Backend API v2"
- "Customer Dashboard"

### Sample Issues
- **Bug**: "Login fails on mobile Safari"
- **Feature**: "Add dark mode to settings"
- **Task**: "Update user documentation"
- **Improvement**: "Improve search performance"

### Sample Comments
- "I've reproduced this on iOS 16"
- "Working on a fix, should be ready by Friday"
- "Tested and verified - looks good!"

---

## Testing Tips

1. **Test with different roles** - Admin, Manager, Developer, Viewer
2. **Try all features** - Don't skip anything
3. **Test edge cases** - Empty fields, large files, long text
4. **Check mobile** - Resize browser to mobile width
5. **Test keyboard shortcuts** - Press `Ctrl+K` for search
6. **Try dark mode** - Toggle between themes
7. **Upload files** - Test with different file types
8. **Break things** - Try to break it (that's the point!)

---

## Checklist for Tester

Before starting testing:
- [ ] Node.js v18+ installed
- [ ] PostgreSQL v14+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Database created (`taskforge`)
- [ ] Environment variables configured (`.env`)
- [ ] Migrations run (`npm run migrate`)
- [ ] Sample data seeded (`npm run db:seed`)
- [ ] Server running (`npm run dev`)
- [ ] Application opens at http://localhost:3000
- [ ] Can sign in (or have test user)

After setup:
- [ ] Read [SCREEN-BY-SCREEN-GUIDE.md](SCREEN-BY-SCREEN-GUIDE.md)
- [ ] Use [TESTING-CHECKLIST.md](TESTING-CHECKLIST.md)
- [ ] Report bugs with screenshots
- [ ] Share feedback

---

## Quick Command Reference

```bash
# Install dependencies
npm install

# Create database tables
npm run migrate

# Add test data
npm run db:seed

# Start development server
npm run dev

# Reset database (WARNING: deletes data)
npm run db:reset

# Check TypeScript errors
npm run type-check
```

---

## Contact Information

**Developer**: [Your Name]
**Email**: [Your Email]
**GitHub**: https://github.com/jsmanyamklu/issue-tracker-rebuilt
**Issues**: https://github.com/jsmanyamklu/issue-tracker-rebuilt/issues

---

## Expected Testing Timeline

- **Setup**: 30-60 minutes (first time)
- **Basic Testing**: 2-3 hours
- **Comprehensive Testing**: 1-2 days
- **Bug Reporting**: Ongoing

---

## Success Indicators

You're ready to test when:
✅ Server starts without errors
✅ Can open http://localhost:3000
✅ Can see login/dashboard page
✅ Database has tables (check pgAdmin or psql)
✅ Can create/view/edit projects and issues
✅ Global search works (press Ctrl+K)
✅ Dark mode toggles properly

---

## Additional Resources

- **Official Docs**: Check all .md files in the repo
- **API Documentation**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Database Schema**: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- **RBAC System**: [RBAC-SYSTEM.md](RBAC-SYSTEM.md)

---

**Happy Testing! 🧪**

*If you encounter any issues not covered here, please report them so we can improve this guide.*

---

*Last Updated: March 25, 2026*
*Version: 2.0.0*
*For TaskForge Testing Team*
