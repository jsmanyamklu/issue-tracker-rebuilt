# 📋 TaskForge - Manager Setup Guide

**Complete guide to get TaskForge running on your local machine**

---

## 🎯 What is TaskForge?

TaskForge is a modern issue tracking and project management system with features like:
- Project and issue tracking with due dates
- Team collaboration with comments and attachments
- Role-based access control (Admin, Manager, Developer, Viewer)
- Activity logging and AI-powered analytics
- Real-time notifications (Email & Slack)
- Beautiful dark mode UI

---

## ⚙️ Prerequisites

Before starting, ensure you have these installed on your machine:

### Required Software

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify installation: Open Command Prompt and run:
     ```bash
     node --version
     ```
   - Should show: `v18.x.x` or higher

2. **PostgreSQL** (v14 or higher)
   - Download: https://www.postgresql.org/download/
   - During installation, remember the password you set for the `postgres` user
   - Verify installation: Open Command Prompt and run:
     ```bash
     psql --version
     ```
   - Should show: `psql (PostgreSQL) 14.x` or higher

3. **Git** (for cloning the repository)
   - Download: https://git-scm.com/download/win
   - Verify installation:
     ```bash
     git --version
     ```

---

## 📥 Step 1: Get the Code

### Option A: Clone from GitHub (Recommended)

1. Open Command Prompt or PowerShell
2. Navigate to where you want to install TaskForge:
   ```bash
   cd C:\Users\YourName\Documents
   ```

3. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/issue-tracker-rebuilt.git
   cd issue-tracker-rebuilt
   ```

### Option B: Download ZIP

1. Go to the GitHub repository
2. Click the green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file to your desired location
5. Open Command Prompt and navigate to the extracted folder

---

## 🗄️ Step 2: Setup Database

### Create the Database

1. Open **pgAdmin 4** (installed with PostgreSQL)
   - Or use Command Prompt with `psql`

2. Connect to PostgreSQL:
   ```bash
   psql -U postgres
   ```
   - Enter the password you set during PostgreSQL installation

3. Create the database:
   ```sql
   CREATE DATABASE taskforge;
   ```

4. Exit psql:
   ```sql
   \q
   ```

---

## 🔐 Step 3: Configure Environment Variables

1. In the project folder, find the file `.env.example`

2. **Create a copy** and rename it to `.env`:
   - Right-click `.env.example` → Copy → Paste → Rename to `.env`

3. Open `.env` in Notepad or any text editor

4. Update the following values:

```env
# Database Connection
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/taskforge

# Replace YOUR_PASSWORD with your PostgreSQL password
# Example: postgresql://postgres:admin123@localhost:5432/taskforge

# JWT Secret (for authentication)
JWT_SECRET=your-super-secret-key-change-this-in-production

# Session Secret
SESSION_SECRET=another-super-secret-key-change-this-too

# Email Configuration (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=TaskForge <your-email@gmail.com>

# Slack Integration (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token

# AI Analytics (Optional - for AI-powered insights)
ANTHROPIC_API_KEY=your-anthropic-api-key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. **Save the file**

> **Note**: The optional features (Email, Slack, AI) can be configured later. The app will work without them.

---

## 📦 Step 4: Install Dependencies

1. Open Command Prompt in the project folder

2. Install all required packages:
   ```bash
   npm install
   ```
   - This will take 2-5 minutes depending on your internet speed

3. Wait for the installation to complete
   - You should see a success message with no errors

---

## 🚀 Step 5: Setup Database Schema

Run the database migrations to create all tables:

```bash
npm run migrate
```

**You should see:**
```
🚀 Starting database migrations...
✅ Migrations tracking table ready
📄 Executing 001_create_users_table.sql...
✅ Successfully executed 001_create_users_table.sql
...
🎉 Successfully executed X migration(s)!
```

---

## 🌱 Step 6: Seed Sample Data (Optional but Recommended)

Add sample users, projects, and issues for testing:

```bash
npm run db:seed
```

**Default test accounts created:**
- **Admin**: admin@taskforge.com / password123
- **Manager**: manager@taskforge.com / password123
- **Developer**: developer@taskforge.com / password123
- **Viewer**: viewer@taskforge.com / password123

---

## ▶️ Step 7: Start the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. **You should see:**
   ```
   ▲ Next.js 15.5.14
   - Local:        http://localhost:3000
   - Network:      http://192.168.1.XX:3000

   ✓ Ready in 3.5s
   ```

3. Open your web browser and go to:
   ```
   http://localhost:3000
   ```

4. **Login with one of the test accounts**:
   - Email: `admin@taskforge.com`
   - Password: `password123`

---

## 🎉 You're All Set!

TaskForge is now running on your machine. Here's what you can do:

### Explore the Features

1. **Dashboard** - See your issues and statistics
2. **Projects** - Create and manage projects with deadlines
3. **Issues** - Create issues with:
   - Calendar date picker for due dates
   - File attachments
   - Title suggestions from recent issues
4. **Admin Panel** - View team analytics (admin@taskforge.com)
5. **Profile** - Manage your account settings

### Key Admin/Manager Features

- **Extend Project Due Dates**: On any project page, click "📅 Extend Due Date"
- **Assign Issues**: Smart workload-based assignment suggestions
- **View Analytics**: Admin dashboard with AI-powered insights
- **Manage Users**: User management and role assignment

---

## 🛑 Stopping the Application

To stop TaskForge:

1. In the Command Prompt where it's running
2. Press **`Ctrl + C`**
3. Confirm with **`Y`** if prompted

---

## 🔄 Restarting the Application

Next time you want to run TaskForge:

1. Open Command Prompt
2. Navigate to the project folder:
   ```bash
   cd C:\path\to\issue-tracker-rebuilt
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
4. Open browser to `http://localhost:3000`

---

## 🐛 Troubleshooting

### Database Connection Error

**Error**: `could not connect to server`

**Solution**:
1. Make sure PostgreSQL is running
2. Check your DATABASE_URL in `.env`
3. Verify password is correct

### Port 3000 Already in Use

**Error**: `Port 3000 is in use`

**Solution**:
1. Stop any other applications using port 3000
2. Or use a different port:
   ```bash
   PORT=3001 npm run dev
   ```

### Migration Errors

**Error**: `relation already exists`

**Solution**:
```bash
npm run db:reset
npm run migrate
npm run db:seed
```
⚠️ **Warning**: This will delete all existing data

### Missing Dependencies

**Error**: `Cannot find module 'xyz'`

**Solution**:
```bash
npm install
```

---

## 📧 Getting Help

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Review the error message carefully
3. Check the detailed documentation in `/docs` folder
4. Contact the development team with:
   - Error message
   - Screenshot
   - Steps to reproduce

---

## 🔐 Security Notes

### For Production Deployment:

1. **Change all default passwords**
2. **Generate new JWT secrets**
3. **Use environment-specific .env files**
4. **Enable HTTPS**
5. **Configure proper backup strategy**
6. **Set up monitoring and logging**

See `docs/DEPLOYMENT_QUICK_START.md` for production deployment guide.

---

## 📚 Additional Documentation

- **Features Documentation**: `/docs/INDEX.md`
- **Deployment Guide**: `/docs/DEPLOYMENT_QUICK_START.md`
- **Future Upgrades**: `/docs/FUTURE_UPGRADES_ROADMAP.md`
- **Client Options**: `/docs/CLIENT_UPGRADE_OPTIONS.md`
- **File Uploads**: `/docs/FEATURE_FILE_UPLOADS.md`

---

## ✅ Quick Reference Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run migrate` | Run database migrations |
| `npm run db:seed` | Seed sample data |
| `npm run db:reset` | Reset database (⚠️ deletes all data) |
| `npm test` | Run tests |

---

## 🎨 Latest Features (Added in Current Release)

### 1. Calendar Date Picker
- Visual calendar popup for selecting due dates
- Month/year navigation
- Min/max date validation
- Today and Clear quick actions

### 2. File Attachments
- Upload files to issues and comments
- Support for images, PDFs, and documents
- Image previews with file icons
- 10MB file size limit

### 3. Issue Title Suggestions
- Dropdown showing recent issues in project
- Prevents duplicate issues
- Add custom title templates
- Auto-complete from history

### 4. Project Due Date Extension
- Admin/Manager can extend project deadlines
- Validation ensures issue dates ≤ project dates
- Conflict detection and warnings
- Visual overdue indicators

---

**Happy Project Management! 🚀**

---

*Last Updated: March 26, 2026*
*Version: 1.1.0*
