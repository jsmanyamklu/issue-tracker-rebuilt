# TaskForge - Comprehensive Testing Checklist

## Test Environment
- **URL:** http://localhost:3002
- **Browser:** Chrome/Firefox/Safari (test on all)
- **Database:** PostgreSQL (ensure running)
- **Node.js:** v18+ required

---

## Pre-Testing Setup

### 1. Start Services
```bash
# Terminal 1: Start PostgreSQL (if not running)
docker-compose up -d postgres

# Terminal 2: Start Development Server
npm run dev
```

### 2. Verify Environment
- [ ] Development server running on http://localhost:3002
- [ ] PostgreSQL database `taskforge` exists and is accessible
- [ ] `.env` file has correct DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET
- [ ] OAuth credentials configured (GITHUB_ID, GITHUB_SECRET, GOOGLE_ID, GOOGLE_SECRET)

---

## Testing Categories

## Category 1: Authentication & Authorization

### Test 1.1: Sign In Flow
- [ ] Navigate to http://localhost:3002
- [ ] Click "Sign In" button
- [ ] Redirects to `/auth/signin` page
- [ ] See "Sign in with GitHub" button
- [ ] See "Sign in with Google" button
- [ ] Click "Sign in with GitHub"
- [ ] OAuth flow redirects to GitHub
- [ ] Authorize application
- [ ] Redirects back to Dashboard successfully
- [ ] User profile displayed in navigation (avatar + name + role)

### Test 1.2: Sign Out Flow
- [ ] While signed in, click user avatar or profile menu
- [ ] Click "Sign Out" button
- [ ] Session cleared
- [ ] Redirects to landing page
- [ ] Cannot access protected routes (Dashboard, Projects) without signing in again

### Test 1.3: Role-Based Access Control (RBAC)
**Test with Admin Role:**
- [ ] Admin Panel link visible in navigation (red color)
- [ ] Can access `/admin` page
- [ ] Can create projects
- [ ] Can edit any project
- [ ] Can delete projects
- [ ] Can create issues
- [ ] Can edit any issue
- [ ] Can assign issues to anyone
- [ ] Can delete issues
- [ ] Can change user roles

**Test with Manager Role:**
- [ ] Admin Panel link NOT visible
- [ ] Cannot access `/admin` page (redirects or 403)
- [ ] Can create projects
- [ ] Can edit projects
- [ ] Can delete projects
- [ ] Can create issues
- [ ] Can edit any issue
- [ ] Can assign issues
- [ ] Can delete issues

**Test with Developer Role:**
- [ ] Admin Panel link NOT visible
- [ ] Cannot access `/admin` page
- [ ] Cannot create projects
- [ ] Cannot edit projects
- [ ] Can create issues
- [ ] Can edit own issues only
- [ ] Cannot assign issues (no assignee dropdown or disabled)
- [ ] Cannot delete issues

**Test with Viewer Role:**
- [ ] Admin Panel link NOT visible
- [ ] Cannot create projects
- [ ] Cannot edit projects
- [ ] Cannot create issues
- [ ] Cannot edit issues
- [ ] Read-only access to all pages

---

## Category 2: Dashboard

### Test 2.1: Statistics Cards
- [ ] Navigate to `/dashboard`
- [ ] See 4 statistics cards:
  - [ ] "Assigned to Me" - Shows count of issues assigned to current user
  - [ ] "Reported by Me" - Shows count of issues created by current user
  - [ ] "Open Issues" - Shows count of all open/in-progress issues
  - [ ] "Closed Issues" - Shows count of all resolved/closed issues
- [ ] Statistics are accurate (verify by counting manually)
- [ ] Cards display numbers correctly
- [ ] Cards have proper styling and icons

### Test 2.2: Charts
- [ ] See "Issue Status Distribution" Pie Chart
  - [ ] Shows Open, In Progress, Resolved, Closed segments
  - [ ] Hover shows count and percentage
  - [ ] Colors are distinct and visible
  - [ ] Legend shows all statuses
- [ ] See "Issues by Priority" Bar Chart
  - [ ] Shows Low, Medium, High, Critical bars
  - [ ] Hover shows exact count
  - [ ] Colors match priority severity (green→yellow→orange→red)
  - [ ] Y-axis shows counts

### Test 2.3: Recent Issues
- [ ] See "Recent Issues" section
- [ ] Lists latest 5-10 issues (assigned or reported by you)
- [ ] Each issue shows:
  - [ ] Issue title
  - [ ] Status badge (colored)
  - [ ] Priority badge (colored)
  - [ ] Project name
- [ ] Click issue title opens issue detail page
- [ ] If no issues, shows empty state message

---

## Category 3: Theme Toggle (Dark Mode)

### Test 3.1: Theme Toggle UI
- [ ] See theme toggle in navigation bar (3 icons: Sun, Moon, Computer)
- [ ] Current theme is highlighted (different background)
- [ ] Icons are visible and clear

### Test 3.2: Light Mode
- [ ] Click Sun icon
- [ ] Theme switches to Light mode immediately
- [ ] Background is white/light gray
- [ ] Text is dark/black
- [ ] All components visible and readable
- [ ] Smooth transition animation (0.3s)

### Test 3.3: Dark Mode
- [ ] Click Moon icon
- [ ] Theme switches to Dark mode immediately
- [ ] Background is dark gray/black (#111827)
- [ ] Text is white/light gray
- [ ] All components visible and readable
- [ ] Charts adapt to dark background
- [ ] Cards have dark background (#1f2937)
- [ ] Borders are subtle but visible

### Test 3.4: System Mode
- [ ] Click Computer/System icon
- [ ] Theme follows OS preference
- [ ] Change OS theme (in OS settings)
- [ ] TaskForge automatically updates to match
- [ ] No page refresh required

### Test 3.5: Theme Persistence
- [ ] Select Dark mode
- [ ] Refresh page (F5)
- [ ] Dark mode persists after refresh
- [ ] Close browser tab
- [ ] Open new tab to http://localhost:3002
- [ ] Theme still persists (localStorage working)

---

## Category 4: Global Search

### Test 4.1: Open Search Modal
- [ ] Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
- [ ] Search modal opens
- [ ] Background dimmed (overlay)
- [ ] Search input auto-focused (cursor in input)
- [ ] Placeholder text: "Search projects and issues..."

### Test 4.2: Search Functionality
- [ ] Type "backend" in search input
- [ ] Results appear in real-time (300ms debounce)
- [ ] Results grouped by:
  - [ ] Projects (folder icon)
  - [ ] Issues (document icon)
- [ ] Each project result shows:
  - [ ] Project name (bold)
  - [ ] Project description (gray)
- [ ] Each issue result shows:
  - [ ] Issue title (bold)
  - [ ] Status and priority badges
  - [ ] Project name (subtitle)
  - [ ] Issue ID

### Test 4.3: Keyboard Navigation
- [ ] Type search query
- [ ] Press `Down Arrow` key
- [ ] First result highlighted
- [ ] Press `Down Arrow` again
- [ ] Next result highlighted
- [ ] Press `Up Arrow` key
- [ ] Previous result highlighted
- [ ] Press `Enter` key
- [ ] Selected result opens (navigate to that page)

### Test 4.4: Mouse Navigation
- [ ] Type search query
- [ ] Hover over a result
- [ ] Result highlights on hover
- [ ] Click result
- [ ] Navigate to that page

### Test 4.5: Close Search Modal
- [ ] Open search modal (`Cmd+K`)
- [ ] Press `Esc` key
- [ ] Modal closes
- [ ] Open again
- [ ] Click outside modal (on overlay)
- [ ] Modal closes

### Test 4.6: No Results
- [ ] Type "xyzabcnonexistent" (gibberish)
- [ ] See "No results found" message
- [ ] No errors in console

---

## Category 5: Projects

### Test 5.1: Projects List
- [ ] Navigate to `/projects`
- [ ] See breadcrumb: Home > Projects
- [ ] See "New Project" button (if Manager/Admin)
- [ ] See project cards in grid layout
- [ ] Each project card shows:
  - [ ] Project name
  - [ ] Project description (truncated)
  - [ ] Progress bar (colored)
  - [ ] Completion percentage (e.g., "65% complete")
  - [ ] Issue breakdown with emojis (Open, In Progress, Resolved, Closed)
  - [ ] "View Details" button
  - [ ] "View Kanban" button

### Test 5.2: Progress Bar Colors
- [ ] Find project with <25% completion - Progress bar is RED
- [ ] Find project with 25-50% completion - Progress bar is YELLOW
- [ ] Find project with 50-80% completion - Progress bar is BLUE
- [ ] Find project with >80% completion - Progress bar is GREEN
- [ ] Progress bar fills correctly based on percentage

### Test 5.3: Create New Project (Manager/Admin only)
- [ ] Click "New Project" button
- [ ] Redirects to `/projects/new`
- [ ] See form with fields:
  - [ ] Name (required)
  - [ ] Key (required, auto-generated or manual)
  - [ ] Description (optional)
- [ ] Fill out form
- [ ] Click "Create Project"
- [ ] Toast notification: "Project created successfully!"
- [ ] Redirects to new project detail page
- [ ] New project appears in projects list

### Test 5.4: Project Card Navigation
- [ ] Click project name or "View Details"
- [ ] Navigate to project detail page
- [ ] Click "View Kanban"
- [ ] Navigate to Kanban board for that project

---

## Category 6: Project Detail Page

### Test 6.1: Project Information
- [ ] Navigate to any project detail page
- [ ] See breadcrumb: Home > Projects > [Project Name]
- [ ] See project title (large heading)
- [ ] See project description
- [ ] See action buttons:
  - [ ] "View Kanban Board"
  - [ ] "Edit Project" (if Manager/Admin)
  - [ ] "New Issue"

### Test 6.2: Issues List
- [ ] See list of all issues in project
- [ ] Each issue row shows:
  - [ ] Issue title (clickable)
  - [ ] Status badge
  - [ ] Priority badge
  - [ ] Type badge
  - [ ] Assignee name or avatar
  - [ ] Reporter name
  - [ ] Created date
- [ ] Click issue title
- [ ] Navigate to issue detail page

### Test 6.3: Empty State
- [ ] Find or create project with no issues
- [ ] See empty state message: "No issues in this project yet"
- [ ] See "Create First Issue" button
- [ ] Click button
- [ ] Navigate to new issue form with project pre-selected

---

## Category 7: Kanban Board

### Test 7.1: Kanban Board Layout
- [ ] Navigate to `/projects/[id]/kanban`
- [ ] See breadcrumb: Home > Projects > [Project Name] > Kanban
- [ ] See page title: "[Project Name] - Kanban Board"
- [ ] See subtitle: "Drag and drop issues to change their status"
- [ ] See 4 columns:
  - [ ] Open (yellow background)
  - [ ] In Progress (blue background)
  - [ ] Resolved (green background)
  - [ ] Closed (gray background)
- [ ] Each column shows issue count badge

### Test 7.2: Issue Cards
- [ ] Each issue card shows:
  - [ ] Issue title (truncated if long)
  - [ ] Priority badge (colored)
  - [ ] Type badge (colored)
  - [ ] Assignee avatar and name
- [ ] Cards are visually distinct
- [ ] Cards fit within column width

### Test 7.3: Drag and Drop
- [ ] Hover over issue card
- [ ] Cursor changes to move/grab cursor
- [ ] Click and hold on issue card
- [ ] Drag card to different column
- [ ] Column highlights while dragging over it
- [ ] Release mouse (drop)
- [ ] Card moves to new column
- [ ] Toast notification: "Issue status updated"
- [ ] Column counts update immediately

### Test 7.4: Drag and Drop Error Handling
- [ ] Try dragging issue to same column (no-op)
- [ ] Should work without error
- [ ] Try dragging while API is slow (simulate by throttling network)
- [ ] Card should stay in original position until API responds
- [ ] If API fails, show error toast: "Failed to update issue status"
- [ ] Card returns to original position

### Test 7.5: Click Issue Card
- [ ] Click on issue card (not dragging, just click)
- [ ] Navigate to issue detail page
- [ ] Can return to Kanban via breadcrumb or back button

### Test 7.6: Empty Columns
- [ ] Find column with no issues
- [ ] See "No issues" message in center of column
- [ ] Message is grayed out and centered

---

## Category 8: Issue Detail Page

### Test 8.1: Issue Information
- [ ] Navigate to any issue detail page
- [ ] See breadcrumb: Home > Projects > [Project Name] > Issue #[ID]
- [ ] See "Back to Project" button at top
- [ ] See issue title (large heading)
- [ ] See full description
- [ ] See metadata panel:
  - [ ] Status badge
  - [ ] Priority badge
  - [ ] Type badge
  - [ ] Reporter name
  - [ ] Assignee name (or "Unassigned")
  - [ ] Project name (clickable link)
  - [ ] Created date
  - [ ] Updated date

### Test 8.2: Action Buttons
- [ ] See "Edit Issue" button (if you have permission)
- [ ] See "Add Comment" button
- [ ] See "Delete Issue" button (if Admin/Manager)
- [ ] Click "Edit Issue" - navigate to edit page
- [ ] Click "Add Comment" - navigate to add comment page
- [ ] Click "Back to Project" - return to project detail

### Test 8.3: Attached Files Section
**If files attached:**
- [ ] See "Attached Files" section
- [ ] Each file shows:
  - [ ] File icon (image/document icon)
  - [ ] File name
  - [ ] File size
  - [ ] "View" button
  - [ ] "Delete" button (if you have permission)
- [ ] Click "View" on image file
- [ ] Image opens in new tab or downloads
- [ ] Click "Delete" on file (if permitted)
- [ ] Confirmation prompt (if implemented)
- [ ] File removed from list
- [ ] Toast notification

**If no files:**
- [ ] "Attached Files" section not shown or shows "No files attached"

### Test 8.4: Comments Section
- [ ] See "Comments" section
- [ ] Each comment shows:
  - [ ] Commenter's name and avatar
  - [ ] Comment text
  - [ ] Timestamp (e.g., "2 hours ago")
  - [ ] "Edit" button (if you own the comment)
  - [ ] "Delete" button (if you own the comment)
- [ ] Comments in chronological order (oldest first or newest first)
- [ ] If no comments, shows empty state

### Test 8.5: Activity Timeline
- [ ] See "Activity Timeline" section
- [ ] Each activity entry shows:
  - [ ] Icon (colored badge)
  - [ ] Description of change
  - [ ] User who made change
  - [ ] Timestamp (relative, e.g., "2 hours ago")
- [ ] Activity types visible:
  - [ ] Issue created (green)
  - [ ] Status changed (blue)
  - [ ] Priority changed (purple)
  - [ ] Assignee changed (orange)
  - [ ] Comment added (gray)
- [ ] Activities in chronological order (newest first)
- [ ] Timeline connects entries with vertical line

---

## Category 9: Create New Issue

### Test 9.1: Access Create Form
- [ ] From Dashboard, click "New Issue" (if visible)
- [ ] From Projects page, click "New Issue"
- [ ] From Project detail page, click "New Issue"
- [ ] Navigate to `/issues/new`
- [ ] Form loads correctly

### Test 9.2: Form Fields
- [ ] See title input (required)
- [ ] See description textarea (required)
- [ ] See project dropdown (required)
  - [ ] Lists all projects you can access
  - [ ] Pre-selected if coming from project page
- [ ] See priority dropdown (required)
  - [ ] Options: Low, Medium, High, Critical
- [ ] See type dropdown (required)
  - [ ] Options: Bug, Feature, Task, Improvement
- [ ] See status dropdown (required)
  - [ ] Options: Open, In Progress, Resolved, Closed
  - [ ] Default: Open
- [ ] See assignee dropdown (optional)
  - [ ] Lists all users (if you have assign permission)
  - [ ] Shows user avatar and name
  - [ ] "Unassigned" option available
  - [ ] Dropdown disabled if you're Developer (no assign permission)

### Test 9.3: File Upload
- [ ] See file upload area
- [ ] See "Drag and drop files here, or click to select" message
- [ ] See file limit note: "Up to 5 files, 10MB each"
- [ ] See accepted types: "Images (JPG, PNG, GIF, WebP), PDF, TXT"

### Test 9.4: Form Validation
- [ ] Try submitting empty form
- [ ] See validation errors on required fields
- [ ] Fill title only
- [ ] Still see validation errors
- [ ] Fill all required fields
- [ ] Validation errors clear

### Test 9.5: File Upload - Drag and Drop
- [ ] Drag a PNG image file into upload area
- [ ] Upload area highlights (border changes)
- [ ] Release file
- [ ] File uploads (see progress if implemented)
- [ ] File appears in file list below
- [ ] Shows file icon, name, size
- [ ] Shows "Delete" button next to file

### Test 9.6: File Upload - Click to Select
- [ ] Click upload area
- [ ] File picker dialog opens
- [ ] Select an image file
- [ ] File uploads
- [ ] File appears in list

### Test 9.7: File Upload - Multiple Files
- [ ] Upload 3 image files (one by one or all at once)
- [ ] All 3 files appear in list
- [ ] See "3/5 files uploaded" counter
- [ ] Try uploading 3 more files (total would be 6)
- [ ] See error: "Maximum 5 files allowed"
- [ ] Only 5 files in list

### Test 9.8: File Upload - Size Validation
- [ ] Try uploading file larger than 10MB
- [ ] See error toast: "File too large (max 10MB)"
- [ ] File not added to list

### Test 9.9: File Upload - Type Validation
- [ ] Try uploading .exe or .zip file
- [ ] See error toast: "File type not supported"
- [ ] File not added to list

### Test 9.10: File Upload - Delete File
- [ ] Upload 2 files
- [ ] Click "Delete" on one file
- [ ] File removed from list
- [ ] Counter updates (1/5 files)

### Test 9.11: Submit Issue
- [ ] Fill all required fields
- [ ] Upload 1 test file
- [ ] Click "Create Issue" button
- [ ] Button shows loading state (if implemented)
- [ ] Toast notification: "Issue created successfully!"
- [ ] Redirect to new issue detail page
- [ ] Issue data correct
- [ ] File attached and visible

### Test 9.12: Cancel
- [ ] Fill out form partially
- [ ] Click "Cancel" button
- [ ] Confirm discard (if prompt exists)
- [ ] Return to previous page
- [ ] Issue not created

---

## Category 10: Edit Issue

### Test 10.1: Access Edit Form
- [ ] From issue detail page, click "Edit Issue"
- [ ] Navigate to `/issues/[id]/edit`
- [ ] See "Back to Issue" button at top
- [ ] Form loads with current issue data pre-filled

### Test 10.2: Pre-filled Fields
- [ ] Title input has current title
- [ ] Description textarea has current description
- [ ] Priority dropdown has current priority selected
- [ ] Type dropdown has current type selected
- [ ] Status dropdown has current status selected
- [ ] Assignee dropdown has current assignee selected (or "Unassigned")

### Test 10.3: Edit Fields
- [ ] Change title
- [ ] Change description
- [ ] Change priority from Medium to High
- [ ] Change status from Open to In Progress
- [ ] Change assignee

### Test 10.4: File Management
- [ ] See "Existing Files" section
- [ ] Lists currently attached files
- [ ] Each file has "View" and "Delete" buttons
- [ ] Click "Delete" on one file
- [ ] File marked for deletion (or removed immediately)

### Test 10.5: Upload Additional Files
- [ ] See "Upload New Files" section
- [ ] Upload 1 new file
- [ ] New file appears in upload list
- [ ] Total file count respects 5 file limit
- [ ] If already 5 files attached, cannot upload more

### Test 10.6: Update Issue
- [ ] Make changes to fields
- [ ] Click "Update Issue" button
- [ ] Toast notification: "Issue updated successfully!"
- [ ] Redirect to issue detail page
- [ ] Changes reflected correctly
- [ ] Activity timeline shows updates

### Test 10.7: Cancel Edit
- [ ] Make changes to form
- [ ] Click "Cancel" button
- [ ] Confirm discard (if prompt)
- [ ] Return to issue detail
- [ ] Changes not saved

---

## Category 11: Add Comment

### Test 11.1: Access Comment Form
- [ ] From issue detail page, click "Add Comment"
- [ ] Navigate to `/issues/[id]/comments/new`
- [ ] See "Back to Issue" button at top
- [ ] See issue title and badges for context

### Test 11.2: Comment Form
- [ ] See large textarea for comment
- [ ] Placeholder text present
- [ ] See "Submit Comment" button
- [ ] See "Cancel" button

### Test 11.3: Validation
- [ ] Try submitting empty comment
- [ ] See validation error
- [ ] Type comment text
- [ ] Error clears

### Test 11.4: Submit Comment
- [ ] Write comment: "Testing comment functionality"
- [ ] Click "Submit Comment"
- [ ] Toast notification: "Comment added successfully!"
- [ ] Redirect to issue detail page
- [ ] New comment appears in comments section
- [ ] Comment shows your name and timestamp
- [ ] Activity timeline shows "Comment added" entry

### Test 11.5: Cancel Comment
- [ ] Write comment
- [ ] Click "Cancel"
- [ ] Return to issue detail
- [ ] Comment not added

---

## Category 12: Admin Panel

**Note:** Must be signed in as Admin role

### Test 12.1: Access Admin Panel
- [ ] Sign in as Admin user
- [ ] See "Admin Panel" link in navigation (red text)
- [ ] Click "Admin Panel"
- [ ] Navigate to `/admin`
- [ ] Page loads successfully

### Test 12.2: User List
- [ ] See table of all users
- [ ] Table has columns:
  - [ ] User (avatar, name, email)
  - [ ] Role (badge)
  - [ ] Joined (date)
  - [ ] Last Active (date/time)
  - [ ] Actions (dropdown + button)
- [ ] All users displayed
- [ ] Data is accurate

### Test 12.3: Change User Role
- [ ] Find a Developer user
- [ ] Click role dropdown for that user
- [ ] See all role options: Admin, Manager, Developer, Viewer
- [ ] Select "Manager"
- [ ] Click "Update Role" button
- [ ] Toast notification: "User role updated successfully!"
- [ ] User's role badge updates to "Manager"
- [ ] Change reflected immediately

### Test 12.4: Role Change Persistence
- [ ] Change user role
- [ ] Refresh page
- [ ] Role change persists

### Test 12.5: Cannot Demote Self
- [ ] Try to change your own role from Admin to Developer
- [ ] Should see error or dropdown disabled
- [ ] Cannot demote yourself (prevents lock-out)

### Test 12.6: Delete User (if implemented)
- [ ] Click "Delete User" button
- [ ] Confirmation dialog appears
- [ ] Cancel - user not deleted
- [ ] Click "Delete User" again
- [ ] Confirm - user deleted
- [ ] Toast notification
- [ ] User removed from list

---

## Category 13: Toast Notifications

### Test 13.1: Success Toast
- [ ] Trigger success action (create issue, update project, etc.)
- [ ] See success toast (green background)
- [ ] Toast slides in from right
- [ ] Shows checkmark icon
- [ ] Shows message text
- [ ] Shows close button (X)

### Test 13.2: Error Toast
- [ ] Trigger error (invalid form submission, network error)
- [ ] See error toast (red background)
- [ ] Shows error icon (X or exclamation)
- [ ] Shows error message
- [ ] Shows close button

### Test 13.3: Warning Toast
- [ ] Trigger warning action (if implemented)
- [ ] See warning toast (yellow/orange background)
- [ ] Shows warning icon
- [ ] Shows message

### Test 13.4: Info Toast
- [ ] Trigger info action
- [ ] See info toast (blue background)
- [ ] Shows info icon (i)
- [ ] Shows message

### Test 13.5: Auto-dismiss
- [ ] Trigger success toast
- [ ] Wait 5 seconds (default duration)
- [ ] Toast fades out automatically
- [ ] Toast removed from screen

### Test 13.6: Manual Dismiss
- [ ] Trigger toast
- [ ] Click X button
- [ ] Toast disappears immediately

### Test 13.7: Multiple Toasts
- [ ] Trigger 3 toasts quickly (e.g., create 3 issues in succession)
- [ ] All 3 toasts appear
- [ ] Toasts stack vertically
- [ ] Each auto-dismisses after 5 seconds
- [ ] First one dismisses first (FIFO)

---

## Category 14: Loading Skeletons

### Test 14.1: Dashboard Skeleton
- [ ] Clear browser cache
- [ ] Navigate to `/dashboard`
- [ ] While page loads, see skeleton placeholders:
  - [ ] 4 card skeletons (pulsing)
  - [ ] Chart area skeletons
  - [ ] List skeletons for recent issues
- [ ] Skeleton disappears when data loads
- [ ] Smooth transition to actual content

### Test 14.2: Projects List Skeleton
- [ ] Navigate to `/projects`
- [ ] While loading, see project card skeletons
- [ ] Skeletons have same layout as real cards
- [ ] Pulsing animation

### Test 14.3: Issue List Skeleton
- [ ] Navigate to project detail
- [ ] While loading, see table row skeletons
- [ ] Multiple rows with pulsing effect

---

## Category 15: Empty States

### Test 15.1: No Projects
- [ ] Delete all projects (or test with fresh DB)
- [ ] Navigate to `/projects`
- [ ] See empty state:
  - [ ] Icon/illustration
  - [ ] Message: "No projects yet"
  - [ ] "Create First Project" button (if Manager/Admin)
- [ ] Click button
- [ ] Navigate to new project form

### Test 15.2: No Issues
- [ ] Navigate to project with no issues
- [ ] See empty state:
  - [ ] Icon
  - [ ] Message: "No issues in this project yet"
  - [ ] "Create First Issue" button
- [ ] Click button
- [ ] Navigate to new issue form (project pre-selected)

### Test 15.3: No Comments
- [ ] Navigate to issue with no comments
- [ ] Comments section shows empty state
- [ ] Message: "No comments yet" or similar

### Test 15.4: No Search Results
- [ ] Open Global Search
- [ ] Type gibberish query
- [ ] See "No results found" message
- [ ] No error thrown

### Test 15.5: No Assigned Issues
- [ ] Sign in as user with no assigned issues
- [ ] Dashboard shows "No issues assigned to you"
- [ ] Empty state message clear

---

## Category 16: Responsive Design

### Test 16.1: Desktop (1920x1080)
- [ ] Resize browser to 1920x1080
- [ ] All components fit properly
- [ ] Navigation bar full width
- [ ] Dashboard has 4 columns for stat cards
- [ ] Charts side-by-side
- [ ] Kanban board shows 4 columns side-by-side
- [ ] Project cards in 3-column grid

### Test 16.2: Laptop (1366x768)
- [ ] Resize browser to 1366x768
- [ ] Layout adapts
- [ ] Dashboard stats may go to 2x2 grid
- [ ] Kanban columns still visible (may be narrower)
- [ ] Project cards in 2-column grid

### Test 16.3: Tablet (768x1024)
- [ ] Resize browser to 768px width
- [ ] Navigation collapses or adapts
- [ ] Dashboard stats stack vertically (2 columns)
- [ ] Charts stack vertically
- [ ] Kanban board columns stack (2 columns)
- [ ] Project cards single column
- [ ] Touch-friendly button sizes

### Test 16.4: Mobile (375x667)
- [ ] Resize browser to 375px width
- [ ] Navigation becomes hamburger menu (if implemented)
- [ ] Dashboard stats stack vertically (1 column)
- [ ] Charts stack vertically
- [ ] Kanban board columns stack vertically
- [ ] Project cards single column
- [ ] All text readable without zooming
- [ ] Buttons tap-friendly (44px minimum)

---

## Category 17: Cross-Browser Testing

### Test 17.1: Chrome
- [ ] Open TaskForge in Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct

### Test 17.2: Firefox
- [ ] Open TaskForge in Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct

### Test 17.3: Safari
- [ ] Open TaskForge in Safari
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct

### Test 17.4: Edge
- [ ] Open TaskForge in Edge
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct

---

## Category 18: Performance Testing

### Test 18.1: Page Load Speed
- [ ] Clear cache
- [ ] Load dashboard
- [ ] Page loads in <2 seconds (on localhost)
- [ ] No blocking resources

### Test 18.2: Search Debouncing
- [ ] Open Global Search
- [ ] Type quickly: "backend"
- [ ] Network tab in DevTools
- [ ] Only 1 API call made (after 300ms debounce)
- [ ] Not 7 calls (one per keystroke)

### Test 18.3: File Upload Progress
- [ ] Upload large file (near 10MB)
- [ ] See upload progress (if implemented)
- [ ] UI doesn't freeze

### Test 18.4: Large Data Sets
- [ ] Create 100+ issues in a project
- [ ] Navigate to project detail
- [ ] Page loads without hanging
- [ ] Kanban board renders all issues
- [ ] Scrolling is smooth

---

## Category 19: Error Handling

### Test 19.1: Network Errors
- [ ] Disconnect internet
- [ ] Try creating issue
- [ ] See error toast: "Network error" or similar
- [ ] Issue not created
- [ ] Reconnect internet
- [ ] Try again - works

### Test 19.2: Invalid Form Data
- [ ] Create issue with title >500 characters
- [ ] See validation error
- [ ] Form doesn't submit

### Test 19.3: 404 Pages
- [ ] Navigate to `/issues/nonexistent-id`
- [ ] See 404 page or "Issue not found" message
- [ ] Can navigate back

### Test 19.4: 403 Forbidden
- [ ] Sign in as Viewer
- [ ] Try accessing `/admin`
- [ ] See 403 or redirect to dashboard
- [ ] Error message shown

---

## Category 20: Data Persistence

### Test 20.1: Create and Reload
- [ ] Create new issue
- [ ] Note issue ID
- [ ] Refresh page
- [ ] Issue still exists
- [ ] Navigate to issue directly
- [ ] Issue loads correctly

### Test 20.2: Edit and Reload
- [ ] Edit issue title
- [ ] Save changes
- [ ] Refresh page
- [ ] Changes persisted

### Test 20.3: Theme Persistence
- [ ] Switch to Dark mode
- [ ] Close browser completely
- [ ] Reopen browser
- [ ] Navigate to TaskForge
- [ ] Still in Dark mode

---

## Post-Testing

### Checklist
- [ ] All critical features tested
- [ ] All bugs documented
- [ ] Performance acceptable
- [ ] Cross-browser compatibility verified
- [ ] Responsive design works
- [ ] No console errors
- [ ] All data persists correctly

### Bug Report Template
If you find bugs, document them as:

```
Bug ID: BUG-001
Title: [Brief description]
Severity: Critical/High/Medium/Low
Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]
Expected Result: [What should happen]
Actual Result: [What actually happens]
Browser: [Chrome/Firefox/etc.]
Screenshot: [If applicable]
Console Errors: [Copy errors from DevTools]
```

---

## Testing Summary

After completing all tests, fill out:

### Test Results Summary

**Total Tests:** [count]
**Passed:** [count]
**Failed:** [count]
**Blocked:** [count]

**Critical Issues:** [count]
**High Issues:** [count]
**Medium Issues:** [count]
**Low Issues:** [count]

**Overall Status:** PASS / FAIL / PARTIAL

**Recommendation:** Ready for production / Needs fixes / Requires major work

---

## Automated Testing (Future)

Future test automation with Playwright/Cypress:
- [ ] E2E tests for authentication flow
- [ ] E2E tests for CRUD operations
- [ ] Unit tests for service layer
- [ ] Integration tests for API routes
- [ ] Component tests for UI components

---

*Last Updated: March 25, 2026*
*Version: 2.0.0*
*For TaskForge Quality Assurance*
