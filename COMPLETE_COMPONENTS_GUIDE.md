# COMPLETE COMPONENTS & IMPLEMENTATION GUIDE
# Continuation of PROJECT_BLUEPRINT.md

This document continues from Section 10.8 of PROJECT_BLUEPRINT.md

---

# 11. COMPONENT LIBRARY - COMPLETE REFERENCE

## 11.1 Layout Components

### DashboardLayout (components/DashboardLayout.js)

**File:** `components/DashboardLayout.js`
**Type:** Layout Component
**Purpose:** Reusable dashboard layout with responsive sidebar and header

**Props:**
- `children` (ReactNode, required) - Dashboard page content

**Features:**
1. **Responsive Sidebar**
   - Fixed width (256px) on desktop
   - Collapsible on mobile with overlay
   - Smooth slide-in/out animation
   - Auto-closes on mobile when link clicked

2. **Role-Based Navigation**
   - Different menu items per role
   - Icons for each menu item
   - Active state highlighting
   - Hover effects

3. **User Profile Section**
   - User avatar (first letter of name)
   - User name and role display
   - Logout button
   - Located in sidebar footer

4. **Mobile Menu Toggle**
   - Hamburger icon (visible < 1024px)
   - Overlay backdrop when open
   - Click outside to close

**Navigation Menus by Role:**

**Citizen:**
- Dashboard → /citizen/dashboard
- Report Issue → /citizen/report
- My Issues → /citizen/dashboard?filter=my-issues

**Department:**
- Dashboard → /department/dashboard
- Assigned Issues → /department/dashboard?filter=assigned

**Municipal:**
- Dashboard → /municipal/dashboard
- All Issues → /municipal/dashboard?filter=all
- Departments → /municipal/departments

**Admin:**
- Dashboard → /admin/dashboard
- Users → /admin/users
- Departments → /admin/departments
- Reports → /admin/reports

**State Management:**
- Uses UserContext for user data
- Local state for sidebar open/close
- Loading state while fetching user

**Styling:**
- TailwindCSS with custom color classes
- Smooth transitions
- Shadow effects
- Responsive breakpoints

---

### DashboardProtection (components/DashboardProtection.js)

**File:** `components/DashboardProtection.js`
**Type:** HOC/Wrapper Component
**Purpose:** Protect dashboard routes with role-based access control

**Props:**
- `children` (ReactNode, required) - Protected content
- `requiredRole` (string, optional) - Required role to access

**Logic Flow:**
1. Gets user from UserContext
2. Waits for initialization
3. If not authenticated → redirects to /login
4. If wrong role → redirects to correct dashboard
5. If admin → allows access to everything
6. If department staff without department → redirects to login
7. If authorized → renders children

**Access Rules:**
- Admin can access all dashboards
- Other roles can only access their own dashboard
- Department staff must have department assigned

**Loading States:**
- Shows "Verifying access..." while checking
- Returns null if unauthorized (prevents flash)

**Error Handling:**
- Toast notifications for access denied
- Automatic redirection
- Clear error messages

**Usage Example:**
```javascript
export default function AdminDashboard() {
  return (
    <DashboardProtection requiredRole="admin">
      <DashboardLayout>
        {/* Dashboard content */}
      </DashboardLayout>
    </DashboardProtection>
  );
}
```

---

## 11.2 Issue Display Components

### IssueCard (components/IssueCard.js)

**File:** `components/IssueCard.js`
**Type:** Display Component
**Purpose:** Display issue in card format with actions

**Props:**
- `issue` (object, required) - Issue object from database
- `onStatusChange` (function, optional) - Status change callback
- `userRole` (string, optional) - Current user role
- `showSensitiveData` (boolean, optional) - Show sensitive data

**Features:**

1. **Responsive Layout**
   - Mobile layout (< 640px): Vertical stack
   - Desktop layout (≥ 640px): Horizontal with sidebar

2. **Issue Information Display**
   - Report ID (format: R00001)
   - Title (bold, prominent)
   - Description (expandable with "Read more")
   - Category with icon
   - Ward information
   - Created date
   - Reporter name (or "Anonymous")

3. **Status & Priority Badges**
   - Color-coded status badge
   - Priority badge (urgent/high/medium/low)
   - SLA indicator
   - Escalation level indicator

4. **Image Gallery**
   - Up to 3 images displayed
   - Thumbnail view
   - Click to expand (uses ImageGallery component)

5. **Upvote System**
   - Prominent upvote count display
   - Upvote button (authenticated users only)
   - Visual feedback (👍 emoji + count)
   - Disabled state while processing

6. **Comments Section**
   - Shows first 2 comments
   - "+X more comments" indicator
   - Comment author and date
   - Rounded card design

7. **Action Buttons**
   - "View Details" link
   - Upvote button
   - Status change dropdown (role-based)
   - Mobile: Full-width buttons
   - Desktop: Inline actions

**Role-Based Actions:**
- **Citizen:** View details, upvote
- **Department:** View details, upvote, change status
- **Municipal:** View details, upvote, change status
- **Admin:** View details, upvote, change status

**Category Icons:**
```javascript
{
  water: '💧',
  electricity: '⚡',
  roads: '🛣️',
  garbage: '🗑️',
  parks: '🌳',
  other: '📝'
}
```

**State Management:**
- Local state for expand/collapse
- Local state for upvoting status
- Uses UserContext for current user

**API Calls:**
- POST /api/citizen-engagement (upvote)
- Reloads page after successful upvote

---

### LocationPicker (components/LocationPicker.jsx)

**File:** `components/LocationPicker.jsx`
**Type:** Form Component
**Purpose:** Interactive map for selecting issue location

**Props:**
- `onLocationSelect` (function, required) - Callback with location data
- `initialLocation` (object, optional) - Initial map center {lat, lng}

**Features:**

1. **Auto-Detect Location**
   - Uses browser Geolocation API
   - GPS-based location detection
   - Loading state with spinner
   - Error handling for denied permissions

2. **Interactive Map**
   - Leaflet + React Leaflet
   - OpenStreetMap tiles
   - Click to place marker
   - Draggable marker
   - Zoom controls
   - 400px height

3. **Reverse Geocoding**
   - Uses OpenStreetMap Nominatim API
   - Converts coordinates to address
   - Extracts city, state, pincode
   - Displays formatted address

4. **Default Location**
   - Surendranagar, Gujarat, India
   - Coordinates: {lat: 22.7281, lng: 71.6378}
   - Used if no initial location provided

**Location Data Structure:**
```javascript
{
  address: "Full formatted address",
  coordinates: { lat: 22.7281, lng: 71.6378 },
  city: "Surendranagar",
  state: "Gujarat",
  pincode: "363001"
}
```

**State Management:**
- position: Current marker position
- address: Detected address string
- loading: Loading state
- error: Error message
- mapLoaded: Map initialization state

**Error Handling:**
- Geolocation not supported
- Permission denied
- Network errors
- Reverse geocoding failures

**Styling:**
- Rounded corners
- Border styling
- Loading indicators
- Success/error states

**Dependencies:**
- leaflet: ^1.9.4
- react-leaflet: ^4.2.1

---

### ImageUploader (components/ImageUploader.jsx)

**File:** `components/ImageUploader.jsx`
**Type:** Form Component
**Purpose:** Upload and compress images with progress tracking

**Props:**
- `onImagesChange` (function, required) - Callback with image URLs array
- `maxImages` (number, optional, default: 3) - Maximum images allowed

**Features:**

1. **Image Compression**
   - Uses browser-image-compression library
   - Max size: 500KB per image
   - Max dimensions: 1920px
   - Converts all to JPEG format
   - Web worker for performance

2. **Upload to Cloudinary**
   - POST to /api/upload
   - FormData with file
   - Progress tracking with XMLHttpRequest
   - Returns Cloudinary URL

3. **File Validation**
   - Allowed types: JPG, PNG, HEIC
   - Max images limit check
   - File type validation
   - Error messages

4. **Upload Progress**
   - Per-image progress bars
   - Percentage display
   - Visual feedback
   - Smooth animations

5. **Image Thumbnails**
   - 3-column grid
   - Aspect ratio preserved
   - Hover effects
   - Remove button (X icon)
   - Image info on hover (name, size)

6. **Drag and Drop** (via file input)
   - Click to upload
   - Multiple file selection
   - Visual upload area
   - Disabled state while uploading

**Compression Options:**
```javascript
{
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/jpeg'
}
```

**State Management:**
- images: Array of uploaded images
- uploading: Upload in progress
- uploadProgress: Progress per image {index: percentage}
- errors: Array of error messages

**Error Handling:**
- Max images exceeded
- Invalid file types
- Compression failures
- Upload failures
- Network errors

**Image Object Structure:**
```javascript
{
  url: "https://res.cloudinary.com/.../image.jpg",
  name: "photo.jpg",
  size: 245678 // bytes
}
```

---

## 11.3 UI Primitive Components

### Card (components/ui/Card.jsx)

**Purpose:** Reusable card container
**Props:**
- `children` - Card content
- `className` - Additional Tailwind classes
- `onClick` - Optional click handler

**Default Styling:**
- White background
- Rounded corners (rounded-2xl)
- Border (border-neutral-border)
- Shadow on hover
- Padding (p-6)

---

### StatCard (components/ui/StatCard.jsx)

**Purpose:** Display statistic with icon
**Props:**
- `title` - Stat title
- `value` - Stat value (number or string)
- `icon` - Icon component or emoji
- `color` - Color theme (brand/success/warning/error)
- `trend` - Trend indicator (up/down/neutral)

**Features:**
- Large value display
- Icon in colored circle
- Trend arrow (↑ ↓)
- Responsive sizing

---

### PrimaryButton (components/ui/PrimaryButton.jsx)

**Purpose:** Primary action button
**Props:**
- `children` - Button text
- `onClick` - Click handler
- `loading` - Loading state (shows spinner)
- `disabled` - Disabled state
- `variant` - Style variant (primary/secondary/danger)

**Variants:**
- primary: Brand color background
- secondary: Outline style
- danger: Red background

---

### PriorityBadge (components/PriorityBadge.jsx)

**Purpose:** Visual badge for priority level
**Props:**
- `priority` - Priority string (urgent/high/medium/low)
- `size` - Size variant (sm/md/lg)

**Colors:**
- urgent: Red (bg-red-100, text-red-700)
- high: Orange (bg-orange-100, text-orange-700)
- medium: Yellow (bg-yellow-100, text-yellow-700)
- low: Green (bg-green-100, text-green-700)

**Labels:**
- 🔴 Urgent
- 🟠 High
- 🟡 Medium
- 🟢 Low

---

## 11.4 Modal Components

### RatingModal (components/RatingModal.jsx)

**Purpose:** Modal for rating resolved issues
**Props:**
- `issue` - Issue object
- `onClose` - Close handler
- `onSubmit` - Submit handler

**Form Fields:**
1. **Star Rating** (1-5 stars)
   - Interactive star selection
   - Hover effects
   - Required field

2. **Resolution Confirmation**
   - "Was the issue actually resolved?"
   - Yes/No radio buttons
   - Required field

3. **Comment** (optional)
   - Textarea for feedback
   - Max 500 characters
   - Placeholder text

**Submission:**
- POST to /api/issues/[id]/rate
- Validates all required fields
- Shows loading state
- Success/error feedback

---

### DuplicateModal (components/DuplicateModal.jsx)

**Purpose:** Show potential duplicate issues before submission
**Props:**
- `duplicates` - Array of similar issues
- `onClose` - Close handler
- `onProceed` - Proceed with submission handler

**Features:**
- Lists similar issues
- Shows similarity score
- "View Existing Issue" links
- "Proceed Anyway" button
- "Cancel" button

---

# 12. UTILITIES & HELPERS - COMPLETE REFERENCE

## 12.1 Authentication Utilities (lib/auth.js)

All functions documented in PROJECT_BLUEPRINT.md Section 7

---

## 12.2 Database Utilities (lib/mongodb.js)

All functions documented in PROJECT_BLUEPRINT.md Section 6

---

## 12.3 Validation Schemas (lib/schemas.js)

All schemas documented in PROJECT_BLUEPRINT.md Section 4

---

## 12.4 Error Handling (lib/error-handler.js)

All functions documented in PROJECT_BLUEPRINT.md Section 9.3

---

## 12.5 Security Utilities (lib/security.js)

All functions documented in PROJECT_BLUEPRINT.md Section 7.8

---

## 12.6 Department Mapping (lib/department-mapper.js)

All functions documented in PROJECT_BLUEPRINT.md Section 10.6

---

## 12.7 Priority Calculation (lib/priority-calculator.js)

All functions documented in PROJECT_BLUEPRINT.md Section 10.7

---

## 12.8 AI Integration (lib/ai.js)

All functions documented in PROJECT_BLUEPRINT.md Section 10.8

---

# 13. EMAIL SYSTEM - COMPLETE REFERENCE

All email functions and templates documented in PROJECT_BLUEPRINT.md Section 9.2

---

# 14. FILE UPLOAD SYSTEM - COMPLETE REFERENCE

All upload functions documented in PROJECT_BLUEPRINT.md Section 9.2

---

# 15. DEPLOYMENT GUIDE

## 15.1 Vercel Deployment (Recommended)

**Prerequisites:**
- GitHub/GitLab/Bitbucket account
- Vercel account (free tier available)
- MongoDB Atlas database
- Cloudinary account
- OpenAI API key

**Step-by-Step:**

1. **Prepare Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Create Vercel Project**
   - Go to vercel.com
   - Click "New Project"
   - Import your Git repository
   - Select framework: Next.js

3. **Configure Environment Variables**
   In Vercel dashboard, add:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=[64+ char string]
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   OPENAI_API_KEY=...
   RESEND_API_KEY=...
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your deployed app

**Build Settings:**
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Node Version: 18.x

**Post-Deployment:**
- Test all features
- Check database connection
- Verify image uploads
- Test email sending
- Monitor error logs

---

## 15.2 Firebase Hosting Deployment

**Prerequisites:**
- Firebase project
- Firebase CLI: `npm install -g firebase-tools`

**Steps:**

1. **Login to Firebase**
   ```bash
   firebase login
   ```

2. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```
   - Select existing project or create new
   - Public directory: `.next`
   - Configure as single-page app: No
   - Set up automatic builds: No

3. **Build Project**
   ```bash
   npm run build
   ```

4. **Deploy**
   ```bash
   firebase deploy
   ```

**firebase.json Configuration:**
```json
{
  "hosting": {
    "public": ".next",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## 15.3 Environment Variables Checklist

**Required for Production:**
- [ ] MONGODB_URI (MongoDB Atlas connection string)
- [ ] JWT_SECRET (64+ character random string)
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET
- [ ] OPENAI_API_KEY
- [ ] NEXT_PUBLIC_APP_URL (your production URL)
- [ ] NODE_ENV=production

**Optional:**
- [ ] RESEND_API_KEY (for emails)
- [ ] NEXT_PUBLIC_MAPBOX_TOKEN (for maps)

---

# 16. COMPLETE REBUILD INSTRUCTIONS

## 16.1 15-Day Rebuild Plan

### Phase 1: Foundation (Days 1-2)
**Day 1:**
- [ ] Initialize Next.js 14 project
- [ ] Install all dependencies
- [ ] Set up .env.local
- [ ] Configure MongoDB connection
- [ ] Test database connection
- [ ] Set up TailwindCSS
- [ ] Create basic folder structure

**Day 2:**
- [ ] Create all 7 database models
- [ ] Add indexes to models
- [ ] Test model creation
- [ ] Seed initial departments
- [ ] Create test admin user

### Phase 2: Authentication (Days 3-4)
**Day 3:**
- [ ] Implement lib/auth.js
- [ ] Create POST /api/auth/register
- [ ] Create POST /api/auth/login
- [ ] Create POST /api/auth/logout
- [ ] Create GET /api/auth/me
- [ ] Test all auth endpoints

**Day 4:**
- [ ] Create UserContext
- [ ] Create login page
- [ ] Create register page
- [ ] Test complete auth flow
- [ ] Implement role-based redirects

### Phase 3: Core API (Days 5-7)
**Day 5:**
- [ ] Create POST /api/issues
- [ ] Create GET /api/issues
- [ ] Create GET /api/issues/[id]
- [ ] Create PATCH /api/issues/[id]
- [ ] Test issue CRUD

**Day 6:**
- [ ] Create status update endpoint
- [ ] Create upvote endpoint
- [ ] Create rating endpoint
- [ ] Create department endpoints
- [ ] Test all endpoints

**Day 7:**
- [ ] Create user management endpoints
- [ ] Create analytics endpoints
- [ ] Create report endpoints
- [ ] Test all endpoints

### Phase 4: Frontend Pages (Days 8-10)
**Day 8:**
- [ ] Create landing page
- [ ] Create citizen dashboard
- [ ] Create citizen report form
- [ ] Test citizen flow

**Day 9:**
- [ ] Create department dashboard
- [ ] Create department issues page
- [ ] Create municipal dashboard
- [ ] Test department flow

**Day 10:**
- [ ] Create admin dashboard
- [ ] Create admin analytics
- [ ] Create admin user management
- [ ] Test admin flow

### Phase 5: Components (Days 11-12)
**Day 11:**
- [ ] Create DashboardLayout
- [ ] Create DashboardProtection
- [ ] Create IssueCard
- [ ] Create LocationPicker
- [ ] Test components

**Day 12:**
- [ ] Create ImageUploader
- [ ] Create all UI primitives
- [ ] Create modals
- [ ] Test all components

### Phase 6: Features (Days 13-14)
**Day 13:**
- [ ] Implement AI analysis
- [ ] Implement email system
- [ ] Implement file upload
- [ ] Test integrations

**Day 14:**
- [ ] Implement SLA tracking
- [ ] Implement escalation
- [ ] Implement performance tracking
- [ ] Test all features

### Phase 7: Deployment (Day 15)
- [ ] Set up MongoDB Atlas
- [ ] Set up Cloudinary
- [ ] Set up OpenAI
- [ ] Configure environment variables
- [ ] Deploy to Vercel
- [ ] Test production deployment
- [ ] Monitor for errors

---

## 16.2 Critical Implementation Checklist

**Database:**
- [ ] All 7 models created
- [ ] All indexes added
- [ ] Pre-save hooks working
- [ ] Methods tested

**Authentication:**
- [ ] JWT tokens working
- [ ] Password hashing working
- [ ] Role-based access working
- [ ] Session persistence working

**API Endpoints:**
- [ ] All 50+ endpoints created
- [ ] All middleware applied
- [ ] All validations working
- [ ] All error handling working

**Frontend:**
- [ ] All pages created
- [ ] All components created
- [ ] All forms working
- [ ] All navigation working

**Features:**
- [ ] Issue reporting working
- [ ] Status updates working
- [ ] Upvoting working
- [ ] Rating working
- [ ] AI analysis working
- [ ] Email sending working
- [ ] File upload working
- [ ] SLA tracking working
- [ ] Escalation working

**Security:**
- [ ] Input validation
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Secure cookies

**Performance:**
- [ ] Database indexes
- [ ] Image compression
- [ ] API pagination
- [ ] Code splitting

---

## END OF COMPLETE COMPONENTS & IMPLEMENTATION GUIDE

This document provides complete details for all components and implementation steps. Use in conjunction with PROJECT_BLUEPRINT.md for full system understanding.

**Total Documentation:**
- PROJECT_BLUEPRINT.md: 2,551 lines
- COMPLETE_COMPONENTS_GUIDE.md: This document
- REBUILD_GUIDE.md: Quick reference
- BLUEPRINT_INDEX.md: Navigation guide

**Coverage: 100% of system documented**
