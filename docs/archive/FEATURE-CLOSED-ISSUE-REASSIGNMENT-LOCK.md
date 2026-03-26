# Feature: Disable Reassignment for Closed Issues

**Implemented:** March 26, 2026
**Status:** ✅ Complete
**Type:** Workflow Enhancement

---

## Overview

Closed issues can no longer be reassigned. This prevents accidental changes to completed work and maintains a clean issue lifecycle.

---

## Business Logic

### The Rule:
**Once an issue is closed, it cannot be reassigned.**

### Rationale:
1. **Closed = Done** - Completed work shouldn't be modified
2. **Clear Workflow** - Follows industry standards (GitHub, Jira)
3. **Prevents Mistakes** - No accidental reassignment of finished work
4. **Audit Trail** - Closed issues remain unchanged

### Edge Case Handling:
If reassignment is needed for a closed issue:
1. **Reopen** the issue first
2. **Reassign** to the new person
3. **Close** again if needed

This two-step process ensures intentional changes only.

---

## Implementation Details

### Components Updated

#### 1. InlineAssigneeChanger Component
**File:** `src/components/issues/InlineAssigneeChanger.tsx`

**Changes:**
- Added `issueStatus` prop
- Updated `canEdit` logic: `&& issueStatus !== 'closed'`
- Added visual feedback for closed issues

**UI States:**

**For Managers/Admins:**
```
Open/In Progress/Resolved Issues:
┌──────────────────────────────┐
│ 👤 John Doe                  │
│    Click to reassign         │  ← Clickable
└──────────────────────────────┘

Closed Issues:
┌──────────────────────────────┐
│ 👤 John Doe                  │
│    🔒 Issue is closed -      │  ← Read-only
│       cannot reassign        │
└──────────────────────────────┘
```

**For Developers:**
```
┌──────────────────────────────┐
│ 👤 John Doe                  │
│    Only managers can         │  ← Always read-only
│    reassign                  │
└──────────────────────────────┘
```

#### 2. ReassignIssueButton Component
**File:** `src/components/issues/ReassignIssueButton.tsx`

**Changes:**
- Added `issueStatus` prop
- Button hidden completely if `issueStatus === 'closed'`
- Early return to prevent modal from opening

**UI Behavior:**
```
Open/In Progress/Resolved:
┌─────────────────────┐
│  📝 Reassign Issue  │  ← Button visible
└─────────────────────┘

Closed:
(Button not rendered at all)
```

#### 3. Issue Detail Page
**File:** `src/app/issues/[id]/page.tsx`

**Changes:**
- Pass `issueStatus={issue.status}` to both components
- Both InlineAssigneeChanger and ReassignIssueButton receive status

---

## Permission Matrix

| User Role | Issue Status | Can Reassign? | UI Display |
|-----------|--------------|---------------|------------|
| **Admin** | Open | ✅ Yes | Clickable + Button |
| **Admin** | In Progress | ✅ Yes | Clickable + Button |
| **Admin** | Resolved | ✅ Yes | Clickable + Button |
| **Admin** | Closed | ❌ No | Read-only + 🔒 message |
| **Manager** | Open | ✅ Yes | Clickable + Button |
| **Manager** | In Progress | ✅ Yes | Clickable + Button |
| **Manager** | Resolved | ✅ Yes | Clickable + Button |
| **Manager** | Closed | ❌ No | Read-only + 🔒 message |
| **Developer** | Any | ❌ No | Read-only (no change) |
| **Viewer** | Any | ❌ No | Read-only (no change) |

---

## User Experience

### Scenario 1: Manager Viewing Open Issue
```
Status: Open
Result: Can click assignee name → Dropdown appears → Can reassign
```

### Scenario 2: Manager Viewing Closed Issue
```
Status: Closed
Result: Assignee name not clickable → Shows "🔒 Issue is closed - cannot reassign"
Button: "Reassign Issue" button hidden
```

### Scenario 3: Developer Viewing Any Issue
```
Status: Any
Result: Always read-only → Shows "Only managers can reassign"
(No change from previous behavior)
```

### Scenario 4: Need to Reassign Closed Issue
```
1. Manager clicks "Reopen Issue" button
2. Status changes to "In Progress" or "Open"
3. Manager can now reassign
4. After reassignment, can close again if needed
```

---

## Code Examples

### Before (Old Behavior):
```typescript
// Could reassign ANY issue regardless of status
const canEdit = userRole === 'admin' || userRole === 'manager';
```

### After (New Behavior):
```typescript
// Cannot reassign closed issues
const canEdit = (userRole === 'admin' || userRole === 'manager')
  && issueStatus !== 'closed';
```

---

## Testing Checklist

### Manual Testing:

- [x] **As Manager on Open Issue:**
  - Click assignee name → Dropdown appears ✅
  - Reassign button visible ✅

- [x] **As Manager on Closed Issue:**
  - Assignee name not clickable ✅
  - Shows "🔒 Issue is closed" message ✅
  - Reassign button hidden ✅

- [x] **As Developer on Any Issue:**
  - Always read-only ✅
  - Shows "Only managers can reassign" ✅

- [x] **Reopen Workflow:**
  - Close issue → Cannot reassign ✅
  - Reopen issue → Can reassign ✅
  - Reassign → Can close again ✅

### Edge Cases Tested:

- [x] Issue with NULL assignee (should still be read-only if closed)
- [x] Multiple rapid clicks on closed issue (should not open dropdown)
- [x] Browser back/forward navigation (status persists correctly)
- [x] Page refresh (lock status maintained)

---

## Database Impact

**None** - This is a UI-level restriction only.

- No database schema changes
- No new queries needed
- Issue status already exists in database
- Performance impact: negligible (one extra prop check)

---

## API Impact

**None** - Backend API already validates permissions.

The backend `IssueService.update()` method already checks:
- User has permission to reassign
- Issue exists
- Assignee user exists

This feature adds a frontend UX layer that prevents the API call from being made for closed issues, providing immediate feedback.

---

## Configuration

No configuration needed. Behavior is hardcoded:
- `issueStatus === 'closed'` → Cannot reassign
- All other statuses → Can reassign (if manager/admin)

To change this behavior in the future:
1. Edit `InlineAssigneeChanger.tsx` line ~41
2. Edit `ReassignIssueButton.tsx` line ~35
3. Update the status check condition

---

## Future Enhancements (Optional)

### Possible Extensions:

1. **Also lock "Resolved" issues** (Option 2 from discussion)
   ```typescript
   && issueStatus !== 'closed' && issueStatus !== 'resolved'
   ```

2. **Admin override** - Allow admins to reassign closed issues
   ```typescript
   && (issueStatus !== 'closed' || userRole === 'admin')
   ```

3. **Confirmation dialog** - Warn when reassigning resolved issues
   ```typescript
   if (issueStatus === 'resolved') {
     confirm("This issue is resolved. Reassign anyway?");
   }
   ```

4. **Audit log reason** - Require reason if reopening to reassign
   ```typescript
   const reason = prompt("Why are you reopening this issue?");
   ```

---

## Comparison with Industry Standards

| Platform | Closed Issue Reassignment |
|----------|---------------------------|
| **GitHub** | ❌ Cannot reassign closed issues |
| **Jira** | ❌ Cannot reassign closed issues (must reopen) |
| **Linear** | ❌ Cannot reassign closed issues |
| **GitLab** | ❌ Cannot reassign closed issues |
| **TaskForge** | ❌ Cannot reassign closed issues ✅ |

---

## Documentation Updates

### User Guide Addition:
```markdown
### Reassigning Issues

#### Who Can Reassign:
- Managers and Admins only
- Developers cannot reassign issues

#### Status Restrictions:
- **Open** - Can reassign ✅
- **In Progress** - Can reassign ✅
- **Resolved** - Can reassign ✅
- **Closed** - Cannot reassign ❌

#### To Reassign a Closed Issue:
1. Click "Reopen Issue"
2. Reassign to new person
3. Close again if needed
```

---

## Rollback Plan

If this feature needs to be reverted:

1. **Remove prop from components:**
   ```typescript
   // Remove issueStatus prop from interfaces
   // Remove issueStatus from canEdit logic
   ```

2. **Revert to old logic:**
   ```typescript
   const canEdit = userRole === 'admin' || userRole === 'manager';
   ```

3. **Remove status prop from page:**
   ```typescript
   // Remove issueStatus={issue.status} from both components
   ```

**Estimated rollback time:** 5 minutes

---

## Success Metrics

### Expected Outcomes:
- ✅ Fewer accidental reassignments of completed work
- ✅ Clearer workflow understanding for users
- ✅ Reduced support tickets about "why can't I reassign"
- ✅ Better alignment with industry standards

### Monitoring:
- Track frequency of reopen-then-reassign workflow
- Monitor user feedback about the restriction
- Check for workaround attempts

---

## Status

✅ **Implementation Complete**
✅ **Testing Complete**
✅ **Ready for Production**

**Last Updated:** March 26, 2026

---

## Related Features

- Auto-assignment to issue creator
- Inline reassignment component
- Manager analytics dashboard
- Activity logging for assignments

---

**Summary:** Closed issues are now locked for reassignment, providing a cleaner workflow and preventing accidental changes to completed work. Users can still reassign by reopening the issue first.
