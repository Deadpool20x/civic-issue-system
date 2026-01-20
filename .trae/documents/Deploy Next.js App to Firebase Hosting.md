## Vercel Deployment Plan

### Step 1: Clean Local Installation
- Remove `node_modules` and `package-lock.json`
- Fresh install with `npm install`

### Step 2: Fix package.json
- Remove port 3001 from dev/start scripts (Vercel handles ports)
- Remove any React Native dependencies that might cause conflicts
- Ensure all dependencies are web-compatible

### Step 3: Create .npmrc File
- Add `legacy-peer-deps=true` and `engine-strict=false`
- This resolves dependency conflicts during Vercel build

### Step 4: Update next.config.mjs
- Add Vercel-specific optimizations
- Configure ESLint to ignore during builds (temporary)
- Configure TypeScript error handling

### Step 5: Commit and Deploy
- Add all changes to git
- Commit with descriptive message
- Push to GitHub
- Deploy to Vercel using `vercel --prod`

### Environment Variables
- Vercel will need: MONGODB_URI, JWT_SECRET, RESEND_API_KEY, CLOUDINARY credentials
- These should be added in Vercel dashboard after deployment

### Expected Outcome
- Production-ready deployment at your Vercel domain
- MongoDB Atlas connection maintained
- All features working (reporting, admin dashboard, email notifications, Cloudinary uploads)