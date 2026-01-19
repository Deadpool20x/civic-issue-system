# Troubleshooting Guide

This guide helps you resolve common issues when running the Civic Issue System.

## Quick Diagnostics

Run the startup check script to diagnose configuration issues:
```bash
node lib/startup-check.js
```

## Common Issues and Solutions

### 1. ESLint Error: `__dirname is not defined`

**Error:**
```
ReferenceError: __dirname is not defined in ES module scope
```

**Solution:**
This has been fixed in the codebase. If you still see it:
```bash
# Pull latest changes
git pull origin main

# Or manually add to eslint.config.mjs after line 5:
const __dirname = dirname(__filename);
```

---

### 2. MongoDB Connection Failures

**Error:**
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**

#### Windows:
```powershell
# Start MongoDB
.\start-local-db.bat

# Or manually:
mongod --dbpath C:\data\db
```

#### Mac/Linux:
```bash
# Start MongoDB service
brew services start mongodb-community
# or
sudo systemctl start mongod
```

#### Using MongoDB Atlas:
Update `.env.local`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civic-issues?retryWrites=true&w=majority
```

---

### 3. Category Validation Errors

**Error:**
```
Invalid category
```

**Cause:** Category mismatch between old format (`water`, `electricity`) and new format (`water-drainage`, `roads-infrastructure`).

**Solution:**
Categories have been updated throughout the codebase. Valid categories are:
- `roads-infrastructure`
- `street-lighting`
- `waste-management`
- `water-drainage`
- `parks-public-spaces`
- `traffic-signage`
- `public-health-safety`
- `other`

If you have existing data with old categories, run:
```bash
node scripts/migrate-categories.js
```

---

### 4. Invalid Issue Status

**Error:**
```
ValidationError: status: `submitted` is not a valid enum value
```

**Solution:**
This has been fixed. Valid statuses are:
- `pending`
- `assigned`
- `in-progress`
- `resolved`
- `rejected`
- `reopened`
- `escalated`

---

### 5. JWT Secret Errors

**Error:**
```
JWT_SECRET environment variable is not defined
```

**Solution:**
```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Add to .env.local
JWT_SECRET=<generated-value>
```

---

### 6. Image Upload Failures

**Error:**
```
Cloudinary configuration error
```

**Solution:**
1. Sign up at https://cloudinary.com
2. Get your credentials from Dashboard
3. Add to `.env.local`:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

### 7. Email Sending Failures

**Error:**
```
RESEND_API_KEY not configured
```

**Solution:**
Email is optional. To enable:
1. Sign up at https://resend.com
2. Get API key
3. Add to `.env.local`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

Or disable email by not setting the variable (emails will be logged but not sent).

---

### 8. Authentication Issues

**Problem:** User can't login or sessions expire immediately

**Solutions:**

#### Check cookie settings:
- Ensure `sameSite` is set to `'lax'` not `'strict'` for better compatibility
- Set `path: '/'` for cookies

#### Clear browser cookies:
```javascript
// In browser console
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```

#### Check JWT token validity:
```bash
# In browser console
console.log(document.cookie);
```

---

### 9. Role Access Denied

**Error:**
```
Access denied - citizen role cannot access /admin/dashboard
```

**Solution:**
This is by design. Users can only access their designated dashboard:
- **Citizen** → `/citizen/dashboard`
- **Department** → `/department/dashboard`
- **Municipal** → `/municipal/dashboard`
- **Admin** → `/admin/dashboard` (can access all)

To change a user's role:
```bash
# Run MongoDB shell
mongosh civic-issues

# Update user role
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

---

### 10. Department Staff Issues

**Error:**
```
Department staff user has no department assigned
```

**Solution:**
Department staff MUST have a department field. Valid values:
- `roads-infrastructure`
- `street-lighting`
- `waste-management`
- `water-drainage`
- `parks-public-spaces`
- `traffic-signage`
- `public-health-safety`
- `other`

Fix in MongoDB:
```javascript
db.users.updateOne(
  { email: "staff@example.com" },
  { $set: { department: "water-drainage" } }
)
```

---

### 11. Build Errors

**Error:**
```
Module not found or import errors
```

**Solutions:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

### 12. Port Already in Use

**Error:**
```
Port 3001 is already in use
```

**Solutions:**

#### Windows:
```powershell
# Find process using port 3001
netstat -ano | findstr :3001

# Kill process (replace PID)
taskkill /PID <PID> /F
```

#### Mac/Linux:
```bash
# Find and kill process
lsof -ti:3001 | xargs kill -9
```

Or change port in `package.json`:
```json
"dev": "next dev -p 3002"
```

---

### 13. Missing Subcategory Error

**Error:**
```
Please select a subcategory
```

**Solution:**
Subcategory is now required for all issues. Each category has predefined subcategories defined in `lib/schemas.js`.

---

### 14. Production Deployment Issues

#### Vercel Deployment:

1. **Environment Variables:** Add all variables from `.env.local` to Vercel dashboard
2. **MongoDB Atlas:** Use Atlas URI, not localhost
3. **Build Errors:** Check build logs for specific errors

#### Common deployment errors:
```bash
# Clear Vercel cache
vercel --force

# Check environment variables
vercel env ls

# View deployment logs
vercel logs
```

---

## Development Tips

### Enable Debug Logging
Add to `.env.local`:
```env
DEBUG=true
NODE_ENV=development
```

### Check API Routes Directly
```bash
# Test auth
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Test issue creation
curl -X POST http://localhost:3001/api/issues \
  -H "Content-Type: application/json" \
  -H "Cookie: token=your-token" \
  -d '{"title":"Test Issue","description":"Test description..."}'
```

### Database Inspection
```bash
# Connect to MongoDB
mongosh civic-issues

# List all users
db.users.find().pretty()

# List all issues
db.issues.find().pretty()

# Count documents
db.users.countDocuments()
db.issues.countDocuments()
```

---

## Still Having Issues?

1. Run the startup check: `node lib/startup-check.js`
2. Check console for detailed error messages
3. Look for errors in:
   - Browser console (F12)
   - Terminal running Next.js
   - MongoDB logs
4. Review `WARP.md` for architecture details
5. Check `README.md` for setup instructions

### Get More Help

- Check GitHub Issues: [Project Issues](#)
- Review the codebase documentation in `/docs`
- Ensure all dependencies are up to date: `npm update`

---

## Prevention Checklist

Before starting development:
- [ ] `.env.local` file exists with all required variables
- [ ] MongoDB is running
- [ ] Node.js version is 18+
- [ ] All dependencies installed: `npm install`
- [ ] Startup check passes: `node lib/startup-check.js`
- [ ] Port 3001 is available
