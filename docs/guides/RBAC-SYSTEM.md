# Role-Based Access Control (RBAC) System

## 🎯 Overview

The Issue Tracker now has a comprehensive **Role-Based Access Control (RBAC)** system that provides fine-grained permission management for different types of users.

## 👥 User Roles

### 1. **Admin** 🔴
**Full system access - Super user**

**Permissions:**
- ✅ Create, edit, and delete **any** project
- ✅ Create, edit, assign, and delete **any** issue
- ✅ Close **any** issue
- ✅ Change issue priority on **any** issue
- ✅ Create, edit, and delete **any** comment
- ✅ **Manage user roles** (promote/demote users)
- ✅ Access **Admin Panel**

**Use Cases:**
- System administrators
- Team leads with full control
- CTO/Engineering managers

---

### 2. **Manager** 🔵
**Project and team management**

**Permissions:**
- ✅ Create projects
- ✅ Edit and delete **own** projects
- ✅ Edit **any** project (if needed)
- ✅ Create issues
- ✅ **Assign issues** to team members
- ✅ Edit **any** issue
- ✅ Close **any** issue
- ✅ Change issue priority
- ✅ Delete issues in **own** projects or **own** reported issues
- ✅ Create comments
- ✅ Edit and delete **any** comment

**Use Cases:**
- Project managers
- Team leads
- Scrum masters
- Department heads

---

### 3. **Developer** 🟢
**Work on assigned tasks**

**Permissions:**
- ✅ Create projects
- ✅ Edit and delete **own** projects
- ✅ Create issues
- ✅ Edit **assigned** or **own reported** issues
- ✅ Close **assigned** issues
- ❌ Cannot assign issues to others
- ❌ Cannot change issue priority
- ✅ Delete **own reported** issues
- ✅ Create comments
- ✅ Edit and delete **own** comments

**Use Cases:**
- Software developers
- QA testers
- Individual contributors
- Contractors

---

### 4. **Viewer** ⚪
**Read-only access**

**Permissions:**
- ✅ View all projects
- ✅ View all issues
- ✅ View all comments
- ❌ **Cannot create** anything
- ❌ **Cannot edit** anything
- ❌ **Cannot delete** anything

**Use Cases:**
- Stakeholders
- Clients
- Auditors
- Read-only observers

---

## 📊 Permission Matrix

| Action | Admin | Manager | Developer | Viewer |
|--------|:-----:|:-------:|:---------:|:------:|
| **PROJECTS** |
| Create Project | ✅ | ✅ | ✅ | ❌ |
| Edit Own Project | ✅ | ✅ | ✅ | ❌ |
| Edit Any Project | ✅ | ✅ | ❌ | ❌ |
| Delete Own Project | ✅ | ✅ | ✅ | ❌ |
| Delete Any Project | ✅ | ❌ | ❌ | ❌ |
| **ISSUES** |
| Create Issue | ✅ | ✅ | ✅ | ❌ |
| Edit Any Issue | ✅ | ✅ | ❌ | ❌ |
| Edit Assigned Issue | ✅ | ✅ | ✅ | ❌ |
| Edit Own Reported Issue | ✅ | ✅ | ✅ | ❌ |
| Assign Issue | ✅ | ✅ | ❌ | ❌ |
| Change Priority | ✅ | ✅ | ❌ | ❌ |
| Close Any Issue | ✅ | ✅ | ❌ | ❌ |
| Close Assigned Issue | ✅ | ✅ | ✅ | ❌ |
| Delete Any Issue | ✅ | ❌ | ❌ | ❌ |
| Delete Own Issue | ✅ | ✅ | ✅ | ❌ |
| **COMMENTS** |
| Create Comment | ✅ | ✅ | ✅ | ❌ |
| Edit Own Comment | ✅ | ✅ | ✅ | ❌ |
| Edit Any Comment | ✅ | ✅ | ❌ | ❌ |
| Delete Own Comment | ✅ | ✅ | ✅ | ❌ |
| Delete Any Comment | ✅ | ✅ | ❌ | ❌ |
| **ADMIN** |
| Manage User Roles | ✅ | ❌ | ❌ | ❌ |
| Access Admin Panel | ✅ | ❌ | ❌ | ❌ |

---

## 🚀 How to Use

### For Admins

1. **Access Admin Panel:**
   - Sign in with an admin account
   - Click "Admin Panel" in the navigation bar
   - URL: `http://localhost:3001/admin`

2. **Manage User Roles:**
   - View all users in the system
   - Use the dropdown to change any user's role
   - Changes take effect immediately
   - Users will see updated permissions on next action

3. **Role Assignment Guidelines:**
   - **Admin**: Only assign to trusted team leads
   - **Manager**: Assign to project managers and team leads
   - **Developer**: Default role for engineers
   - **Viewer**: Use for stakeholders and read-only users

### For Managers

1. **Creating Issues:**
   - Go to Projects → Select Project → New Issue
   - Fill in details
   - **Assign to a developer** using the Assignee dropdown
   - Manager can assign to anyone

2. **Managing Team Workload:**
   - Go to Issues page
   - Filter by Assignee to see who's working on what
   - Reassign issues as needed
   - Close issues when completed

3. **Tracking Progress:**
   - Use "My Issues" to see issues you reported
   - Use filters to track team progress
   - Check dashboard for statistics

### For Developers

1. **Viewing Assigned Issues:**
   - Go to "My Issues" in navigation
   - See all issues assigned to you
   - Grouped by status (Open, In Progress, etc.)

2. **Working on Issues:**
   - Click on assigned issue
   - Update status (Open → In Progress → Resolved)
   - Add comments to communicate progress
   - Close when complete

3. **Creating Issues:**
   - Can create issues but **cannot assign** to others
   - Leave assignee empty or ask manager to assign

### For Viewers

- Can browse and view all content
- Cannot make any changes
- Perfect for stakeholders who need visibility

---

## 🔧 Technical Implementation

### Database Schema

```sql
-- Added to users table
ALTER TABLE users
ADD COLUMN role user_role NOT NULL DEFAULT 'developer';

-- Enum definition
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'developer', 'viewer');
```

### Permission Helper Functions

Located in: `src/lib/permissions.ts`

```typescript
// Check permissions
if (!IssuePermissions.canEdit(user.role, userId, issue)) {
  throw new ForbiddenError('No permission');
}

// Role hierarchy
hasMinimumRole(UserRole.MANAGER, UserRole.DEVELOPER) // true
```

### Service Layer Integration

All services (IssueService, ProjectService, CommentService) now check permissions before allowing operations:

```typescript
// Example from IssueService
async update(id: string, data: UpdateIssueDTO, userId: string) {
  const user = await userRepository.findById(userId);

  // Permission check
  if (!IssuePermissions.canEdit(user.role, userId, issue)) {
    throw new ForbiddenError('No permission to edit');
  }

  // Proceed with update...
}
```

---

## 🎨 UI Integration

### Navigation

- **Admin Panel link** shown only to admins (red color)
- **Role badge** displayed next to user name
- Role is fetched from session

### Form Validation

- Forms disable fields based on permissions
- Example: Assignee dropdown only shown to Manager/Admin
- Submit buttons disabled if no permission

### Error Handling

When user tries unauthorized action:
```
Error: You do not have permission to [action]
HTTP Status: 403 Forbidden
```

---

## 🔐 Security Features

1. **Server-Side Validation**
   - All permissions checked on backend
   - Frontend hiding is for UX only
   - Cannot bypass by modifying UI

2. **Session-Based Roles**
   - Role stored in JWT token
   - Refreshed on each request
   - Changes take effect immediately

3. **Audit Trail**
   - All actions logged with user ID
   - Can track who did what
   - Database timestamps on everything

---

## 📈 Typical Workflow

### Scenario: Manager Creates and Assigns Issue

1. **Manager** logs in (sees "Admin Panel" if also admin)
2. Goes to Project → Backend API
3. Clicks "New Issue"
4. Fills form:
   - Title: "Fix login bug"
   - Priority: High
   - **Assignee: Jane (Developer)** ← Manager can assign
5. Submits → Issue created
6. **Slack notification** sent to Jane

### Scenario: Developer Works on Issue

1. **Developer (Jane)** logs in
2. Sees role badge: "Developer" next to name
3. Goes to "My Issues" → Sees "Fix login bug"
4. Clicks issue → Can edit because it's assigned to her
5. Changes status: Open → In Progress
6. Adds comment: "Working on this"
7. Later changes status: In Progress → Resolved
8. **Manager** reviews and closes

### Scenario: Developer Tries to Assign (Permission Denied)

1. Developer creates an issue
2. Tries to set Assignee field
3. **Field is disabled** (grayed out)
4. Or if tries via API: `403 Forbidden: No permission to assign`
5. Must ask Manager to assign

---

## 🆕 Upgrade from Old System

### Before (No RBAC):
- ❌ Anyone could assign issues
- ❌ Anyone could close issues
- ❌ Anyone could delete anything
- ❌ No role hierarchy
- ❌ Trust-based system

### After (With RBAC):
- ✅ Only Manager/Admin can assign
- ✅ Only Manager/Admin can close any issue
- ✅ Proper permission checks
- ✅ Clear role hierarchy
- ✅ Enterprise-grade security

---

## 🐛 Troubleshooting

### "You do not have permission" error

**Cause:** Your role doesn't allow this action

**Solution:**
1. Check your role in navigation (next to your name)
2. Refer to permission matrix above
3. Ask admin to promote you if needed

### Can't see Admin Panel

**Cause:** You're not an admin

**Solution:**
1. Only users with Admin role can see this
2. Ask current admin to promote you
3. Check database: `SELECT role FROM users WHERE email='you@example.com'`

### Role changes not taking effect

**Cause:** Session not refreshed

**Solution:**
1. Sign out and sign in again
2. Or wait for JWT token to refresh (automatic)
3. Or clear browser cookies

---

## 📞 API Endpoints

### Update User Role (Admin Only)

```http
PUT /api/admin/users/{userId}/role

Headers:
  Cookie: next-auth.session-token=...

Body:
{
  "role": "manager"
}

Response:
{
  "success": true,
  "data": {
    "id": "user-id",
    "role": "manager",
    ...
  },
  "message": "User role updated successfully"
}
```

---

## ✅ Best Practices

1. **Principle of Least Privilege**
   - Give users minimum permissions needed
   - Start with Developer, promote as needed
   - Don't make everyone Admin

2. **Regular Audits**
   - Review user roles quarterly
   - Remove access for inactive users
   - Demote users who leave teams

3. **Role Assignment**
   - **Admin**: 1-2 people maximum
   - **Manager**: Team leads only
   - **Developer**: Most engineers
   - **Viewer**: External stakeholders

4. **Communication**
   - Tell users their role and permissions
   - Explain why they can't do certain actions
   - Provide escalation path (ask manager)

---

## 🎓 Training for Teams

### For New Users

1. Watch for role badge in navigation
2. Try actions - system will prevent unauthorized ones
3. Read permission matrix above
4. Ask manager if need higher permissions

### For Managers

1. Practice assigning issues
2. Learn to track team workload
3. Use filters effectively
4. Understand when to escalate to Admin

### For Admins

1. Access Admin Panel
2. Practice changing roles
3. Understand security implications
4. Keep admin list minimal

---

## 🚀 Future Enhancements

Possible additions:

- Custom roles beyond the 4 defaults
- Per-project permissions
- Fine-grained field-level permissions
- Activity logs in Admin Panel
- Bulk role updates
- Role templates

---

## 📝 Summary

✅ **4 Roles**: Admin, Manager, Developer, Viewer
✅ **Granular Permissions**: Per action control
✅ **Secure**: Backend enforcement
✅ **User Friendly**: Clear error messages
✅ **Enterprise Ready**: Production-grade RBAC

**Your Issue Tracker now has professional, enterprise-level access control!** 🎉
