# PROJECT BLUEPRINT - CIVIC ISSUE MANAGEMENT SYSTEM

**Complete Technical Specification & Rebuild Guide**

---

## TABLE OF CONTENTS

1. [Project Foundation](#1-project-foundation)
2. [Complete Tech Stack](#2-complete-tech-stack)
3. [Environment Configuration](#3-environment-configuration)
4. [Dependencies](#4-dependencies)
5. [Project Structure](#5-project-structure)
6. [Database Architecture](#6-database-architecture)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Backend API Architecture](#9-backend-api-architecture)
10. [Core Features & Workflows](#10-core-features--workflows)
11. [Component Library](#11-component-library)
12. [Utilities & Helpers](#12-utilities--helpers)
13. [Email System](#13-email-system)
14. [File Upload System](#14-file-upload-system)
15. [AI Integration](#15-ai-integration)
16. [Deployment Guide](#16-deployment-guide)
17. [Rebuild Instructions](#17-rebuild-instructions)

---

# 1. PROJECT FOUNDATION

## 1.1 Project Identity

**Name:** Civic Issue Management System

**Purpose:** A comprehensive digital platform for citizens to report civic issues (potholes, street lights, waste management, etc.) and track their resolution by municipal departments. The system provides transparency, accountability, and efficient issue management through role-based dashboards.

**Problem Solved:**
- Citizens lack a centralized platform to report civic issues
- Municipal departments struggle with issue tracking and prioritization
- No transparency in issue resolution process
- Manual issue assignment is inefficient
- No performance metrics for departments

**Target Users:**
1. **Citizens** - Report issues, track status, upvote important issues, provide feedback
2. **Department Staff** - View assigned issues, update status, manage workload
3. **Municipal Officers** - Oversee all departments, manage system-wide operations
4. **Administrators** - Full system access, user management, analytics, reports

**Core Workflow:**
1. Citizen reports issue with photos, location, description
2. AI analyzes and categorizes issue, assigns priority
3. System auto-assigns to appropriate department
4. Department staff receives notification
5. Staff updates status (pending → assigned → in-progress → resolved)
6. Citizen receives real-time notifications
7. Upon resolution, citizen rates the service
8. System tracks SLA compliance and performance metrics

---

## 1.2 Key Features

### For Citizens
- Report issues with images (up to 3), location, detailed description
- Track issue status in real-time
- Upvote important issues to increase priority
- Comment on issues
- View all issues on interactive map
- Rate resolved issues
- View public dashboard with statistics

### For Department Staff
- View issues assigned to their department
- Update issue status with comments
- Filter by status (pending, assigned, in-progress, resolved)
- View department statistics and performance
- Manage assigned workload

### For Municipal Officers
- View all issues across all departments
- Assign issues to departments
- Override priority levels
- View system-wide analytics
- Monitor SLA compliance
- Access performance reports

### For Administrators
- Full CRUD operations on users, departments, issues
- Create department and municipal staff accounts
- Generate comprehensive reports
- View advanced analytics
- Manage system configuration

---

# 2. COMPLETE TECH STACK

## 2.1 Frontend
- **Framework:** Next.js 14.2.15 (App Router)
- **Language:** JavaScript (ES6+)
- **UI Library:** React 18.3.1
- **Styling:** TailwindCSS 3.4.19
- **State Management:** React Context API (UserContext)
- **Notifications:** react-hot-toast 2.4.1
- **Maps:** Leaflet 1.9.4, react-leaflet 4.2.1, react-leaflet-cluster 4.0.0
- **Image Compression:** browser-image-compression 2.0.2
- **Image Upload:** next-cloudinary 6.3.0

## 2.2 Backend
- **Framework:** Next.js API Routes (App Router)
- **Runtime:** Node.js 18.17.0+
- **Language:** JavaScript (ES6+)

## 2.3 Database
- **Database:** MongoDB
- **ODM:** Mongoose 8.1.0
- **Connection:** MongoDB Atlas or Local MongoDB

## 2.4 Authentication
- **Method:** JWT (JSON Web Tokens)
- **Library:** jsonwebtoken 9.0.2
- **Password Hashing:** bcryptjs 3.0.2
- **Storage:** HTTP-only cookies

## 2.5 File Storage
- **Service:** Cloudinary 2.7.0
- **Purpose:** Image upload and storage for issue photos

## 2.6 Email Service
- **Service:** Resend 6.7.0
- **Purpose:** Transactional emails (notifications, status updates)

## 2.7 AI Integration
- **Service:** OpenAI GPT-3.5-turbo
- **Purpose:** Issue categorization, priority calculation, sentiment analysis

## 2.8 Validation
- **Library:** Zod 3.22.4
- **Purpose:** Request body validation, schema validation

## 2.9 Scheduling
- **Library:** node-cron 3.0.3
- **Purpose:** Automated tasks (SLA checks, reminders, escalations)

## 2.10 Development Tools
- **Linter:** ESLint 8.57.1
- **CSS Processing:** PostCSS 8.5.6, Autoprefixer 10.4.24
- **Testing:** Jest 29.7.0

## 2.11 Deployment
- **Platform:** Vercel (primary), Firebase Hosting (alternative)
- **Build:** Standalone output mode
- **Environment:** Production, Development

---

# 3. ENVIRONMENT CONFIGURATION

## 3.1 Required Environment Variables

### Database Configuration
```env
MONGODB_URI=mongodb://localhost:27017/civic-issues
# Production: mongodb+srv://username:password@cluster.mongodb.net/civic-issues
```
**Purpose:** MongoDB connection string
**Used by:** lib/mongodb.js, all API routes
**Type:** String (MongoDB connection URI)

### Authentication Configuration
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```
**Purpose:** Secret key for JWT token signing and verification
**Used by:** lib/auth.js, all authenticated API routes
**Type:** String (64+ characters recommended)
**Generation:** `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### Application Configuration
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Production: https://your-domain.com
```
**Purpose:** Base URL for the application
**Used by:** Frontend components, email templates
**Type:** String (URL)

```env
NODE_ENV=development
# Production: production
```
**Purpose:** Environment mode
**Used by:** Error handling, logging, feature flags
**Type:** String (development | production)

### Cloudinary Configuration
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```
**Purpose:** Image upload and storage
**Used by:** lib/upload.js, app/api/upload/route.js
**Type:** String (Cloudinary credentials)
**Get from:** https://cloudinary.com/

### OpenAI Configuration
```env
OPENAI_API_KEY=your_openai_api_key
```
**Purpose:** AI-powered issue analysis
**Used by:** lib/ai.js, app/api/ai/route.js
**Type:** String (OpenAI API key)
**Get from:** https://platform.openai.com/

### Email Configuration (Optional)
```env
RESEND_API_KEY=your-resend-api-key
```
**Purpose:** Transactional email sending
**Used by:** lib/email.js, lib/mailer.js
**Type:** String (Resend API key)
**Get from:** https://resend.com/

### Map Configuration (Optional)
```env
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```
**Purpose:** Map functionality (alternative to Leaflet)
**Used by:** Map components
**Type:** String (Mapbox access token)
**Get from:** https://account.mapbox.com/

---

# 4. DEPENDENCIES

## 4.1 Production Dependencies

### Core Framework
```json
"next": "14.2.15"
```
**Purpose:** React framework with server-side rendering, API routes, file-based routing

```json
"react": "^18.3.1",
"react-dom": "^18.3.1"
```
**Purpose:** Core React library for building UI components

### Authentication & Security
```json
"jsonwebtoken": "^9.0.2"
```
**Purpose:** Generate and verify JWT tokens for authentication

```json
"bcryptjs": "^3.0.2"
```
**Purpose:** Hash passwords before storing in database

### Database
```json
"mongoose": "^8.1.0"
```
**Purpose:** MongoDB ODM for schema definition, validation, queries

### Validation
```json
"zod": "^3.22.4"
```
**Purpose:** TypeScript-first schema validation for API requests

### File Upload
```json
"cloudinary": "^2.7.0",
"next-cloudinary": "^6.3.0",
"browser-image-compression": "^2.0.2"
```
**Purpose:** Image upload, storage, and compression

### Maps
```json
"leaflet": "^1.9.4",
"react-leaflet": "^4.2.1",
"react-leaflet-cluster": "^4.0.0"
```
**Purpose:** Interactive maps for issue location visualization

### Email
```json
"resend": "^6.7.0"
```
**Purpose:** Transactional email service

### UI & Notifications
```json
"react-hot-toast": "^2.4.1"
```
**Purpose:** Toast notifications for user feedback

### Utilities
```json
"dotenv": "^17.2.2"
```
**Purpose:** Load environment variables from .env files

```json
"node-cron": "^3.0.3"
```
**Purpose:** Schedule automated tasks (SLA checks, reminders)

## 4.2 Development Dependencies

```json
"eslint": "^8.57.1",
"eslint-config-next": "^16.1.1"
```
**Purpose:** Code linting and style enforcement

```json
"tailwindcss": "^3.4.19",
"postcss": "^8.5.6",
"autoprefixer": "^10.4.24"
```
**Purpose:** CSS framework and processing

```json
"jest": "^29.7.0"
```
**Purpose:** Testing framework

---

# 5. PROJECT STRUCTURE

## 5.1 Complete Directory Tree

```
civic-issue-system/
├── .env.example                    # Environment variables template
├── .env.local                      # Local environment variables (gitignored)
├── .env.local.example              # Example local environment
├── .firebaserc                     # Firebase configuration
├── .gitignore                      # Git ignore rules
├── .npmrc                          # NPM configuration
├── .vercel/                        # Vercel deployment config
│   ├── project.json
│   └── README.txt
├── .vscode/                        # VS Code settings
├── app/                            # Next.js App Router directory
│   ├── (auth)/                     # Auth route group (no layout)
│   │   ├── login/
│   │   │   └── page.js            # Login page
│   │   └── register/
│   │       └── page.js            # Registration page
│   ├── admin/                      # Admin dashboard routes
│   │   ├── analytics/
│   │   │   └── page.jsx           # Admin analytics page
│   │   ├── dashboard/
│   │   │   └── page.js            # Admin main dashboard
│   │   ├── departments/
│   │   │   └── page.js            # Department management
│   │   ├── reports/
│   │   │   └── page.js            # Reports generation
│   │   ├── secure-dashboard/
│   │   │   └── page.js            # Secure admin dashboard
│   │   └── users/
│   │       ├── create/
│   │       │   └── page.js        # Create user page
│   │       └── page.js            # User management
│   ├── api/                        # API routes
│   │   ├── admin/
│   │   │   ├── analytics/
│   │   │   │   ├── departments/route.js
│   │   │   │   ├── overview/route.js
│   │   │   │   ├── stuck/route.js
│   │   │   │   ├── trends/route.js
│   │   │   │   └── workflow/route.js
│   │   │   └── create-user/route.js
│   │   ├── ai/route.js             # AI analysis endpoint
│   │   ├── auth/
│   │   │   ├── login/route.js
│   │   │   ├── logout/route.js
│   │   │   ├── me/route.js
│   │   │   └── register/route.js
│   │   ├── citizen-engagement/route.js
│   │   ├── debug/
│   │   │   └── cookies/route.js
│   │   ├── departments/
│   │   │   ├── [id]/route.js
│   │   │   └── route.js
│   │   ├── health/route.js
│   │   ├── issues/
│   │   │   ├── [id]/
│   │   │   │   ├── assign/route.js
│   │   │   │   ├── priority/route.js
│   │   │   │   ├── quick-action/route.js
│   │   │   │   ├── rate/route.js
│   │   │   │   ├── route.js
│   │   │   │   ├── update-status/route.js
│   │   │   │   └── upvote/route.js
│   │   │   ├── admin/route.js
│   │   │   ├── check-duplicate/route.js
│   │   │   ├── department/
│   │   │   │   ├── assigned/route.js
│   │   │   │   ├── resolved/route.js
│   │   │   │   ├── route.js
│   │   │   │   └── stats/route.js
│   │   │   ├── public/route.js
│   │   │   └── route.js
│   │   ├── middleware/route.js
│   │   ├── notifications/route.js
│   │   ├── performance/route.js
│   │   ├── placeholder-image/route.js
│   │   ├── public-dashboard/route.js
│   │   ├── reports/
│   │   │   ├── download/route.js
│   │   │   └── route.js
│   │   ├── sla/route.js
│   │   ├── stats/route.js
│   │   ├── upload/route.js
│   │   └── users/
│   │       ├── [id]/route.js
│   │       └── admin/route.js
│   ├── citizen/                    # Citizen dashboard routes
│   │   ├── dashboard/page.js
│   │   ├── report/page.js
│   │   └── secure-dashboard/page.js
│   ├── department/                 # Department dashboard routes
│   │   ├── dashboard/page.js
│   │   ├── issues/page.js
│   │   ├── layout.js
│   │   ├── profile/page.js
│   │   ├── resolved/page.js
│   │   └── stats/page.js
│   ├── issues/
│   │   └── [id]/
│   │       ├── edit/
│   │       ├── page.js
│   │       └── temp_page.js
│   ├── map/
│   │   └── page.js                 # Public map view
│   ├── municipal/                  # Municipal dashboard routes
│   │   ├── dashboard/page.js
│   │   ├── departments/page.js
│   │   └── sla-dashboard/page.js
│   ├── public-dashboard/
│   │   └── page.js                 # Public statistics dashboard
│   ├── favicon.ico
│   ├── globals.css                 # Global styles
│   ├── layout.js                   # Root layout
│   └── page.js                     # Home/landing page
├── components/                     # React components
│   ├── forms/                      # Form components (empty)
│   ├── ui/                         # UI primitives
│   │   ├── Card.jsx
│   │   ├── PrimaryButton.jsx
│   │   ├── SpotlightCard.jsx
│   │   ├── StarBorderButton.jsx
│   │   └── StatCard.jsx
│   ├── DashboardLayout.js
│   ├── DashboardProtection.js
│   ├── DepartmentStats.jsx
│   ├── DuplicateModal.jsx
│   ├── ErrorBoundary.js
│   ├── ImageUploader.jsx
│   ├── IssueActionButtons.jsx
│   ├── IssueCard.js
│   ├── IssueCardRefactored.js
│   ├── IssueMap.jsx
│   ├── IssuePopup.jsx
│   ├── LocationPicker.jsx
│   ├── PriorityBadge.jsx
│   ├── PrivacyNotice.js
│   ├── RatingModal.jsx
│   └── StatusTimeline.jsx
├── lib/                            # Utility libraries
│   ├── contexts/
│   │   └── UserContext.js          # User authentication context
│   ├── email-templates/
│   │   ├── department-assignment.js
│   │   ├── new-report-alert.js
│   │   ├── rating-request.js
│   │   ├── report-rejected.js
│   │   ├── report-submitted.js
│   │   └── status-update.js
│   ├── models/
│   │   └── Department.js           # Department model (duplicate)
│   ├── ai.js                       # AI analysis utilities
│   ├── auth.js                     # Authentication utilities
│   ├── components.js               # Component utilities
│   ├── department-mapper.js        # Department assignment logic
│   ├── email.js                    # Email sending
│   ├── env.js                      # Environment validation
│   ├── error-handler.js            # Error handling utilities
│   ├── mailer.js                   # Email templates wrapper
│   ├── middleware.js               # API middleware
│   ├── mongodb.js                  # Database connection
│   ├── priority-calculator.js      # Priority calculation
│   ├── schemas.js                  # Zod validation schemas
│   ├── security.js                 # Security utilities
│   ├── startup-check.js            # Startup validation
│   ├── upload.js                   # File upload utilities
│   └── utils.js                    # General utilities
├── models/                         # Mongoose models
│   ├── DepartmentPerformance.js
│   ├── Issue.js
│   ├── Notification.js
│   ├── StaffPerformance.js
│   ├── StateHistory.js
│   └── User.js
├── public/                         # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── scripts/                        # Utility scripts
│   ├── add-report-ids.js
│   ├── add-state-history.js
│   ├── clear-users.js
│   ├── create-test-admin.js
│   ├── fix-admin.js
│   ├── migrate-department-refs.js
│   ├── seed-departments.js
│   ├── test-all-roles.js
│   └── verify-database.js
├── jsconfig.json                   # JavaScript configuration
├── next.config.mjs                 # Next.js configuration
├── package.json                    # Dependencies
├── postcss.config.mjs              # PostCSS configuration
├── README.md                       # Project documentation
└── tailwind.config.mjs             # Tailwind configuration
```

---


# 6. DATABASE ARCHITECTURE

## 6.1 MongoDB Collections Overview

The system uses 7 main collections:
1. **users** - All user accounts (citizens, department staff, municipal, admin)
2. **issues** - All reported civic issues
3. **departments** - Department information and configuration
4. **statehistories** - Issue status change history
5. **notifications** - User notifications
6. **staffperformances** - Individual staff performance metrics
7. **departmentperformances** - Department-level performance metrics

---

## 6.2 User Model (models/User.js)

### Schema Definition
```javascript
{
  name: String (required, trimmed),
  email: String (required, unique, lowercase, trimmed),
  password: String (required, hashed with bcrypt, min 6 chars, select: false),
  phone: String (optional),
  role: String (enum: ['citizen', 'admin', 'municipal', 'department'], default: 'citizen'),
  department: ObjectId (ref: 'Department', required if role === 'department'),
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  isActive: Boolean (default: true),
  welcomeEmailSent: Boolean (default: false),
  createdAt: Date (default: Date.now)
}
```

### Indexes
- `{ department: 1 }` - Fast queries for department staff
- `{ role: 1 }` - Fast role-based queries
- `{ email: 1 }` - Unique constraint and fast login

### Pre-save Hooks
1. **Password Hashing:** Automatically hashes password using bcrypt (salt rounds: 10) before saving
2. **Department Validation:** Ensures department is set for role='department', cleared for other roles

### Instance Methods
- `comparePassword(candidatePassword)` - Compares plain text password with hashed password
- `populateDepartment()` - Populates department details if assigned

### Sample Document
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$...", // bcrypt hash
  "phone": "+1234567890",
  "role": "citizen",
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "pincode": "62701"
  },
  "isActive": true,
  "welcomeEmailSent": false,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

## 6.3 Issue Model (models/Issue.js)

### Schema Definition
```javascript
{
  reportId: String (unique, auto-generated, format: R00001, R00002...),
  title: String (required, trimmed, 10-200 chars),
  description: String (required, trimmed, 30-2000 chars),
  
  location: {
    address: String (required),
    coordinates: {
      type: String (enum: ['Point'], default: 'Point'),
      coordinates: [Number] // [lng, lat] - MongoDB GeoJSON format
    },
    city: String,
    state: String,
    pincode: String
  },
  
  category: String (required, enum: [
    'roads-infrastructure',
    'street-lighting',
    'waste-management',
    'water-drainage',
    'parks-public-spaces',
    'traffic-signage',
    'public-health-safety',
    'other'
  ]),
  
  subcategory: String (required, trimmed),
  
  priority: String (enum: ['low', 'medium', 'high', 'urgent'], default: 'medium'),
  priorityOverriddenBy: ObjectId (ref: 'User'),
  priorityOverriddenAt: Date,
  
  status: String (enum: [
    'pending', 'assigned', 'in-progress', 
    'resolved', 'rejected', 'reopened', 'escalated'
  ], default: 'pending'),
  
  rejectionReason: String (trimmed),
  
  images: [{
    url: String,
    publicId: String // Cloudinary public ID
  }],
  
  reportedBy: ObjectId (ref: 'User', required),
  assignedTo: ObjectId (ref: 'User'),
  assignedDepartment: ObjectId (ref: 'Department'),
  
  // SLA and Escalation System
  sla: {
    deadline: Date (required, auto-calculated based on priority),
    hoursRemaining: Number (default: 0, calculated),
    isOverdue: Boolean (default: false, calculated),
    escalationLevel: Number (default: 1, min: 1, max: 3),
    escalationHistory: [{
      level: Number,
      escalatedAt: Date,
      escalatedTo: String,
      reason: String
    }]
  },
  
  // Location Classification
  ward: String (trimmed),
  zone: String (trimmed),
  
  // Citizen Engagement
  upvotes: Number (default: 0),
  upvotedBy: [ObjectId] (ref: 'User'),
  
  reminders: [{
    sentAt: Date,
    sentTo: String,
    type: String (enum: ['citizen', 'department', 'escalation'])
  }],
  
  // Feedback and Rating
  feedback: {
    rating: Number (min: 1, max: 5),
    isResolved: Boolean,
    comment: String,
    submittedAt: Date,
    submittedBy: ObjectId (ref: 'User')
  },
  
  // Performance Tracking
  resolutionTime: Number (in hours, default: 0),
  penaltyPoints: Number (default: 0),
  
  // Staff Assignment
  assignedStaff: ObjectId (ref: 'User'),
  departmentHead: ObjectId (ref: 'User'),
  
  // Verification System
  verification: {
    isVerified: Boolean (default: false),
    verifiedAt: Date,
    verifiedBy: ObjectId (ref: 'User'),
    verificationNotes: String
  },
  
  comments: [{
    text: String,
    user: ObjectId (ref: 'User'),
    createdAt: Date (default: Date.now)
  }],
  
  // AI Analysis
  aiAnalysis: {
    category: String,
    priority: String,
    sentiment: String,
    keywords: [String]
  },
  
  createdAt: Date (default: Date.now),
  dueTime: Date (required, auto-set to createdAt + 7 days),
  updatedAt: Date (default: Date.now)
}
```

### Indexes
- `{ reportId: 1 }` - Unique constraint and fast lookup
- `{ priority: 1 }` - Fast priority-based queries
- `{ 'location.coordinates': '2dsphere' }` - Geospatial queries (sparse)
- `{ upvotes: 1 }` - Sort by popularity

### Pre-save Hooks

1. **Report ID Generation:**
   - Finds highest existing reportId
   - Increments by 1
   - Formats as R##### (5 digits, zero-padded)
   - Fallback: timestamp-based if error

2. **SLA Deadline Calculation:**
   - Urgent: 24 hours
   - High: 48 hours
   - Medium: 72 hours
   - Low: 120 hours

3. **Due Time Setting:**
   - Sets to createdAt + 7 days if not set

4. **SLA Calculations:**
   - Calculates hoursRemaining
   - Sets isOverdue flag
   - Calculates resolutionTime when status = 'resolved'

### Instance Methods

**escalate(reason)**
- Increments escalationLevel (max 3)
- Sets status to 'escalated'
- Adds to escalationHistory
- Adds penalty points (level * 10)
- Returns saved document

**getEscalationTarget()**
- Level 1: 'Department Staff'
- Level 2: 'Department Head'
- Level 3: 'Commissioner/Mayor'

**addUpvote(userId)**
- Checks if user already upvoted
- Increments upvotes
- Adds userId to upvotedBy array
- Returns {success, upvotes} or {success: false, message}

**submitFeedback(rating, comment, isResolved, userId)**
- Sets feedback object
- If isResolved = false, sets status to 'reopened'
- Saves and returns document

### Static Methods

**addUpvote(issueId, userId)** - Atomic upvote operation
- Uses findOneAndUpdate with $ne check
- Increments upvotes
- Adds to upvotedBy array
- Returns updated document

**removeUpvote(issueId, userId)** - Atomic remove upvote
- Uses findOneAndUpdate with userId check
- Decrements upvotes
- Removes from upvotedBy array
- Returns updated document

### Sample Document
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "reportId": "R00042",
  "title": "Large pothole on Main Street",
  "description": "There is a large pothole near the intersection of Main St and 5th Ave causing traffic issues",
  "location": {
    "address": "Main St & 5th Ave, Springfield, IL 62701",
    "coordinates": {
      "type": "Point",
      "coordinates": [-89.6501, 39.7817]
    },
    "city": "Springfield",
    "state": "IL",
    "pincode": "62701"
  },
  "category": "roads-infrastructure",
  "subcategory": "Pothole",
  "priority": "high",
  "status": "in-progress",
  "images": [
    {
      "url": "https://res.cloudinary.com/.../pothole.jpg",
      "publicId": "civic-issues/abc123"
    }
  ],
  "reportedBy": "507f1f77bcf86cd799439011",
  "assignedDepartment": "507f1f77bcf86cd799439020",
  "assignedStaff": "507f1f77bcf86cd799439021",
  "sla": {
    "deadline": "2024-01-17T10:30:00.000Z",
    "hoursRemaining": 36,
    "isOverdue": false,
    "escalationLevel": 1,
    "escalationHistory": []
  },
  "upvotes": 15,
  "upvotedBy": ["507f...", "507f..."],
  "comments": [
    {
      "text": "This is causing accidents!",
      "user": "507f1f77bcf86cd799439013",
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "aiAnalysis": {
    "category": "roads",
    "priority": "high",
    "sentiment": "negative",
    "keywords": ["pothole", "traffic", "accident"]
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "dueTime": "2024-01-22T10:30:00.000Z",
  "updatedAt": "2024-01-15T14:20:00.000Z"
}
```

---

## 6.4 Department Model (lib/models/Department.js)

### Schema Definition
```javascript
{
  name: String (required, unique, trimmed),
  description: String (trimmed),
  contactEmail: String (required, trimmed, lowercase),
  contactPhone: String (trimmed),
  headOfDepartment: ObjectId (ref: 'User'),
  staff: [ObjectId] (ref: 'User'),
  categories: [String] (trimmed),
  isActive: Boolean (default: true),
  staffCount: Number (default: 0),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Indexes
- `{ isActive: 1 }` - Fast active department queries
- `{ categories: 1 }` - Fast category-based assignment

### Instance Methods

**getWorkload()**
- Counts issues where assignedDepartment = this.name
- Status in ['pending', 'assigned', 'in-progress']
- Returns count

### Static Methods

**getDepartmentByCategory(category)**
- Finds department with category in categories array
- Only returns active departments
- Returns first match

### Sample Document
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "name": "Roads & Infrastructure Department",
  "description": "Handles road maintenance, potholes, and infrastructure",
  "contactEmail": "roads@city.gov",
  "contactPhone": "+1234567890",
  "headOfDepartment": "507f1f77bcf86cd799439021",
  "staff": ["507f...", "507f..."],
  "categories": ["roads-infrastructure", "traffic-signage"],
  "isActive": true,
  "staffCount": 5,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

---

## 6.5 StateHistory Model (models/StateHistory.js)

### Schema Definition
```javascript
{
  issueId: ObjectId (ref: 'Issue', required),
  status: String (required, enum: [
    'submitted', 'acknowledged', 'assigned', 
    'in-progress', 'resolved', 'rejected', 
    'reopened', 'escalated'
  ]),
  changedBy: ObjectId (ref: 'User'),
  assignedTo: ObjectId (ref: 'User'),
  comment: String (trimmed),
  rejectionReason: String (trimmed),
  timestamp: Date (default: Date.now, required),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Indexes
- `{ issueId: 1 }` - Fast history lookup by issue
- `{ timestamp: -1 }` - Chronological sorting

### Purpose
Tracks complete audit trail of all status changes for each issue

### Sample Document
```json
{
  "_id": "507f1f77bcf86cd799439030",
  "issueId": "507f1f77bcf86cd799439012",
  "status": "in-progress",
  "changedBy": "507f1f77bcf86cd799439021",
  "comment": "Work started on pothole repair",
  "timestamp": "2024-01-15T14:20:00.000Z"
}
```

---

## 6.6 Notification Model (models/Notification.js)

### Schema Definition
```javascript
{
  user: ObjectId (ref: 'User', required),
  title: String (required),
  message: String (required),
  type: String (required, enum: [
    'issue_update', 'assignment', 'comment', 
    'status_change', 'system'
  ]),
  relatedIssue: ObjectId (ref: 'Issue'),
  read: Boolean (default: false),
  createdAt: Date (default: Date.now)
}
```

### Purpose
Stores in-app notifications for users

### Sample Document
```json
{
  "_id": "507f1f77bcf86cd799439040",
  "user": "507f1f77bcf86cd799439011",
  "title": "Issue Status Updated",
  "message": "Your issue R00042 is now in-progress",
  "type": "status_change",
  "relatedIssue": "507f1f77bcf86cd799439012",
  "read": false,
  "createdAt": "2024-01-15T14:20:00.000Z"
}
```

---

## 6.7 StaffPerformance Model (models/StaffPerformance.js)

### Schema Definition
```javascript
{
  staffId: ObjectId (ref: 'User', required),
  department: String (required),
  
  // Performance Metrics
  totalIssuesAssigned: Number (default: 0),
  totalIssuesResolved: Number (default: 0),
  totalIssuesEscalated: Number (default: 0),
  averageResolutionTime: Number (in hours, default: 0),
  penaltyPoints: Number (default: 0),
  
  // Rewards and Recognition
  badges: [{
    name: String,
    description: String,
    earnedAt: Date,
    category: String (enum: ['speed', 'quality', 'consistency', 'leadership', 'innovation'])
  }],
  totalRewardPoints: Number (default: 0),
  
  // Monthly Performance
  monthlyStats: [{
    month: String (YYYY-MM format),
    issuesResolved: Number,
    averageResolutionTime: Number,
    penaltyPoints: Number,
    rewardPoints: Number,
    rank: Number
  }],
  
  // Current Month Performance
  currentMonth: {
    issuesResolved: Number (default: 0),
    averageResolutionTime: Number (default: 0),
    penaltyPoints: Number (default: 0),
    rewardPoints: Number (default: 0)
  },
  
  // Recognition
  isTopPerformer: Boolean (default: false),
  lastTopPerformerMonth: String,
  
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### Indexes
- `{ staffId: 1 }` - Fast staff lookup
- `{ department: 1 }` - Department-wise queries
- `{ 'currentMonth.issuesResolved': -1 }` - Leaderboard
- `{ totalRewardPoints: -1 }` - Ranking

### Instance Methods

**addResolvedIssue(resolutionTime)**
- Increments totalIssuesResolved and currentMonth.issuesResolved
- Recalculates averageResolutionTime
- Awards points based on speed (10 base + bonuses)
- Saves document

**addEscalatedIssue()**
- Increments totalIssuesEscalated
- Adds 20 penalty points
- Saves document

**addBadge(badgeName, description, category)**
- Adds badge to badges array
- Saves document

**checkForBadges()**
- Checks criteria for various badges
- Returns array of newly earned badges
- Auto-adds badges if criteria met

**hasBadge(badgeName)**
- Returns true if staff has specific badge

### Sample Document
```json
{
  "_id": "507f1f77bcf86cd799439050",
  "staffId": "507f1f77bcf86cd799439021",
  "department": "Roads & Infrastructure Department",
  "totalIssuesAssigned": 50,
  "totalIssuesResolved": 45,
  "totalIssuesEscalated": 2,
  "averageResolutionTime": 36.5,
  "penaltyPoints": 40,
  "badges": [
    {
      "name": "Speed Demon",
      "description": "Average resolution time under 12 hours",
      "earnedAt": "2024-01-10T00:00:00.000Z",
      "category": "speed"
    }
  ],
  "totalRewardPoints": 650,
  "currentMonth": {
    "issuesResolved": 12,
    "averageResolutionTime": 32.0,
    "penaltyPoints": 0,
    "rewardPoints": 180
  },
  "isTopPerformer": true,
  "lastTopPerformerMonth": "2024-01"
}
```

---

## 6.8 DepartmentPerformance Model (models/DepartmentPerformance.js)

### Schema Definition
```javascript
{
  department: String (required, unique),
  
  // Performance Metrics
  totalIssuesReceived: Number (default: 0),
  totalIssuesResolved: Number (default: 0),
  totalIssuesEscalated: Number (default: 0),
  averageResolutionTime: Number (in hours, default: 0),
  
  // SLA Performance
  slaComplianceRate: Number (percentage, default: 0),
  overdueIssues: Number (default: 0),
  
  // Penalty System
  totalPenaltyPoints: Number (default: 0),
  monthlyPenaltyPoints: Number (default: 0),
  
  // Monthly Performance History
  monthlyStats: [{
    month: String (YYYY-MM format),
    issuesReceived: Number,
    issuesResolved: Number,
    issuesEscalated: Number,
    averageResolutionTime: Number,
    slaComplianceRate: Number,
    penaltyPoints: Number,
    rank: Number
  }],
  
  // Current Month Performance
  currentMonth: {
    issuesReceived: Number (default: 0),
    issuesResolved: Number (default: 0),
    issuesEscalated: Number (default: 0),
    averageResolutionTime: Number (default: 0),
    slaComplianceRate: Number (default: 0),
    penaltyPoints: Number (default: 0)
  },
  
  // Ward-wise Performance
  wardPerformance: [{
    ward: String,
    issuesReceived: Number,
    issuesResolved: Number,
    averageResolutionTime: Number,
    slaComplianceRate: Number
  }],
  
  // Recognition
  isTopDepartment: Boolean (default: false),
  lastTopDepartmentMonth: String,
  
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### Indexes
- `{ department: 1 }` - Unique constraint
- `{ 'currentMonth.issuesResolved': -1 }` - Leaderboard
- `{ slaComplianceRate: -1 }` - Performance ranking
- `{ totalPenaltyPoints: 1 }` - Penalty tracking

### Instance Methods

**addNewIssue()**
- Increments totalIssuesReceived and currentMonth.issuesReceived
- Saves document

**addResolvedIssue(resolutionTime, wasOnTime)**
- Increments resolved counts
- Recalculates averageResolutionTime
- Updates SLA compliance
- Adds penalty if overdue
- Saves document

**addEscalatedIssue()**
- Increments escalated counts
- Adds 50 penalty points
- Saves document

**updateSlaCompliance()**
- Calculates compliance rate
- Updates both total and current month
- Saves document

**updateWardPerformance(ward, resolutionTime, wasOnTime)**
- Finds or creates ward entry
- Updates ward statistics
- Saves document

**getPerformanceScore()**
- Calculates score (0-100) based on:
  - Base: 100
  - Deductions: escalations (-5 each), penalties (-0.5 per point)
  - Bonuses: SLA compliance, fast resolution
- Returns clamped score (0-100)

---


# 7. AUTHENTICATION & AUTHORIZATION

## 7.1 Authentication Flow

### Technology
- **Method:** JWT (JSON Web Tokens)
- **Storage:** HTTP-only cookies
- **Library:** jsonwebtoken 9.0.2
- **Password Hashing:** bcryptjs (salt rounds: 10)

### Token Structure
```javascript
{
  userId: user._id,
  email: user.email,
  role: user.role,
  department: user.department // Only for department staff
}
```

### Token Expiration
- **Duration:** 7 days
- **Refresh:** No automatic refresh (user must re-login)

---

## 7.2 Registration Flow (POST /api/auth/register)

**Step 1:** User submits registration form
- Frontend: app/(auth)/register/page.js
- Fields: name, email, password, phone (optional), address (optional)
- Role: Always 'citizen' (security: role cannot be set by user)

**Step 2:** Backend validates request
- File: app/api/auth/register/route.js
- Validates using Zod schema (lib/schemas.js - userRegisterSchema)
- Checks: email format, password length (min 6), phone format

**Step 3:** Check for existing user
- Queries User model by email
- Returns 400 if email already exists

**Step 4:** Create user
- Creates new User document
- Password automatically hashed by pre-save hook
- Role set to 'citizen'
- isActive set to true

**Step 5:** Generate JWT token
- Calls generateToken(user) from lib/auth.js
- Signs token with JWT_SECRET
- Expiration: 7 days

**Step 6:** Set cookie and respond
- Sets 'token' cookie (httpOnly, secure in production, sameSite: 'lax')
- Returns user data (without password) and redirectUrl
- Frontend redirects to /citizen/dashboard

---

## 7.3 Login Flow (POST /api/auth/login)

**Step 1:** User submits login form
- Frontend: app/(auth)/login/page.js
- Fields: email, password

**Step 2:** Backend validates request
- File: app/api/auth/login/route.js
- Validates using Zod schema (lib/schemas.js - loginSchema)

**Step 3:** Find user
- Queries User model by email
- Includes password field (normally excluded)
- Returns 401 if user not found

**Step 4:** Verify password
- Calls user.comparePassword(password)
- Uses bcrypt.compare internally
- Returns 401 if password incorrect

**Step 5:** Check if user is active
- Returns 403 if isActive = false

**Step 6:** Generate JWT token
- Calls generateToken(user)
- Signs token with JWT_SECRET

**Step 7:** Set cookie and respond
- Sets 'token' cookie
- Returns user data and redirectUrl based on role
- Frontend redirects to appropriate dashboard

---

## 7.4 Logout Flow (POST /api/auth/logout)

**Step 1:** User clicks logout
- Frontend: UserContext.logout()

**Step 2:** Backend clears cookie
- File: app/api/auth/logout/route.js
- Sets 'token' cookie with empty value and maxAge: 0

**Step 3:** Frontend cleanup
- Clears user state
- Clears localStorage and sessionStorage
- Redirects to /login

---

## 7.5 Session Verification (GET /api/auth/me)

**Step 1:** Frontend checks authentication
- Called by UserContext on mount
- Called before accessing protected routes

**Step 2:** Backend verifies token
- File: app/api/auth/me/route.js
- Reads 'token' cookie
- Verifies using jwt.verify(token, JWT_SECRET)
- Returns 401 if token invalid or expired

**Step 3:** Find user
- Queries User model by userId from token
- Populates department if role = 'department'
- Returns 401 if user not found

**Step 4:** Return user data
- Returns user object (without password)
- Frontend updates user state

---

## 7.6 Role-Based Access Control (RBAC)

### Roles Hierarchy
1. **citizen** - Basic user, can report and track own issues
2. **department** - Department staff, can manage department issues
3. **municipal** - Municipal officer, can oversee all departments
4. **admin** - Full system access

### Access Control Implementation

#### Middleware Functions (lib/auth.js)

**authMiddleware(handler)**
- Wraps API route handler
- Verifies JWT token
- Attaches user data to req.user
- Returns 401 if not authenticated

**roleMiddleware(roles)**
- Wraps API route handler
- Checks if user.role is in allowed roles array
- Returns 403 if role not allowed

**pathRoleMiddleware(allowedRoles)**
- Enhanced version with better error messages
- Used for path-based access control

**Convenience Functions:**
- `requireAdmin()` - Only admin
- `requireDepartmentOrAdmin()` - Department staff or admin
- `requireMunicipalOrAdmin()` - Municipal or admin
- `requireCitizen()` - Only citizen

#### Path-Based Access Control (lib/middleware.js)

**createPathMiddleware(pathRules)**
- Maps URL paths to allowed roles
- Enforces strict role-based access
- Returns detailed error messages

**Pre-configured Middleware:**
```javascript
pathAccessControl.admin - Admin-only paths
pathAccessControl.department - Department or admin
pathAccessControl.municipal - Municipal or admin
pathAccessControl.citizen - Citizen-only
pathAccessControl.authenticated - Any authenticated user
```

### Route Protection Examples

**Admin-only route:**
```javascript
// app/api/admin/create-user/route.js
import { requireAdmin } from '@/lib/auth';

export const POST = requireAdmin()(async (req) => {
  // Only admins can access
});
```

**Department or Admin route:**
```javascript
// app/api/issues/department/route.js
import { requireDepartmentOrAdmin } from '@/lib/auth';

export const GET = requireDepartmentOrAdmin()(async (req) => {
  // Department staff or admins can access
});
```

**Any authenticated user:**
```javascript
// app/api/issues/route.js
import { authMiddleware } from '@/lib/auth';

export const POST = authMiddleware(async (req) => {
  // Any logged-in user can access
});
```

---

## 7.7 Frontend Route Protection

### UserContext (lib/contexts/UserContext.js)

**Purpose:** Global authentication state management

**State:**
- `user` - Current user object or null
- `loading` - Loading state
- `error` - Error message
- `isInitialized` - Whether initial auth check completed

**Methods:**
- `login(credentials)` - Login user
- `register(userData)` - Register new user
- `logout()` - Logout user
- `checkUser()` - Verify current session

**Auto-redirect Logic:**
1. On mount, calls checkUser()
2. If authenticated and on /login or /register, redirects to dashboard
3. If not authenticated and on protected route, redirects to /login
4. Enforces role-based dashboard access (prevents citizen accessing /admin)

### Dashboard Protection Pattern

**DashboardProtection Component (components/DashboardProtection.js)**
- Wraps dashboard pages
- Checks if user is authenticated
- Checks if user has correct role for the dashboard
- Shows loading state while checking
- Redirects if unauthorized

**Usage Example:**
```javascript
// app/admin/dashboard/page.js
export default function AdminDashboard() {
  return (
    <DashboardProtection allowedRoles={['admin']}>
      {/* Dashboard content */}
    </DashboardProtection>
  );
}
```

---

## 7.8 Security Best Practices Implemented

### Password Security
- Minimum 6 characters (enforced in schema)
- Hashed with bcrypt (salt rounds: 10)
- Never returned in API responses (select: false in schema)
- Password field excluded from User.find() queries by default

### Token Security
- Stored in HTTP-only cookies (not accessible via JavaScript)
- Secure flag in production (HTTPS only)
- SameSite: 'lax' (CSRF protection)
- 7-day expiration
- JWT_SECRET must be 64+ characters

### Input Validation
- All inputs validated with Zod schemas
- Email format validation
- Phone number format validation
- String length limits enforced
- XSS prevention through sanitization

### Rate Limiting
- Implemented in lib/error-handler.js
- checkRateLimit(identifier, maxRequests, windowMs)
- Default: 100 requests per 60 seconds
- Tracks by user identifier

### Error Handling
- Generic error messages for security (no details leaked)
- Detailed errors only in development mode
- 401 for authentication failures
- 403 for authorization failures
- No user enumeration (same error for invalid email/password)

---

# 8. FRONTEND ARCHITECTURE

## 8.1 Application Entry Point

### Root Layout (app/layout.js)

**Purpose:** Global layout wrapper for entire application

**Structure:**
```javascript
<html>
  <body>
    <UserProvider>
      {children}
      <Toaster position="top-right" />
    </UserProvider>
  </body>
</html>
```

**Features:**
- Wraps app in UserProvider for global auth state
- Includes react-hot-toast Toaster for notifications
- Applies Inter font from Google Fonts
- Imports global CSS (app/globals.css)

**Metadata:**
- Title: "Civic Issue System"
- Description: "A platform for managing and resolving civic issues"

---

## 8.2 Routing System

### Next.js App Router Structure

**Public Routes (No Authentication Required):**
- `/` - Landing page (app/page.js)
- `/login` - Login page (app/(auth)/login/page.js)
- `/register` - Registration page (app/(auth)/register/page.js)
- `/map` - Public issue map (app/map/page.js)
- `/public-dashboard` - Public statistics (app/public-dashboard/page.js)

**Citizen Routes (Role: citizen):**
- `/citizen/dashboard` - Citizen dashboard
- `/citizen/report` - Report new issue
- `/citizen/secure-dashboard` - Secure citizen dashboard

**Department Routes (Role: department):**
- `/department/dashboard` - Department dashboard
- `/department/issues` - Assigned issues list
- `/department/resolved` - Resolved issues list
- `/department/stats` - Department statistics
- `/department/profile` - Staff profile

**Municipal Routes (Role: municipal):**
- `/municipal/dashboard` - Municipal dashboard
- `/municipal/departments` - Department management
- `/municipal/sla-dashboard` - SLA monitoring

**Admin Routes (Role: admin):**
- `/admin/dashboard` - Admin dashboard
- `/admin/analytics` - Advanced analytics
- `/admin/departments` - Department CRUD
- `/admin/users` - User management
- `/admin/users/create` - Create user
- `/admin/reports` - Report generation
- `/admin/secure-dashboard` - Secure admin dashboard

**Issue Routes (Dynamic):**
- `/issues/[id]` - Issue detail page
- `/issues/[id]/edit` - Edit issue (if allowed)

### Route Groups

**Auth Group: (auth)**
- No layout applied
- Contains login and register pages
- Auto-redirects if already authenticated

---

## 8.3 Landing Page (app/page.js)

**Purpose:** Public-facing homepage for unauthenticated users

**Features:**
1. **Navigation Bar**
   - Logo/Title
   - Login button
   - Register button (primary CTA)

2. **Hero Section**
   - Main headline: "Report & Track Civic Issues"
   - Subheadline explaining platform purpose
   - Two CTAs: "Get Started" and "Sign In"
   - "View Issue Map" button

3. **How It Works Section**
   - Three feature cards:
     - Report Issue (with icon)
     - AI Processing (with icon)
     - Track Progress (with icon)

4. **Supporting Roles Section**
   - Four role cards:
     - Citizens
     - Municipal
     - Departments
     - Admins

5. **Footer**
   - Copyright
   - Brief description

**Auto-redirect Logic:**
- If user is authenticated, redirects to their role-based dashboard
- Uses useUser() hook to check authentication
- Shows loading state while checking

---

## 8.4 Authentication Pages

### Login Page (app/(auth)/login/page.js)

**Form Fields:**
- Email (required, type: email)
- Password (required, type: password with show/hide toggle)

**Features:**
- Show/hide password toggle with eye icon
- Error display (red banner)
- Loading state during submission
- Link to registration page
- Auto-redirect on success (handled by UserContext)

**Validation:**
- Client-side: HTML5 required attributes
- Server-side: Zod schema validation

**Submission Flow:**
1. User submits form
2. Calls UserContext.login(credentials)
3. Shows loading spinner
4. On success: UserContext handles redirect
5. On error: Shows error message with toast

### Registration Page (app/(auth)/register/page.js)

**Form Fields:**
- Full Name (required)
- Email (required, type: email)
- Password (required, min 6 chars, with show/hide toggle)
- Phone Number (optional, validated format)
- Street Address (optional)
- City (optional)
- State (optional)
- PIN Code (optional)

**Features:**
- Show/hide password toggle
- Real-time phone validation with visual feedback
- Error display
- Loading state
- Link to login page
- Auto-redirect on success

**Security:**
- Role is always set to 'citizen' (cannot be changed by user)
- No department field exposed
- Only admins can create non-citizen accounts

**Validation:**
- Client-side: HTML5 + custom phone validation
- Server-side: Zod schema validation

---

## 8.5 Citizen Dashboard Pages

### Citizen Dashboard (app/citizen/dashboard/page.js)

**Purpose:** Main dashboard for citizens to view and manage their reported issues

**Layout:**
- Uses DashboardLayout component
- Protected by DashboardProtection (allowedRoles: ['citizen'])

**Sections:**
1. **Header**
   - Welcome message with user name
   - Quick stats (total issues, pending, resolved)

2. **Quick Actions**
   - "Report New Issue" button (primary CTA)
   - "View Map" button

3. **My Issues List**
   - Displays all issues reported by the user
   - Each issue shows:
     - Report ID
     - Title
     - Status badge
     - Priority badge
     - Created date
     - Upvotes count
     - View details button

4. **Filters**
   - Filter by status (all, pending, in-progress, resolved)
   - Sort by date, priority, upvotes

**Data Fetching:**
- Fetches issues from GET /api/issues?reportedBy={userId}
- Real-time updates via polling or manual refresh

### Report Issue Page (app/citizen/report/page.js)

**Purpose:** Form for citizens to report new civic issues

**Form Sections:**

1. **Issue Details**
   - Title (required, 10-200 chars)
   - Description (required, 30-2000 chars)
   - Category (required, dropdown)
   - Subcategory (required, dynamic based on category)

2. **Location**
   - Address (required, text input)
   - Interactive map picker (LocationPicker component)
   - Auto-fill from map click
   - Coordinates captured automatically

3. **Images**
   - Upload up to 3 images
   - Image compression before upload
   - Preview thumbnails
   - Remove image option

**Components Used:**
- LocationPicker - Interactive map for location selection
- ImageUploader - Image upload with compression
- Category/Subcategory dropdowns from lib/schemas.js

**Submission Flow:**
1. User fills form
2. Images compressed and uploaded to Cloudinary
3. POST request to /api/issues
4. AI analysis triggered automatically
5. Issue assigned to department
6. Success message and redirect to dashboard

**Validation:**
- Client-side: Form validation with visual feedback
- Server-side: Zod schema validation (createIssueSchema)

---

## 8.6 Department Dashboard Pages

### Department Dashboard (app/department/dashboard/page.js)

**Purpose:** Main dashboard for department staff to manage assigned issues

**Layout:**
- Uses custom department layout (app/department/layout.js)
- Protected by DashboardProtection (allowedRoles: ['department'])

**Sections:**
1. **Statistics Cards**
   - Total assigned issues
   - Pending issues
   - In-progress issues
   - Resolved this month
   - Average resolution time
   - SLA compliance rate

2. **Priority Issues**
   - List of urgent and high-priority issues
   - Quick action buttons

3. **Recent Assignments**
   - Latest issues assigned to department
   - Status update options

4. **Performance Metrics**
   - Department performance chart
   - Staff leaderboard

**Data Fetching:**
- GET /api/issues/department - All department issues
- GET /api/issues/department/stats - Statistics

### Department Issues Page (app/department/issues/page.js)

**Purpose:** List and manage all assigned issues

**Features:**
1. **Filters**
   - Status filter (pending, assigned, in-progress)
   - Priority filter
   - Date range filter
   - Search by report ID or title

2. **Issue List**
   - Table or card view
   - Each issue shows:
     - Report ID
     - Title
     - Priority badge
     - Status badge
     - Assigned staff
     - SLA deadline
     - Action buttons

3. **Quick Actions**
   - Update status
   - Assign to staff
   - Add comment
   - View details

**Data Fetching:**
- GET /api/issues/department/assigned

### Department Resolved Page (app/department/resolved/page.js)

**Purpose:** View resolved issues and performance

**Features:**
- List of resolved issues
- Resolution time for each
- Citizen feedback/ratings
- Filter by date range
- Export to CSV

**Data Fetching:**
- GET /api/issues/department/resolved

### Department Stats Page (app/department/stats/page.js)

**Purpose:** Detailed performance analytics

**Features:**
- Performance charts (resolution time, SLA compliance)
- Staff performance comparison
- Monthly trends
- Ward-wise breakdown
- Badge achievements

**Data Fetching:**
- GET /api/issues/department/stats

---

## 8.7 Municipal Dashboard Pages

### Municipal Dashboard (app/municipal/dashboard/page.js)

**Purpose:** Overview of all departments and system-wide metrics

**Sections:**
1. **System-wide Statistics**
   - Total issues (all departments)
   - Pending issues
   - Overdue issues
   - Average resolution time
   - SLA compliance rate

2. **Department Performance**
   - Table showing each department:
     - Name
     - Active issues
     - Resolved this month
     - SLA compliance
     - Performance score
     - Rank

3. **Priority Alerts**
   - Urgent issues across all departments
   - Overdue issues
   - Escalated issues

4. **Recent Activity**
   - Latest issue updates
   - Status changes
   - Escalations

**Data Fetching:**
- GET /api/issues/admin - All issues
- GET /api/departments - All departments
- GET /api/admin/analytics/overview

### Municipal Departments Page (app/municipal/departments/page.js)

**Purpose:** Manage departments and view detailed performance

**Features:**
- List of all departments
- Department details (staff count, categories, contact)
- Performance metrics per department
- Assign/reassign issues
- View department workload

**Data Fetching:**
- GET /api/departments

### Municipal SLA Dashboard (app/municipal/sla-dashboard/page.js)

**Purpose:** Monitor SLA compliance and escalations

**Features:**
- SLA compliance by department
- Overdue issues list
- Escalation tracking
- Penalty points by department
- Trend analysis

**Data Fetching:**
- GET /api/sla
- GET /api/admin/analytics/workflow

---

## 8.8 Admin Dashboard Pages

### Admin Dashboard (app/admin/dashboard/page.js)

**Purpose:** Full system administration and oversight

**Sections:**
1. **System Overview**
   - Total users (by role)
   - Total issues
   - Total departments
   - System health

2. **Quick Actions**
   - Create user
   - Create department
   - Generate report
   - View analytics

3. **Recent Activity**
   - New registrations
   - New issues
   - Status changes

**Data Fetching:**
- GET /api/users/admin
- GET /api/issues/admin
- GET /api/departments

### Admin Analytics Page (app/admin/analytics/page.jsx)

**Purpose:** Advanced analytics and insights

**Features:**
1. **Overview Tab**
   - System-wide KPIs
   - Trend charts
   - Comparison metrics

2. **Departments Tab**
   - Department performance comparison
   - Workload distribution
   - SLA compliance by department

3. **Workflow Tab**
   - Issue lifecycle analysis
   - Bottleneck identification
   - Average time per status

4. **Stuck Issues Tab**
   - Issues stuck in status
   - Long-pending issues
   - Escalation candidates

5. **Trends Tab**
   - Historical trends
   - Seasonal patterns
   - Predictive analytics

**Data Fetching:**
- GET /api/admin/analytics/overview
- GET /api/admin/analytics/departments
- GET /api/admin/analytics/workflow
- GET /api/admin/analytics/stuck
- GET /api/admin/analytics/trends

### Admin Users Page (app/admin/users/page.js)

**Purpose:** User management (CRUD operations)

**Features:**
- List all users (paginated)
- Filter by role
- Search by name/email
- View user details
- Edit user
- Deactivate/activate user
- Delete user

**Data Fetching:**
- GET /api/users/admin

### Admin Create User Page (app/admin/users/create/page.js)

**Purpose:** Create department or municipal staff accounts

**Form Fields:**
- Name (required)
- Email (required)
- Password (required)
- Phone (optional)
- Role (required, dropdown: department or municipal)
- Department (required if role = department)
- Address (optional)

**Submission:**
- POST /api/admin/create-user

### Admin Departments Page (app/admin/departments/page.js)

**Purpose:** Department management (CRUD operations)

**Features:**
- List all departments
- Create new department
- Edit department
- Deactivate/activate department
- View department staff
- Assign categories

**Data Fetching:**
- GET /api/departments
- POST /api/departments (create)
- PATCH /api/departments/[id] (update)
- DELETE /api/departments/[id] (delete)

### Admin Reports Page (app/admin/reports/page.js)

**Purpose:** Generate and download reports

**Report Types:**
- Issues report (all issues with filters)
- Users report (all users by role)
- Departments report (performance metrics)
- Performance report (staff and department performance)

**Features:**
- Date range selection
- Filter options
- Export formats (CSV, PDF)
- Scheduled reports

**Data Fetching:**
- GET /api/reports?type={type}&filters={filters}
- GET /api/reports/download?type={type}

---


# 9. BACKEND API ARCHITECTURE

## 9.1 API Route Structure

All API routes are in `app/api/` directory using Next.js App Router conventions.

### Route File Pattern
```javascript
// app/api/[resource]/route.js
export async function GET(req) { }
export async function POST(req) { }
export async function PATCH(req) { }
export async function DELETE(req) { }
```

### Dynamic Routes
```javascript
// app/api/[resource]/[id]/route.js
export async function GET(req, { params }) {
  const { id } = params;
}
```

---

## 9.2 Complete API Endpoint Reference

### Authentication Endpoints

#### POST /api/auth/register
**Purpose:** Register new citizen account
**Auth:** None
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "pincode": "62701"
  }
}
```
**Response:** `{ user, redirectUrl }`
**Sets Cookie:** token (JWT)

#### POST /api/auth/login
**Purpose:** Login user
**Auth:** None
**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:** `{ user, redirectUrl }`
**Sets Cookie:** token (JWT)

#### POST /api/auth/logout
**Purpose:** Logout user
**Auth:** Required
**Response:** `{ message: "Logged out successfully" }`
**Clears Cookie:** token

#### GET /api/auth/me
**Purpose:** Get current user
**Auth:** Required
**Response:** `{ user }` (with populated department if applicable)

---

### Issue Endpoints

#### POST /api/issues
**Purpose:** Create new issue
**Auth:** Required (any role)
**Body:**
```json
{
  "title": "Large pothole on Main Street",
  "description": "Detailed description...",
  "category": "roads-infrastructure",
  "subcategory": "Pothole",
  "location": {
    "address": "Main St & 5th Ave",
    "coordinates": { "lat": 39.7817, "lng": -89.6501 },
    "city": "Springfield",
    "state": "IL",
    "pincode": "62701"
  },
  "images": ["https://cloudinary.com/..."]
}
```
**Process:**
1. Validates with createIssueSchema
2. Triggers AI analysis (category, priority, sentiment)
3. Auto-assigns department based on category
4. Calculates SLA deadline based on priority
5. Creates StateHistory entry
6. Sends email notification to department
**Response:** `{ issue }`

#### GET /api/issues
**Purpose:** Get all issues (admin/municipal only)
**Auth:** Required (admin, municipal)
**Query Params:**
- `status` - Filter by status
- `priority` - Filter by priority
- `category` - Filter by category
- `department` - Filter by department
- `reportedBy` - Filter by reporter
- `page` - Pagination
- `limit` - Items per page
**Response:** `{ issues, total, page, pages }`

#### GET /api/issues/[id]
**Purpose:** Get single issue by ID
**Auth:** Required
**Access Control:**
- Citizens: Only their own issues
- Department: Only their department's issues
- Municipal/Admin: All issues
**Response:** `{ issue }` (with populated references)

#### PATCH /api/issues/[id]
**Purpose:** Update issue
**Auth:** Required (department, municipal, admin)
**Body:** Partial issue object
**Response:** `{ issue }`

#### DELETE /api/issues/[id]
**Purpose:** Delete issue
**Auth:** Required (admin only)
**Response:** `{ message: "Issue deleted" }`

---

### Issue Status Management

#### PATCH /api/issues/[id]/update-status
**Purpose:** Update issue status
**Auth:** Required (department, municipal, admin)
**Body:**
```json
{
  "status": "in-progress",
  "comment": "Work started on pothole repair"
}
```
**Process:**
1. Validates status transition
2. Updates issue status
3. Creates StateHistory entry
4. Sends notification to reporter
5. Updates performance metrics
**Response:** `{ issue }`

#### PATCH /api/issues/[id]/priority
**Purpose:** Override issue priority
**Auth:** Required (municipal, admin)
**Body:**
```json
{
  "priority": "urgent"
}
```
**Process:**
1. Updates priority
2. Records who overrode and when
3. Recalculates SLA deadline
**Response:** `{ issue }`

#### PATCH /api/issues/[id]/assign
**Purpose:** Assign issue to staff
**Auth:** Required (department, municipal, admin)
**Body:**
```json
{
  "assignedTo": "userId",
  "assignedStaff": "staffId"
}
```
**Response:** `{ issue }`

---

### Issue Engagement

#### POST /api/issues/[id]/upvote
**Purpose:** Upvote/remove upvote on issue
**Auth:** Required (any role)
**Process:**
1. Checks if user already upvoted
2. If yes: removes upvote
3. If no: adds upvote
4. Uses atomic operation (Issue.addUpvote or Issue.removeUpvote)
**Response:** `{ upvotes, upvoted }`

#### POST /api/issues/[id]/rate
**Purpose:** Rate resolved issue
**Auth:** Required (issue reporter only)
**Body:**
```json
{
  "rating": 4,
  "comment": "Good work!",
  "isResolved": true
}
```
**Process:**
1. Validates reporter is the one who reported
2. Validates issue is resolved
3. Saves feedback
4. If isResolved = false, reopens issue
**Response:** `{ issue }`

#### POST /api/issues/[id]/quick-action
**Purpose:** Quick status update with predefined actions
**Auth:** Required (department, municipal, admin)
**Body:**
```json
{
  "action": "start-work" | "complete" | "reject",
  "comment": "Optional comment",
  "rejectionReason": "Required if action = reject"
}
```
**Response:** `{ issue }`

---

### Department-Specific Issue Endpoints

#### GET /api/issues/department
**Purpose:** Get all issues for user's department
**Auth:** Required (department)
**Query Params:** status, priority, page, limit
**Response:** `{ issues, total }`

#### GET /api/issues/department/assigned
**Purpose:** Get assigned issues for department
**Auth:** Required (department)
**Response:** `{ issues }`

#### GET /api/issues/department/resolved
**Purpose:** Get resolved issues for department
**Auth:** Required (department)
**Response:** `{ issues }`

#### GET /api/issues/department/stats
**Purpose:** Get department statistics
**Auth:** Required (department)
**Response:**
```json
{
  "total": 150,
  "pending": 20,
  "assigned": 15,
  "inProgress": 10,
  "resolved": 105,
  "averageResolutionTime": 36.5,
  "slaCompliance": 92.5,
  "overdueIssues": 3
}
```

---

### Admin Issue Endpoints

#### GET /api/issues/admin
**Purpose:** Get all issues with advanced filters
**Auth:** Required (admin, municipal)
**Query Params:** All filters + sorting + pagination
**Response:** `{ issues, total, stats }`

#### GET /api/issues/public
**Purpose:** Get public issues for map view
**Auth:** None
**Query Params:** bounds (map bounds), category
**Response:** `{ issues }` (anonymized data)

#### POST /api/issues/check-duplicate
**Purpose:** Check for duplicate issues
**Auth:** Required
**Body:**
```json
{
  "title": "Pothole on Main St",
  "location": { "lat": 39.7817, "lng": -89.6501 }
}
```
**Process:**
1. Searches for similar titles (fuzzy match)
2. Searches for nearby issues (within 100m radius)
3. Returns potential duplicates
**Response:** `{ duplicates: [] }`

---

### Department Endpoints

#### GET /api/departments
**Purpose:** Get all departments
**Auth:** Required (any role)
**Response:** `{ departments }`

#### POST /api/departments
**Purpose:** Create new department
**Auth:** Required (admin)
**Body:**
```json
{
  "name": "Roads & Infrastructure Department",
  "description": "Handles road maintenance",
  "contactEmail": "roads@city.gov",
  "contactPhone": "+1234567890",
  "categories": ["roads-infrastructure", "traffic-signage"]
}
```
**Response:** `{ department }`

#### GET /api/departments/[id]
**Purpose:** Get department by ID
**Auth:** Required
**Response:** `{ department }` (with populated staff)

#### PATCH /api/departments/[id]
**Purpose:** Update department
**Auth:** Required (admin)
**Body:** Partial department object
**Response:** `{ department }`

#### DELETE /api/departments/[id]
**Purpose:** Delete department
**Auth:** Required (admin)
**Response:** `{ message: "Department deleted" }`

---

### User Management Endpoints

#### GET /api/users/admin
**Purpose:** Get all users
**Auth:** Required (admin, municipal)
**Query Params:** role, page, limit, search
**Response:** `{ users, total }`

#### POST /api/admin/create-user
**Purpose:** Create department or municipal staff
**Auth:** Required (admin)
**Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@city.gov",
  "password": "password123",
  "phone": "+1234567890",
  "role": "department",
  "department": "departmentId"
}
```
**Response:** `{ user }`

#### GET /api/users/[id]
**Purpose:** Get user by ID
**Auth:** Required (admin or self)
**Response:** `{ user }`

#### PATCH /api/users/[id]
**Purpose:** Update user
**Auth:** Required (admin or self)
**Body:** Partial user object
**Response:** `{ user }`

#### DELETE /api/users/[id]
**Purpose:** Delete user
**Auth:** Required (admin)
**Response:** `{ message: "User deleted" }`

---

### Analytics Endpoints

#### GET /api/admin/analytics/overview
**Purpose:** System-wide analytics overview
**Auth:** Required (admin, municipal)
**Response:**
```json
{
  "totalIssues": 1500,
  "pendingIssues": 150,
  "resolvedIssues": 1200,
  "averageResolutionTime": 42.5,
  "slaCompliance": 89.5,
  "issuesByCategory": { ... },
  "issuesByPriority": { ... },
  "issuesByStatus": { ... },
  "trendsLastMonth": { ... }
}
```

#### GET /api/admin/analytics/departments
**Purpose:** Department performance comparison
**Auth:** Required (admin, municipal)
**Response:**
```json
{
  "departments": [
    {
      "name": "Roads & Infrastructure",
      "totalIssues": 500,
      "resolved": 450,
      "averageResolutionTime": 38.5,
      "slaCompliance": 92.0,
      "performanceScore": 87.5,
      "rank": 1
    }
  ]
}
```

#### GET /api/admin/analytics/workflow
**Purpose:** Issue workflow analysis
**Auth:** Required (admin, municipal)
**Response:**
```json
{
  "averageTimeByStatus": {
    "pending": 12.5,
    "assigned": 8.0,
    "in-progress": 24.5,
    "resolved": 0
  },
  "bottlenecks": [ ... ],
  "escalationRate": 5.2
}
```

#### GET /api/admin/analytics/stuck
**Purpose:** Stuck issues analysis
**Auth:** Required (admin, municipal)
**Response:**
```json
{
  "stuckIssues": [
    {
      "issue": { ... },
      "daysInStatus": 15,
      "status": "in-progress",
      "reason": "No updates for 15 days"
    }
  ]
}
```

#### GET /api/admin/analytics/trends
**Purpose:** Historical trends
**Auth:** Required (admin, municipal)
**Query Params:** startDate, endDate, granularity (day/week/month)
**Response:**
```json
{
  "trends": [
    {
      "date": "2024-01",
      "issuesReported": 120,
      "issuesResolved": 110,
      "averageResolutionTime": 40.5
    }
  ]
}
```

---

### Report Endpoints

#### GET /api/reports
**Purpose:** Generate reports
**Auth:** Required (admin, municipal)
**Query Params:**
- `type` - issues | users | departments | performance
- `startDate` - Filter start date
- `endDate` - Filter end date
- `format` - json | csv
**Response:** Report data in requested format

#### GET /api/reports/download
**Purpose:** Download report as file
**Auth:** Required (admin, municipal)
**Query Params:** Same as /api/reports
**Response:** File download (CSV or PDF)

---

### Utility Endpoints

#### GET /api/health
**Purpose:** Health check
**Auth:** None
**Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### POST /api/upload
**Purpose:** Upload image to Cloudinary
**Auth:** Required
**Body:** FormData with image file
**Process:**
1. Validates file type (image only)
2. Validates file size (max 5MB)
3. Compresses image
4. Uploads to Cloudinary
**Response:**
```json
{
  "url": "https://res.cloudinary.com/.../image.jpg",
  "publicId": "civic-issues/abc123"
}
```

#### GET /api/notifications
**Purpose:** Get user notifications
**Auth:** Required
**Query Params:** read (true/false), page, limit
**Response:** `{ notifications, unreadCount }`

#### PATCH /api/notifications/[id]
**Purpose:** Mark notification as read
**Auth:** Required
**Response:** `{ notification }`

#### GET /api/stats
**Purpose:** Public statistics
**Auth:** None
**Response:**
```json
{
  "totalIssues": 1500,
  "resolvedIssues": 1200,
  "activeUsers": 500,
  "departments": 8
}
```

#### GET /api/public-dashboard
**Purpose:** Public dashboard data
**Auth:** None
**Response:**
```json
{
  "stats": { ... },
  "recentIssues": [ ... ],
  "topCategories": [ ... ]
}
```

#### GET /api/sla
**Purpose:** SLA monitoring data
**Auth:** Required (municipal, admin)
**Response:**
```json
{
  "overallCompliance": 89.5,
  "byDepartment": [ ... ],
  "overdueIssues": [ ... ],
  "escalatedIssues": [ ... ]
}
```

#### GET /api/performance
**Purpose:** Performance metrics
**Auth:** Required (department, municipal, admin)
**Response:**
```json
{
  "staff": [ ... ],
  "departments": [ ... ],
  "leaderboard": [ ... ]
}
```

#### POST /api/ai
**Purpose:** AI analysis for issue
**Auth:** Required
**Body:**
```json
{
  "title": "Pothole on Main St",
  "description": "Large pothole causing issues"
}
```
**Response:**
```json
{
  "category": "roads",
  "priority": "high",
  "sentiment": "negative",
  "keywords": ["pothole", "road", "damage"]
}
```

#### GET /api/citizen-engagement
**Purpose:** Citizen engagement metrics
**Auth:** Required (municipal, admin)
**Response:**
```json
{
  "totalCitizens": 500,
  "activeReporters": 250,
  "averageUpvotes": 3.5,
  "feedbackRate": 75.0
}
```

---

## 9.3 API Middleware Stack

### Request Flow
1. **CORS Handling** (Next.js built-in)
2. **Body Parsing** (Next.js built-in)
3. **Authentication Check** (lib/auth.js - authMiddleware)
4. **Role Authorization** (lib/auth.js - roleMiddleware)
5. **Request Validation** (lib/utils.js - withValidation)
6. **Database Connection** (lib/mongodb.js - connectDB)
7. **Route Handler** (actual endpoint logic)
8. **Error Handling** (lib/error-handler.js - handleAPIError)
9. **Response Formatting**

### Middleware Application Pattern
```javascript
// Example: Protected admin endpoint with validation
import { requireAdmin } from '@/lib/auth';
import { withValidation } from '@/lib/utils';
import { createIssueSchema } from '@/lib/schemas';

export const POST = requireAdmin()(
  withValidation(createIssueSchema)(
    async (req) => {
      // Handler logic
      const body = req.validatedBody;
      // ...
    }
  )
);
```

---

# 10. CORE FEATURES & WORKFLOWS

## 10.1 Issue Reporting Workflow

**Step 1: Citizen Accesses Report Form**
- Page: /citizen/report
- Component: Report form with LocationPicker and ImageUploader

**Step 2: Citizen Fills Form**
- Enters title, description
- Selects category and subcategory
- Picks location on map or enters address
- Uploads up to 3 images (compressed automatically)

**Step 3: Form Submission**
- Frontend validates inputs
- Images uploaded to Cloudinary
- POST request to /api/issues

**Step 4: Backend Processing**
- Validates with Zod schema
- Triggers AI analysis (OpenAI GPT-3.5)
  - Analyzes title + description
  - Returns category, priority, sentiment, keywords
- Auto-assigns department based on category (lib/department-mapper.js)
- Calculates SLA deadline based on priority
- Generates unique reportId (R00001, R00002...)
- Saves issue to database

**Step 5: Post-Creation Actions**
- Creates StateHistory entry (status: 'submitted')
- Sends email to department staff
- Sends confirmation email to citizen
- Creates notification for department

**Step 6: Response**
- Returns created issue
- Frontend shows success message
- Redirects to citizen dashboard

---

## 10.2 Issue Status Update Workflow

**Step 1: Department Staff Views Issue**
- Page: /department/issues
- Sees list of assigned issues

**Step 2: Staff Clicks Update Status**
- Modal or form appears
- Selects new status (assigned → in-progress → resolved)
- Adds optional comment

**Step 3: Status Update Submission**
- PATCH request to /api/issues/[id]/update-status
- Body: { status, comment }

**Step 4: Backend Processing**
- Validates status transition
- Updates issue.status
- Updates issue.updatedAt
- Creates StateHistory entry
- If status = 'resolved':
  - Calculates resolutionTime
  - Updates StaffPerformance
  - Updates DepartmentPerformance
  - Sends rating request email to citizen

**Step 5: Notifications**
- Creates notification for citizen
- Sends email to citizen with status update
- If escalated: notifies department head

**Step 6: Response**
- Returns updated issue
- Frontend updates UI
- Shows success toast

---

## 10.3 Issue Escalation Workflow

**Trigger Conditions:**
- SLA deadline exceeded
- Issue stuck in status for too long
- Manual escalation by municipal officer

**Automated Escalation (via node-cron):**
1. Cron job runs every hour
2. Queries issues where:
   - sla.deadline < now
   - status not in ['resolved', 'rejected']
   - escalationLevel < 3
3. For each overdue issue:
   - Calls issue.escalate(reason)
   - Increments escalationLevel
   - Sets status to 'escalated'
   - Adds to escalationHistory
   - Adds penalty points
   - Sends notification to escalation target

**Escalation Levels:**
- Level 1: Department Staff (initial assignment)
- Level 2: Department Head (first escalation)
- Level 3: Commissioner/Mayor (final escalation)

**Manual Escalation:**
- Municipal officer clicks "Escalate" button
- Provides reason
- POST request to /api/issues/[id]/escalate
- Same process as automated

---

## 10.4 Upvote Workflow

**Step 1: User Clicks Upvote**
- Component: IssueCard or Issue detail page
- Shows upvote count and button

**Step 2: Frontend Request**
- POST request to /api/issues/[id]/upvote
- No body required

**Step 3: Backend Processing**
- Uses atomic operation (Issue.addUpvote or Issue.removeUpvote)
- Checks if user already upvoted:
  - If yes: removes upvote (decrements count, removes from array)
  - If no: adds upvote (increments count, adds to array)
- Prevents race conditions with MongoDB atomic operations

**Step 4: Priority Recalculation**
- If upvotes reach threshold (3, 5, 10):
  - Recalculates priority using lib/priority-calculator.js
  - May upgrade priority (medium → high → urgent)
  - Updates SLA deadline if priority changed

**Step 5: Response**
- Returns { upvotes, upvoted }
- Frontend updates UI immediately

---

## 10.5 Feedback & Rating Workflow

**Trigger:** Issue status changes to 'resolved'

**Step 1: Email Sent**
- System sends rating request email to citizen
- Email contains:
  - Issue details
  - Before/after photos (if available)
  - Rating link

**Step 2: Citizen Accesses Rating Form**
- Clicks link in email or views on dashboard
- Modal appears with rating form

**Step 3: Citizen Submits Feedback**
- Rates 1-5 stars
- Answers: "Was the issue actually resolved?" (Yes/No)
- Adds optional comment
- POST request to /api/issues/[id]/rate

**Step 4: Backend Processing**
- Validates citizen is the reporter
- Validates issue is resolved
- Saves feedback to issue.feedback
- If isResolved = false:
  - Changes status to 'reopened'
  - Creates StateHistory entry
  - Notifies department
- Updates StaffPerformance based on rating

**Step 5: Response**
- Returns updated issue
- Frontend shows thank you message

---

## 10.6 Department Assignment Logic

**File:** lib/department-mapper.js

**Category to Department Mapping:**
```javascript
{
  'roads-infrastructure': 'Roads & Infrastructure Department',
  'street-lighting': 'Street Lighting Department',
  'waste-management': 'Sanitation & Waste Management Department',
  'water-drainage': 'Water & Drainage Department',
  'parks-public-spaces': 'Parks & Public Spaces Department',
  'traffic-signage': 'Traffic & Signage Department',
  'public-health-safety': 'Public Health & Safety Department',
  'other': 'General Administration'
}
```

**Assignment Process:**
1. Issue created with category
2. getDepartmentForCategory(category, subcategory) called
3. Checks if subcategory has specific override
4. Returns department name
5. Queries Department model to get ObjectId
6. Sets issue.assignedDepartment

**Fallback:** If department not found, assigns to 'General Administration'

---

## 10.7 Priority Calculation Logic

**File:** lib/priority-calculator.js

**Function:** calculatePriority(issueData)

**Factors:**
1. **Category Priority** (0-25 points)
   - water-drainage: +20
   - public-health-safety: +25
   - street-lighting: +15
   - traffic-signage: +15
   - roads-infrastructure: +10
   - waste-management: +10
   - parks-public-spaces: +5
   - other: +0

2. **Subcategory Boost** (+20 points if urgent)
   - Water Leakage, Street Flooding, Sewage Overflow
   - Stray Animals, Dead Animal, Pest Infestation
   - Unsafe Structure, Damaged Manhole Cover
   - Malfunctioning Signal

3. **Keyword Detection** (+10 per keyword)
   - urgent, emergency, immediate, critical, danger
   - dangerous, accident, injury, injured, fire
   - flood, leaking, broken, severe, major

4. **Upvote Escalation**
   - 10+ upvotes: +30 points
   - 5-9 upvotes: +20 points
   - 3-4 upvotes: +10 points

5. **Description Length**
   - 300+ characters: +5 points (detailed = serious)

**Score to Priority Mapping:**
- 80+: urgent
- 60-79: high
- 40-59: medium
- 0-39: low

**SLA Deadlines:**
- urgent: 24 hours
- high: 48 hours
- medium: 72 hours
- low: 120 hours

---

## 10.8 AI Analysis Workflow

**File:** lib/ai.js

**Function:** AIAnalyzer.analyzeIssue(issueData)

**Process:**
1. Constructs prompt with title + description
2. Calls OpenAI GPT-3.5-turbo API
3. Requests JSON response with:
   - category (water/electricity/roads/garbage/parks/other)
   - priority (low/medium/high/urgent)
   - sentiment (positive/neutral/negative)
   - keywords (array of relevant terms)
4. Parses AI response
5. Returns analysis object

**Fallback:** If AI fails or API unavailable:
- Uses keyword-based categorization
- Uses keyword-based priority
- Sets sentiment to 'neutral'
- Extracts keywords using regex

**Integration:**
- Called automatically when issue is created
- Results stored in issue.aiAnalysis
- Can be used to override user-selected category
- Influences priority calculation

---

