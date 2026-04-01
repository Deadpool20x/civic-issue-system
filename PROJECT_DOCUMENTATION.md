# CivicPulse — Complete Project Documentation

Civic Issue Management System for Anand District, Gujarat.
A full-stack Next.js 14 web application enabling citizens to report, track,
and resolve civic issues through a structured multi-role governance platform.

---

## Table of Contents

1. Project Overview
2. Tech Stack and Technologies
3. System Architecture
4. Folder and File Structure
5. User Roles and Permissions
6. Geographic System — Wards and Zones
7. Database Design and Models
8. Authentication and Authorization
9. Backend — API Routes
10. Frontend — All Pages and Dashboards
11. UI System and Design Language
12. Components Library
13. Core Business Logic
14. AI and Integrations
15. Notification System
16. SLA and Escalation System
17. Performance Tracking System
18. PWA and Internationalization
19. How Everything Connects
20. Environment Variables and Configuration
21. Scripts and Utilities
22. Testing
23. Deployment

---

## 1. Project Overview

CivicPulse is a digital governance platform built for Anand District, Gujarat. It bridges the gap
between citizens and municipal departments by providing a structured, transparent, and accountable
system for reporting and resolving civic issues.

### What It Does

- Citizens report civic problems (potholes, broken lights, garbage, water leaks, etc.) with photos,
  location, and description
- The system automatically assigns the issue to the correct ward and department based on GPS
  coordinates and issue category
- Field officers receive assignments and resolve issues in the field
- Department managers oversee their department's two wards (north and south)
- The Municipal Commissioner has a city-wide operations view with AI-generated briefings
- System Admin manages users, departments, and system configuration

### Key Differentiators

- Automatic ward assignment from GPS — citizens never pick a ward manually
- AI-powered issue analysis using Google Gemini and Roboflow (computer vision)
- SLA tracking with 3-level escalation system
- Citizen verification loop — citizens confirm if their issue was actually fixed
- Performance tracking with badges and penalty points for staff
- PWA support — works as a mobile app on any device
- Multi-language support via i18next

---

## 2. Tech Stack and Technologies

### Frontend

| Technology              | Version   | Purpose                              |
|-------------------------|-----------|--------------------------------------|
| Next.js                 | 14.2.15   | Full-stack React framework (App Router) |
| React                   | 18.3.1    | UI library                           |
| TailwindCSS             | 3.4.19    | Utility-first CSS framework          |
| Leaflet + react-leaflet | 1.9.4 / 4.2.1 | Interactive maps                 |
| react-hot-toast         | 2.4.1     | Toast notifications                  |
| i18next + react-i18next | 25.x / 16.x | Internationalization               |
| Lottie Player           | —         | Animated illustrations               |
| recharts                | —         | Charts and analytics graphs          |
| lucide-react            | —         | Icon library                         |

### Backend

| Technology      | Version | Purpose                              |
|-----------------|---------|--------------------------------------|
| Next.js API Routes | 14.2.15 | Serverless API endpoints          |
| Node.js         | >=18.17 | Runtime environment                  |
| jsonwebtoken    | 9.0.3   | JWT token generation                 |
| jose            | 6.2.0   | JWT verification in Edge middleware  |
| bcryptjs        | 3.0.3   | Password hashing (10 salt rounds)    |

### Database

| Technology | Version | Purpose                              |
|------------|---------|--------------------------------------|
| MongoDB    | 7.1.0   | NoSQL document database              |
| Mongoose   | 8.1.0   | MongoDB ODM with schema validation   |

### External Services

| Service                    | SDK                        | Purpose                    |
|----------------------------|----------------------------|----------------------------|
| Cloudinary                 | cloudinary 2.7.0           | Image and video storage    |
| Resend                     | resend 6.7.0               | Transactional email        |
| Google Generative AI       | @google/generative-ai 0.24.1 | Gemini AI analysis       |
| Roboflow                   | HTTP API                   | Computer vision detection  |
| Mapbox                     | NEXT_PUBLIC_MAPBOX_TOKEN   | Map tiles                  |

### Dev Tools

| Tool                    | Purpose                              |
|-------------------------|--------------------------------------|
| Jest 29                 | Unit testing                         |
| @testing-library/react  | Component testing                    |
| Babel                   | JS transpilation for tests           |
| ESLint                  | Code linting                         |
| PostCSS + Autoprefixer  | CSS processing                       |
| next-pwa                | Progressive Web App support          |

---

## 3. System Architecture

### High-Level Architecture

```
+-------------------------------------------------------------+
|                     BROWSER / PWA                           |
|  Next.js 14 App Router (React 18 + TailwindCSS)             |
|  +----------+ +----------+ +----------+ +--------------+   |
|  | Citizen  | |  Field   | |  Dept    | | Commissioner |   |
|  |Dashboard | | Officer  | | Manager  | |  Dashboard   |   |
|  +----------+ +----------+ +----------+ +--------------+   |
+-------------------------+-----------------------------------+
                          | HTTP / Fetch API (cookies)
+-------------------------v-----------------------------------+
|         Next.js Middleware (middleware.js)                  |
|  JWT verification via jose · Role-based route protection   |
+-------------------------+-----------------------------------+
                          |
+-------------------------v-----------------------------------+
|         Next.js API Routes (/app/api/**)                   |
|  Auth · Issues · Departments · Users · Admin · Reports     |
|  Notifications · Stats · Upload · SLA · AI · Wards         |
+------+------------------+------------------+---------------+
       |                  |                  |
+------v------+  +--------v------+  +--------v---------------+
|  MongoDB    |  |  Cloudinary   |  |  External APIs         |
|  (Mongoose) |  |  (Images)     |  |  Gemini · Roboflow     |
|  6 Models   |  |               |  |  Resend (Email)        |
+-------------+  +---------------+  +------------------------+
```

### Issue Creation Flow

```
Citizen fills report form
        |
POST /api/issues
        |
Auth check (JWT cookie) --> 401 if missing
        |
Role check (CITIZEN only) --> 403 if wrong role
        |
Validate input (title >= 5 chars, description >= 10 chars, valid category)
        |
GPS coordinates --> getZoneFromCoordinates() --> 'north' or 'south'
        |
category --> getDepartmentCodeForCategory() --> 'roads', 'water', etc.
        |
zone + deptCode --> getWardByZoneDept() --> wardId (e.g. 'ward-3')
        |
Find FIELD_OFFICER with wardId --> auto-assign if found
        |
Calculate SLA deadline (urgent=24h, high=48h, medium=72h, low=120h)
        |
Issue.create() --> MongoDB
        |
createNotification() --> notify assigned officer
        |
Return { reportId, ward, status }
```

### Authentication Flow

```
User submits login form
        |
POST /api/auth/login
        |
User.findOne({ email }).select('+password')
        |
bcrypt.compare(password, hash)
        |
generateToken() --> JWT { userId, role, wardId, departmentId, isActive }
        |
Set httpOnly cookie 'token' (7 days, sameSite: lax)
        |
Client UserContext fetches GET /api/auth/me on mount
        |
User state available globally via useUser() hook
```

---

## 4. Folder and File Structure

```
civic-issue-system/
|
+-- app/                          Next.js App Router
|   +-- (auth)/                   Auth pages group (no layout)
|   |   +-- login/page.js         Login page
|   |   +-- register/page.js      Registration page
|   |   +-- forgot-password/page.js  Password reset request
|   |
|   +-- api/                      All backend API routes
|   |   +-- auth/
|   |   |   +-- login/route.js    POST login
|   |   |   +-- register/route.js POST register
|   |   |   +-- logout/route.js   POST logout
|   |   |   +-- me/route.js       GET current user
|   |   |   +-- forgot-password/  POST send reset email
|   |   |   +-- reset-password/   POST reset with token
|   |   |   +-- otp/              POST send OTP
|   |   |   +-- verify-otp/       POST verify OTP
|   |   |
|   |   +-- issues/
|   |   |   +-- route.js          GET (role-filtered) / POST (create)
|   |   |   +-- [id]/             GET detail / PATCH status, priority, upvote
|   |   |   +-- admin/            GET all issues (admin view)
|   |   |   +-- department/       GET department issues
|   |   |   +-- stats/            GET issue statistics
|   |   |   +-- ward-stats/       GET per-ward statistics
|   |   |   +-- nearby/           GET issues near coordinates
|   |   |   +-- track/            GET issue by reportId (public)
|   |   |   +-- check-duplicate/  POST duplicate detection
|   |   |   +-- detect-image/     POST AI image analysis
|   |   |   +-- public/           GET public issue feed
|   |   |
|   |   +-- departments/
|   |   |   +-- route.js          GET all / POST create
|   |   |   +-- [id]/route.js     GET / PATCH / DELETE
|   |   |
|   |   +-- users/
|   |   |   +-- [id]/route.js     GET / PATCH / DELETE
|   |   |   +-- create/route.js   POST create user
|   |   |   +-- admin/route.js    GET users list (admin)
|   |   |
|   |   +-- admin/
|   |   |   +-- analytics/        GET system analytics
|   |   |   +-- create-user/      POST create user (admin)
|   |   |   +-- users/            GET users with stats
|   |   |
|   |   +-- commissioner/
|   |   |   +-- briefing/         GET AI-generated daily briefing
|   |   |
|   |   +-- notifications/route.js  GET / PATCH (mark read)
|   |   +-- upload/route.js         POST file upload to Cloudinary
|   |   +-- reports/route.js        GET report generation
|   |   +-- stats/route.js          GET system-wide stats
|   |   +-- sla/route.js            GET SLA monitoring data
|   |   +-- performance/route.js    GET staff performance
|   |   +-- public-dashboard/       GET public stats
|   |   +-- ai/route.js             POST AI analysis
|   |   +-- wards/route.js          GET ward configuration
|   |   +-- health/route.js         GET health check
|   |   +-- cron/reminders/         POST cron job for reminders
|   |   +-- citizen-engagement/     GET engagement stats
|   |
|   +-- citizen/
|   |   +-- dashboard/page.js    Citizen dashboard
|   |   +-- report/page.js       Report new issue form
|   |
|   +-- department/
|   |   +-- dashboard/page.js    Department manager dashboard
|   |   +-- issues/page.js       Issues list
|   |   +-- issues/[id]/page.js  Issue detail
|   |   +-- resolved/page.js     Resolved issues
|   |   +-- stats/page.js        Department statistics
|   |   +-- sla-monitoring/page.js  SLA monitoring
|   |   +-- profile/page.js      Staff profile
|   |   +-- departments/page.js  Department info
|   |   +-- layout.js            Department layout wrapper
|   |
|   +-- field-officer/
|   |   +-- dashboard/page.js    Field officer dashboard
|   |   +-- issues/page.js       Ward issues list
|   |   +-- issues/[id]/page.js  Issue detail with resolution upload
|   |
|   +-- commissioner/
|   |   +-- dashboard/page.js    Commissioner city operations center
|   |   +-- issues/page.js       All issues view
|   |   +-- staff/page.js        Staff management
|   |   +-- create-staff/page.js Create staff account
|   |
|   +-- municipal/
|   |   +-- dashboard/page.js    Municipal dashboard
|   |   +-- departments/page.js  Department management
|   |   +-- sla-dashboard/page.js  SLA monitoring
|   |
|   +-- admin/
|   |   +-- dashboard/page.js    System admin dashboard
|   |   +-- issues/page.js       All issues (read-only)
|   |   +-- issues/[id]/page.js  Issue detail
|   |   +-- users/page.js        User management
|   |   +-- users/[id]/page.js   User detail / edit
|   |   +-- users/create/page.js Create user
|   |   +-- departments/page.js  Department management
|   |   +-- analytics/page.jsx   Analytics dashboard
|   |   +-- create-user/page.js  Create user (shortcut)
|   |
|   +-- issues/[id]/page.js      Public issue detail page
|   +-- map/page.js              Public interactive map
|   +-- track/page.js            Public issue tracker by ID
|   +-- public-dashboard/page.js Public statistics dashboard
|   +-- know-your-district/page.js  District information
|   +-- privacy-policy/page.js   Privacy policy
|   +-- terms-of-service/page.js Terms of service
|   +-- page.js                  Home / landing page
|   +-- layout.js                Root layout (UserProvider + Toaster)
|   +-- globals.css              Global CSS + Tailwind base
|
+-- components/                  Reusable React components
|   +-- ui/                      Base UI primitives
|   |   +-- Card.jsx
|   |   +-- PrimaryButton.jsx
|   |   +-- SpotlightCard.jsx
|   |   +-- StarBorderButton.jsx
|   |   +-- StatCard.jsx
|   |
|   +-- DashboardLayout.js       Sidebar + main layout wrapper
|   +-- DashboardProtection.js   Role-based access guard
|   +-- PageHeader.js            Page title + subtitle + actions
|   +-- StatCard.js              Statistics display card
|   +-- IssueCard.js             Issue summary card
|   +-- IssueCardRefactored.js   Refactored issue card
|   +-- IssueMap.jsx             Leaflet map with issue markers
|   +-- NearbyIssuesMap.jsx      Map showing nearby issues
|   +-- IssuePopup.jsx           Issue detail popup on map
|   +-- IssueComments.jsx        Comments thread
|   +-- IssueActionButtons.jsx   Status action buttons
|   +-- IssueStatusUpdater.jsx   Status update component
|   +-- IssueResponseEditor.jsx  Response/note editor
|   +-- IssueManagementPanel.jsx Full management panel
|   +-- StatusTimeline.jsx       Status history timeline
|   +-- PriorityBadge.jsx        Priority indicator badge
|   +-- LocationPicker.jsx       GPS + manual location selector
|   +-- ImageUploader.jsx        Cloudinary image upload
|   +-- VoiceInput.jsx           Voice-to-text input
|   +-- FeedbackModal.jsx        Citizen feedback / reopen modal
|   +-- RatingModal.jsx          Star rating modal
|   +-- DuplicateModal.jsx       Duplicate issue warning
|   +-- DisclaimerModal.jsx      Disclaimer modal
|   +-- EmptyState.js            Empty state placeholder
|   +-- ErrorBoundary.js         React error boundary
|   +-- DepartmentStats.jsx      Department statistics display
|   +-- LanguageSelector.jsx     Language switcher
|   +-- GoogleTranslate.jsx      Google Translate widget
|   +-- I18nProvider.jsx         i18next provider wrapper
|   +-- LottiePlayer.jsx         Lottie animation player
|   +-- PrivacyNotice.js         Privacy notice banner
|
+-- lib/                         Utility functions and helpers
|   +-- auth.js                  JWT generation, verification, middleware
|   +-- mongodb.js               MongoDB connection with caching
|   +-- middleware.js            Auth + role middleware factories
|   +-- roleFilter.js            Role-based MongoDB query filters
|   +-- wards.js                 Ward/zone/department master data
|   +-- zones.js                 GPS coordinate to zone mapping
|   +-- department-mapper.js     Category slug to department code
|   +-- notifications.js         Notification creation helper
|   +-- schemas.js               Input validation schemas
|   +-- ai.js                    AI analysis (Gemini + Roboflow)
|   +-- email.js                 Email sending utilities
|   +-- startup-check.js         Environment validation on startup
|   +-- useStaticTranslation.js  i18n hook
|   +-- contexts/
|       +-- UserContext.js       Global user state (React Context)
|
+-- models/                      Mongoose schemas
|   +-- Issue.js                 Issue document schema
|   +-- User.js                  User document schema
|   +-- Notification.js          Notification schema
|   +-- StateHistory.js          Issue status history schema
|   +-- StaffPerformance.js      Staff metrics schema
|   +-- DepartmentPerformance.js Department metrics schema
|   +-- OTP.js                   OTP for password reset (TTL index)
|
+-- public/                      Static assets
|   +-- locales/                 i18n translation JSON files
|   +-- manifest.json            PWA manifest
|   +-- icons/                   App icons
|
+-- scripts/                     Database and maintenance scripts
|   +-- seed-departments.js      Seed department data
|   +-- seed-users.js            Seed test users
|   +-- create-test-admin.js     Create admin account
|   +-- verify-database.js       Verify DB integrity
|   +-- migrate-department-refs.js  Migrate old department refs
|   +-- test-all-roles.js        Test all user roles
|   +-- cleanup-duplicate-users.js  Remove duplicate users
|   +-- reset-passwords.js       Reset user passwords
|
+-- __tests__/                   Test files
|   +-- api-department.test.js
|   +-- assignment.test.js
|   +-- components.test.jsx
|   +-- role-system.test.js
|   +-- utils.test.js
|
+-- middleware.js                 Next.js Edge middleware (route protection)
+-- next.config.js                Next.js configuration
+-- tailwind.config.mjs           Tailwind configuration
+-- jest.config.mjs               Jest configuration
+-- package.json                  Dependencies and scripts
+-- .env.local                    Environment variables (not committed)
+-- .env.example                  Environment variable template
```

---
## 5. User Roles and Permissions

The system has 5 distinct roles. Both old (lowercase) and new (UPPERCASE) role formats are supported
for backward compatibility.

### Role Hierarchy

```
SYSTEM_ADMIN
    |
MUNICIPAL_COMMISSIONER
    |
DEPARTMENT_MANAGER (x8, one per department)
    |
FIELD_OFFICER (x16, one per ward)
    |
CITIZEN (unlimited)
```

### Role Details

#### CITIZEN (citizen)
- Register and log in independently
- Report new civic issues with title, description, category, location, images, videos
- View only their own reported issues
- Upvote issues to increase visibility
- Add comments to issues
- Confirm resolution or request reopen after issue is marked resolved
- Submit star rating and feedback
- Track any issue by report ID (public)
- View public dashboard and map

#### FIELD_OFFICER (field_officer)
- Assigned to exactly ONE ward (wardId in JWT)
- View all issues in their assigned ward only
- Update issue status: assigned → in-progress → resolved
- Upload resolution proof (photos, videos, notes)
- View their ward statistics and SLA health
- View their performance metrics

#### DEPARTMENT_MANAGER (department_manager / department)
- Assigned to ONE department (departmentId in JWT)
- Sees issues in their department's TWO wards (north + south)
- Assign/reassign issues between field officers
- View department-level statistics and SLA compliance
- Monitor overdue issues and trigger reassignment
- View department performance dashboard
- Access SLA monitoring page

#### MUNICIPAL_COMMISSIONER (municipal_commissioner / commissioner)
- Sees ALL issues across all 16 wards and 8 departments
- AI-generated daily briefing with key indicators and critical alerts
- City-wide statistics (total issues, resolved, escalations, SLA health)
- Department overview cards with north/south zone breakdown
- Staff management (view field officers and managers)
- Create new staff accounts
- View critical escalations table

#### SYSTEM_ADMIN (system_admin / admin)
- Full read access to all issues (read-only on issues)
- User management: create, edit, deactivate, delete users
- Department management: create, edit, delete departments
- System analytics dashboard
- Assign roles, wardId, departmentId to users
- View all system data

### Role-Based Data Filtering (lib/roleFilter.js)

```javascript
CITIZEN          --> { reportedBy: user.userId }
FIELD_OFFICER    --> { ward: user.wardId }
DEPARTMENT_MANAGER --> { ward: { $in: [northWardId, southWardId] } }
MUNICIPAL_COMMISSIONER --> {} (all issues)
SYSTEM_ADMIN     --> {} (all issues)
```

### Route Protection (middleware.js)

```
/citizen/**      --> CITIZEN only
/field-officer/** --> FIELD_OFFICER only
/department/**   --> DEPARTMENT_MANAGER only
/commissioner/** --> MUNICIPAL_COMMISSIONER only
/municipal/**    --> MUNICIPAL_COMMISSIONER only
/admin/**        --> SYSTEM_ADMIN only
```

---

## 6. Geographic System — Wards and Zones

The geographic system is the backbone of automatic issue routing. It is defined entirely in
lib/wards.js as a single source of truth.

### Zone Division

The city is divided into two zones based on latitude (Anand District, Gujarat):
- North Zone: latitude >= 22.55
- South Zone: latitude < 22.55

### 8 Departments

| ID      | Name                      | Icon |
|---------|---------------------------|------|
| roads   | Roads & Infrastructure    | Road |
| lighting | Street Lighting          | Bulb |
| waste   | Waste Management          | Bin  |
| water   | Water & Drainage          | Drop |
| parks   | Parks & Public Spaces     | Tree |
| traffic | Traffic & Signage         | Light|
| health  | Public Health & Safety    | Hospital |
| other   | Other / General           | Clipboard |

### 16 Wards — Master Map

| Ward   | Zone  | Department |
|--------|-------|------------|
| ward-1 | North | Roads      |
| ward-2 | North | Lighting   |
| ward-3 | North | Waste      |
| ward-4 | North | Water      |
| ward-5 | North | Parks      |
| ward-6 | North | Traffic    |
| ward-7 | North | Health     |
| ward-8 | North | Other      |
| ward-9 | South | Roads      |
| ward-10 | South | Lighting  |
| ward-11 | South | Waste     |
| ward-12 | South | Water     |
| ward-13 | South | Parks     |
| ward-14 | South | Traffic   |
| ward-15 | South | Health    |
| ward-16 | South | Other     |

### Automatic Ward Assignment Logic

When a citizen reports an issue:
1. GPS coordinates are captured via browser geolocation
2. Latitude is compared to 22.55 boundary → zone = 'north' or 'south'
3. Issue category is mapped to department code via department-mapper.js
4. getWardByZoneDept(zone, deptCode) returns the correct wardId
5. If no GPS available, defaults to 'north' zone

### Helper Functions (lib/wards.js)

- getWardLabel(wardId) → "Ward 1 — North Zone · Roads & Infrastructure"
- getDepartmentWards(departmentId) → ['ward-1', 'ward-9'] (both zones)
- getZoneWards(zone) → ['ward-1', ..., 'ward-8'] (all wards in zone)
- getWardZone(wardId) → 'north' or 'south'
- getWardDepartment(wardId) → 'roads', 'water', etc.
- getWardByZoneDept(zone, departmentId) → ward object

---

## 7. Database Design and Models

### MongoDB Collections Overview

```
civic-issues database
|
+-- issues           Main issue documents
+-- users            All user accounts
+-- notifications    In-app notifications
+-- statehistories   Issue status change log
+-- staffperformances  Staff metrics
+-- departmentperformances  Department metrics
+-- otps             OTP codes for password reset (TTL)
```

### Issue Model (models/Issue.js)

The central model of the entire system.

```
Field                   Type        Description
----------------------  ----------  ------------------------------------------
reportId                String      Auto-generated: R00001, R00002, ...
title                   String      Issue title (min 5 chars)
description             String      Detailed description (min 10 chars)
category                String      Enum: roads-infrastructure, street-lighting,
                                    waste-management, water-drainage,
                                    parks-public-spaces, traffic-signage,
                                    public-health-safety, other
subcategory             String      Specific subcategory within category
priority                String      Enum: low, medium, high, urgent
status                  String      Enum: pending, assigned, in-progress,
                                    resolved, rejected, reopened, escalated
location.address        String      Human-readable address
location.coordinates    GeoJSON     [lng, lat] for geospatial queries
location.city           String
location.state          String
location.pincode        String
images                  Array       [{url, publicId}] from Cloudinary
videos                  Array       [{url, publicId, thumbnailUrl}]
reportedBy              ObjectId    Ref: User (citizen)
assignedTo              ObjectId    Ref: User (field officer)
assignedDepartment      ObjectId    Ref: Department
assignedDepartmentCode  String      'roads', 'water', etc.
ward                    String      'ward-1' through 'ward-16'
zone                    String      'north' or 'south'
upvotes                 Number      Vote count
upvotedBy               [ObjectId]  Users who upvoted
comments                Array       [{text, user, createdAt}]
sla.deadline            Date        When issue must be resolved
sla.hoursRemaining      Number      Calculated on save
sla.isOverdue           Boolean     Calculated on save
sla.escalationLevel     Number      1, 2, or 3
sla.escalationHistory   Array       [{level, escalatedAt, escalatedTo, reason}]
feedback.rating         Number      1-5 stars from citizen
feedback.isResolved     Boolean     Citizen confirmation
feedback.comment        String
feedback.submittedAt    Date
citizenConfirmed        Boolean     null=pending, true=confirmed, false=reopened
resolutionProof.note    String      Field officer resolution note
resolutionProof.images  Array       Proof photos
resolutionProof.videos  Array       Proof videos
statusHistory           Array       [{status, changedBy, changedAt, note}]
aiAnalysis.category     String      AI-detected category
aiAnalysis.priority     String      AI-suggested priority
aiAnalysis.sentiment    String      Sentiment analysis result
aiAnalysis.keywords     [String]    Extracted keywords
detectionSource         String      manual, roboflow, gemini, openai, keyword
penaltyPoints           Number      Accumulated penalty for escalations
resolutionTime          Number      Hours from creation to resolution
dueTime                 Date        7 days from creation
createdAt               Date
updatedAt               Date
```

Indexes: reportId (unique), ward, priority, location.coordinates (2dsphere sparse)

### User Model (models/User.js)

```
Field           Type        Description
--------------  ----------  ------------------------------------------
name            String      Full name
email           String      Unique, lowercase
password        String      bcrypt hash, select: false
phone           String      Optional
role            String      CITIZEN, FIELD_OFFICER, DEPARTMENT_MANAGER,
                            MUNICIPAL_COMMISSIONER, SYSTEM_ADMIN
                            (also accepts old lowercase formats)
wardId          String      'ward-1' to 'ward-16' — FIELD_OFFICER only
departmentId    String      'roads', 'water', etc. — DEPT_MANAGER only
department      ObjectId    Ref: Department (legacy)
googleId        String      Google OAuth ID (sparse)
address         Object      {street, city, state, pincode}
isActive        Boolean     Account active status
welcomeEmailSent Boolean    Email sent flag
otp             String      Current OTP code
otpExpires      Date        OTP expiration
createdAt       Date
```

Indexes: email (unique), phone (sparse), wardId+departmentId, role+departmentId,
         role+isActive, department, role

### Notification Model (models/Notification.js)

```
Field           Type        Description
--------------  ----------  ------------------------------------------
user            ObjectId    Ref: User (recipient)
title           String      Notification title
message         String      Notification body
type            String      issue_update, assignment, comment,
                            status_change, system
relatedIssue    ObjectId    Ref: Issue
read            Boolean     Read status (default: false)
createdAt       Date
```

### StaffPerformance Model (models/StaffPerformance.js)

```
Field                       Type    Description
--------------------------  ------  ------------------------------------------
staffId                     ObjectId  Ref: User
department                  String
totalIssuesAssigned         Number
totalIssuesResolved         Number
totalIssuesEscalated        Number
averageResolutionTime       Number  Hours
penaltyPoints               Number
badges                      Array   [{name, description, earnedAt, category}]
                                    category: speed, quality, consistency,
                                    leadership, innovation
totalRewardPoints           Number
monthlyStats                Array   [{month, issuesResolved, avgTime, penalty,
                                    reward, rank}]
currentMonth                Object  {issuesResolved, avgTime, penalty, reward}
isTopPerformer              Boolean
lastTopPerformerMonth       String
```

Badge system: Speed Demon (avg < 12h), Perfect Record (50+ resolved, 0 escalated),
Century Club (100+ resolved)

### OTP Model (models/OTP.js)

TTL index auto-deletes expired OTPs. Used for password reset and phone verification.

---

## 8. Authentication and Authorization

### JWT Token

Generated on login, stored as httpOnly cookie named 'token'.

Payload structure:
```json
{
  "userId": "mongo_object_id",
  "name": "User Name",
  "email": "user@example.com",
  "role": "CITIZEN",
  "wardId": null,
  "departmentId": null,
  "isActive": true,
  "iat": 1234567890,
  "exp": 1235172690
}
```

Expiry: 7 days. Cookie flags: httpOnly, secure (production), sameSite: lax.

### Middleware Stack

#### Next.js Edge Middleware (middleware.js)
Runs on every request before it reaches the page or API route.
- Uses jose (Edge-compatible) to verify JWT
- Checks ROUTE_PERMISSIONS map for page routes
- Redirects to correct dashboard if wrong role tries to access a route
- Returns 401 JSON for unauthorized API requests
- Deletes invalid token cookie and redirects to /login

#### API Route Middleware (lib/auth.js)
- authMiddleware(handler) — wraps API handler, attaches user to request
- roleMiddleware(allowedRoles)(handler) — checks role before calling handler
- getUser(request) — extracts and verifies JWT from cookie header
- normalizeRole(role) — maps old/new role formats to canonical names

### Role Normalization

Both old and new role formats are accepted everywhere:
```
'citizen'    --> 'CITIZEN'
'department' --> 'DEPARTMENT_MANAGER'
'admin'      --> 'SYSTEM_ADMIN'
'commissioner' --> 'MUNICIPAL_COMMISSIONER'
'municipal'  --> 'MUNICIPAL_COMMISSIONER'
```

### Password Security

- bcryptjs with 10 salt rounds
- Password field has select: false in schema (never returned in queries)
- Must explicitly use .select('+password') to retrieve it
- comparePassword() instance method on User model

---
## 9. Backend — API Routes

All API routes live in app/api/** and use Next.js App Router route handlers.
Runtime: nodejs (not edge) for most routes to support Mongoose.

### Authentication Endpoints

| Method | Path                        | Auth | Description                    |
|--------|-----------------------------|------|--------------------------------|
| POST   | /api/auth/register          | No   | Register new citizen account   |
| POST   | /api/auth/login             | No   | Login, returns JWT cookie      |
| GET    | /api/auth/me                | Yes  | Get current user from token    |
| POST   | /api/auth/logout            | Yes  | Clear token cookie             |
| POST   | /api/auth/forgot-password   | No   | Send password reset email      |
| POST   | /api/auth/reset-password    | No   | Reset password with token      |
| POST   | /api/auth/otp/send          | No   | Send OTP to phone/email        |
| POST   | /api/auth/verify-otp        | No   | Verify OTP code                |

### Issue Endpoints

| Method | Path                          | Auth | Roles              | Description                    |
|--------|-------------------------------|------|--------------------|--------------------------------|
| GET    | /api/issues                   | Yes  | All                | Get issues (role-filtered)     |
| POST   | /api/issues                   | Yes  | CITIZEN            | Create new issue               |
| GET    | /api/issues/[id]              | Yes  | All                | Get issue detail               |
| PATCH  | /api/issues/[id]/status       | Yes  | Officer, Manager   | Update issue status            |
| PATCH  | /api/issues/[id]/priority     | Yes  | Manager, Admin     | Override priority              |
| PATCH  | /api/issues/[id]/upvote       | Yes  | CITIZEN            | Toggle upvote                  |
| POST   | /api/issues/[id]/comments     | Yes  | All                | Add comment                    |
| POST   | /api/issues/[id]/confirm      | Yes  | CITIZEN            | Confirm resolved or reopen     |
| PATCH  | /api/issues/[id]/assign       | Yes  | Manager            | Reassign to officer            |
| GET    | /api/issues/stats             | Yes  | All                | Issue statistics for user      |
| GET    | /api/issues/ward-stats        | Yes  | Manager+           | Per-ward statistics            |
| GET    | /api/issues/nearby            | No   | Public             | Issues near coordinates        |
| GET    | /api/issues/track             | No   | Public             | Track by reportId              |
| POST   | /api/issues/check-duplicate   | Yes  | CITIZEN            | Check for duplicate reports    |
| POST   | /api/issues/detect-image      | Yes  | CITIZEN            | AI image analysis              |
| GET    | /api/issues/public            | No   | Public             | Public issue feed              |
| GET    | /api/issues/admin             | Yes  | SYSTEM_ADMIN       | All issues (admin view)        |
| GET    | /api/issues/department        | Yes  | DEPT_MANAGER       | Department issues              |

### Department Endpoints

| Method | Path                    | Auth | Roles       | Description              |
|--------|-------------------------|------|-------------|--------------------------|
| GET    | /api/departments        | Yes  | All         | List all departments     |
| POST   | /api/departments        | Yes  | SYSTEM_ADMIN | Create department       |
| GET    | /api/departments/[id]   | Yes  | All         | Get department detail    |
| PATCH  | /api/departments/[id]   | Yes  | SYSTEM_ADMIN | Update department       |
| DELETE | /api/departments/[id]   | Yes  | SYSTEM_ADMIN | Delete department       |

### User Endpoints

| Method | Path                    | Auth | Roles       | Description              |
|--------|-------------------------|------|-------------|--------------------------|
| GET    | /api/users/admin        | Yes  | SYSTEM_ADMIN | List all users          |
| POST   | /api/users/create       | Yes  | SYSTEM_ADMIN | Create user             |
| GET    | /api/users/[id]         | Yes  | Admin/Self  | Get user detail          |
| PATCH  | /api/users/[id]         | Yes  | Admin/Self  | Update user              |
| DELETE | /api/users/[id]         | Yes  | SYSTEM_ADMIN | Delete user             |

### Admin Endpoints

| Method | Path                        | Auth | Description                    |
|--------|-----------------------------|------|--------------------------------|
| GET    | /api/admin/analytics        | Yes  | System-wide analytics          |
| POST   | /api/admin/create-user      | Yes  | Create any user type           |
| GET    | /api/admin/users            | Yes  | Users list with stats          |
| GET    | /api/admin/users/stats      | Yes  | User count by role             |

### Other Endpoints

| Method | Path                        | Auth | Description                    |
|--------|-----------------------------|------|--------------------------------|
| GET    | /api/commissioner/briefing  | Yes  | AI daily briefing              |
| GET    | /api/notifications          | Yes  | User notifications             |
| PATCH  | /api/notifications          | Yes  | Mark notifications read        |
| POST   | /api/upload                 | Yes  | Upload to Cloudinary           |
| GET    | /api/reports                | Yes  | Generate reports               |
| GET    | /api/stats                  | Yes  | System statistics              |
| GET    | /api/sla                    | Yes  | SLA monitoring data            |
| GET    | /api/performance            | Yes  | Staff performance data         |
| GET    | /api/public-dashboard       | No   | Public statistics              |
| POST   | /api/ai                     | Yes  | AI issue analysis              |
| GET    | /api/wards                  | No   | Ward configuration             |
| GET    | /api/health                 | No   | Health check                   |
| POST   | /api/cron/reminders         | No   | Cron: send SLA reminders       |

---

## 10. Frontend — All Pages and Dashboards

### Public Pages (no login required)

#### Home Page (/)
- Sticky navbar with Sign In / Sign Up buttons
- Hero section with Lottie animation and CTA buttons
- "How It Works" section: 3 steps (Report, AI Processing, Track Progress)
- FAQ accordion (8 questions)
- Roles section: 4 role cards (Citizen, Municipal, Department, Admin)
- Footer with quick links, legal links, contact
- Auto-redirects logged-in users to their dashboard

#### Login Page (/login)
- Email + password form
- Error handling with toast notifications
- Link to register and forgot password
- On success: redirects to role-specific dashboard

#### Register Page (/register)
- Name, email, password, phone fields
- Creates CITIZEN account by default
- Redirects to citizen dashboard on success

#### Forgot Password (/forgot-password)
- Email input to request reset link
- OTP verification flow

#### Public Dashboard (/public-dashboard)
- City-wide issue statistics (no login needed)
- Total issues, resolved count, categories breakdown
- Recent issues feed
- Department performance overview

#### Interactive Map (/map)
- Full-screen Leaflet map
- All public issues plotted as markers
- Click marker to see issue popup with title, status, category
- Filter by category and status

#### Issue Tracker (/track)
- Enter report ID (e.g. R00042) to track any issue
- Shows full status timeline
- No login required — for citizens to share tracking links

#### Know Your District (/know-your-district)
- Information about Anand District
- Ward map and department contacts
- Public information page

#### Issue Detail (/issues/[id])
- Public view of a single issue
- Status, priority, location, images
- Comments section
- Upvote button (requires login)

#### Privacy Policy (/privacy-policy)
#### Terms of Service (/terms-of-service)

---

### Citizen Dashboard (/citizen/dashboard)

Access: CITIZEN role only

Sections:
- Page header with "Report Issue" CTA button
- Stats row: Total Reports, Pending, Resolved (3 stat cards)
- Nearby Issues Map (Leaflet, shows issues near user's GPS location)
- Filter tabs: All / In Progress / Resolved
- Issue grid (3 columns): IssueCard components
- For resolved issues: "Confirm Fixed" and "Request Reopen" buttons
- Citizen confirmation status badge
- FeedbackModal for reopen reason

Data sources:
- GET /api/issues (citizen sees only their own)
- GET /api/issues/stats

### Citizen Report Page (/citizen/report)

Multi-step issue reporting form:
- Title and description fields
- Category selector (8 categories with icons)
- Subcategory input
- Priority selector (low, medium, high, urgent)
- LocationPicker component (GPS auto-detect + manual address)
- ImageUploader (Cloudinary, multiple images)
- VoiceInput for description (speech-to-text)
- Duplicate detection before submission
- AI image analysis option
- Submit → POST /api/issues

---

### Department Manager Dashboard (/department/dashboard)

Access: DEPARTMENT_MANAGER role only

Sections:
- Header: Department name + icon + ward numbers
- Overall stats: Total Issues, Active, Resolved, SLA Health %
- Zone Operations: 2 ward cards (North + South)
  - Each card shows: ward number, zone badge, field officer name, active/resolved/overdue counts, SLA health progress bar, "View Issues" link
- Critical Feedback Loop: overdue issues table with Reassign button
  - Reassign modal: choose between north or south zone officer

Data sources:
- GET /api/issues/ward-stats
- GET /api/issues?overdue=true
- GET /api/admin/users?role=FIELD_OFFICER&wardId=...

### Department Issues Page (/department/issues)

- Issues list filtered to department's 2 wards
- Filter by status, priority, ward
- Each issue row: reportId, title, status badge, priority badge, assigned officer, SLA deadline
- Click to open issue detail

### Department Issue Detail (/department/issues/[id])

- Full issue information
- Status update controls
- Assign/reassign to field officer
- Add internal notes
- View status history timeline
- View resolution proof from field officer

### Department Stats Page (/department/stats)

- Resolution rate chart
- Average resolution time
- SLA compliance percentage
- Issues by priority breakdown
- Monthly trend chart

### Department SLA Monitoring (/department/sla-monitoring)

- List of all issues with SLA deadlines
- Color-coded: green (on track), amber (at risk), red (overdue)
- Hours remaining countdown
- Escalation level indicator

### Department Profile (/department/profile)

- Staff profile information
- Performance metrics
- Badges earned
- Monthly stats

---

### Field Officer Dashboard (/field-officer/dashboard)

Access: FIELD_OFFICER role only

Sections:
- Header: "Field Officer Dashboard" + ward info
- Ward Info Card: ward number, zone badge (blue=north, purple=south), department icon
- Stats: Total Issues, Active, Resolved, SLA Health %
- Quick Actions: My Issues, Resolved, Performance (3 link cards)
- Recent Active Issues list (latest 5, not resolved)
- Overdue warning banner if any issues are overdue

Data sources:
- GET /api/issues/ward-stats?wardId=...
- GET /api/issues?ward=...

### Field Officer Issues (/field-officer/issues)

- All issues in officer's ward
- Filter by status and priority
- Each issue: reportId, title, status, priority, created date

### Field Officer Issue Detail (/field-officer/issues/[id])

- Full issue details
- Status update: in-progress → resolved
- Resolution proof upload: photos, videos, note
- View citizen's original images

---

### Commissioner Dashboard (/commissioner/dashboard)

Access: MUNICIPAL_COMMISSIONER role only

Sections:
- Page header: "Municipal Commissioner — City Operations Center"
- AI Briefing Card: AI-generated daily summary with key indicators and critical alerts
- Stats row: Total City Issues, Resolved Today, Critical Escalations, City SLA Health %
- Department Overview Grid (8 cards, one per department):
  - Each card: department icon + name, North ward row (ward number, active issues, SLA%), South ward row, total issues, resolved rate, "View All" link
- Critical Escalations table: urgent issues with ward, department, status
- Staffing Overview: field officers count, managers count

Data sources:
- GET /api/commissioner/briefing (AI-generated)
- GET /api/issues/stats
- GET /api/issues/ward-stats
- GET /api/issues?priority=urgent
- GET /api/admin/users/stats

### Commissioner Issues (/commissioner/issues)

- All issues across all wards
- Filter by department, ward, status, priority
- Full issues table

### Commissioner Staff (/commissioner/staff)

- List of all field officers and department managers
- Ward/department assignments
- Active/inactive status

### Commissioner Create Staff (/commissioner/create-staff)

- Form to create FIELD_OFFICER or DEPARTMENT_MANAGER accounts
- Assign wardId (for officers) or departmentId (for managers)

---

### Admin Dashboard (/admin/dashboard)

Access: SYSTEM_ADMIN role only

Sections:
- Header: "Admin Dashboard" + filter controls (status, priority dropdowns)
- Stats: Total Issues, Total Users, SLA Health %, Active Officers (4 stat cards)
- Read-Only Banner: "System Admin — Issue data is read-only"
- Issues Table: reportId, title, category, status badge, priority badge, View link

Data sources:
- GET /api/issues (admin sees all)
- GET /api/issues/stats
- GET /api/admin/users/stats

### Admin Users (/admin/users)

- Full user list with role, department, ward, active status
- Search and filter
- Create, edit, deactivate users

### Admin User Detail (/admin/users/[id])

- Edit user name, email, role, wardId, departmentId
- Activate/deactivate account
- View user's issues

### Admin Departments (/admin/departments)

- List all departments
- Create new department
- Edit department details

### Admin Analytics (/admin/analytics)

- System-wide charts
- Issues by category pie chart
- Resolution time trends
- Department performance comparison
- User growth chart

### Admin Create User (/admin/create-user)

- Create any user type
- Set role, wardId, departmentId
- Send welcome email option

---

### Municipal Pages (/municipal/*)

Alternative dashboard for MUNICIPAL_COMMISSIONER role:
- /municipal/dashboard — similar to commissioner dashboard
- /municipal/departments — department management view
- /municipal/sla-dashboard — city-wide SLA monitoring

---

## 11. UI System and Design Language

### Color Palette (globals.css + tailwind.config.mjs)

The app uses a dark theme with gold accents:

```
Background:     #0A0A0A  (page background)
Card:           #1A1A1A  (card/panel background)
Input:          #111111  (input fields)
Navbar:         #080808  (top navigation)
Border:         #2A2A2A  (borders and dividers)
Gold:           #F5A623  (primary accent, CTAs, highlights)
Text Primary:   #FFFFFF  (headings, important text)
Text Secondary: #AAAAAA  (body text, labels)
Text Muted:     #666666  (placeholder, disabled)
```

Status colors:
- Pending: gray (#6B7280)
- Assigned: blue (#3B82F6)
- In Progress: amber (#F59E0B)
- Resolved: green (#10B981)
- Rejected: red (#EF4444)
- Escalated: orange (#F97316)

Priority colors:
- Urgent: red
- High: orange
- Medium: yellow
- Low: green

Zone colors:
- North Zone: blue (#3B82F6)
- South Zone: purple (#8B5CF6)

### Typography

- Font: System font stack (no custom font loaded)
- Headings: font-bold to font-black, tracking-tight
- Body: text-sm to text-base
- Labels: text-xs uppercase tracking-wider

### Component Patterns

- Cards: bg-card rounded-card border border-border p-6
- Buttons: btn-gold (gold background, black text), btn-outline (border only)
- Pills/Badges: rounded-full px-2.5 py-0.5 text-xs font-medium
- Tables: table-dark class with thead/tbody styling
- Stat cards: stat-card class with stat-value and stat-label
- Section headers: section-header class (text-xs uppercase tracking-wider text-muted)
- Inputs: bg-input border border-border rounded-input focus:border-gold

### Animations

- animate-fade-in: opacity 0 → 1 on mount
- animate-pulse: skeleton loading states
- animate-spin: loading spinners
- stagger-children: staggered entrance for lists
- hover:scale-105: subtle scale on interactive elements

### Responsive Design

- Mobile-first approach
- Grid breakpoints: grid-cols-1 → md:grid-cols-2 → lg:grid-cols-3/4
- Sidebar collapses on mobile
- Tables scroll horizontally on small screens

---
## 12. Components Library

### Layout Components

#### DashboardLayout.js
Main layout wrapper used by all dashboard pages.
- Renders sidebar navigation (role-specific menu items)
- Top navbar with user info, notifications bell, logout
- Main content area with padding
- Mobile hamburger menu

#### DashboardProtection.js
Role-based access guard component.
- Wraps dashboard pages
- Checks user.role against allowedRoles prop
- Shows loading spinner while auth is initializing
- Redirects to /login if not authenticated
- Redirects to correct dashboard if wrong role

#### PageHeader.js
Consistent page title component.
- Props: title, subtitle, children (action buttons)
- Renders h1 + subtitle text + right-side slot for buttons

### Issue Display Components

#### IssueCard.js
Summary card for issue lists.
- Shows: reportId, title, category icon, status badge, priority badge
- Location address, created date
- Upvote count
- Click navigates to issue detail

#### IssueMap.jsx
Leaflet map with issue markers.
- Dynamically imported (ssr: false) to avoid SSR issues
- Custom markers colored by status
- Popup on click with issue summary
- Cluster support via react-leaflet-cluster

#### NearbyIssuesMap.jsx
Map centered on user's GPS location.
- Shows issues within radius
- Used on citizen dashboard
- Falls back to city center if no GPS

#### IssuePopup.jsx
Popup component shown on map marker click.
- Issue title, status, category, address
- Link to full detail page

#### IssueComments.jsx
Comments thread for an issue.
- List of existing comments with user name and date
- Add comment form (authenticated users)
- POST /api/issues/[id]/comments

#### StatusTimeline.jsx
Visual timeline of status changes.
- Shows each status transition
- Who changed it and when
- Optional note for each change

#### PriorityBadge.jsx
Colored badge for priority level.
- urgent=red, high=orange, medium=yellow, low=green

### Issue Management Components

#### IssueActionButtons.jsx
Context-aware action buttons.
- Shows different buttons based on user role and issue status
- Field officer: "Start Work", "Mark Resolved"
- Manager: "Reassign", "Escalate"
- Citizen: "Upvote", "Comment"

#### IssueStatusUpdater.jsx
Status update form.
- Dropdown for new status
- Optional note field
- PATCH /api/issues/[id]/status

#### IssueResponseEditor.jsx
Rich text editor for official responses.
- Used by managers and commissioners
- Saves response to issue document

#### IssueManagementPanel.jsx
Full management panel for staff.
- Combines status updater, assignment, notes, proof upload
- Used on department and field officer issue detail pages

### Form Components

#### LocationPicker.jsx
Location selection component.
- "Use My Location" button (browser geolocation)
- Manual address input fields
- Leaflet map for visual confirmation
- Returns {address, city, state, pincode, coordinates: {lat, lng}}

#### ImageUploader.jsx
Multi-image upload component.
- Drag and drop support
- Preview thumbnails
- Uploads to Cloudinary via POST /api/upload
- Returns array of {url, publicId}

#### VoiceInput.jsx
Speech-to-text input.
- Uses Web Speech API
- Appends transcribed text to description field
- Shows recording indicator

### Modal Components

#### FeedbackModal.jsx
General purpose modal with text input.
- Used for reopen reason, rejection reason
- Props: isOpen, onClose, onSubmit, title, placeholder

#### RatingModal.jsx
Star rating modal.
- 1-5 star selector
- Optional comment field
- Used for citizen satisfaction feedback

#### DuplicateModal.jsx
Shown when a potential duplicate issue is detected.
- Shows similar existing issues
- Options: "Submit Anyway" or "View Existing"

#### DisclaimerModal.jsx
Legal disclaimer shown before report submission.

### Utility Components

#### EmptyState.js
Empty state placeholder.
- Props: icon, title, description, action (optional button)
- Used when lists have no data

#### ErrorBoundary.js
React error boundary.
- Catches rendering errors
- Shows fallback UI instead of crashing

#### StatCard.js / ui/StatCard.jsx
Statistics display card.
- Props: label, value, icon, trend (up/down)
- Used on all dashboards

#### LottiePlayer.jsx
Lottie animation wrapper.
- Dynamically imported (ssr: false)
- Props: src (URL), style

#### LanguageSelector.jsx
Language switcher dropdown.
- Changes i18next language
- Persists selection to localStorage

#### GoogleTranslate.jsx
Google Translate widget integration.
- Adds Google Translate toolbar to page

#### I18nProvider.jsx
i18next initialization wrapper.
- Wraps app with translation context

#### PrivacyNotice.js
GDPR/privacy notice banner.

---

## 13. Core Business Logic

### Issue Lifecycle

```
PENDING
  |
  +--> ASSIGNED (auto, when field officer found for ward)
  |
  +--> IN-PROGRESS (field officer starts work)
  |
  +--> RESOLVED (field officer uploads proof)
  |         |
  |         +--> Citizen confirms --> CLOSED (citizenConfirmed=true)
  |         |
  |         +--> Citizen reopens --> REOPENED
  |                   |
  |                   +--> back to ASSIGNED/IN-PROGRESS
  |
  +--> REJECTED (manager rejects with reason)
  |
  +--> ESCALATED (SLA exceeded, escalation level increases)
```

### SLA Calculation

SLA deadlines are set at issue creation based on priority:
- urgent: 24 hours
- high: 48 hours
- medium: 72 hours
- low: 120 hours

On every save, the Issue pre-save hook recalculates:
- sla.hoursRemaining = max(0, ceil((deadline - now) / 3600000))
- sla.isOverdue = deadline < now

### Escalation System

When SLA deadline is exceeded:
1. Level 1: Escalated to Department Staff
2. Level 2: Escalated to Department Head
3. Level 3: Escalated to Commissioner/Mayor

Each escalation adds 10 * level penalty points to the issue.
Escalation history is recorded with timestamp and reason.

### Duplicate Detection

Before submission, POST /api/issues/check-duplicate is called with:
- title, description, location coordinates, category

The API checks for issues within a radius with similar category
reported in the last 7 days. Returns potential duplicates for user review.

### Ward Auto-Assignment Algorithm

```javascript
// 1. Get zone from GPS
const zone = getZoneFromCoordinates(lat, lng)
// lat >= 22.55 --> 'north', else 'south'

// 2. Get department from category
const deptCode = getDepartmentCodeForCategory(category)
// 'roads-infrastructure' --> 'roads'

// 3. Find ward
const ward = getWardByZoneDept(zone, deptCode)
// Returns ward object from WARD_MAP

// 4. Auto-assign field officer
const officer = await User.findOne({
  role: 'FIELD_OFFICER',
  wardId: ward.wardId,
  isActive: true
})
```

### Citizen Verification Loop

After an issue is marked resolved:
1. Citizen sees "Confirm Fixed" and "Request Reopen" buttons
2. If confirmed: citizenConfirmed = true, issue stays resolved
3. If reopened: citizenConfirmed = false, status = 'reopened', citizen provides reason
4. Reopened issues go back into the assignment queue

### Performance Points System

Field officers earn/lose points:
- Base: +10 points per resolved issue
- Speed bonus: +20 if resolved within 24h
- Super speed: +30 if resolved within 12h
- Escalation penalty: -20 per escalation

Department managers see aggregate performance for their wards.

---

## 14. AI and Integrations

### Google Gemini (lib/ai.js)

Used for:
- Issue category and priority suggestion from title + description
- Sentiment analysis of issue description
- Keyword extraction
- Daily briefing generation for Commissioner dashboard

The Commissioner briefing includes:
- Summary of city-wide issue status
- Key performance indicators
- Critical alerts (overdue, escalated issues)
- Recommended actions

### Roboflow (lib/ai.js)

Computer vision model for image analysis:
- Detects issue type from uploaded photos
- Confirms category (e.g., detects pothole in road photo)
- Returns confidence score
- Used in POST /api/issues/detect-image

### OpenAI (lib/ai.js)

Fallback when Gemini is unavailable:
- Same analysis capabilities
- Used as secondary AI provider

### Detection Source Tracking

Each issue records how its category/priority was determined:
- 'manual': citizen selected manually
- 'roboflow': detected from image
- 'gemini': AI text analysis
- 'openai': OpenAI fallback
- 'keyword': keyword matching
- 'AI_CONFIRMED': AI confirmed citizen's selection
- 'AI_OVERRIDDEN': AI overrode citizen's selection

### Cloudinary (lib/upload, /api/upload)

- Images and videos uploaded to Cloudinary
- Returns {url, publicId} for each file
- next-cloudinary package for optimized Next.js integration
- Images served via res.cloudinary.com CDN
- Configured in next.config.js remotePatterns

### Resend (lib/email.js)

Transactional emails:
- Welcome email on registration
- Password reset link
- Issue status update notifications
- SLA breach alerts

### Mapbox

Map tiles for Leaflet maps.
Token: NEXT_PUBLIC_MAPBOX_TOKEN environment variable.
Used as tile layer source in IssueMap and NearbyIssuesMap.

---

## 15. Notification System

### In-App Notifications

Stored in MongoDB Notification collection.
Created via createNotification() helper in lib/notifications.js.

Notification types:
- assignment: New issue assigned to field officer
- status_change: Issue status updated
- issue_update: General issue update
- comment: New comment on issue
- system: System-wide announcements

### When Notifications Are Created

- Issue created and auto-assigned → notify field officer (NEW_ASSIGNMENT)
- Issue status changed → notify reporter (STATUS_CHANGE)
- Comment added → notify issue reporter (COMMENT)
- Issue escalated → notify department manager and commissioner

### Notification API

- GET /api/notifications — returns unread notifications for current user
- PATCH /api/notifications — mark as read

### Email Notifications

Sent via Resend for important events:
- Welcome email on account creation
- Password reset
- Issue resolved confirmation to citizen
- SLA breach warning to department manager

### Cron Job (api/cron/reminders)

Scheduled job that:
- Finds issues approaching SLA deadline
- Sends reminder notifications to assigned officers
- Escalates issues that have exceeded SLA
- Records escalation in sla.escalationHistory

---

## 16. SLA and Escalation System

### SLA Deadlines by Priority

| Priority | SLA Deadline | Due Time |
|----------|-------------|----------|
| urgent   | 24 hours    | 7 days   |
| high     | 48 hours    | 7 days   |
| medium   | 72 hours    | 7 days   |
| low      | 120 hours   | 7 days   |

### SLA Health Calculation

SLA Health % = ((total - overdue) / total) * 100

Displayed on all dashboards with color coding:
- >= 80%: green (healthy)
- 50-79%: amber (at risk)
- < 50%: red (critical)

### Escalation Levels

Level 1 (default): Assigned to Department Staff
Level 2: Escalated to Department Head
Level 3: Escalated to Commissioner/Mayor

Each escalation:
- Increments sla.escalationLevel
- Sets status to 'escalated'
- Adds entry to sla.escalationHistory
- Adds penaltyPoints (level * 10)
- Sends notification to escalation target

### Penalty Points

Accumulated on issues for:
- Each escalation: level * 10 points
- Used to calculate department and staff performance scores
- Visible on performance dashboards

---

## 17. Performance Tracking System

### Staff Performance (StaffPerformance model)

Tracked per field officer:
- Total issues assigned, resolved, escalated
- Average resolution time (hours)
- Penalty points
- Reward points
- Monthly breakdown
- Badges earned
- isTopPerformer flag

### Reward Points Calculation

- Base: +10 per resolved issue
- Speed bonus: +20 if resolved within 24h
- Super speed: +30 if resolved within 12h

### Badge System

| Badge          | Criteria                                    | Category    |
|----------------|---------------------------------------------|-------------|
| Speed Demon    | Average resolution time < 12 hours          | speed       |
| Perfect Record | 50+ resolved with zero escalations          | quality     |
| Century Club   | 100+ issues resolved                        | consistency |

### Department Performance (DepartmentPerformance model)

Tracked per department:
- Total issues received, resolved, escalated
- Average resolution time
- SLA compliance rate
- Total and monthly penalty points
- Per-ward performance breakdown
- isTopDepartment flag

### Performance API

GET /api/performance — returns performance data for current user's scope
- Field officer: their own stats
- Department manager: department stats
- Commissioner/Admin: all departments

---

## 18. PWA and Internationalization

### Progressive Web App (PWA)

Configured via next-pwa in next.config.js:
- Service worker registered automatically
- Offline support for cached pages
- Install prompt on mobile browsers
- App manifest: public/manifest.json

Manifest includes:
- App name: CivicPulse
- Theme color: #1A1A1A
- Background color: #0A0A0A
- Icons for various sizes
- Display: standalone (full-screen app)
- Start URL: /

PWA is disabled in development (NODE_ENV=development).

### Internationalization (i18next)

Setup:
- i18next + react-i18next + i18next-browser-languagedetector
- Translation files in public/locales/[lang]/translation.json
- Custom hook: lib/useStaticTranslation.js
- I18nProvider.jsx wraps the app

Usage in components:
```javascript
const { t } = useTranslation()
t('citizen.dashboard')  // Returns translated string
t('nav.title', 'Civic System')  // With fallback
```

Translation keys cover:
- Navigation labels
- Dashboard titles and subtitles
- Form labels and placeholders
- Status and priority labels
- Error messages
- FAQ questions and answers
- Landing page content

### Google Translate Integration

GoogleTranslate.jsx adds the Google Translate toolbar for additional language support beyond the built-in i18n translations.

---
## 19. How Everything Connects

### Data Flow: Citizen Reports an Issue

1. Citizen opens /citizen/report
2. Fills form: title, description, category, subcategory, priority
3. LocationPicker captures GPS coordinates
4. ImageUploader sends photos to POST /api/upload --> Cloudinary
5. VoiceInput optionally transcribes description
6. DuplicateModal checks POST /api/issues/check-duplicate
7. Form submits to POST /api/issues
8. API: auth check (JWT cookie) --> role check (CITIZEN)
9. API: GPS --> zone (lib/zones.js)
10. API: category --> deptCode (lib/department-mapper.js)
11. API: zone + deptCode --> wardId (lib/wards.js)
12. API: find FIELD_OFFICER for wardId --> auto-assign
13. API: calculate SLA deadline
14. API: Issue.create() --> MongoDB
15. API: createNotification() for field officer
16. API: returns { reportId, ward, status }
17. Citizen sees success toast with report ID
18. Citizen redirected to /citizen/dashboard

### Data Flow: Field Officer Resolves an Issue

1. Field officer receives in-app notification
2. Opens /field-officer/issues/[id]
3. Views issue details, location, citizen photos
4. Updates status to 'in-progress' via IssueStatusUpdater
5. PATCH /api/issues/[id]/status --> MongoDB update
6. Goes to site, fixes the issue
7. Uploads resolution proof (photos + note) via ImageUploader
8. Marks status as 'resolved'
9. Notification sent to citizen: Your issue has been resolved
10. Citizen sees Confirm Fixed / Request Reopen buttons
11. If citizen confirms: citizenConfirmed = true
12. If citizen reopens: status = 'reopened', back to queue

### Data Flow: Commissioner Views City Status

1. Commissioner opens /commissioner/dashboard
2. Page fetches 5 APIs in parallel:
   - GET /api/commissioner/briefing --> Gemini AI generates summary
   - GET /api/issues/stats --> total, resolved, pending counts
   - GET /api/issues/ward-stats --> per-ward breakdown
   - GET /api/issues?priority=urgent --> critical escalations
   - GET /api/admin/users/stats --> officer/manager counts
3. AI briefing card shows: summary, key points, critical alerts
4. Stats row shows city-wide numbers
5. Department grid shows 8 cards with north/south ward data
6. Escalations table shows urgent issues
7. Staffing overview shows workforce numbers

### Context and State Management

app/layout.js wraps everything in UserProvider (lib/contexts/UserContext.js).
On mount, UserProvider fetches GET /api/auth/me and stores the user object.
All components access user state via the useUser() hook.
DashboardProtection uses user.role to guard pages.
DashboardLayout uses user.role to render the correct sidebar menu.
All API fetch calls include credentials: 'include' to send the JWT cookie.

### Middleware Chain

Browser Request
  --> Next.js Edge Middleware (middleware.js)
       Reads 'token' cookie, verifies JWT with jose
       Checks ROUTE_PERMISSIONS map
       Redirects wrong roles, allows correct roles through
  --> Next.js API Route Handler
       authMiddleware() reads and verifies token server-side
       roleMiddleware() checks allowed roles
       getRoleFilter() builds MongoDB query filter by role
       connectDB() ensures DB connection
       Mongoose query with role filter applied
       Returns JSON response

---

## 20. Environment Variables and Configuration

### Required Variables (.env.local)

MONGODB_URI=mongodb://localhost:27017/civic-issues
JWT_SECRET=your-super-secret-key-minimum-32-chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RESEND_API_KEY=re_your_resend_api_key
GOOGLE_AI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token
NODE_ENV=development

### Optional Variables

OPENAI_API_KEY=sk-your-openai-key
ROBOFLOW_API_KEY=your-roboflow-key
ROBOFLOW_MODEL_ID=your-model-id
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-app-password

### Next.js Configuration (next.config.js)

- ESLint and TypeScript errors ignored during builds
- optimizePackageImports for recharts, react-leaflet, lucide-react
- Cloudinary images allowed via remotePatterns
- Webpack: leaflet excluded from server bundle (browser-only)
- PWA via next-pwa, disabled in development

### Tailwind Configuration (tailwind.config.mjs)

Custom colors: gold (#F5A623), page (#0A0A0A), card (#1A1A1A), border (#2A2A2A)
Custom border radius: card=20px, input=12px, pill=9999px
Custom animations: fade-in, slide-up

---

## 21. Scripts and Utilities

| Script                        | Purpose                                      |
|-------------------------------|----------------------------------------------|
| seed-departments.js           | Creates 8 department documents               |
| seed-users.js                 | Creates test users for all roles             |
| create-test-admin.js          | Creates a SYSTEM_ADMIN account               |
| verify-database.js            | Checks DB integrity, reports issues          |
| migrate-department-refs.js    | Migrates old ObjectId dept refs              |
| test-all-roles.js             | Tests login and API access for all roles     |
| cleanup-duplicate-users.js    | Removes duplicate user documents             |
| reset-passwords.js            | Resets all user passwords                    |
| hash-plaintext-passwords.js   | Hashes any plain-text passwords in DB        |

### NPM Scripts

| Command               | Description                              |
|-----------------------|------------------------------------------|
| npm run dev           | Start development server                 |
| npm run build         | Build for production                     |
| npm start             | Start production server                  |
| npm run lint          | Run ESLint                               |
| npm run check         | Run startup environment check            |
| npm run db:seed       | Seed departments                         |
| npm run db:seed-users | Seed test users                          |
| npm run db:admin      | Create test admin account                |
| npm test              | Run Jest tests                           |

---

## 22. Testing

| File                        | Tests                                    |
|-----------------------------|------------------------------------------|
| api-department.test.js      | Department API endpoint tests            |
| assignment.test.js          | Issue assignment logic tests             |
| components.test.jsx         | React component rendering tests          |
| role-system.test.js         | Role-based access control tests          |
| utils.test.js               | Utility function unit tests              |

Test stack: Jest 29, @testing-library/react, @testing-library/jest-dom, Babel, dotenv

Run tests: npm test
Single run (no watch): npx jest --testPathPattern=role-system

---

## 23. Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy — Vercel auto-detects Next.js

### Production Checklist

- Strong JWT_SECRET (64+ random characters)
- MongoDB Atlas cluster (not local MongoDB)
- Cloudinary account configured
- Resend API key for emails
- NODE_ENV=production
- Run npm run db:seed to create departments
- Run npm run db:admin to create first admin
- Change all default passwords

### Health Check

GET /api/health returns: { status: 'ok', timestamp: '...' }
Use this endpoint for uptime monitoring.

---

## Quick Reference

### Default Test Credentials

| Role                   | Email                   | Password        |
|------------------------|-------------------------|-----------------|
| System Admin           | admin@test.com          | admin123        |
| Municipal Commissioner | commissioner@test.com   | commissioner123 |
| Department Manager     | manager@test.com        | manager123      |
| Field Officer          | officer@test.com        | officer123      |
| Citizen                | citizen@test.com        | citizen123      |

Change all passwords before going to production.

### Key File Locations

| What                  | Where                              |
|-----------------------|------------------------------------|
| Ward/zone master data | lib/wards.js                       |
| Role filtering logic  | lib/roleFilter.js                  |
| JWT auth logic        | lib/auth.js                        |
| DB connection         | lib/mongodb.js                     |
| Route protection      | middleware.js                      |
| Global user state     | lib/contexts/UserContext.js        |
| Issue model           | models/Issue.js                    |
| User model            | models/User.js                     |
| Issue creation API    | app/api/issues/route.js            |
| Login API             | app/api/auth/login/route.js        |
| AI analysis           | lib/ai.js                          |
| Notification helper   | lib/notifications.js               |
| Category to dept map  | lib/department-mapper.js           |
| GPS to zone           | lib/zones.js                       |

---

*Documentation for CivicPulse — Civic Issue Management System*
*Anand District, Gujarat | Next.js 14, MongoDB, TailwindCSS*

