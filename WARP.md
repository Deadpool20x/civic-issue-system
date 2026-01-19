# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development
```bash
# Start development server on port 3001 (default for this project)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Code Quality
```bash
# Run linter (ESLint with strict rules)
npm run lint

# Run tests
npm test
```

### Database Management
```bash
# Create admin user (test credentials: admin@test.com / admin)
node scripts/create-test-admin.js

# Seed departments
node scripts/seed-departments.js

# Clear users (development only)
node scripts/simple-clear-users.js

# Start local MongoDB (Windows)
.\start-local-db.bat
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context (UserContext)
- **File Upload**: Cloudinary
- **AI Integration**: OpenAI API for issue categorization
- **Validation**: Zod schemas
- **Maps**: React Leaflet (OpenStreetMap)

### Core Architecture Patterns

#### 1. Role-Based Access Control (RBAC)
The system enforces strict role-based access at multiple layers:

**User Roles**: `citizen`, `department`, `municipal`, `admin`
- **citizen**: Report and track personal issues
- **department**: Manage issues assigned to their department
- **municipal**: Manage all issues across departments
- **admin**: Full system access, user management, analytics

**Protection Layers**:
- **Frontend**: `DashboardProtection` component wraps role-specific pages
- **API Middleware**: Path-based middleware in `lib/middleware.js` and `lib/auth.js`
- **Token Validation**: JWT tokens include userId, email, role, and department

**Key Middleware Functions**:
- `authMiddleware(handler)` - Ensures user is authenticated
- `pathRoleMiddleware(allowedRoles)` - Enforces role-based route access
- `strictRoleMiddleware(allowedRoles)` - Enhanced role checking with department validation
- `createPathMiddleware(pathRules)` - Custom path-based access control

#### 2. Database Connection Pattern
MongoDB connection is cached globally to prevent connection pool exhaustion:
```javascript
// lib/mongodb.js uses global caching
// Always import: import connectDB from '@/lib/mongodb'
// Call before DB operations: await connectDB()
```

**Important**: The app boots without throwing if MONGODB_URI is missing (to allow Next.js dev server to start), but DB operations will fail with helpful error messages.

#### 3. API Route Structure
All API routes follow Next.js 14 App Router conventions:
- Located in `app/api/` with route handlers in `route.js` files
- Use `NextRequest` and `NextResponse` (not Express-style)
- Protected routes wrap handlers with middleware
- Dynamic routes use `[id]` folder naming

**Example Pattern**:
```javascript
import { pathRoleMiddleware } from '@/lib/auth';
import connectDB from '@/lib/mongodb';

export const GET = pathRoleMiddleware(['admin', 'municipal'])(async (req) => {
  await connectDB();
  // ... handler logic
});
```

#### 4. Issue Management System
Issues have a sophisticated lifecycle with SLA tracking:

**Status Flow**: `pending` → `assigned` → `in-progress` → `resolved` (or `rejected`, `reopened`, `escalated`)

**SLA System**:
- Automatic deadline calculation based on priority
- Escalation levels (1-3) with penalty points
- Pre-save hooks calculate `hoursRemaining` and `isOverdue`
- Method: `issue.escalate(reason)` handles escalation logic

**reportId Generation**:
- Auto-generated format: `R#####` (e.g., R00001, R00042)
- Pre-save hook in Issue model handles sequential numbering

**Upvoting**:
- Atomic operations: `Issue.addUpvote(issueId, userId)` and `Issue.removeUpvote(issueId, userId)`
- Prevents race conditions and duplicate upvotes

#### 5. Form Validation Pattern
All forms use Zod schemas defined in `lib/schemas.js`:
- `createIssueSchema` - Issue reporting
- `userRegisterSchema` - User registration
- `loginSchema` - Authentication
- `userAdminCreateSchema` - Admin user creation

**Category System**: 8 predefined categories with subcategories (see `CATEGORIES` object in `lib/schemas.js`)

#### 6. Authentication Flow
```
1. User submits credentials → /api/auth/login
2. Server validates with bcrypt → User.comparePassword()
3. JWT generated with role/department → generateToken(user)
4. Token stored in HTTP-only cookie (7-day expiry)
5. Subsequent requests validated via getTokenData()
```

**Important**: Department staff users MUST have a `department` field or they cannot access department routes.

### Directory Structure

#### Key Directories
- `app/` - Next.js App Router pages and API routes
  - `(auth)/` - Auth pages (login, register) with route grouping
  - `admin/`, `citizen/`, `department/`, `municipal/` - Role-specific dashboards
  - `api/` - API endpoints organized by feature
- `components/` - Reusable React components
  - `DashboardProtection.js` - Client-side role enforcement
  - `DashboardLayout.js` - Shared layout for dashboards
  - `ErrorBoundary.js` - Error handling wrapper
- `lib/` - Utility libraries and core logic
  - `auth.js` - Authentication utilities and middleware
  - `middleware.js` - Path-based access control
  - `mongodb.js` - Database connection
  - `schemas.js` - Zod validation schemas
  - `security.js` - Security utilities
  - `ai.js` - OpenAI integration
  - `contexts/UserContext.js` - Global user state
- `models/` - Mongoose models (Issue, User, Department, etc.)
- `scripts/` - Utility scripts for development
- `docs/` - Documentation including design system

#### Important Files
- `lib/schemas.js` - Contains `CATEGORIES` constant (source of truth for categories)
- `lib/contexts/UserContext.js` - Manages global user authentication state
- `components/DashboardProtection.js` - Client-side route protection

### Design System
The project uses a custom design system documented in `docs/design-style-guide.md`:
- **Primary Color**: `#2563EB` (Blue-600)
- **Border Radius**: 8px for inputs/buttons, 12px for cards
- **Spacing**: 4px base unit system
- **Shadows**: Small for buttons, medium for cards
- **Typography**: Inter font (or system-ui fallback)

**Tailwind Classes**:
- Primary Button: `bg-blue-600 hover:bg-blue-800 text-white font-medium py-3 px-6 rounded-lg`
- Card: `bg-white border border-gray-200 rounded-xl p-6 shadow-md`
- Input: `w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600`

### Testing
Tests are in `__tests__/` directory using Jest:
- `category.test.js` - Category validation
- `email.test.js` - Email functionality
- `image-upload.test.js` - Image upload validation
- `location.test.js` - Location handling
- `utils.test.js` - Utility functions

**Run tests**: `npm test`

## Environment Variables

Required environment variables (see `.env.example`):
```bash
# MongoDB connection (local or Atlas)
MONGODB_URI=mongodb://localhost:27017/civic-issues

# JWT secret (use strong random string)
JWT_SECRET=your-secure-random-string-here

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI (for AI categorization)
OPENAI_API_KEY=your-openai-api-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Optional: Demo mode
ALLOW_DEMO=true
```

## Development Guidelines

### Adding New API Routes
1. Create route handler in appropriate `app/api/` subdirectory
2. Wrap handler with appropriate middleware (e.g., `pathRoleMiddleware(['admin'])`)
3. Always call `await connectDB()` before database operations
4. Use Zod schemas for input validation
5. Return `NextResponse.json()` for responses

### Adding New User Roles
1. Update `role` enum in `models/User.js`
2. Update middleware allowedRoles in `lib/middleware.js`
3. Create corresponding dashboard route in `app/[role]/`
4. Add route protection with `DashboardProtection` component
5. Update `getDashboardForRole()` helper in `DashboardProtection.js`

### Issue Status Changes
When changing issue status, consider:
- SLA deadline recalculation
- Escalation level impact
- Penalty points for overdue issues
- Email notifications (if configured)
- Status history tracking

### Working with Categories
- **Never hardcode categories** - always import from `lib/schemas.js`
- Categories must match enum in `models/Issue.js`
- Category values use kebab-case (e.g., `roads-infrastructure`)
- Each category has predefined subcategories

### Security Considerations
- All passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 7 days
- HTTP-only cookies prevent XSS attacks
- Input validation via Zod prevents injection attacks
- Rate limiting on public endpoints (if configured)
- File upload validation (size, type, MIME)

### Performance
- Database connection is cached globally
- Mongoose lean() queries for read-only operations
- Images optimized via Cloudinary
- Static generation for public pages
- Code splitting via Next.js App Router

## Common Issues & Solutions

### MongoDB Connection Failures
- Ensure MongoDB is running: `mongod` (or `.\start-local-db.bat` on Windows)
- Check MONGODB_URI in `.env.local`
- Connection timeout is 5 seconds - increase if needed in `lib/mongodb.js`

### Role Access Denied
- Verify user role in database matches route requirements
- Check if department staff have `department` field populated
- Admin role can access all routes

### Image Upload Issues
- Verify Cloudinary credentials in `.env.local`
- Max 3 images per issue (enforced by Zod schema)
- Image compression happens client-side before upload

### Test User Creation
- Use `node scripts/create-test-admin.js` for admin user
- Credentials: `admin@test.com` / `admin`
- WARNING: This is for development only - delete before production

## Deployment Notes
- Build command: `npm run build`
- Start command: `npm start`
- Requires Node.js 18+
- Set all environment variables in hosting platform
- MongoDB Atlas recommended for production database
- Ensure JWT_SECRET is cryptographically secure in production
- Default port is 3001 (configured in dev server)
