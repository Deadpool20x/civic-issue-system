# Debug: Issue Not Found Problem

## Problem Description
Field Officer can see issues in the dashboard list, but when clicking on them, gets "Issue Not Found" error.

## Debug Steps

### Step 1: Check Browser Console
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Login as Field Officer
4. Go to Field Officer dashboard
5. Click on any issue
6. Look for these debug messages in console:
   ```
   [DEBUG] Issue Detail GET - params.id: [some ID]
   [DEBUG] Issue Detail GET - user role: [role]
   [DEBUG] Issue Detail GET - user wardId: [wardId]
   [DEBUG] Searched by _id: [ID] Found: true/false
   [DEBUG] Issue found - ward: [ward] status: [status]
   ```

### Step 2: Check Server Logs
1. Look at your terminal where the Next.js server is running
2. You should see the same debug messages
3. This will tell us:
   - Is the issue ID being passed correctly?
   - Is the issue found in the database?
   - Is the role check passing or failing?

### Step 3: Check Network Tab
1. In Developer Tools, go to Network tab
2. Click on an issue
3. Find the request to `/api/issues/[id]`
4. Check:
   - Request URL - does it have a valid ID?
   - Response Status - 200 (success), 404 (not found), or 403 (forbidden)?
   - Response Body - what error message?

## Possible Causes

### Cause 1: MongoDB ObjectId Format Issue
**Symptom**: Issue ID looks like `675abc123def456...` (24 hex characters)
**Problem**: The ID might not be a valid MongoDB ObjectId
**Solution**: Check if `issue._id` is being converted to string properly

### Cause 2: Role Normalization Issue
**Symptom**: Debug shows role as lowercase `field_officer` instead of `FIELD_OFFICER`
**Problem**: Role comparison failing
**Solution**: Already fixed with `.toUpperCase()`

### Cause 3: Ward ID Mismatch
**Symptom**: Debug shows different ward IDs
**Problem**: Issue ward doesn't match user's assigned ward
**Solution**: Check if user has correct wardId in JWT token

### Cause 4: Issue Not Populated
**Symptom**: Issue found but `reportedBy` is null
**Problem**: Population failed
**Solution**: Check if reportedBy field exists in database

## Quick Test

Run this in your browser console when on the dashboard:

```javascript
// Get the first issue link
const issueLink = document.querySelector('a[href^="/issues/"]');
console.log('Issue link href:', issueLink?.href);
console.log('Issue ID from link:', issueLink?.href.split('/issues/')[1]);

// Try to fetch it directly
const issueId = issueLink?.href.split('/issues/')[1];
fetch(`/api/issues/${issueId}`)
  .then(r => r.json())
  .then(data => console.log('API Response:', data))
  .catch(err => console.error('API Error:', err));
```

## Expected vs Actual

### Expected Behavior:
1. Dashboard shows issues ✅
2. Click on issue ✅
3. API receives correct ID ✅
4. Issue found in database ✅
5. Role check passes ✅
6. Issue details displayed ✅

### Actual Behavior:
1. Dashboard shows issues ✅
2. Click on issue ✅
3. API receives correct ID ❓
4. Issue found in database ❓
5. Role check passes ❓
6. "Issue Not Found" error ❌

## Next Steps

Please run the debug steps above and share:
1. What you see in browser console
2. What you see in server terminal
3. The Network tab response for the failed request

This will help me identify exactly where the problem is!

## Temporary Workaround

If you need to test other features while we debug this, you can temporarily disable the role check:

**File**: `app/api/issues/[id]/route.js`

Comment out the Field Officer check (lines 54-66):
```javascript
// Field Officers can only view issues in their assigned ward
// if (userRole === 'FIELD_OFFICER') {
//     if (!req.user.wardId) {
//         return new Response(
//             JSON.stringify({ error: 'Ward not assigned to your account' }),
//             { status: 403, headers: { 'Content-Type': 'application/json' } }
//         );
//     }
//     if (issue.ward !== req.user.wardId) {
//         return new Response(
//             JSON.stringify({ error: 'Unauthorized - This issue is not in your assigned ward' }),
//             { status: 403, headers: { 'Content-Type': 'application/json' } }
//         );
//     }
// }
```

This will let Field Officers view all issues temporarily so you can test other features.
