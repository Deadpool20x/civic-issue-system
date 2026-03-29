# Debug Instructions - Response Editor Not Showing

## Step 1: Check Browser Console

1. **Open Browser Developer Tools**
   - Press `F12` or right-click → Inspect
   - Go to "Console" tab

2. **Login as Department Manager**
   - Email: `manager1@civicpulse.in`
   - Password: `password123`

3. **Go to any issue detail page**
   - From dashboard, click on any issue
   - OR go directly to: `/issues/[any-issue-id]`

4. **Look for these debug messages in console:**
   ```
   [IssueResponseEditor] Checking permissions...
   [IssueResponseEditor] currentUser: {userId: "...", role: "...", ...}
   [IssueResponseEditor] currentUser.role: DEPARTMENT_MANAGER
   [IssueResponseEditor] User is Department Manager - returning true
   ```

   AND

   ```
   [IssueManagementPanel] Checking permissions...
   [IssueManagementPanel] currentUser: {userId: "...", role: "...", ...}
   [IssueManagementPanel] currentUser.role: DEPARTMENT_MANAGER
   [IssueManagementPanel] User is Department Manager - returning true
   ```

## Step 2: Check What You See

### If you see the debug messages but NO panels:
**Problem**: Components are checking permissions but not rendering
**Solution**: There might be a React rendering issue

### If you see "No currentUser - returning false":
**Problem**: User data not being passed to components
**Solution**: Check `/api/auth/me` endpoint

### If you see "User role not authorized - returning false":
**Problem**: Role mismatch
**Solution**: Check what role is in the JWT token

### If you see NO debug messages at all:
**Problem**: Components not being loaded
**Solution**: Check if components are imported in issue detail page

## Step 3: Check User Data

Run this in browser console:
```javascript
fetch('/api/auth/me')
  .then(r => r.json())
  .then(data => {
    console.log('User Data:', data);
    console.log('Role:', data.role);
    console.log('Department ID:', data.departmentId);
  });
```

**Expected Output for Department Manager:**
```javascript
{
  userId: "...",
  name: "Manager Name",
  email: "manager1@civicpulse.in",
  role: "DEPARTMENT_MANAGER",  // or "municipal"
  departmentId: "roads",  // or other department
  wardId: null
}
```

## Step 4: Check Department Dashboard Errors

1. **Go to Department Dashboard**
   - Should be at `/department/dashboard`

2. **Open Browser Console**
   - Look for any red error messages

3. **Check Network Tab**
   - Go to "Network" tab in Developer Tools
   - Look for failed API calls (red status codes)
   - Check these endpoints:
     - `/api/issues/ward-stats`
     - `/api/issues/stats`

4. **Common Errors:**
   - "Department not assigned" → User missing departmentId
   - "Failed to load ward stats" → API error
   - "Cannot read property of undefined" → Data structure issue

## Step 5: Share Debug Info

Please share:

1. **Console Output** (copy all debug messages)
2. **User Data** (from `/api/auth/me`)
3. **Any Error Messages** (red text in console)
4. **Network Tab** (any failed requests)
5. **Screenshots** (what you see vs what you expect)

## Quick Fix: Temporary Workaround

If you need to test immediately, you can temporarily disable the permission check:

**File**: `components/IssueResponseEditor.jsx`

Change line 156:
```javascript
// BEFORE
if (!canEditResponses()) {
    return null;
}

// AFTER (temporary - shows for everyone)
// if (!canEditResponses()) {
//     return null;
// }
```

This will show the Response Editor for ALL users (including Field Officers) temporarily, so you can test the functionality.

**Remember to revert this after testing!**

## Expected Behavior

When working correctly, Department Manager should see:

1. **Issue Detail Page** with these sections:
   - Issue details (top)
   - Status History timeline
   - Comments section
   - **Response Management panel** (3 buttons: Edit, Reject, Approve)
   - **Issue Management panel** (3 buttons: Reassign, Change Dept, Change Priority)
   - Status Updater (5 status buttons at bottom)

2. **Department Dashboard** with:
   - Department name and icon
   - Overall stats (4 cards)
   - 2 Ward cards (North + South zones)
   - Each ward showing officer name and stats

If you're not seeing these, the debug messages will tell us why!
