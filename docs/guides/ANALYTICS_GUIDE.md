# Where to Find Activity Logging & Analytics

## 🎯 Where It's Visible in the Web Pages

### 1. **Admin Analytics Dashboard** 📊
**URL**: `http://localhost:3000/admin/analytics`

**Access**: Admin and Manager roles only

**What You'll See**:
- **Issue Metrics**
  - Total issues, open, in progress, overdue counts
  - Average resolution time (hours)
  - Issue velocity (issues/day)
  - Issues grouped by priority (low, medium, high, critical)
  - Issues grouped by type (bug, feature, task, improvement)

- **User Performance**
  - Total users
  - Active users (last 7 days, last 30 days)
  - **Most Active Users** - Top 5 users by action count
  - **Top Resolvers** - Top 5 users who close issues fastest

- **Project Health**
  - Total projects
  - Active projects (with open issues)
  - Projects with overdue issues
  - **Project Health Scores** (0-100) with visual progress bars
  - Per-project breakdown of open/overdue issues

- **AI-Powered Insights** 🤖 (if configured)
  - Automated recommendations
  - Pattern detection
  - Predictive analytics

**How to Access**:
1. Go to http://localhost:3000/admin (Admin Panel)
2. Click the **"📊 View Analytics & Performance"** button in the top-right corner

---

### 2. **Issue Activity Log** 📜
**Location**: Bottom of every issue detail page

**URL**: `http://localhost:3000/issues/[issue-id]` (e.g., `/issues/123`)

**Access**: Anyone who can view the issue

**What You'll See**:
- Full chronological history of the issue
- Each activity shows:
  - User who performed the action (with avatar)
  - Action type (created, updated, status changed, assigned, commented)
  - Details of what changed
  - Timestamp (relative time like "2 hours ago")

**Activities Tracked**:
- ✨ **Issue Created** - Who created it, project, priority
- ✏️ **Issue Updated** - What fields were changed
- 🔄 **Status Changed** - From/to status with badges
- 👤 **Assigned** - Who was assigned, reason (if any)
- 💬 **Comment Added** - When comments were posted

---

### 3. **Admin Panel**
**URL**: `http://localhost:3000/admin`

**Access**: Admin role only

**What You'll See**:
- User role management
- Overdue issue notifications
- **NEW: Big "📊 View Analytics & Performance" button** to access analytics dashboard

---

## 📊 API Endpoints for Data Export

### Get Activity Logs
```javascript
GET /api/activity-logs?resource_type=issue&resource_id=123
GET /api/activity-logs?user_id=user-123&limit=100
GET /api/activity-logs?action_type=issue_status_changed
```

### Get Analytics Metrics
```javascript
GET /api/admin/analytics/metrics
```

**Response includes**:
- Issue metrics (resolution time, velocity, distribution)
- User metrics (active users, top resolvers)
- Project health scores
- Performance metrics (time to assign, reassignment rate)

### Get AI Insights (if configured)
```javascript
GET /api/admin/analytics/insights?days=30
```

---

## 🔍 What Data is Being Tracked

### Every Issue Action Logs:
1. **Creation** - Who, when, project, priority
2. **Updates** - What fields changed
3. **Status Changes** - From → To (open, in_progress, resolved, closed)
4. **Assignments** - Who assigned, to whom, reason
5. **Reassignments** - Track multiple assignments
6. **Comments** - When comments were added
7. **Deletions** - If issues are deleted

### Calculated Metrics:
- **Resolution Time** - Hours from creation to closed
- **Issue Velocity** - Issues resolved per day
- **User Activity** - Actions per user, active days
- **Reassignment Rate** - % of issues reassigned
- **Time to Assign** - Hours from creation to first assignment
- **Project Health** - Score based on open/overdue issues

---

## 🎯 How to Use for Performance Analysis

### 1. **Find Top Performers**
Go to: **Admin → Analytics → User Activity → Top Resolvers**

See:
- Who resolves the most issues
- How many issues each person has resolved
- (Future: average time per resolution)

### 2. **Track Issue Lifecycle**
Go to: **Any Issue Detail Page → Scroll to Activity Log**

See:
- Full timeline from creation to closure
- How long it stayed in each status
- How many times it was reassigned
- All updates and changes

### 3. **Monitor Team Velocity**
Go to: **Admin → Analytics → Issue Metrics → Issue Velocity**

See:
- How many issues your team resolves per day
- Trend over last 30 days

### 4. **Identify Bottlenecks**
Go to: **Admin → Analytics → Project Health**

See:
- Which projects have low health scores
- Projects with many overdue issues
- Projects needing attention

### 5. **Track Team Activity**
Go to: **Admin → Analytics → User Activity**

See:
- Who is most active (by action count)
- Active users in last 7 and 30 days
- Engagement trends

---

## 🤖 Ready for AI Analysis

All activity data is stored in the database and can be exported for AI/ML analysis:

```javascript
// Export all activity logs for training
GET /api/activity-logs?limit=10000&start_date=2025-01-01

// Get comprehensive metrics
GET /api/admin/analytics/metrics
```

### AI Use Cases (Future):
1. **Predict resolution time** for new issues
2. **Recommend best assignee** based on past performance
3. **Detect patterns** (e.g., certain types of issues take longer)
4. **Identify at-risk issues** likely to miss deadlines
5. **Performance forecasting** for team capacity planning

---

## 📸 Screenshots Guide

### To Access Analytics Dashboard:
1. Sign in as Admin or Manager
2. Click "Admin" in navigation
3. Click "📊 View Analytics & Performance" button
4. Explore all metrics and insights

### To See Issue Activity:
1. Go to any issue (click an issue from the list)
2. Scroll down below the comments section
3. See "📜 Activity Log (X)" section
4. View full chronological history

---

## 🚀 Summary

**Analytics are visible in 2 main places:**

1. **`/admin/analytics`** - Full dashboard with metrics, performance, and insights
2. **`/issues/[id]`** - Individual issue activity history

**All data is being collected automatically** - no configuration needed!

**For AI analysis** - Export via API endpoints and train models on:
- Resolution times
- User performance patterns
- Issue complexity indicators
- Team velocity trends
