# Complete Debug Guide - All Dashboard Issues

## Issues Reported

1. ❌ Cannot see response editor/management features
2. ❌ Admin dashboard (users list) is glitchy and buggy
3. ❌ Create user page has errors

## Step-by-Step Debugging

### Issue 1: Response Editor Not Showing

**Test as Department Manager:**

1. **Login**:
   - Email: `manager1@civicpulse.in`
   - Password: `password123`

2. **Open Browser Console** (F12)

3. **Go to any issue detail page**

4. **Look for these debug messages**:
   ```
   [IssueResponseEditor] Checking permissions...
   [IssueResponseEditor] currentUser: {...}
   [IssueResponseEditor] currentUser.role: DEPARTMENT_MANAGER
   ```

5. **What to check**:
   - Is `currentUser` null or undefined?
   - What is the exact role value?
   - Does it say "returning true" or "returning false"?

6. **Share with me**:
   - Screenshot of console messages
   - What you see on the page
   - Any red errors

### Issue 2: Admin Users List Glitchy

**Test as System Admin:**

1. **Login**:
   - Email: `admin@civicpulse.in`
   - Password: `password123`

2. **Go to** `/admin/users`

3. **Open Browser Console** (F12)

4. **Check for**:
   - Red error messages
   - Failed API calls in Network tab
   - What exactly is "glitchy"? (slow loading, wrong data, crashes?)

5. **Share with me**:
   - Screenshot of the page
   - Console errors
   - Network tab showing failed requests

### Issue 3: Create User Errors

**Test as System Admin:**

1. **Go to** `/admin/create-user`

2. **Fill the form**:
   - Role: Field Officer
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
   - Ward: Select any ward

3. **Click "Create Account"**

4. **Check**:
   - Does it show success or error?
   - What error message?
   - Check console for errors
   - Check Network tab for API response

5. **Share with me**:
   - Error message shown
   - Console errors
   - API response from Network tab

## Quick Diagnostic Commands

### Check User Authentication
Run in browser console:
```javascript
fetch('/api/auth/me')
  .then(r => r.json())
  .then(data => {
    console.log('=== USER DATA ===');
    console.log('Role:', data.role);
    console.log('Department ID:', data.departmentId);
    console.log('Ward ID:', data.wardId);
    console.log('Full data:', data);
  });
```

### Check Issue Data
Run in browser console (replace ID):
```javascript
const issueId = 'PASTE_ISSUE_ID_HERE';
fetch(`/api/issues/${issueId}`)
  .then(r => r.json())
  .then(data => {
    console.log('=== ISSUE DATA ===');
    console.log('Issue:', data.issue);
    console.log('State History:', data.stateHistory);
  });
```

### Check Users API
Run in browser console:
```javascript
fetch('/api/admin/users')
  .then(r => r.json())
  .then(data => {
    console.log('=== USERS DATA ===');
    console.log('Count:', data.users?.length || data.length);
    console.log('First user:', data.users?.[0] || data[0]);
  });
```

## Common Issues and Solutions

### Issue: "Cannot see response editor"

**Possible Causes:**
1. User role not matching (check console debug messages)
2. currentUser is null (auth issue)
3. Component not rendering (React error)

**Solutions:**
1. Check browser console for debug messages
2. Verify user role with `/api/auth/me`
3. Check for React errors in console

### Issue: "Admin dashboard glitchy"

**Possible Causes:**
1. API returning wrong data format
2. Missing data causing undefined errors
3. Slow API responses
4. Build cache corruption

**Solutions:**
1. Check Network tab for slow/failed requests
2. Check console for JavaScript errors
3. Clear `.next` folder and restart
4. Check API responses match expected format

### Issue: "Create user fails"

**Possible Causes:**
1. API endpoint not found (404)
2. Validation errors (400)
3. Duplicate email (400)
4. Server error (500)

**Solutions:**
1. Check Network tab for API response
2. Read error message carefully
3. Verify all required fields filled
4. Check server terminal for errors

## Files to Check

### For Response Editor Issue:
- `components/IssueResponseEditor.jsx` - Has debug logging
- `components/IssueManagementPanel.jsx` - Has debug logging
- `app/issues/[id]/page.js` - Renders the components
- `/api/auth/me` - Returns user data

### For Admin Dashboard Issue:
- `app/admin/users/page.js` - Users list page
- `app/api/admin/users/route.js` - Users API
- `app/api/admin/users/stats/route.js` - Stats API

### For Create User Issue:
- `app/admin/create-user/page.js` - Create form
- `app/api/users/create/route.js` - Create API (just fixed)

## What I Need From You

To help fix the issues, please provide:

1. **For Response Editor**:
   - Console debug messages (screenshot)
   - User role from `/api/auth/me`
   - What you see vs what you expect

2. **For Admin Dashboard**:
   - What exactly is "glitchy"? (describe the behavior)
   - Console errors (screenshot)
   - Network tab showing API calls
   - Does data load at all?

3. **For Create User**:
   - Error message shown
   - Console errors
   - Network tab API response
   - Server terminal output

## Expected Behavior

### Response Editor (Department Manager)
Should see:
- 📝 Response Management panel
- 3 buttons: Edit Response, Reject Response, Approve Resolution
- Blue info box explaining options

### Admin Users List
Should see:
- 6 stat cards at top
- Filter buttons
- Table with all users
- Edit, Reset Password, Activate/Deactivate buttons

### Create User
Should see:
- Form with all fields
- Role-specific fields (ward for officer, dept for manager)
- Success message after creation
- Redirect to users list

## Next Steps

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Restart dev server** if needed
3. **Login with correct role**
4. **Open browser console** (F12)
5. **Test each feature**
6. **Share debug output with me**

The debug messages will tell us exactly what's wrong!
