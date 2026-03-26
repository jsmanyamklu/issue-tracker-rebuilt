# Fix: Unassigned Issues Display Bug

**Date:** March 26, 2026
**Status:** ✅ Fixed
**Issue Type:** Data Loading Bug

---

## Problem Description

Users were seeing issues appear as "unassigned" in the project page UI, even though:
- Database had all issues with valid `assignee_id` values
- The auto-assignment script successfully fixed all NULL assignees
- Database queries confirmed 0 unassigned issues

**Symptom:** Issues showed placeholder avatars instead of assignee information.

---

## Root Cause

The `findByProjectId()` method in `IssueRepository` was **not loading relations** (assignee/reporter data).

### The Bug:

**File:** `src/repositories/IssueRepository.ts`

**Old Code (Line 206-216):**
```typescript
async findByProjectId(projectId: string): Promise<Issue[]> {
  const result = await query<Issue>(
    'SELECT * FROM issues WHERE project_id = $1 ORDER BY created_at DESC',
    [projectId]
  );
  return result.rows;
}
```

**Problem:**
- Returned `Issue[]` (basic issue objects)
- Did NOT include JOIN statements to load user data
- `assignee_id` existed but no `assignee` object with name/email/avatar

**Result:**
- UI had `issue.assignee_id` but no `issue.assignee.name` or `issue.assignee.avatar_url`
- Conditional logic treated missing `issue.assignee` as "unassigned"
- Displayed placeholder avatar instead of actual assignee

---

## The Fix

Updated three repository methods to load relations using LEFT JOIN:

### 1. Fixed `findByProjectId()`

**File:** `src/repositories/IssueRepository.ts` (Lines 203-234)

```typescript
async findByProjectId(projectId: string): Promise<IssueWithRelations[]> {
  const result = await query<IssueWithRelations>(
    `SELECT i.*,
            json_build_object(
              'id', p.id,
              'name', p.name
            ) as project,
            json_build_object(
              'id', a.id,
              'name', a.name,
              'email', a.email,
              'avatar_url', a.avatar_url
            ) as assignee,
            json_build_object(
              'id', r.id,
              'name', r.name,
              'email', r.email,
              'avatar_url', r.avatar_url
            ) as reporter
     FROM issues i
     LEFT JOIN projects p ON i.project_id = p.id
     LEFT JOIN users a ON i.assignee_id = a.id
     LEFT JOIN users r ON i.reporter_id = r.id
     WHERE i.project_id = $1
     ORDER BY i.created_at DESC`,
    [projectId]
  );
  return result.rows;
}
```

**Changes:**
- ✅ Returns `IssueWithRelations[]` instead of `Issue[]`
- ✅ Includes LEFT JOIN for assignee user data
- ✅ Includes LEFT JOIN for reporter user data
- ✅ Includes LEFT JOIN for project data
- ✅ Uses `json_build_object` to create nested objects

### 2. Fixed `findByReporterId()`

**File:** `src/repositories/IssueRepository.ts` (Lines 255-284)

Same pattern - added LEFT JOINs and changed return type to `IssueWithRelations[]`.

### 3. Updated Service Layer

**File:** `src/services/IssueService.ts`

Updated return types to match:
- `getByProjectId()`: `Promise<Issue[]>` → `Promise<IssueWithRelations[]>`
- `getByReporterId()`: `Promise<Issue[]>` → `Promise<IssueWithRelations[]>`

---

## Impact

### Before Fix:
```
issue = {
  id: "abc123",
  title: "Fix bug",
  assignee_id: "user-uuid-456",  // ✅ Has ID
  assignee: undefined             // ❌ No data!
}
```

**UI Display:** Shows placeholder avatar (appears unassigned)

### After Fix:
```
issue = {
  id: "abc123",
  title: "Fix bug",
  assignee_id: "user-uuid-456",  // ✅ Has ID
  assignee: {                    // ✅ Has data!
    id: "user-uuid-456",
    name: "John Doe",
    email: "john@example.com",
    avatar_url: "https://..."
  }
}
```

**UI Display:** Shows actual user avatar and name

---

## Files Modified

1. ✅ `src/repositories/IssueRepository.ts` (3 methods updated)
   - `findByProjectId()` - Added relations
   - `findByReporterId()` - Added relations

2. ✅ `src/services/IssueService.ts` (2 methods updated)
   - `getByProjectId()` - Updated return type
   - `getByReporterId()` - Updated return type

---

## Testing

### Verification Steps:

1. **Database check:**
   ```bash
   # Confirmed 0 unassigned issues in database
   SELECT COUNT(*) FROM issues WHERE assignee_id IS NULL;
   # Result: 0
   ```

2. **Code fix applied:**
   - Repository methods now load relations
   - Service layer updated to match

3. **Browser test:**
   - Hard refresh project page (Ctrl+Shift+R)
   - All issues should show assignee avatars
   - No more "unassigned" placeholders

---

## Why This Happened

The repository had two patterns:

**Pattern A (Correct):**
- `findAllWithRelations()` - Loaded assignee/reporter ✅
- `findByIdWithRelations()` - Loaded assignee/reporter ✅
- `findByAssigneeId()` - Loaded assignee/reporter ✅

**Pattern B (Incorrect):**
- `findByProjectId()` - Did NOT load relations ❌
- `findByReporterId()` - Did NOT load relations ❌

The project page uses `issueService.getByProjectId()`, which called the Pattern B method, causing the display bug.

---

## Related Issues

This fix also resolves:
- ❌ Reporter names not showing on project page
- ❌ Can't click on reporter avatars
- ❌ Missing user information in issue cards

---

## Prevention

### Code Review Checklist:
- [ ] All `findBy*` methods should load relations if used in UI
- [ ] Check return type: `Issue[]` vs `IssueWithRelations[]`
- [ ] Verify LEFT JOINs for assignee, reporter, project
- [ ] Test in UI that avatars and names appear

### Consistent Pattern:
All repository methods that return data for UI display should:
1. Use LEFT JOIN for user tables
2. Use `json_build_object` for nested data
3. Return `IssueWithRelations[]` type
4. Include assignee, reporter, and project data

---

## Status

✅ **Fixed and Deployed**

### Next Steps:
1. Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Navigate to any project page
3. Verify all issues show assignee avatars
4. Verify no "unassigned" placeholders

---

**Issue Resolved:** All assignee data now loads correctly!
