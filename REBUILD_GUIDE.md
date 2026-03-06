# CIVIC ISSUE SYSTEM - QUICK REBUILD GUIDE

## Overview
This is a comprehensive civic issue management platform built with Next.js 14, MongoDB, and various integrations. Citizens report issues, departments resolve them, and the system tracks everything with AI-powered analysis.

## Core Technologies
- **Frontend:** Next.js 14 (App Router), React 18, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** MongoDB with Mongoose
- **Auth:** JWT with HTTP-only cookies, bcrypt password hashing
- **File Storage:** Cloudinary
- **Email:** Resend
- **AI:** OpenAI GPT-3.5-turbo
- **Maps:** Leaflet + React Leaflet

## User Roles
1. **Citizen** - Report and track issues
2. **Department** - Manage assigned issues
3. **Municipal** - Oversee all departments
4. **Admin** - Full system access

## Key Features
- Issue reporting with photos and location
- AI-powered categorization and priority
- Auto-assignment to departments
- SLA tracking and escalation
- Performance metrics and analytics
- Email notifications
- Interactive map view
- Rating and feedback system

## Environment Variables Required
```env
MONGODB_URI=mongodb://localhost:27017/civic-issues
JWT_SECRET=[64+ char random string]
CLOUDINARY_CLOUD_NAME=[your-cloud-name]
CLOUDINARY_API_KEY=[your-api-key]
CLOUDINARY_API_SECRET=[your-api-secret]
OPENAI_API_KEY=[your-openai-key]
RESEND_API_KEY=[your-resend-key]
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Quick Start
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev

# Access at http://localhost:3000
```

## Database Models (7 Collections)

### 1. User
- Authentication and profile
- Roles: citizen, department, municipal, admin
- Password hashed with bcrypt
- Department reference for staff

### 2. Issue
- Core issue data
- Location with GeoJSON coordinates
- Status workflow tracking
- SLA and escalation system
- Upvotes and comments
- AI analysis results
- Performance metrics

### 3. Department
- Department information
- Staff assignments
- Category mappings
- Contact details

### 4. StateHistory
- Audit trail of status changes
- Tracks who changed what and when

### 5. Notification
- In-app notifications
- Linked to issues

### 6. StaffPerformance
- Individual staff metrics
- Badges and rewards
- Monthly statistics

### 7. DepartmentPerformance
- Department-level metrics
- SLA compliance
- Ward-wise breakdown

## API Endpoints Summary

### Authentication
- POST /api/auth/register - Register citizen
- POST /api/auth/login - Login
- POST /api/auth/logout - Logout
- GET /api/auth/me - Get current user

### Issues
- POST /api/issues - Create issue
- GET /api/issues - List issues (filtered by role)
- GET /api/issues/[id] - Get single issue
- PATCH /api/issues/[id]/update-status - Update status
- POST /api/issues/[id]/upvote - Upvote/remove upvote
- POST /api/issues/[id]/rate - Rate resolved issue
- GET /api/issues/department - Department issues
- GET /api/issues/admin - All issues (admin)

### Departments
- GET /api/departments - List departments
- POST /api/departments - Create (admin)
- PATCH /api/departments/[id] - Update (admin)
- DELETE /api/departments/[id] - Delete (admin)

### Users
- GET /api/users/admin - List users (admin)
- POST /api/admin/create-user - Create staff (admin)
- PATCH /api/users/[id] - Update user
- DELETE /api/users/[id] - Delete user (admin)

### Analytics
- GET /api/admin/analytics/overview - System overview
- GET /api/admin/analytics/departments - Department comparison
- GET /api/admin/analytics/workflow - Workflow analysis
- GET /api/admin/analytics/stuck - Stuck issues
- GET /api/admin/analytics/trends - Historical trends

### Utilities
- POST /api/upload - Upload image
- GET /api/notifications - Get notifications
- GET /api/stats - Public statistics
- POST /api/ai - AI analysis

## Key Workflows

### Issue Reporting
1. Citizen fills form (title, description, category, location, images)
2. Images compressed and uploaded to Cloudinary
3. POST to /api/issues
4. AI analyzes and suggests category/priority
5. Auto-assigned to department based on category
6. SLA deadline calculated
7. Email sent to department
8. Confirmation email to citizen

### Status Update
1. Department staff updates status
2. PATCH to /api/issues/[id]/update-status
3. StateHistory entry created
4. Performance metrics updated
5. Email sent to citizen
6. If resolved: rating request sent

### Escalation
1. Cron job checks overdue issues
2. Calls issue.escalate()
3. Increments escalation level (1→2→3)
4. Adds penalty points
5. Notifies escalation target
6. Updates status to 'escalated'

## Component Structure

### Layouts
- DashboardLayout - Reusable dashboard wrapper
- DashboardProtection - Role-based route protection

### Issue Components
- IssueCard - Issue display card
- IssueMap - Interactive Leaflet map
- StatusTimeline - Status change timeline
- PriorityBadge - Priority indicator

### Form Components
- LocationPicker - Map-based location selector
- ImageUploader - Multi-image upload with compression

### Modals
- RatingModal - Rate resolved issues
- DuplicateModal - Show similar issues

## Critical Implementation Details

### Password Security
- Hashed with bcrypt (10 salt rounds)
- Pre-save hook in User model
- Never returned in API responses (select: false)

### JWT Tokens
- Stored in HTTP-only cookies
- 7-day expiration
- Contains: userId, email, role, department

### Role-Based Access
- Middleware checks role before allowing access
- Frontend: DashboardProtection component
- Backend: authMiddleware + roleMiddleware

### Priority Calculation
- Category weight (0-25 points)
- Subcategory boost (+20 for urgent)
- Keyword detection (+10 per keyword)
- Upvote escalation (+10/+20/+30)
- Score → Priority mapping

### Department Assignment
- Based on category mapping
- Defined in lib/department-mapper.js
- Fallback to 'General Administration'

### SLA Deadlines
- Urgent: 24 hours
- High: 48 hours
- Medium: 72 hours
- Low: 120 hours

## Deployment Steps

### Vercel (Recommended)
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Firebase Hosting
1. `firebase init hosting`
2. `npm run build`
3. `firebase deploy`

## Testing Checklist
- [ ] Register as citizen
- [ ] Report issue with images
- [ ] View on map
- [ ] Upvote issue
- [ ] Login as department
- [ ] Update status
- [ ] Login as municipal
- [ ] View analytics
- [ ] Login as admin
- [ ] Create staff user
- [ ] Generate reports

## Common Issues & Solutions

**Database connection fails:**
- Check MONGODB_URI in .env.local
- Ensure MongoDB is running
- Check network connectivity

**JWT errors:**
- Verify JWT_SECRET is set
- Check token expiration
- Clear cookies and re-login

**Image upload fails:**
- Verify Cloudinary credentials
- Check file size (max 5MB)
- Ensure file is image type

**AI analysis fails:**
- Check OPENAI_API_KEY
- Falls back to keyword-based analysis
- Check API quota

## Performance Optimizations
- Database indexes on frequently queried fields
- Image compression before upload
- Pagination for large lists
- Lean queries for read-only operations
- Connection pooling for MongoDB

## Security Best Practices
- Input validation with Zod
- XSS prevention through sanitization
- CSRF protection with SameSite cookies
- Rate limiting on API endpoints
- Generic error messages (no info leakage)

## File Structure Highlights
```
app/
├── (auth)/          # Login, Register
├── citizen/         # Citizen dashboard
├── department/      # Department dashboard
├── municipal/       # Municipal dashboard
├── admin/           # Admin dashboard
├── api/             # All API routes
└── page.js          # Landing page

components/          # Reusable components
lib/                 # Utilities and helpers
models/              # Mongoose models
scripts/             # Database scripts
```

## Next Steps After Setup
1. Seed departments: `node scripts/seed-departments.js`
2. Create admin: `node scripts/create-test-admin.js`
3. Verify database: `node scripts/verify-database.js`
4. Test all roles: `node scripts/test-all-roles.js`

## Support & Documentation
- Full blueprint: PROJECT_BLUEPRINT.md (2551 lines)
- README.md for detailed setup
- Inline code comments
- API documentation in blueprint

---

**Built with ❤️ for better civic engagement**
