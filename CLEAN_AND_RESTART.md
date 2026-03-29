# Clean and Restart Instructions

## The Problem
Your Next.js build cache (`.next` folder) is corrupted. This causes:
- 404 errors for static files
- Module not found errors
- Favicon errors
- General glitchy behavior

## Solution: Clean Build Cache

### Step 1: Stop the Development Server
Press `Ctrl+C` in your terminal to stop the server

### Step 2: Delete Build Cache
Run these commands in PowerShell:

```powershell
# Delete .next folder
Remove-Item -Recurse -Force .next

# Delete node_modules cache
Remove-Item -Recurse -Force node_modules/.cache

# Optional: Clear npm cache
npm cache clean --force
```

### Step 3: Restart Development Server
```bash
npm run dev
```

## Quick One-Liner (PowerShell)
```powershell
Remove-Item -Recurse -Force .next, node_modules/.cache -ErrorAction SilentlyContinue; npm run dev
```

## What This Does
1. Deletes the corrupted `.next` build folder
2. Deletes the node_modules cache
3. Next.js will rebuild everything fresh on next start

## After Restart

Once the server restarts successfully:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+F5)
3. **Login as Department Manager**
4. **Open browser console** (F12)
5. **Go to any issue detail page**
6. **Check for debug messages**

## Expected Result

After cleaning and restarting, you should see:
- ✅ No more 404 errors
- ✅ No more module not found errors
- ✅ Pages load correctly
- ✅ Debug messages in console
- ✅ Response Management panel visible for Department Managers

## If Problems Persist

If you still see issues after cleaning:

1. **Check if server started successfully**
   - Look for "Ready in X ms" message
   - No red errors in terminal

2. **Check browser console**
   - Should see debug messages from components
   - No red errors

3. **Try a full reinstall** (last resort):
   ```bash
   Remove-Item -Recurse -Force node_modules, .next
   npm install
   npm run dev
   ```

## Common Issues After Clean

### Issue: "Port already in use"
**Solution**: Kill the old process
```powershell
# Find process on port 3000
netstat -ano | findstr :3000

# Kill it (replace PID with actual number)
taskkill /PID <PID> /F
```

### Issue: "Cannot find module"
**Solution**: Reinstall dependencies
```bash
npm install
```

### Issue: Still seeing old code
**Solution**: Clear browser cache completely
- Chrome: Ctrl+Shift+Delete → Clear all
- Or use Incognito mode

## Why This Happened

The build cache can get corrupted when:
- Server crashes during build
- Files are modified while server is running
- Multiple rapid code changes
- Disk space issues
- Antivirus interfering with file operations

## Prevention

To avoid this in the future:
1. Stop server before major file changes
2. Use `npm run dev` instead of `next dev`
3. Don't modify files in `.next` folder
4. Keep enough disk space free
5. Add `.next` to antivirus exclusions

---

## TL;DR - Quick Fix

```powershell
# Stop server (Ctrl+C)
# Then run:
Remove-Item -Recurse -Force .next
npm run dev
```

That's it! The server will rebuild everything fresh.
