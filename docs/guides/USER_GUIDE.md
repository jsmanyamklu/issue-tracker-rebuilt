# TaskForge - User Guide

**Last Updated:** March 25, 2026
**Version:** 1.0.0

Welcome to TaskForge! This guide will help you get started and make the most of all features.

---

## 📑 Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Managing Projects](#managing-projects)
4. [Working with Issues](#working-with-issues)
5. [Filtering & Search](#filtering--search)
6. [Comments & Collaboration](#comments--collaboration)
7. [User Roles & Permissions](#user-roles--permissions)
8. [Dark Mode](#dark-mode)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Tips & Best Practices](#tips--best-practices)

---

## 🚀 Getting Started

### First Time Sign In

1. Navigate to the TaskForge application
2. Click **"Sign in"** button
3. Choose your OAuth provider:
   - **GitHub** - Sign in with your GitHub account
   - **Google** - Sign in with your Google account
4. Authorize the application
5. You'll be redirected to the Dashboard

**Note**: The first user to sign up automatically becomes an **Admin**.

### Your First Login

After signing in, you'll see:
- **Navigation Bar** at the top with links to Dashboard, Projects, Issues
- **User Menu** in the top-right corner (click your avatar)
- **Dashboard** showing your issue statistics

---

## 📊 Dashboard

The Dashboard is your home base in TaskForge, providing a quick overview of your work.

### Statistics Cards

The Dashboard shows 5 clickable statistic cards:

1. **Assigned to Me** (Blue) - Issues currently assigned to you
2. **Reported by Me** (Green) - Issues you've created
3. **Open Issues** (Blue) - All open issues (role-dependent)
4. **Closed Issues** (Gray) - All closed issues
5. **Overdue Issues** (Red, Animated) - Issues past their due date

**Pro Tip**: Click any stat card to instantly filter the issues list!

### Recent Issues

Below the statistics, you'll see:
- **Recent Issues** - The 5 most recent issues assigned to you
- **Recent Projects** - The 5 most recently updated projects

### Role-Based Views

- **User**: See only your assigned and reported issues
- **Manager**: See all issues across all projects
- **Admin**: See all issues plus admin tools

---

## 📁 Managing Projects

Projects are containers for related issues. Here's how to work with them.

### Viewing Projects

1. Click **"Projects"** in the navigation bar
2. You'll see all projects with:
   - Project name and description
   - Owner information
   - Issue statistics (Total, Open, In Progress, Resolved, Closed, Overdue)

### Creating a Project

1. Click **"Projects"** → **"+ New Project"**
2. Fill in the form:
   - **Name** (required) - Project name
   - **Description** (optional) - Project details
   - **Owner** (optional) - Defaults to you
3. Click **"Create Project"**

**Requirements**:
- Name must be at least 3 characters
- You need to be logged in

### Viewing Project Details

1. Click on any project card
2. You'll see:
   - **6 Statistic Cards**: Total, Open, In Progress, Resolved, Closed, Overdue
   - **All Issues** in this project
   - **"+ New Issue"** button to create issues

### Editing a Project

1. Navigate to the project detail page
2. Click **"Edit Project"**
3. Update the fields you want to change
4. Click **"Save Changes"**

**Permissions**:
- **User**: Can edit own projects
- **Manager**: Can edit own projects
- **Admin**: Can edit any project

### Deleting a Project

1. Navigate to the project detail page
2. Click **"Delete Project"**
3. Confirm the deletion

**Warning**: Deleting a project will also delete all issues and comments in that project!

**Permissions**:
- **User**: Can delete own projects
- **Manager**: Can delete own projects
- **Admin**: Can delete any project

---

## 🎯 Working with Issues

Issues are the core of TaskForge - track bugs, features, tasks, and improvements.

### Creating an Issue

#### Method 1: From Project Page
1. Navigate to the project
2. Click **"+ New Issue"**
3. Fill in the form (see below)

#### Method 2: From Issues Page
1. Click **"Issues"** in navigation
2. Click **"+ New Issue"**
3. Fill in the form

### Issue Form Fields

**Required**:
- **Title** (min 3 characters) - Brief description of the issue
- **Project** - Select which project this belongs to

**Optional**:
- **Description** - Detailed explanation (supports multiple paragraphs)
- **Type**:
  - 🐛 Bug - Something isn't working
  - ⭐ Feature - New functionality
  - 📋 Task - Work item
  - 🔧 Improvement - Enhancement to existing feature
- **Priority**:
  - Low (Gray)
  - Medium (Blue)
  - High (Orange)
  - Critical (Red)
- **Status**:
  - Open - New issue
  - In Progress - Being worked on
  - Resolved - Fixed, awaiting verification
  - Closed - Completed
- **Assignee** - Who should work on this (dropdown of team members)
- **Due Date** - Target completion date (cannot be in the past)

### Viewing Issue Details

1. Click on any issue from the list
2. You'll see:

#### Info Panel (4 Cards)
1. **Creator** - Who reported the issue (avatar, name, email, date)
2. **Assignee** - Who's working on it (or "Unassigned")
3. **Current Stage** - Status with icon and project link
4. **Expected Closure** - Due date with days remaining/overdue

#### Description Section
- Full issue description
- Can be edited if you have permission

#### Comments Section
- All comments on the issue
- Ability to add new comments
- Each comment shows:
  - User avatar and name
  - User role badge
  - Timestamp (relative: "2 hours ago")
  - Hover for exact timestamp

### Editing an Issue

1. Navigate to the issue detail page
2. Click **"Edit"**
3. Update any fields
4. Click **"Save Changes"**

**Permissions**:
- **User**: Can edit issues they reported or are assigned to
- **Manager**: Can edit any issue
- **Admin**: Can edit any issue

### Assigning/Reassigning Issues

1. Open the issue
2. Click **"Edit"**
3. Select a user from the **Assignee** dropdown
4. Click **"Save Changes"**

**Permissions**:
- **User**: Cannot assign issues
- **Manager**: Can assign any issue
- **Admin**: Can assign any issue

### Updating Issue Status

Common workflow:
```
Open → In Progress → Resolved → Closed
```

1. Open the issue
2. Click **"Edit"**
3. Change **Status** dropdown
4. Click **"Save Changes"**

**Best Practice**: Use "Resolved" when done, and let the reporter verify before "Closed"

### Due Dates & Overdue Tracking

#### Setting a Due Date
1. When creating/editing an issue
2. Select a date from the **Due Date** picker
3. Cannot select past dates on creation

#### Overdue Indicators
Issues past their due date show:
- 🚨 **Red badge** with "Xd overdue" on issue lists
- **Animated pulse** effect for visibility
- **Red text** on issue detail page
- **Overdue count** on dashboard (clickable)

**Note**: Resolved and Closed issues are not counted as overdue

---

## 🔍 Filtering & Search

TaskForge provides powerful filtering to help you find exactly what you need.

### Basic Filters (All Users)

On the Issues page, you'll see filter controls:

1. **Status Filter**
   - All Statuses
   - Open
   - In Progress
   - Resolved
   - Closed

2. **Priority Filter**
   - All Priorities
   - Low
   - Medium
   - High
   - Critical

3. **Project Filter**
   - All Projects
   - [Dropdown of all projects]

4. **Assignee Filter**
   - All Assignees
   - Unassigned (issues with no assignee)
   - [List of team members]

### Advanced Filters (Manager/Admin Only)

**Scope Filter**:
- **All Issues** - System-wide view
- **Assigned to Me** - Only issues assigned to you
- **Reported by Me** - Only issues you created
- **My Issues** - Both assigned and reported

### Special Filters

#### Overdue Filter
- Toggle **"Show Overdue Only"** checkbox
- When active, a blue banner appears
- Click **"Clear"** on banner to reset
- Combines with other filters

### Text Search

Use the search box to search in:
- Issue titles
- Issue descriptions

Search is:
- Real-time (as you type)
- Case-insensitive
- Works with other filters

### Using Dashboard Stats for Filtering

Quick way to filter:
1. Click any stat card on the Dashboard
2. Automatically navigates to Issues page with appropriate filters
3. Examples:
   - Click "Overdue Issues" → Shows only overdue
   - Click "Assigned to Me" → Shows your assigned issues

### Clearing Filters

- Click **"Clear Filters"** button to reset all
- Or manually change each filter back to "All"

---

## 💬 Comments & Collaboration

Comments enable team communication on issues.

### Adding a Comment

1. Navigate to an issue
2. Scroll to the **Comments** section
3. Type your comment in the text box
4. Click **"Add Comment"**

**Tips**:
- Be clear and concise
- Reference other issues if needed
- Tag team members (future feature)
- Add updates on progress

### Viewing Comments

Comments display:
- **User avatar** - Visual identification
- **Name and role** - Who commented (with role badge)
- **Timestamp** - Relative time ("5 minutes ago")
  - Hover over timestamp for exact date/time
- **Comment content** - The actual message

Comments are sorted **chronologically** (oldest first).

### Editing Comments

1. Find your comment
2. Click **"Edit"** (only visible on your own comments)
3. Update the text
4. Click **"Save"**

**Permissions**:
- **User**: Can edit own comments
- **Manager**: Can edit any comment
- **Admin**: Can edit any comment

### Deleting Comments

1. Find the comment
2. Click **"Delete"**
3. Confirm deletion

**Permissions**:
- **User**: Can delete own comments
- **Manager**: Can delete any comment
- **Admin**: Can delete any comment

**Note**: Deleted comments cannot be recovered!

### Comment Timestamps

TaskForge shows **dual timestamps**:

- **Relative**: "2 minutes ago", "3 hours ago", "5 days ago"
- **Absolute**: Full timestamp on hover (e.g., "Jan 15, 2026, 03:45:12 PM")

This gives you both quick context and precise timing.

---

## 👥 User Roles & Permissions

TaskForge has three user roles with different permissions.

### User (Default Role)

**Can**:
- ✅ View own issues (assigned or reported)
- ✅ Create issues
- ✅ Edit own issues
- ✅ Comment on any issue
- ✅ Create projects
- ✅ Edit own projects
- ✅ Delete own projects

**Cannot**:
- ❌ View all issues (only own)
- ❌ Edit other users' issues
- ❌ Delete other users' issues
- ❌ Assign issues
- ❌ Change user roles
- ❌ Access admin panel

### Manager

**Can**:
- ✅ View **all** issues across all projects
- ✅ Create issues
- ✅ Edit **any** issue
- ✅ Delete any issue
- ✅ **Assign issues** to team members
- ✅ Comment on any issue
- ✅ Create projects
- ✅ Edit own projects
- ✅ Delete own projects
- ✅ Use **Scope Filter** (All/Assigned/Reported/Mine)

**Cannot**:
- ❌ Edit other users' projects
- ❌ Change user roles
- ❌ Access admin panel

### Admin

**Can**:
- ✅ **Everything** Managers can do
- ✅ Edit **any** project
- ✅ Delete **any** project
- ✅ Change **user roles**
- ✅ Access **admin panel**
- ✅ Send **overdue notifications**
- ✅ View **system statistics**

**Cannot**:
- Nothing - Admins have full system access

### Checking Your Role

1. Click your **avatar** in the top-right
2. Your role is displayed in the dropdown menu
3. Or go to **Profile** to see your role

### Role Badges

Users' roles are shown as badges:
- 👑 **Admin** - Gold badge
- 🔧 **Manager** - Blue badge
- 👤 **User** - Gray badge

You'll see these badges on:
- Comments
- User lists
- Issue assignee/reporter info

---

## 🌓 Dark Mode

TaskForge supports a beautiful dark theme for reduced eye strain.

### Enabling Dark Mode

1. Click the **moon icon** (🌙) in the navigation bar
2. The entire app switches to dark theme
3. Your preference is saved automatically

### Disabling Dark Mode

1. Click the **sun icon** (☀️) in the navigation bar
2. The app switches back to light theme

### Dark Mode Features

- **Persistent**: Your choice is remembered across sessions
- **Smooth Transitions**: Animated color changes (0.2s)
- **Complete Coverage**: All pages and components support dark mode
- **Optimized Colors**: Easy-to-read contrast in dark mode

**Dark Mode Colors**:
- Background: Deep gray (#111827)
- Cards: Dark gray (#1F2937)
- Text: Light gray (#D1D5DB) and white
- Borders: Medium gray (#374151)

---

## ⌨️ Keyboard Shortcuts

Speed up your workflow with keyboard shortcuts!

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open global search |
| `Cmd/Ctrl + /` | Show keyboard shortcuts |

### Navigation Shortcuts

| Shortcut | Action |
|----------|--------|
| `G D` | Go to Dashboard |
| `G P` | Go to Projects |
| `G I` | Go to Issues |

### Issue Shortcuts

| Shortcut | Action |
|----------|--------|
| `N` | Create new issue |
| `E` | Edit current issue |
| `C` | Add comment |
| `Esc` | Close modal/dialog |

**Note**: Shortcuts work when not focused in a text input.

---

## 💡 Tips & Best Practices

### For All Users

1. **Use Descriptive Titles**
   - Bad: "Bug"
   - Good: "Login button not responding on mobile"

2. **Add Detailed Descriptions**
   - Include steps to reproduce
   - Add expected vs actual behavior
   - Mention browser/device if relevant

3. **Set Realistic Due Dates**
   - Consider dependencies
   - Add buffer time
   - Update if priorities change

4. **Update Issue Status Regularly**
   - Move to "In Progress" when you start
   - Mark "Resolved" when done
   - Let reporter close after verification

5. **Use Comments for Updates**
   - Post progress updates
   - Ask questions if blocked
   - Notify when completed

6. **Leverage Filtering**
   - Use filters to focus on specific work
   - Bookmark common filter combinations
   - Check overdue issues daily

### For Managers

1. **Triage New Issues Daily**
   - Assign priority levels
   - Assign to appropriate team members
   - Set realistic due dates

2. **Monitor Overdue Issues**
   - Check "Overdue" filter regularly
   - Reallocate if assignee is blocked
   - Update due dates if needed

3. **Use Scope Filter**
   - "All Issues" for team overview
   - "Assigned to Me" for your tasks
   - "Reported by Me" to track requests

4. **Regular Status Updates**
   - Review "In Progress" issues
   - Follow up on stale issues
   - Close resolved issues after verification

### For Admins

1. **Manage Roles Carefully**
   - Only promote trusted users to Manager/Admin
   - Review permissions regularly
   - First user is auto-admin

2. **Send Overdue Notifications**
   - Use Admin Panel → "Send Notifications"
   - Schedule weekly overdue reports
   - Follow up on critical overdue items

3. **Monitor System Health**
   - Check system statistics in Admin Panel
   - Review user activity
   - Ensure balanced workload

### Project Organization

1. **Create Separate Projects for**
   - Different products
   - Different teams
   - Different release cycles

2. **Use Clear Project Names**
   - "Web App v2.0"
   - "Mobile iOS App"
   - "Infrastructure"

3. **Add Project Descriptions**
   - Explain project purpose
   - List key stakeholders
   - Note important links

### Issue Workflow

**Recommended Flow**:
```
1. Issue Reported → Status: Open
2. Assigned to Developer → Status: Open
3. Developer Starts → Status: In Progress
4. Work Completed → Status: Resolved
5. Reporter Verifies → Status: Closed
```

**Alternative for Small Teams**:
```
1. Issue Created → Status: Open
2. Work Started → Status: In Progress
3. Work Done → Status: Closed
```

---

## 🔔 Notifications

TaskForge sends notifications for overdue issues.

### Email Notifications

When an admin sends overdue notifications:
- You receive an email for each overdue issue assigned to you
- Email includes:
  - Issue title and description
  - Priority, status, and project
  - Days overdue (highlighted in red)
  - Direct link to the issue

**Setup**: Ask your admin to configure SMTP settings.

### Slack Notifications

Your team receives Slack messages for:
- Bulk overdue notifications (admin-triggered)
- Issues grouped by priority (Critical → High → Medium → Low)
- Each issue shows title, assignee, days overdue, and link

**Setup**: Ask your admin to integrate Slack webhook or bot token.

---

## ❓ Frequently Asked Questions

### How do I change my email?

Contact your admin. Email is tied to your OAuth account.

### Can I delete an issue?

Only if you're the reporter, or you're a Manager/Admin.

### How do I become a Manager?

Ask an Admin to promote your role in the Admin Panel.

### What happens when a project is deleted?

All issues and comments in that project are permanently deleted.

### Can I recover a deleted comment?

No, deleted comments cannot be recovered.

### Why can't I see all issues?

Users can only see their own issues. Managers and Admins see all issues.

### How do I export issues?

This feature is coming in a future update.

### Can I upload files to issues?

Not yet - file attachments are planned for Phase 2.

### Is there a mobile app?

Not yet, but the web app is fully responsive and works on mobile browsers.

---

## 🆘 Getting Help

### If You're Stuck

1. Check this User Guide
2. Ask your team Manager or Admin
3. Check the [FEATURES.md](FEATURES.md) for feature details
4. Report bugs or request features via your admin

### For Admins

- See [SETUP_GUIDE.md](SETUP_GUIDE.md) for installation
- See [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API reference
- Report issues on GitHub

---

## 🎉 Conclusion

You're now ready to use TaskForge effectively! Remember:

- Use the **Dashboard** for quick overview
- **Filter** to focus your work
- **Comment** to collaborate
- **Update status** to keep everyone informed
- Check **overdue issues** regularly

Happy tracking! 🚀

---

**For questions or feedback, contact your admin or visit our GitHub repository.**

*Last updated: March 25, 2026*
