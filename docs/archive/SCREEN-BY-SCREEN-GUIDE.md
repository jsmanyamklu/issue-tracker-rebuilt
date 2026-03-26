# TaskForge - Screen-by-Screen User Guide

## Complete Navigation & Usage Documentation

---

## Table of Contents

1. [Landing Page](#1-landing-page)
2. [Sign In Page](#2-sign-in-page)
3. [Dashboard](#3-dashboard)
4. [Projects List](#4-projects-list)
5. [Project Detail Page](#5-project-detail-page)
6. [Kanban Board View](#6-kanban-board-view)
7. [Issue Detail Page](#7-issue-detail-page)
8. [Create New Issue](#8-create-new-issue)
9. [Edit Issue](#9-edit-issue)
10. [Add Comment](#10-add-comment)
11. [Global Search](#11-global-search)
12. [Admin Panel](#12-admin-panel)
13. [Profile/Settings](#13-profile-settings)

---

## 1. Landing Page

**URL:** `/` or `http://localhost:3000`

### What You See
- TaskForge branding and logo
- Welcome message
- Key features overview
- "Get Started" or "Sign In" button

### Purpose
- First impression of the application
- Introduction to TaskForge capabilities
- Entry point for new and returning users

### Actions Available
- Click "Sign In" button to authenticate
- Click "Get Started" to begin registration/login flow

### Navigation Flow
```
Landing Page → Sign In Page → Dashboard (after authentication)
```

### Valuable Information
- Product overview
- Key features at a glance
- Clear call-to-action

### Tips
- If already signed in, you'll be redirected to Dashboard automatically
- This page is public and doesn't require authentication

---

## 2. Sign In Page

**URL:** `/auth/signin`

### What You See
- Sign-in options (OAuth providers)
- "Sign in with GitHub" button
- "Sign in with Google" button
- TaskForge branding

### Purpose
- Authenticate users securely
- Provide multiple sign-in options
- Create user session

### Actions Available
1. Click "Sign in with GitHub" - Authenticate using GitHub account
2. Click "Sign in with Google" - Authenticate using Google account

### Navigation Flow
```
Sign In Page → OAuth Provider → Dashboard (on success)
```

### Valuable Information
- Secure authentication via trusted OAuth providers
- No password management required
- Automatic account creation on first sign-in

### Tips
- First-time users are automatically assigned "Developer" role
- Your email from OAuth provider is used as your account identifier
- Session persists across browser tabs

---

## 3. Dashboard

**URL:** `/dashboard` (default after sign-in)

### What You See

**Top Navigation Bar:**
- TaskForge logo (left)
- "Dashboard" link (active)
- "Projects" link
- "Admin Panel" link (red, visible only to Admins)
- Global Search button (magnifying glass icon)
- Theme Toggle (Sun/Moon/System icons)
- User avatar and name
- Role badge (Admin/Manager/Developer/Viewer)

**Main Content Area:**

**Statistics Cards (4 cards in a row):**
1. **Assigned to Me** - Count of issues assigned to you
2. **Reported by Me** - Count of issues you created
3. **Open Issues** - Total open/in-progress issues system-wide
4. **Closed Issues** - Total resolved/closed issues system-wide

**Charts Section (2 charts side-by-side):**
1. **Issue Status Distribution** - Pie chart showing Open, In Progress, Resolved, Closed
2. **Issues by Priority** - Bar chart showing Low, Medium, High, Critical

**Recent Issues Section:**
- List of your most recent issues (assigned or reported)
- Each issue shows: Title, Status badge, Priority badge, Project name

### Purpose
- Get quick overview of your work
- See system-wide issue statistics
- Visualize project health with charts
- Access recent issues quickly

### Actions Available
1. Click on any issue in "Recent Issues" to view details
2. Click "Projects" in navigation to see all projects
3. Press `⌘K` or `Ctrl+K` to open Global Search
4. Click Theme Toggle to switch between Light/Dark/System modes
5. Click your avatar to access profile (if implemented)

### Navigation Flow
```
Dashboard → Issue Detail (click recent issue)
Dashboard → Projects List (click "Projects" link)
Dashboard → Global Search (press ⌘K)
Dashboard → Admin Panel (if Admin role)
```

### Valuable Information

**Statistics Tell You:**
- **Assigned to Me**: Your current workload
- **Reported by Me**: Issues you're tracking
- **Open Issues**: Active work across the team
- **Closed Issues**: Completed work (productivity metric)

**Charts Tell You:**
- **Status Distribution**: Where issues are in the workflow
- **Priority Breakdown**: What needs attention urgently

**Recent Issues Help You:**
- Jump back to issues you're working on
- See latest activity at a glance
- Quick access without searching

### Tips
- Dashboard automatically updates when issues are created/updated (refresh page)
- Charts are interactive - hover over segments for exact counts
- Use keyboard shortcut `⌘K` for fastest navigation
- Dark mode is easier on eyes for extended use
- Statistics show real-time data (as of page load)

---

## 4. Projects List

**URL:** `/projects`

### What You See

**Page Header:**
- Title: "Projects"
- Breadcrumb: Home > Projects
- "New Project" button (if you have permission)

**Project Cards Grid:**
Each project card displays:
- Project name (bold heading)
- Project description (truncated)
- Progress bar (color-coded):
  - Red: 0-25% complete
  - Yellow: 25-50% complete
  - Blue: 50-80% complete
  - Green: 80-100% complete
- Completion percentage (e.g., "65% complete")
- Issue breakdown with emoji indicators:
  - Open issues
  - In Progress issues
  - Resolved issues
  - Closed issues
- "View Details" button
- "View Kanban" button (if available)

### Purpose
- See all projects at a glance
- Understand project progress visually
- Quick access to project details or Kanban board

### Actions Available
1. **Click Project Name** - Navigate to project detail page
2. **Click "View Details"** - Navigate to project detail page
3. **Click "View Kanban"** - Open Kanban board for the project
4. **Click "New Project"** - Create a new project (Manager/Admin only)
5. **Hover over progress bar** - See exact completion percentage

### Navigation Flow
```
Projects List → Project Detail (click project or "View Details")
Projects List → Kanban Board (click "View Kanban")
Projects List → Create Project (click "New Project")
```

### Valuable Information

**Progress Bar Shows:**
- Visual representation of project completion
- Color-coded for quick status recognition
- Automatically calculated based on closed issues

**Issue Breakdown Shows:**
- How many issues are in each status
- Emoji indicators for quick scanning:
  - Open
  - In Progress
  - Resolved
  - Closed

**Project Cards Help You:**
- Identify which projects need attention (low completion %)
- See workload distribution across projects
- Quickly jump to the view you need (detail vs. Kanban)

### Tips
- Progress bar auto-updates when issues are resolved
- Green progress bar (80%+) means project is nearly complete
- Red progress bar (<25%) means project just started or needs attention
- Kanban view is best for managing active work
- Detail view is best for reviewing all issues in a list

---

## 5. Project Detail Page

**URL:** `/projects/[project-id]`

### What You See

**Page Header:**
- Breadcrumb: Home > Projects > [Project Name]
- Project title (large heading)
- Project description (below title)
- Action buttons:
  - "View Kanban Board" button
  - "Edit Project" button (if permitted)
  - "New Issue" button

**Issues Section:**
- List of all issues in this project
- Each issue row shows:
  - Issue title (clickable)
  - Status badge (Open/In Progress/Resolved/Closed)
  - Priority badge (Low/Medium/High/Critical)
  - Type badge (Bug/Feature/Task/Improvement)
  - Assignee name or avatar
  - Reporter name
  - Created date

**Empty State:**
- If no issues exist: "No issues in this project yet"
- "Create First Issue" button

### Purpose
- See all issues for a specific project
- Understand project scope and status
- Quick access to create new issues
- Jump to Kanban view for visual management

### Actions Available
1. **Click Issue Title** - Open issue detail page
2. **Click "View Kanban Board"** - Switch to Kanban view
3. **Click "New Issue"** - Create new issue (pre-fills project)
4. **Click "Edit Project"** - Modify project details (Manager/Admin)
5. **Click Status/Priority/Type badges** - Visual information (no action)

### Navigation Flow
```
Project Detail → Issue Detail (click issue title)
Project Detail → Kanban Board (click "View Kanban Board")
Project Detail → Create Issue (click "New Issue")
Project Detail → Edit Project (click "Edit Project")
```

### Valuable Information

**Issue List Shows:**
- Complete inventory of project work
- Who's working on what (Assignee column)
- Who reported issues (Reporter column)
- When work was created (Created date)
- Current status and priority of each item

**Status Badges Tell You:**
- **Open**: Not yet started
- **In Progress**: Actively being worked on
- **Resolved**: Work completed, awaiting verification
- **Closed**: Verified and done

**Priority Badges Tell You:**
- **Low**: Can wait, not urgent
- **Medium**: Normal priority, address soon
- **High**: Important, prioritize
- **Critical**: Urgent, immediate attention needed

**Type Badges Tell You:**
- **Bug**: Something broken that needs fixing
- **Feature**: New functionality to build
- **Task**: General work item or chore
- **Improvement**: Enhancement to existing feature

### Tips
- Use "View Kanban Board" for visual project management
- Use this list view for detailed overview and searching
- Filter mentally by status badges to see project health
- Click issue titles to see full details and comments
- "New Issue" button pre-selects this project in the form

---

## 6. Kanban Board View

**URL:** `/projects/[project-id]/kanban`

### What You See

**Page Header:**
- Breadcrumb: Home > Projects > [Project Name] > Kanban
- Title: "[Project Name] - Kanban Board"
- Subtitle: "Drag and drop issues to change their status"
- Action buttons:
  - "Back to Project" button
  - "New Issue" button

**Kanban Board (4 Columns):**

1. **Open Column** (Yellow background)
   - Title: "Open"
   - Issue count badge
   - Issue cards

2. **In Progress Column** (Blue background)
   - Title: "In Progress"
   - Issue count badge
   - Issue cards

3. **Resolved Column** (Green background)
   - Title: "Resolved"
   - Issue count badge
   - Issue cards

4. **Closed Column** (Gray background)
   - Title: "Closed"
   - Issue count badge
   - Issue cards

**Issue Cards (in each column):**
- Issue title (truncated)
- Priority badge
- Type badge
- Assignee avatar and name
- Draggable (cursor changes to move icon)

### Purpose
- Visual project management
- Easy status updates via drag-and-drop
- See workflow at a glance
- Agile/Scrum-friendly interface

### Actions Available
1. **Drag Issue Card** - Click and hold on an issue card
2. **Drop in New Column** - Drag to different column to change status
3. **Click Issue Card** - Open issue detail page
4. **Click "Back to Project"** - Return to list view
5. **Click "New Issue"** - Create new issue in this project

### Navigation Flow
```
Kanban Board → Issue Detail (click issue card)
Kanban Board → Project Detail (click "Back to Project")
Kanban Board → Create Issue (click "New Issue")

Drag Flow:
Pick up issue → Drag to column → Drop → Status updates → Toast notification
```

### Valuable Information

**Column Distribution Shows:**
- Where work is concentrated
- Bottlenecks (too many in one column)
- Flow of work through pipeline

**Open Column:**
- Issues waiting to be started
- Backlog items
- New work coming in

**In Progress Column:**
- Active work being done now
- Team's current focus
- Should be limited (WIP limit concept)

**Resolved Column:**
- Work completed but needs verification
- Ready for QA/review
- Almost done

**Closed Column:**
- Completed and verified work
- Historical record
- Can be archived later

**Issue Cards Show:**
- What issue is about (title)
- How urgent (priority badge)
- What type of work (type badge)
- Who's responsible (assignee)

### Tips
- **Drag-and-drop is the fastest way to update status**
- Status saves automatically when you drop the card
- Toast notification confirms successful update
- If drag fails, you'll see error notification
- Use Kanban for daily standups and sprint planning
- Limit "In Progress" items for better focus (recommended: 3-5 per person)
- Review "Open" column to prioritize next work
- Clean out "Closed" column periodically
- Click issue card to see full details without leaving Kanban view

---

## 7. Issue Detail Page

**URL:** `/issues/[issue-id]`

### What You See

**Page Header:**
- Breadcrumb: Home > Projects > [Project Name] > Issue #[ID]
- "Back to Project" button (returns to project detail)

**Issue Information Section:**

**Title and Description:**
- Issue title (large heading)
- Full description (multiline text, may include formatting)

**Metadata Panel (right side or below):**
- **Status:** Badge showing current status
- **Priority:** Badge showing priority level
- **Type:** Badge showing issue type
- **Reporter:** Name of person who created it
- **Assignee:** Name of person assigned (or "Unassigned")
- **Project:** Project name (clickable link)
- **Created:** Date/time created
- **Updated:** Date/time last modified

**Action Buttons:**
- "Edit Issue" button (if you have permission)
- "Add Comment" button
- "Delete Issue" button (if Admin/Manager)

**Attached Files Section:**
- List of uploaded files (if any)
- File icon, name, and size
- "View" button for each file
- "Delete" button for each file (if permitted)

**Comments Section:**
- List of comments in chronological order
- Each comment shows:
  - Commenter's name and avatar
  - Comment text
  - Timestamp (e.g., "2 hours ago")
  - "Edit" and "Delete" buttons (if you own the comment)

**Activity Timeline:**
- Chronological history of all changes
- Activity types with icons:
  - Issue created
  - Status changed
  - Priority changed
  - Assignee changed
  - Comment added
- Each activity shows:
  - Icon and color-coded badge
  - Description of change
  - Who made the change
  - When it happened (relative time)

### Purpose
- View complete details of an issue
- Understand full context and history
- Add comments for collaboration
- Track who changed what and when
- Access attached files

### Actions Available
1. **Click "Edit Issue"** - Modify issue details
2. **Click "Add Comment"** - Add a comment to the issue
3. **Click "Back to Project"** - Return to project detail page
4. **Click Project name** - Navigate to project detail
5. **Click attached file "View"** - Open/download file
6. **Click attached file "Delete"** - Remove file (if permitted)
7. **Click "Delete Issue"** - Remove issue completely (Admin/Manager)
8. **Scroll through Activity Timeline** - Review history

### Navigation Flow
```
Issue Detail → Edit Issue (click "Edit Issue")
Issue Detail → Add Comment (click "Add Comment")
Issue Detail → Project Detail (click "Back to Project" or project name)
Issue Detail → View File (click "View" on attachment)
```

### Valuable Information

**Status Shows:**
- Current state of the work
- Where it is in the workflow
- Whether action is needed

**Priority Shows:**
- How urgent the issue is
- When it should be addressed
- Helps with work prioritization

**Type Shows:**
- Nature of the work
- Helps categorize issues
- Useful for filtering and reporting

**Reporter Tells You:**
- Who identified the issue
- Who to ask for clarification
- Context of issue origin

**Assignee Tells You:**
- Who's responsible for resolving it
- Who to follow up with
- Workload distribution

**Comments Provide:**
- Discussion and collaboration
- Additional context
- Updates on progress
- Questions and answers

**Activity Timeline Shows:**
- Complete audit trail
- When status changed
- Who made decisions
- Historical context

**Attached Files Contain:**
- Screenshots of bugs
- Design mockups
- Documentation
- Test data
- Supporting materials

### Tips
- Read full description and comments before starting work
- Check Activity Timeline to understand what's already been tried
- Attachments often contain critical context (screenshots of bugs)
- Add comments for any updates, don't just change status silently
- Use Edit to update description as you learn more
- Check who reported issue if you need clarification
- Relative timestamps (e.g., "2 hours ago") show recent activity
- Long issues may have lots of activity - scroll to see full history

---

## 8. Create New Issue

**URL:** `/issues/new` or `/issues/new?project_id=[id]`

### What You See

**Page Header:**
- Title: "Create New Issue"
- Breadcrumb: Home > Issues > New

**Form Fields:**

1. **Title** (Required)
   - Text input
   - Placeholder: "Brief description of the issue"

2. **Description** (Required)
   - Large textarea
   - Placeholder: "Detailed description..."
   - Supports multiple lines

3. **Project** (Required)
   - Dropdown select
   - Lists all available projects
   - May be pre-selected if coming from project page

4. **Priority** (Required)
   - Dropdown select
   - Options: Low, Medium, High, Critical

5. **Type** (Required)
   - Dropdown select
   - Options: Bug, Feature, Task, Improvement

6. **Status** (Required)
   - Dropdown select
   - Options: Open, In Progress, Resolved, Closed
   - Default: Open

7. **Assignee** (Optional)
   - Dropdown select
   - Lists all users
   - Shows user avatar and name
   - Can be left unassigned

8. **File Upload** (Optional)
   - Drag-and-drop area
   - "Click to upload" option
   - Supports up to 5 files
   - 10MB max per file
   - Accepted types: Images (JPG, PNG, GIF, WebP), PDF, TXT

**Action Buttons:**
- "Create Issue" button (primary, blue)
- "Cancel" button (secondary, gray)

### Purpose
- Create new work items
- Report bugs
- Request features
- Assign work to team members
- Attach supporting files

### Actions Available
1. **Fill out form fields** - Enter issue details
2. **Select project** - Choose which project this belongs to
3. **Set priority** - Indicate urgency
4. **Choose type** - Categorize issue
5. **Assign to user** - Designate responsible person (optional)
6. **Upload files** - Attach screenshots, documents (optional)
7. **Click "Create Issue"** - Submit the form
8. **Click "Cancel"** - Abandon and return to previous page

### Navigation Flow
```
Create Issue → Issue Detail (on successful creation)
Create Issue → Previous Page (click "Cancel")

Form Submission Flow:
Fill form → Click "Create Issue" → Validation → API call → Success toast → Redirect to new issue
```

### Valuable Information

**Title Should Contain:**
- Brief summary of issue
- Clear and descriptive
- Examples:
  - "Login button not working on mobile"
  - "Add dark mode to settings page"
  - "Update user documentation"

**Description Should Include:**
- Detailed explanation
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Context and background
- Any relevant details

**Project Selection:**
- Determines which project owns this issue
- Affects project progress calculations
- Makes issue visible to project team

**Priority Guidance:**
- **Low**: Minor issues, cosmetic bugs, nice-to-haves
- **Medium**: Normal bugs, standard features, typical work
- **High**: Important bugs, key features, blocks other work
- **Critical**: System down, security issues, urgent fixes

**Type Guidance:**
- **Bug**: Something is broken or not working as expected
- **Feature**: New functionality to be built
- **Task**: Work item, chore, or general task
- **Improvement**: Enhancement to existing feature

**Status (Initial):**
- Usually "Open" for new issues
- Can set to "In Progress" if starting immediately
- Avoid "Resolved" or "Closed" for new issues

**Assignee:**
- Assign if you know who should handle it
- Leave unassigned if needs triage
- Can change assignee later

**File Attachments:**
- Screenshots are extremely helpful for bugs
- Design mockups for feature requests
- Documents for reference
- Drag files directly into upload area
- Up to 5 files, 10MB each

### Tips
- **Good title**: "Login fails with OAuth" ✅
- **Bad title**: "Broken" ❌
- **For bugs**: Include steps to reproduce in description
- **For features**: Explain why and what problem it solves
- **Attach screenshots**: Visual evidence makes bugs clearer
- **Set priority honestly**: Not everything is Critical
- **Assign if known**: Saves time in triage
- **Use correct type**: Helps with reporting and filtering
- Files upload immediately, visible before creating issue
- All fields except Assignee and Files are required

---

## 9. Edit Issue

**URL:** `/issues/[issue-id]/edit`

### What You See

**Page Header:**
- Title: "Edit Issue"
- Breadcrumb: Home > Projects > [Project Name] > Issue #[ID] > Edit
- "Back to Issue" button

**Form Fields (Pre-filled):**

All fields are the same as Create Issue form, but pre-populated with current values:

1. **Title** - Current issue title
2. **Description** - Current description
3. **Priority** - Current priority selected
4. **Type** - Current type selected
5. **Status** - Current status selected
6. **Assignee** - Current assignee selected (or empty)

**File Management Section:**
- **Existing Files:**
  - List of already attached files
  - "View" button for each
  - "Delete" button for each

- **Upload New Files:**
  - Drag-and-drop area
  - Add up to 5 total files
  - Counter shows: "2/5 files uploaded"

**Action Buttons:**
- "Update Issue" button (primary, blue)
- "Cancel" button (secondary, gray)

### Purpose
- Modify issue details
- Update status, priority, type
- Change assignee
- Add more files
- Remove incorrect files
- Correct mistakes

### Actions Available
1. **Edit any field** - Modify issue details
2. **Change status** - Update workflow state
3. **Change priority** - Adjust urgency
4. **Change assignee** - Reassign work
5. **Upload additional files** - Add more attachments
6. **Delete existing files** - Remove attachments
7. **Click "Update Issue"** - Save changes
8. **Click "Cancel"** - Discard changes and return
9. **Click "Back to Issue"** - Return to issue detail (saves nothing)

### Navigation Flow
```
Edit Issue → Issue Detail (click "Update Issue" after saving)
Edit Issue → Issue Detail (click "Cancel" or "Back to Issue")

Update Flow:
Modify fields → Click "Update Issue" → Validation → API call → Success toast → Redirect to issue detail
```

### Valuable Information

**Status Changes:**
- **Open → In Progress**: Starting work
- **In Progress → Resolved**: Work completed, needs verification
- **Resolved → Closed**: Verified and complete
- **Any → Open**: Reopening issue
- Status change creates Activity Timeline entry

**Priority Changes:**
- Can escalate (Low → High) if more urgent than initially thought
- Can de-escalate (Critical → Medium) if resolved or less urgent
- Priority change logged in Activity Timeline

**Assignee Changes:**
- Reassign if workload shifts
- Unassign if person unavailable
- Assign if was initially unassigned
- Assignee change logged in timeline

**File Management:**
- Keep relevant files, delete outdated ones
- Add new screenshots showing current state
- Remove files uploaded by mistake
- File changes logged in timeline

### Tips
- **Status updates should match reality**: If you start work, change to "In Progress"
- **Comment when changing status**: Explain why in a comment (recommended)
- **Priority changes are logged**: Team will see you changed it
- **Assignee changes notify**: Person assigned may get notified
- **Save often**: Changes only apply when you click "Update Issue"
- **Cancel discards everything**: No changes are saved if you cancel
- **Preview files before deleting**: Make sure you're removing the right one
- **Upload limit is cumulative**: Existing + new files must be ≤ 5 total
- Consider adding a comment explaining major changes

---

## 10. Add Comment

**URL:** `/issues/[issue-id]/comments/new`

### What You See

**Page Header:**
- Title: "Add Comment"
- Breadcrumb: Home > Projects > [Project Name] > Issue #[ID] > Add Comment
- "Back to Issue" button

**Issue Context (shown at top):**
- Issue title (for reference)
- Issue status badge
- Issue priority badge

**Form:**

1. **Comment Text** (Required)
   - Large textarea
   - Placeholder: "Write your comment here..."
   - Supports multiple lines
   - Minimum length validation

**Action Buttons:**
- "Submit Comment" button (primary, blue)
- "Cancel" button (secondary, gray)

### Purpose
- Add updates to an issue
- Ask questions
- Provide additional information
- Discuss the issue with team
- Document progress

### Actions Available
1. **Type comment** - Enter your text
2. **Click "Submit Comment"** - Post the comment
3. **Click "Cancel"** - Discard comment and return
4. **Click "Back to Issue"** - Return without posting

### Navigation Flow
```
Add Comment → Issue Detail (click "Submit Comment" after posting)
Add Comment → Issue Detail (click "Cancel" or "Back to Issue")

Comment Flow:
Write comment → Click "Submit Comment" → Validation → API call → Success toast → Redirect to issue detail
```

### Valuable Information

**Good Comments Include:**
- **Progress updates**: "Working on this, found the root cause in auth.ts"
- **Questions**: "Should we support IE11 for this feature?"
- **Additional context**: "This also affects the mobile app"
- **Test results**: "Tested on Chrome and Firefox, both work now"
- **Blockers**: "Blocked by issue #123, waiting on API"
- **Solutions**: "Fixed by updating the dependency to v2.0"

**Bad Comments:**
- **Too vague**: "ok" or "done" (no context)
- **Off-topic**: Unrelated discussions
- **Duplicate info**: Repeating what's in description
- **Should be separate issue**: New bugs/features (create new issue instead)

### Tips
- **Be specific**: Explain what you did, found, or need
- **Tag people**: Mention names if directing comment to someone
- **Include links**: Reference related issues, docs, or commits
- **Add after status changes**: Explain why you changed status
- **Ask questions early**: Don't wait if something's unclear
- **Update team**: Comment even for small progress
- **Format matters**: Use line breaks for readability
- **Think before posting**: Can't edit after submission
- Comment appears in Activity Timeline automatically
- Comments send notifications (future feature)

---

## 11. Global Search

**Trigger:** Press `⌘K` (Mac) or `Ctrl+K` (Windows/Linux)

### What You See

**Modal Overlay:**
- Dark background overlay (dims rest of page)
- Centered search modal

**Search Modal:**

1. **Search Input:**
   - Large text input at top
   - Placeholder: "Search projects and issues..."
   - Magnifying glass icon
   - "⌘K" or "Ctrl+K" hint shown when closed

2. **Results Section:**
   - Split into two groups:
     - **Projects** section
     - **Issues** section
   - Each result shows:
     - Icon (folder for projects, document for issues)
     - Title/name (bold)
     - Description or subtitle (gray text)
     - Matching context

3. **Keyboard Hints (footer):**
   - ↑↓ to navigate
   - Enter to select
   - Esc to close

4. **No Results State:**
   - "No results found" message
   - Search suggestions

### Purpose
- Find anything instantly
- Navigate without clicking through menus
- Power-user productivity
- Quick access to projects and issues

### Actions Available
1. **Type query** - Enter search terms
2. **↑↓ arrow keys** - Navigate results
3. **Enter key** - Open selected result
4. **Click result** - Open with mouse
5. **Esc key** - Close search modal
6. **Click overlay** - Close search modal

### Navigation Flow
```
Any Page → Press ⌘K → Search Modal Opens
Type query → Results appear in real-time (300ms debounce)
Select result → Navigate to that page
```

### Valuable Information

**Search Finds:**
- **Projects by:**
  - Project name
  - Project description
  - Key words

- **Issues by:**
  - Issue title
  - Issue description
  - Issue ID
  - Keywords

**Search Results Show:**
- **For Projects:**
  - Project name (bold)
  - Project description (preview)
  - Folder icon

- **For Issues:**
  - Issue title (bold)
  - Status and priority badges
  - Project name (subtitle)
  - Issue ID
  - Document icon

**Results are Limited:**
- Top 10 total results
- Most relevant matches first
- Projects and issues grouped separately

### Tips
- **Most important tip**: Learn the keyboard shortcut ⌘K/Ctrl+K
- **Type less**: Search starts working as you type
- **Use keywords**: Search by status, priority, or project name
- **Keyboard is faster**: Use ↑↓ and Enter instead of mouse
- **Works everywhere**: Available on every page
- **Real-time results**: See matches as you type (300ms debounce)
- **Fuzzy matching**: Doesn't need exact match
- **Great for issue IDs**: Type issue number to jump directly
- **No need to be exact**: Search is forgiving
- **Close quickly**: Esc or click outside to close

**Search Examples:**
- "login bug" → Find login-related issues
- "backend" → Find Backend API project and related issues
- "#42" → Find issue number 42
- "critical" → Find all critical priority issues
- "dashboard" → Find Dashboard project and dashboard-related issues

---

## 12. Admin Panel

**URL:** `/admin`

**Visibility:** Admins only (red link in navigation)

### What You See

**Page Header:**
- Title: "Admin Panel"
- Subtitle: "Manage user roles and permissions"
- Warning badge: "ADMIN ONLY"

**User Management Table:**

**Columns:**
1. **User** - Avatar, name, and email
2. **Role** - Current role badge
3. **Joined** - Date user account was created
4. **Last Active** - Last login/activity date
5. **Actions** - Role dropdown and buttons

**Each Row Shows:**
- User avatar (profile picture or initials)
- Full name
- Email address
- Current role with color-coded badge
- Join date
- Last active timestamp
- Role change dropdown
- "Update Role" button
- "Delete User" button (careful!)

**Role Badges:**
- **Admin** - Red badge
- **Manager** - Blue badge
- **Developer** - Green badge
- **Viewer** - Gray badge

### Purpose
- Manage user permissions
- Assign roles to team members
- Control who can do what
- Monitor user activity
- Remove users if needed

### Actions Available
1. **Change user role** - Select new role from dropdown
2. **Click "Update Role"** - Save role change
3. **Click "Delete User"** - Remove user (permanent!)
4. **Sort table** - Click column headers
5. **View user details** - Click user name

### Navigation Flow
```
Admin Panel → User Detail (click user name, if implemented)
Admin Panel → Role Change → Confirmation → Update → Success toast
```

### Valuable Information

**Role Hierarchy:**
```
Admin (highest) → Manager → Developer → Viewer (lowest)
```

**Role Permissions Matrix:**

| Action | Admin | Manager | Developer | Viewer |
|--------|-------|---------|-----------|--------|
| View issues | ✅ | ✅ | ✅ | ✅ |
| Create issues | ✅ | ✅ | ✅ | ❌ |
| Edit own issues | ✅ | ✅ | ✅ | ❌ |
| Edit any issue | ✅ | ✅ | ❌ | ❌ |
| Delete issues | ✅ | ✅ | ❌ | ❌ |
| Assign issues | ✅ | ✅ | ❌ | ❌ |
| Create projects | ✅ | ✅ | ❌ | ❌ |
| Edit projects | ✅ | ✅ | ❌ | ❌ |
| Delete projects | ✅ | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ |
| Access admin panel | ✅ | ❌ | ❌ | ❌ |

**User Information Tells You:**
- **Joined date**: When user started using TaskForge
- **Last active**: How engaged user is
- **Current role**: What they can do
- **Email**: Contact information

**Role Change Impact:**
- Role changes apply immediately
- User sees new permissions on next action
- Logged in Activity Timeline
- Cannot demote yourself (must have another admin)

### Tips
- **Promote carefully**: Admins have full control
- **Manager role for team leads**: Can manage work but not users
- **Developer for most users**: Can do their own work
- **Viewer for read-only**: Stakeholders, clients, observers
- **Don't delete users hastily**: Consider demoting to Viewer instead
- **Maintain multiple admins**: Don't have just one admin
- **Role changes are logged**: Audit trail exists
- **Test with lower roles**: Verify permissions before assigning
- **Communication matters**: Tell users when you change their role

**Common Role Assignments:**
- **Project Manager** → Manager role
- **Engineering Team** → Developer role
- **QA Testers** → Developer role (need to edit issues)
- **Executives** → Viewer role (monitoring)
- **External Stakeholders** → Viewer role
- **System Admin** → Admin role

---

## 13. Profile/Settings

**URL:** `/profile` (if implemented)

### What You See

**Note:** This screen may vary based on implementation.

**Typical Sections:**

1. **Profile Information:**
   - Avatar/profile picture
   - Full name
   - Email address
   - Current role badge
   - Account created date

2. **Theme Preferences:**
   - Theme toggle (Light/Dark/System)
   - Current theme shown

3. **Notification Settings:**
   - Email notification preferences
   - In-app notification settings
   - Frequency options

4. **Account Security:**
   - Change password (if applicable)
   - Two-factor authentication (future)
   - OAuth connections (GitHub, Google)

5. **Preferences:**
   - Default project
   - Issues per page
   - Date format
   - Time zone

**Action Buttons:**
- "Save Changes" button
- "Cancel" button
- "Sign Out" button

### Purpose
- Manage your personal settings
- Update profile information
- Configure preferences
- Control notifications
- Sign out of account

### Actions Available
1. **Update profile info** - Change name, avatar
2. **Change theme** - Select Light/Dark/System
3. **Configure notifications** - Turn on/off email alerts
4. **Update preferences** - Set defaults
5. **Sign out** - End session
6. **Save changes** - Apply settings

### Navigation Flow
```
Any Page → Click Avatar → Profile/Settings
Profile → Update Settings → Save → Success toast
Profile → Sign Out → Landing Page
```

### Valuable Information

**Profile Section:**
- Your basic account information
- Role assigned by admin
- When you joined TaskForge

**Theme Preferences:**
- **Light**: Default bright theme
- **Dark**: Easy on eyes, saves battery (OLED)
- **System**: Follows OS preference (auto-switches)

**Notification Settings:**
- Control what emails you receive
- Manage notification frequency
- Future: Real-time push notifications

### Tips
- **Use System theme**: Automatically switches with OS
- **Dark mode at night**: Easier on eyes
- **Configure notifications**: Avoid email overload
- **Keep profile updated**: Helps team recognize you
- **Sign out on shared devices**: Security best practice

---

## Common Workflows

### Workflow 1: Report a Bug

1. Press `⌘K` to open Global Search
2. Type the project name to find the right project
3. Press Enter to open project detail
4. Click "New Issue" button
5. Fill out form:
   - Title: "Login fails with Google OAuth"
   - Description: "Steps to reproduce: 1. Click Google sign-in..."
   - Priority: High
   - Type: Bug
   - Assign to relevant developer
6. Attach screenshot showing error
7. Click "Create Issue"
8. Success! Issue is created and assigned

### Workflow 2: Start Working on an Issue

1. Go to Dashboard
2. Find issue in "Assigned to Me" section or use ⌘K search
3. Click issue to open detail page
4. Review description and comments
5. Click "Edit Issue"
6. Change status from "Open" to "In Progress"
7. Click "Update Issue"
8. Optionally add comment: "Starting work on this now"
9. Begin working on the issue

### Workflow 3: Track Project Progress

1. Navigate to Projects page
2. View progress bars on project cards
3. Click "View Kanban" on target project
4. See visual distribution of issues
5. Drag issues between columns as work progresses
6. Check completion percentage
7. Return to Dashboard to see overall stats

### Workflow 4: Complete an Issue

1. Open issue detail page
2. Click "Edit Issue"
3. Change status to "Resolved"
4. Click "Update Issue"
5. Click "Add Comment"
6. Explain what you did: "Fixed by updating auth middleware..."
7. Submit comment
8. Wait for verification
9. Once verified, change status to "Closed"

### Workflow 5: Use Dark Mode

1. Look for Theme Toggle in navigation (Sun/Moon/System icons)
2. Click Moon icon for Dark mode
3. Theme switches with smooth transition
4. Entire app now in dark mode
5. Preference saved automatically
6. Persists across browser sessions

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` or `Ctrl+K` | Open Global Search |
| `↑` | Navigate up in search results |
| `↓` | Navigate down in search results |
| `Enter` | Select highlighted search result |
| `Esc` | Close search modal or dismiss dialogs |

**More shortcuts coming in future updates**

---

## Tips for Maximum Productivity

1. **Master ⌘K**: Fastest way to navigate anywhere
2. **Use Kanban for active projects**: Visual management is powerful
3. **Enable Dark Mode**: Easier on eyes for extended use
4. **Attach screenshots to bugs**: Makes reproduction much clearer
5. **Comment frequently**: Keep team updated on progress
6. **Set priorities honestly**: Not everything is Critical
7. **Review Activity Timeline**: Understand history before changing issues
8. **Use breadcrumbs**: Easy way to navigate up the hierarchy
9. **Check Dashboard daily**: Stay aware of your workload
10. **Organize with project progress bars**: Visual cues help prioritize

---

## Getting Help

### In-App Help
- Press `?` key (if implemented) for keyboard shortcuts
- Hover over UI elements for tooltips
- Check breadcrumbs if lost

### Documentation
- Refer to this guide for detailed instructions
- Check COMPLETE-FEATURES-SUMMARY.md for feature list
- See DEMO-VIDEO-SCRIPT.md for visual walkthroughs

### Support
- Report issues by creating a new issue in TaskForge itself
- Contact your admin for permission issues
- Check with your project manager for workflow questions

---

## Conclusion

TaskForge is designed to be intuitive and powerful. This guide covers every screen and action available. Bookmark this document for quick reference.

**Key Takeaways:**
- Use Global Search (⌘K) for fast navigation
- Kanban boards for visual project management
- Dark mode for comfortable viewing
- Activity Timeline for full audit trail
- Comments for team collaboration
- Progress bars for quick project health checks

**Remember:**
- Your role determines what you can do
- Changes are logged and visible to team
- Files can help clarify issues significantly
- Communication through comments is encouraged

Enjoy using TaskForge!

---

*Last Updated: March 25, 2026*
*Version: 2.0.0*
*For TaskForge User Documentation*
