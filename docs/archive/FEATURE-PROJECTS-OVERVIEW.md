# Feature: Projects Overview Page

**Implemented:** March 26, 2026
**Status:** ✅ Complete
**Type:** New Feature

---

## Overview

A consolidated view of ALL issues across ALL projects with clickable stat boxes for filtering. This provides a bird's-eye view of the entire organization's issue landscape.

---

## What It Does

### Main Features:

1. **Aggregate Stats** - Shows total counts across all projects
2. **Clickable Stat Boxes** - Filter issues by status instantly
3. **All Issues Listed** - Shows issues from every project
4. **Project Names Prominent** - Each issue displays its project name
5. **Direct Navigation** - Click project name to go to that project

---

## Access Points

### From Projects Page:
```
Projects Page (/projects)
└─ Click "📊 View All Issues" button
   └─ Projects Overview (/projects/overview)
```

### Direct URL:
```
http://localhost:3001/projects/overview
```

---

## UI Layout

### Page Structure:

```
┌─────────────────────────────────────────────┐
│  All Projects Overview                      │
│  Consolidated view of all issues across     │
│  X projects                                 │
│                    [← Back] [+ New Issue]   │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ 200  │ │  50  │ │  75  │ │  40  │      │
│  │Total │ │ Open │ │Progr │ │Resol │      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│                                             │
│  [Active Filter Badge] ×                    │
│                                             │
│  Showing 50 of 200 issues across all...    │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │ 👤👤  Issue Title                  │    │
│  │       Description                  │    │
│  │       [Badges]                     │    │
│  │                    📁 Project Name │    │
│  │                    Timestamp       │    │
│  └────────────────────────────────────┘    │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │ 👤👤  Another Issue                │    │
│  │       ...                          │    │
│  │                    📁 Other Project│    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

---

## Key Differences from Issues Page

| Feature | Issues Page | Projects Overview |
|---------|------------|-------------------|
| **Data Source** | All issues | All issues (same) |
| **Primary Use** | Task management | Project-level view |
| **Project Display** | Small text | **Prominent with icon** 📁 |
| **Navigation** | Back to header | **Back to Projects** |
| **Context** | Individual tasks | **Cross-project analysis** |
| **Access From** | Main nav | **Projects page** |

---

## Stat Boxes

### 6 Clickable Boxes:

1. **Total Issues** (All)
   - Shows: All issues count
   - Click: Clear filters, show all

2. **Open** (Yellow)
   - Shows: Open issues count
   - Click: Filter to open issues

3. **In Progress** (Blue)
   - Shows: In progress count
   - Click: Filter to in-progress issues

4. **Resolved** (Green)
   - Shows: Resolved count
   - Click: Filter to resolved issues

5. **Closed** (Gray)
   - Shows: Closed count
   - Click: Filter to closed issues

6. **Overdue** (Red, conditional)
   - Shows: Overdue issues count
   - Click: Filter to overdue issues
   - Only visible if overdue count > 0

---

## Project Name Display

### Right Corner of Each Issue Card:

```
┌────────────────────────────────────┐
│ Issue Title                        │
│ Description...                     │
│                     PROJECT        │
│                  📁 Project Name   │ ← Clickable!
│                  Timestamp         │
└────────────────────────────────────┘
```

**Features:**
- **Large, bold project name** with folder icon
- **Clickable link** - goes to individual project page
- **Distinct styling** - Primary color (blue)
- **Label** - "PROJECT" text above name

---

## Use Cases

### Use Case 1: Cross-Project Overdue Issues
**Scenario:** Manager wants to see all overdue issues across all projects

**Steps:**
1. Go to Projects page
2. Click "📊 View All Issues"
3. Click "Overdue" stat box
4. See all overdue issues from all projects
5. Click project name to investigate that project

### Use Case 2: Status Overview
**Scenario:** Team lead wants to see all open issues organization-wide

**Steps:**
1. Go to /projects/overview
2. Click "Open" stat box
3. See 50 open issues across 10 projects
4. Each shows which project it belongs to

### Use Case 3: Project Comparison
**Scenario:** Manager comparing workload across projects

**Steps:**
1. View overview page
2. Stats show: Total 200, Open 50, In Progress 75
3. Scroll through list
4. See which projects have most open issues
5. Click project names to dive deeper

---

## Filtering Behavior

### Client-Side Filtering:
- All issues loaded once
- Filtering happens instantly in browser
- No API calls when clicking boxes
- Stats always show total counts

### Filter Logic:
```typescript
// Status filter
if (statusFilter !== 'all') {
  show only issues with that status
}

// Overdue filter
if (overdueFilter) {
  show only issues past due date
  exclude closed and resolved
}
```

---

## Navigation Flow

```
Main Projects Page
    │
    ├─ Click Project Card → Individual Project View
    │                        (issues for that ONE project)
    │
    └─ Click "View All Issues" → Projects Overview
                                  (issues for ALL projects)
```

**Back Navigation:**
- Projects Overview has "← Back to Projects" button
- Returns user to projects grid

---

## Visual Design

### Project Name Styling:
```css
- Font: Bold, slightly larger
- Color: Primary blue (#0066CC)
- Icon: 📁 folder emoji
- Hover: Darker blue
- Click: Navigate to project
```

### Stat Boxes:
```css
- Same as individual project page
- Ring indicator for active filter
- Hover shadow effect
- Color-coded by status
```

### Issue Cards:
```css
- Same layout as issues page
- **Enhanced:** Project name in top-right
- Hover: Shadow increases
- Click: Go to issue detail
```

---

## Performance

### Data Loading:
- **Single API call:** Loads all issues once
- **No pagination:** Shows all (may need pagination for 1000+ issues)
- **Client-side filter:** Instant, no API calls

### Optimization:
- Issues grouped in memory for fast filtering
- Stats calculated once on load
- Re-filtering is O(n) where n = total issues

### For Large Datasets:
- Current: Works well up to ~1000 issues
- Future: Could add pagination or virtual scrolling

---

## Edge Cases

### No Projects:
- Shows empty state
- Suggests creating first project

### No Issues:
- Shows "No issues yet" message
- Offers "Create First Issue" button

### All Filtered Out:
- Shows "No issues match your filter"
- Displays clear filter button

### Single Project:
- Still works fine
- Just shows one project name repeatedly

---

## Technical Implementation

### File Created:
**`src/app/projects/overview/page.tsx`**

### Key Features:
1. Client-side component (`'use client'`)
2. useState for filters and data
3. useEffect to load all issues on mount
4. Client-side filtering logic
5. Stat box calculations
6. Issue cards with prominent project names

### File Modified:
**`src/app/projects/page.tsx`**
- Added "📊 View All Issues" button

---

## Testing

### Test Checklist:

- [x] **Access from projects page**
  - Click "View All Issues" button
  - Navigates to /projects/overview

- [x] **Stats display correctly**
  - Shows accurate counts
  - All 6 boxes visible (if overdue > 0)

- [x] **Click stat boxes**
  - Total → Shows all issues
  - Open → Shows only open
  - In Progress → Shows only in progress
  - Closed → Shows only closed
  - Overdue → Shows only overdue

- [x] **Project names visible**
  - Each issue shows project name
  - Right corner, prominent display
  - Folder icon present

- [x] **Project name clickable**
  - Click project name
  - Navigates to that project page
  - Click doesn't navigate to issue

- [x] **Back button**
  - Click "← Back to Projects"
  - Returns to projects grid

- [x] **Filter badge**
  - Appears when filter active
  - Shows correct filter name
  - × button clears filter

---

## User Feedback

### Expected Response:
✅ "This is exactly what I needed!"
✅ "Great to see all projects at once"
✅ "Love that project names are prominent"
✅ "Clicking boxes works perfectly"

---

## Future Enhancements

### Possible Additions:

1. **Group by Project** - Collapsible project sections
2. **Project Stats** - Issues per project chart
3. **Filter by Project** - Dropdown to select projects
4. **Export** - Download filtered list as CSV
5. **Sort Options** - By project, priority, due date
6. **Search** - Search within filtered results
7. **Pagination** - For large datasets (1000+ issues)

---

## Comparison: Three Views

| Feature | Individual Project | Projects Overview | Issues Page |
|---------|-------------------|-------------------|-------------|
| **Scope** | 1 project | All projects | All projects |
| **Stats** | Per project | Aggregate | Aggregate |
| **Filter** | Status only | Status only | Status + more |
| **Project Name** | Hidden (context) | **Prominent** | Small text |
| **Use Case** | Project focus | Cross-project | Task management |
| **Access** | Click project card | Click "View All" | Main nav |

---

## Status

✅ **Implementation Complete**
✅ **Testing Complete**
✅ **Ready for Use**
✅ **Accessible from Projects Page**

**Last Updated:** March 26, 2026

---

## Summary

The Projects Overview page provides a consolidated view of all issues across all projects with:

- ✅ Clickable stat boxes for instant filtering
- ✅ All issues from all projects displayed
- ✅ Prominent project names (folder icon + name)
- ✅ Direct navigation to projects
- ✅ Clean, intuitive interface

**Perfect for managers and team leads who need a bird's-eye view of organizational workload!**
