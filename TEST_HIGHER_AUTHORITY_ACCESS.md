# Test Guide: Higher Authority Access to Issue Management

## What You're Testing
Verify that Department Managers and Commissioners can see and use the management features that Field Officers cannot.

---

## Test 1: Department Manager Access

### Login
- Email: `manager1@civicpulse.in`
- Password: `password123`

### Steps
1. **Go to Department Dashboard**
   - Should redirect to `/department/dashboard`
   - Should see 2 ward cards (North + South)

2. **Click on any issue** from the dashboard or go to "My Issues"

3. **On Issue Detail Page, you should see:**

   ✅ **Status Updater Section** (at bottom)
   - Shows 5 status buttons (Pending, Assigned, In Progress, Resolved, Rejected)
   - Can click to change status

   ✅ **Comments Section**
   - Can view all comments
   - Can add new comments

   ✅ **Issue Management Panel** (Should be visible!)
   - Title: "🔧 Issue Management (Manager/Commissioner Only)"
   - 3 buttons:
     - 👤 Reassign Officer
     - 🏢 Change Department
     - ⚡ Change Priority
   - Blue notice: "You can only reassign issues within your department: [Department Name] (Wards X, Y)"

   ✅ **Response Editor Panel** (Should be visible!)
   - Title: "Response Management (Manager/Commissioner Only)"
   - 3 buttons:
     - ✏️ Edit Response
     - ❌ Reject Response
     - ✅ Approve Resolution

4. **Test Reassignment**
   - Click "Reassign Officer"
   - Should see modal with ward dropdown
   - Should ONLY see 2 wards (your department's wards)
   - Select a ward and officer
   - Click "Reassign Issue"
   - Should show success message

5. **Test Priority Change**
   - Click "Change Priority"
   - Should see modal with 4 priority options (Low, Medium, High, Urgent)
   - Select a priority
   - Click "Update Priority"
   - Should show success message

---

## Test 2: Commissioner Access

### Login
- Email: `commissioner@civicpulse.in`
- Password: `password123`

### Steps
1. **Go to Commissioner Dashboard**
   - Should redirect to `/commissioner/dashboard` or `/municipal/dashboard`
   - Should see ALL 16 ward cards

2. **Click on any issue** from any ward

3. **On Issue Detail Page, you should see:**

   ✅ **Status Updater Section**
   ✅ **Comments Section**
   
   ✅ **Issue Management Panel** (Full Access!)
   - Title: "🔧 Issue Management (Manager/Commissioner Only)"
   - 3 buttons visible
   - NO blue notice about department restrictions
   - Can reassign to ANY of the 16 wards

   ✅ **Response Editor Panel**
   - Can edit any response
   - Can reject any response
   - Can approve any resolution

4. **Test Full Reassignment**
   - Click "Reassign Officer"
   - Should see modal with ward dropdown
   - Should see ALL 16 wards (no restrictions)
   - Select any ward
   - Should show officers for that ward
   - Click "Reassign Issue"
   - Should show success message

5. **Test Department Change**
   - Click "Change Department"
   - Should see modal with all departments
   - Select a different department
   - Click "Change Department"
   - Should show success message
   - Issue should reset to "pending" status

---

## Test 3: Field Officer (Verify Restrictions)

### Login
- Email: `officer1@civicpulse.in`
- Password: `password123`

### Steps
1. **Go to Field Officer Dashboard**
   - Should redirect to `/field-officer/dashboard`
   - Should see single ward view

2. **Click on any issue**

3. **On Issue Detail Page, you should see:**

   ✅ **Status Updater Section** (Can update status)
   ✅ **Comments Section** (Can add comments)
   
   ❌ **Issue Management Panel** (Should NOT be visible!)
   ❌ **Response Editor Panel** (Should NOT be visible!)

4. **Verify Field Officer Can:**
   - Change status to "in-progress"
   - Change status to "resolved" (with required comment)
   - Add comments

5. **Verify Field Officer Cannot:**
   - See reassignment options
   - See priority change options
   - See response editing options
   - See department change options

---

## Expected Results Summary

| Feature | Field Officer | Department Manager | Commissioner |
|---------|--------------|-------------------|--------------|
| View Issues | ✅ Own ward only | ✅ Department (2 wards) | ✅ All wards |
| Update Status | ✅ Yes | ✅ Yes | ✅ Yes |
| Add Comments | ✅ Yes | ✅ Yes | ✅ Yes |
| Reassign Ward | ❌ No | ✅ Within department | ✅ Any ward |
| Change Department | ❌ No | ❌ No | ✅ Yes |
| Change Priority | ❌ No | ✅ Yes | ✅ Yes |
| Edit Responses | ❌ No | ✅ Yes | ✅ Yes |
| Approve/Reject | ❌ No | ✅ Yes | ✅ Yes |

---

## Troubleshooting

### If Department Manager doesn't see management panels:

1. **Check browser console** for errors
2. **Verify user role** in JWT token:
   ```javascript
   // In browser console
   fetch('/api/auth/me').then(r => r.json()).then(console.log)
   ```
   Should show: `role: "DEPARTMENT_MANAGER"` or `role: "municipal"`

3. **Check if departmentId is assigned**:
   - User must have `departmentId` in their profile
   - Run seed script if needed: `npm run seed`

### If Commissioner doesn't see all wards:

1. **Check role** - Should be `MUNICIPAL_COMMISSIONER` or `commissioner`
2. **Check ward dropdown** - Should show all 16 wards
3. **Check console** for errors

### If panels are not showing at all:

1. **Clear browser cache** and refresh
2. **Check server logs** for component errors
3. **Verify components are imported** in `app/issues/[id]/page.js`

---

## What to Report

If something doesn't work, please share:
1. Which role you're testing (Field Officer, Manager, or Commissioner)
2. What you see vs what you expect to see
3. Any error messages in browser console
4. Screenshots if possible

The system should show different features based on role hierarchy!
