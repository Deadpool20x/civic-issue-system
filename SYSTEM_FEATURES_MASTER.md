# CIVIC SYSTEM — COMPLETE FEATURES MASTER DOCUMENT
## Every Role → Every Feature → Every Sub-Page → Every Detail
## Version 1.0 — The Single Build Reference

---

> **FOR AI CODING AGENT — CRITICAL INSTRUCTIONS:**
>
> This document tells you EXACTLY what to build for EVERY page.
> Structure: Role → Features → Sub-Pages → What's on each page.
>
> RULES:
> 1. Read the FULL section for a role before building anything for it
> 2. Build ONE sub-page at a time — never multiple at once
> 3. Each page has a DOES NOT SHOW section — that is a hard restriction
> 4. Every page uses the components listed — do not invent new ones
> 5. Every page calls the API endpoint listed — do not change endpoints

---

## MASTER FEATURE TREE — FULL SYSTEM

```
CIVIC ISSUE SYSTEM
│
├── PUBLIC (no login required)
│   ├── / ...................... Landing Page
│   ├── /login ................. Login Page
│   ├── /register .............. Register Page
│   ├── /map ................... Public Issue Map
│   └── /public-dashboard ...... City Statistics
│
├── CITIZEN (role: CITIZEN / citizen)
│   ├── /citizen/dashboard ..... My Issues Dashboard
│   └── /citizen/report ........ Report New Issue
│
├── FIELD_OFFICER (role: FIELD_OFFICER / department)
│   ├── /department/dashboard .. Officer Main Dashboard
│   ├── /department/issues ..... My Assigned Issues
│   ├── /department/resolved ... My Resolved Issues
│   ├── /department/stats ...... My Performance
│   └── /department/profile .... My Profile
│
├── DEPARTMENT_MANAGER (role: DEPARTMENT_MANAGER / municipal)
│   ├── /municipal/dashboard ... Manager Main Dashboard
│   ├── /municipal/departments . Department Officers View
│   └── /municipal/sla-dashboard SLA Monitoring
│
├── MUNICIPAL_COMMISSIONER (role: MUNICIPAL_COMMISSIONER)
│   ├── /commissioner/dashboard  City Overview Dashboard
│   └── /commissioner/issues ... All City Issues
│
├── SYSTEM_ADMIN (role: SYSTEM_ADMIN / admin)
│   ├── /admin/dashboard ....... Admin Overview
│   ├── /admin/users ........... User Management
│   ├── /admin/users/create .... Create Staff Account
│   ├── /admin/departments ..... Department Config
│   ├── /admin/reports ......... Report Generator
│   └── /admin/analytics ....... System Analytics
│
└── SHARED (accessible by multiple roles)
    └── /issues/[id] ........... Issue Detail Page
```

---
---

# SECTION A: PUBLIC PAGES

---

## PAGE A1: LANDING PAGE

```
Route:     /
File:      app/page.js
Access:    PUBLIC — no login required
Redirect:  If logged in → auto-redirect to role dashboard
```

### Feature Tree
```
Landing Page
├── Navbar
├── Hero Section
├── How It Works
├── Roles Section
└── Footer
```

### Layout & Sections

| Section | Content | Components Used |
|---------|---------|-----------------|
| Navbar | Logo + [Login] + [Register] buttons | Link (next/link) |
| Hero | Headline + subheadline + 2 CTAs + map link | — |
| How It Works | 3 feature cards with icons | — |
| Roles Section | 4 role cards (Citizen, Municipal, Dept, Admin) | — |
| Footer | Copyright + description | — |

### Buttons & Actions

| Button Label | Action | Destination |
|---|---|---|
| Login | Navigate | /login |
| Register | Navigate | /register |
| Get Started | Navigate | /register |
| Sign In | Navigate | /login |
| 🗺️ View Issue Map | Navigate | /map |

### Data Shown
```
No API calls — static content only
Auto-redirect logic uses: useUser() from UserContext
If user exists → getDashboardForRole(user.role) → redirect
```

### DOES NOT SHOW
```
❌ Any issue data
❌ Any statistics
❌ Any user information
```

### Design Instructions
```
Background:      #0A0A0A
Navbar bg:       #080808
Hero headline:   text-5xl font-black text-white
CTA buttons:     bg-[#F5A623] text-black rounded-full px-8 py-3
Feature cards:   bg-[#1A1A1A] rounded-[20px] border border-[#333333]
Role cards:      bg-[#1A1A1A] rounded-[20px] border border-[#333333]
Footer bg:       #080808
```

---

## PAGE A2: LOGIN PAGE

```
Route:     /login
File:      app/(auth)/login/page.js
Access:    PUBLIC — redirect to dashboard if already logged in
```

### Feature Tree
```
Login Page
├── Centered Card
│   ├── Title "Sign In"
│   ├── Email Field
│   ├── Password Field (with eye toggle)
│   ├── [Sign In] Button
│   ├── Error Banner (if error)
│   └── "Create account" link → /register
```

### Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Email | email | Yes | valid email format |
| Password | password | Yes | min 6 chars |

### Buttons & Actions

| Button | Action | Behavior |
|--------|--------|----------|
| 👁️ (eye icon) | Toggle password visibility | Shows/hides password |
| Sign In | Submit form | Calls UserContext.login() → redirects on success |
| Create account | Navigate | → /register |

### API Call
```
POST /api/auth/login
Body: { email, password }
Success: Sets JWT cookie → UserContext redirects to role dashboard
Error: Shows red error banner with message
```

### DOES NOT SHOW
```
❌ Role selection (citizens only can self-register)
❌ Department field
❌ Ward field
```

### Design Instructions
```
Page background:  #0A0A0A
Card:             bg-[#1A1A1A] rounded-[20px] border border-[#333333] p-8
                  max-w-md mx-auto mt-24
Email input:      bg-[#222222] border border-[#333333] rounded-[12px]
                  text-white placeholder:text-[#666666] px-4 py-3 w-full
                  focus:border-[#F5A623] focus:outline-none
Password input:   Same as email + relative wrapper for eye icon
Eye icon:         absolute right-3 top-3 text-[#666666]
Sign In button:   bg-[#F5A623] text-black font-semibold rounded-full
                  px-6 py-3 w-full hover:bg-[#E09010]
Error banner:     bg-red-500/20 border border-red-500/40 text-red-400
                  rounded-[12px] p-3
Link:             text-[#F5A623] hover:underline
```

---

## PAGE A3: REGISTER PAGE

```
Route:     /register
File:      app/(auth)/register/page.js
Access:    PUBLIC — redirect to dashboard if already logged in
Note:      Only citizens can self-register. Role is ALWAYS set to 'citizen'.
```

### Feature Tree
```
Register Page
├── Centered Card
│   ├── Title "Create Account"
│   ├── Full Name Field
│   ├── Email Field
│   ├── Password Field (with eye toggle)
│   ├── Phone Field (optional)
│   ├── Address Fields (optional: street, city, state, pincode)
│   ├── [Sign Up] Button
│   ├── Error Banner (if error)
│   └── "Already have account" link → /login
```

### Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Full Name | text | Yes | non-empty |
| Email | email | Yes | valid email format |
| Password | password | Yes | min 6 chars |
| Phone | tel | No | valid phone format |
| Street Address | text | No | — |
| City | text | No | — |
| State | text | No | — |
| PIN Code | text | No | — |

### API Call
```
POST /api/auth/register
Body: { name, email, password, phone, address }
Role: ALWAYS 'citizen' — backend enforces this
Success: Sets JWT cookie → redirects to /citizen/dashboard
```

### DOES NOT SHOW
```
❌ Role dropdown
❌ Department selection
❌ Ward selection
❌ Any staff-level fields
```

### Design Instructions
```
Same card styling as login page.
Optional fields grouped under "Address (Optional)" collapsible label.
Phone field shows real-time validation checkmark when valid.
```

---

## PAGE A4: PUBLIC MAP

```
Route:     /map
File:      app/map/page.js
Access:    PUBLIC — no login required
Component: IssueMap.jsx (DO NOT MODIFY THIS COMPONENT)
```

### Feature Tree
```
Public Map
├── Full-screen Leaflet Map
│   ├── Issue Markers (color by status)
│   ├── Click Popup → issue summary
│   └── Zoom controls
├── Filter Bar (top overlay)
│   ├── Status filter buttons
│   └── Category filter dropdown
└── Issue Count Badge (top right)
```

### Data Shown

| Element | Data | API Endpoint |
|---------|------|--------------|
| Map markers | All public issues with coordinates | GET /api/issues/public |
| Marker color | Green=resolved, Blue=in-progress, Red=pending | — |
| Click popup | Title, status, category, reportId | — |
| Issue count | Total visible issues | — |

### DOES NOT SHOW
```
❌ Reporter name or personal info
❌ Internal staff comments
❌ Assignment information
❌ Any edit/action buttons (view only)
```

### Design Instructions
```
Page wrapper:    bg-[#0A0A0A]
Map container:   border border-[#333333] rounded-[20px] overflow-hidden
Filter bar:      bg-[#1A1A1A]/90 backdrop-blur border border-[#333333]
                 rounded-full px-4 py-2 (floating overlay)
Filter buttons:  Active: bg-[#F5A623] text-black rounded-full px-3 py-1
                 Inactive: text-[#AAAAAA] hover:text-white
Popup card:      bg-[#1A1A1A] border border-[#333333] rounded-[12px] p-3
```

---

## PAGE A5: PUBLIC DASHBOARD

```
Route:     /public-dashboard
File:      app/public-dashboard/page.js
Access:    PUBLIC — no login required
```

### Feature Tree
```
Public Dashboard
├── Header "City Issue Statistics"
├── City-wide Stat Cards Row
├── Issues by Category Chart
├── Issues by Status Chart
└── Recent Issues List (anonymized)
```

### Data Shown

| Section | Data | API Endpoint |
|---------|------|--------------|
| Stat cards | Total issues, Resolved, Pending, This month | GET /api/issues/public/stats |
| Category chart | Count per category | GET /api/issues/public/stats |
| Status chart | Count per status | GET /api/issues/public/stats |
| Recent list | Last 10 issues (no reporter names) | GET /api/issues/public |

### Design Instructions
```
Background:      #0A0A0A
Stat cards:      bg-[#1A1A1A] rounded-[20px] border border-[#333333]
                 Stat number: text-3xl font-bold text-[#F5A623]
                 Label: text-sm text-[#AAAAAA] uppercase tracking-wider
Charts:          Use recharts with dark theme
                 Chart bg: transparent, grid lines: #333333
                 Bar/line color: #F5A623
```

---
---

# SECTION B: CITIZEN PAGES

---

## CITIZEN FEATURE TREE

```
CITIZEN
├── Can do:
│   ├── Report new issues
│   ├── Track own issues
│   ├── Upvote any issue
│   ├── Comment on issues
│   └── Rate resolved issues
│
├── Cannot do:
│   ├── See other citizens' issues
│   ├── Access any staff dashboard
│   └── Change issue status
│
└── Pages:
    ├── /citizen/dashboard  ← main hub
    └── /citizen/report     ← create issue
```

---

## PAGE B1: CITIZEN DASHBOARD

```
Route:     /citizen/dashboard
File:      app/citizen/dashboard/page.js
Access:    CITIZEN only
Component: DashboardProtection allowedRoles={['CITIZEN','citizen']}
Layout:    DashboardLayout
```

### Feature Tree
```
Citizen Dashboard
├── Header
│   └── "Welcome, [name]" + notification bell
├── Stat Cards Row (4 cards)
│   ├── Total Reports
│   ├── Pending
│   ├── In Progress
│   └── Resolved
├── Filter Bar
│   └── All | Pending | In Progress | Resolved
├── Sort Bar
│   └── Recent | Upvotes
├── Issue Cards List
│   └── Each card: image + title + status + priority + date + upvotes + [View]
└── Empty State (when no issues)
```

### Stat Cards Detail

| Card Label | What It Shows | Source |
|------------|---------------|--------|
| Total Reports | Count of all citizen's issues | issues.length |
| Pending | Count where status='pending' OR 'assigned' | local filter |
| In Progress | Count where status='in-progress' | local filter |
| Resolved | Count where status='resolved' | local filter |

### Issue Card Fields

| Field | What It Shows |
|-------|---------------|
| Image | First uploaded photo OR gray placeholder |
| Report ID | e.g. "R00042" — gold text |
| Title | Issue title — white text |
| Status Badge | Color-coded pill (see status colors) |
| Priority Badge | Color-coded pill |
| Address | Truncated location string |
| Date | "2 days ago" relative time |
| Upvotes | 👍 count |
| [View →] | Link to /issues/[id] |

### Buttons & Actions

| Button | Action | Destination |
|--------|--------|-------------|
| Report Issue (gold, prominent) | Navigate | /citizen/report |
| All / Pending / In Progress / Resolved | Filter issues | client-side filter |
| Recent / Upvotes | Sort issues | client-side sort |
| View → (per issue) | Navigate | /issues/[id] |
| Notification bell | Open notifications panel | — |
| Logout | UserContext.logout() | /login |

### API Call
```
GET /api/issues
Filter applied automatically: { reportedBy: user.userId }
Response: Array of citizen's own issues only
```

### Navigation (sidebar)
```
Dashboard    → /citizen/dashboard   (active)
Report Issue → /citizen/report
My Issues    → /citizen/dashboard?filter=mine
Map          → /map
Public       → /public-dashboard
```

### DOES NOT SHOW
```
❌ Other citizens' issues
❌ Department assignment details
❌ Staff internal notes
❌ City-wide statistics
❌ Any admin or staff controls
```

### Design Instructions
```
Layout:     DashboardLayout with citizen nav
Sidebar bg: #080808
Header:     "My Dashboard" + user name
Stat cards: bg-[#1A1A1A] rounded-[20px]
            Number: text-3xl font-bold text-[#F5A623]
Filter bar: Pill buttons — active: bg-[#F5A623] text-black
Issue card: bg-[#1A1A1A] rounded-[20px] border border-[#333333]
            hover: border-[#F5A623]/40 transition
Report btn: bg-[#F5A623] text-black rounded-full font-bold
            fixed or prominent position
Empty state: Centered icon + "No issues yet" + [Report Issue] button
```

---

## PAGE B2: CITIZEN REPORT PAGE

```
Route:     /citizen/report
File:      app/citizen/report/page.js
Access:    CITIZEN only
```

### Feature Tree
```
Report Issue Page
├── Page Header "Report a New Issue"
├── SECTION 1: Issue Details
│   ├── Title field
│   ├── Description textarea
│   ├── Category dropdown
│   └── Subcategory dropdown (dynamic)
├── SECTION 2: Location
│   ├── Address text input
│   └── Map picker (LocationPicker component)
├── SECTION 3: Ward Selection
│   └── Ward dropdown (16 wards from /api/wards)
├── SECTION 4: Photo Upload
│   ├── Upload area (drag & drop)
│   ├── Image previews
│   └── AI Detection Result (after upload)
│       ├── "AI detected: [category] ([confidence]%)"
│       ├── [Confirm ✓] button
│       └── [Change ✗] button
└── [Submit Report] button
```

### Form Fields Detail

| Field | Type | Required | Options/Validation |
|-------|------|----------|--------------------|
| Title | text | Yes | 10–200 characters |
| Description | textarea | Yes | 30–2000 characters |
| Category | select | Yes | roads-infrastructure, street-lighting, waste-management, water-drainage, parks-public-spaces, traffic-signage, public-health-safety, other |
| Subcategory | select | Yes | Dynamic — changes based on category |
| Address | text | Yes | Free text location |
| Map Location | map picker | Yes | LocationPicker component |
| Ward | select | Yes | 16 wards from GET /api/wards |
| Photos | file | No | Max 3 images, jpg/png |

### Ward Dropdown Options
```
── North Zone ──
Ward 1, Ward 2, Ward 3, Ward 4,
Ward 5, Ward 6, Ward 7, Ward 8
── South Zone ──
Ward 9, Ward 10, Ward 11, Ward 12,
Ward 13, Ward 14, Ward 15, Ward 16
```

### AI Detection Flow
```
Step 1: Citizen uploads photo
Step 2: System calls Roboflow → Gemini → OpenAI fallback
Step 3: Show result below photo:
        "AI detected: Pothole (94%)" — gold text
        [Confirm ✓]  [Change ✗]  — two pill buttons
Step 4a: Citizen clicks Confirm
        → detectionSource = 'AI_CONFIRMED'
        → Category auto-filled in dropdown
Step 4b: Citizen clicks Change
        → detectionSource = 'AI_OVERRIDDEN'
        → Category dropdown enabled for manual selection
Step 4c: AI fails completely
        → Show: "Could not detect automatically"
        → detectionSource = 'MANUAL'
        → Citizen selects category manually
Note: Issue submission NEVER blocked by AI failure
```

### Submission Flow
```
1. Validate all required fields
2. Upload images to Cloudinary via POST /api/upload
3. POST /api/issues with all data
4. Backend: AI analysis + auto-assign + SLA calculation
5. Success: toast "Issue reported!" + redirect to /citizen/dashboard
6. Error: toast with error message + stay on page
```

### Components Used

| Section | Component | File |
|---------|-----------|------|
| Location map | LocationPicker | components/LocationPicker.jsx |
| Photo upload | ImageUploader | components/ImageUploader.jsx |
| AI result | Inline JSX (not separate component) | — |

### DOES NOT SHOW
```
❌ Priority field (set by AI — not user)
❌ Department field (auto-assigned)
❌ Assignment field (auto-assigned)
❌ Status field (always 'pending' on create)
```

### Design Instructions
```
Page bg:          #0A0A0A
Section headers:  text-[#AAAAAA] text-xs uppercase tracking-[0.2em]
                  (like "ISSUE DETAILS", "LOCATION", "PHOTOS")
Input fields:     bg-[#222222] border border-[#333333] rounded-[12px]
                  text-white px-4 py-3 focus:border-[#F5A623]
Textarea:         Same + min-h-[120px] resize-y
Dropdowns:        Same styling as inputs
Upload area:      bg-[#222222] border-2 border-dashed border-[#333333]
                  rounded-[20px] p-8 text-center
                  hover: border-[#F5A623]/60
Image preview:    Rounded-[12px] relative with X remove button
AI result box:    bg-[#F5A623]/10 border border-[#F5A623]/40
                  rounded-[12px] p-3
Confirm button:   bg-[#4ADE80] text-black rounded-full px-4 py-2
Change button:    bg-transparent border border-[#AAAAAA] text-[#AAAAAA]
                  rounded-full px-4 py-2
Submit button:    bg-[#F5A623] text-black rounded-full font-bold
                  w-full py-4 text-lg mt-6
```

---
---

# SECTION C: FIELD_OFFICER PAGES

---

## FIELD OFFICER FEATURE TREE

```
FIELD_OFFICER
├── Identity:
│   ├── wardId:       "ward-3"   (assigned by admin)
│   └── departmentId: "roads"    (assigned by admin)
│
├── Data access rule:
│   └── ALWAYS filter: { ward: wardId, dept: departmentId }
│       Example: Suresh sees ONLY Ward 3 + Roads issues
│
├── Can do:
│   ├── View own ward+dept issues
│   ├── Accept/reject assignments
│   ├── Update issue status
│   ├── Upload proof photos
│   ├── Add internal notes
│   └── View own performance stats
│
├── Cannot do:
│   ├── See other wards (even same dept)
│   ├── See other departments (even same ward)
│   ├── See city-wide data
│   ├── Access /municipal, /commissioner, /admin
│   └── Create or manage accounts
│
└── Pages:
    ├── /department/dashboard  ← main hub
    ├── /department/issues     ← full issue list
    ├── /department/resolved   ← resolved archive
    ├── /department/stats      ← my performance
    └── /department/profile    ← my profile
```

---

## PAGE C1: FIELD OFFICER DASHBOARD

```
Route:     /department/dashboard
File:      app/department/dashboard/page.js
Access:    FIELD_OFFICER only
Component: DashboardProtection allowedRoles={['FIELD_OFFICER','department']}
Layout:    DashboardLayout
```

### Feature Tree
```
Field Officer Dashboard
├── Header
│   ├── "Ward [X] — [Department] Department"
│   └── "Officer: [name]"
├── Stat Cards Row (4 cards)
│   ├── Total Assignments
│   ├── Pending
│   ├── In Progress
│   └── SLA Compliance %
├── Urgent Issues Section
│   └── Top 5 issues sorted by SLA deadline
├── Active Queue Section
│   └── All active issues sorted by urgency
└── Ward Image / Quick Info sidebar
```

### Header — Critical Rule
```
MUST show: "Ward 3 — Roads Department"
           (officer's wardId + departmentId)

MUST NOT show:
  ❌ "All Wards"
  ❌ Other ward names
  ❌ Other department names
  ❌ City-wide anything
```

### Stat Cards Detail

| Card | Label | Value | Source |
|------|-------|-------|--------|
| 1 | Total Assignments | Count of all officer's issues | GET /api/issues/department |
| 2 | Pending | Count where status in ['pending','assigned'] | local filter |
| 3 | Active Cases | Count where status='in-progress' | local filter |
| 4 | SLA Compliance | % of issues resolved before deadline | calculated |

### Issue Queue (Urgent Section)

| Column | Data |
|--------|------|
| Priority badge | URGENT / HIGH / MEDIUM / LOW — color coded |
| Report ID | e.g. R00042 — gold text |
| Title | Issue title |
| Address | Location string |
| SLA Countdown | "2h left" red / "14h left" amber / "3d left" green |
| [Update Status] | Opens status update — gold button |

### SLA Color Rules
```
< 2 hours remaining:   text-red-400  bg-red-500/20   (CRITICAL)
2–12 hours remaining:  text-amber-400 bg-amber-500/20 (WARNING)
> 12 hours remaining:  text-green-400 bg-green-500/20 (OK)
Overdue:               text-red-400  bg-red-500/20 + "OVERDUE" label
```

### Buttons & Actions

| Button | Action |
|--------|--------|
| [Update Status] per issue | Opens status modal for that issue |
| [View] per issue | Navigate to /issues/[id] |
| [All Tasks] | Navigate to /department/issues |
| [Navigate] per issue | Opens GPS/map link to issue location |

### API Call
```
GET /api/issues/department
Auth middleware applies: { ward: user.wardId, dept: user.departmentId }
Response: Only issues for this officer's ward + department
Sort: sla.deadline ascending (most urgent first)
```

### Navigation (sidebar)
```
Dashboard    → /department/dashboard  (active)
My Issues    → /department/issues
Resolved     → /department/resolved
Performance  → /department/stats
Profile      → /department/profile
```

### DOES NOT SHOW
```
❌ Issues from other wards
❌ Issues from other departments
❌ City-wide statistics
❌ Other officers' data
❌ Department manager controls
❌ Analytics or charts
```

---

## PAGE C2: FIELD OFFICER — MY ISSUES

```
Route:     /department/issues
File:      app/department/issues/page.js
Access:    FIELD_OFFICER only
```

### Feature Tree
```
My Issues Page
├── Page Header "My Assigned Issues"
├── Filter Row
│   ├── Status: All | Pending | In Progress | Assigned
│   ├── Priority: All | Urgent | High | Medium | Low
│   └── Search: by Report ID or title
├── Issues Table/List
│   └── Each row: ID | Title | Priority | Status | SLA | [View →]
└── Pagination (if > 20 issues)
```

### Table Columns

| Column | Data | Sortable |
|--------|------|----------|
| Report ID | R00042 — gold text | No |
| Title | Issue title | No |
| Priority | Color-coded badge | Yes |
| Status | Color-coded badge | Yes |
| SLA Deadline | Countdown or date | Yes |
| Action | [View →] button | No |

### Filters

| Filter | Options | Type |
|--------|---------|------|
| Status | All, Pending, Assigned, In Progress | Client-side |
| Priority | All, Urgent, High, Medium, Low | Client-side |
| Search | Free text on ID + title | Client-side |

### API Call
```
GET /api/issues/department
Same role filter as dashboard: { ward: wardId, dept: departmentId }
No status restriction — shows all active statuses
```

### DOES NOT SHOW
```
❌ Resolved issues (those are on /department/resolved)
❌ Other officers' issues
❌ Reporter personal information
❌ Internal department notes
```

### Design Instructions
```
Filter pills: Active = bg-[#F5A623] text-black rounded-full
              Inactive = border border-[#333333] text-[#AAAAAA] rounded-full
Search input: bg-[#222222] border border-[#333333] rounded-full
Table rows:   bg-[#1A1A1A] border-b border-[#333333]
              hover: bg-[#222222] transition
View button:  text-[#F5A623] hover:underline
```

---

## PAGE C3: FIELD OFFICER — RESOLVED ISSUES

```
Route:     /department/resolved
File:      app/department/resolved/page.js
Access:    FIELD_OFFICER only
```

### Feature Tree
```
Resolved Issues Page
├── Page Header "Resolved Issues"
├── Summary Row
│   ├── Total Resolved
│   ├── This Month
│   └── Avg Resolution Time
├── Date Range Filter
└── Resolved Issues Table
    └── Each row: ID | Title | Priority | Resolved Date | Rating | [View →]
```

### Table Columns

| Column | Data |
|--------|------|
| Report ID | R00042 — gold text |
| Title | Issue title |
| Priority | Color-coded badge |
| Resolved Date | Formatted date (e.g. "Jan 15, 2026") |
| Citizen Rating | ⭐ 1–5 stars (if rated) or "—" |
| Action | [View →] → /issues/[id] |

### API Call
```
GET /api/issues/department?status=resolved
Role filter still applies: { ward: wardId, dept: departmentId }
Sort: updatedAt descending (most recently resolved first)
```

### DOES NOT SHOW
```
❌ Pending or active issues
❌ Other officers' resolved issues
❌ Unrated issues marked differently (just show "—")
```

---

## PAGE C4: FIELD OFFICER — PERFORMANCE / STATS

```
Route:     /department/stats
File:      app/department/stats/page.js
Access:    FIELD_OFFICER only
```

### Feature Tree
```
My Performance Page
├── Page Header "My Performance"
├── Stat Cards (5 cards)
│   ├── Total Issues (all time)
│   ├── Pending
│   ├── In Progress
│   ├── Resolved
│   └── High Priority
├── This Month Summary
│   ├── Resolved this month
│   ├── Avg resolution time
│   └── SLA compliance %
├── Performance Badge Section
│   └── Earned badges display
└── Monthly Trend (if data exists)
```

### Stat Cards Detail

| Card | Label | Value |
|------|-------|-------|
| 1 | Total Issues | All issues ever assigned |
| 2 | Pending | Currently pending |
| 3 | In Progress | Currently active |
| 4 | Resolved | Total resolved all time |
| 5 | High Priority | Urgent + High count |

### API Call
```
GET /api/issues/department
All data calculated on frontend from response
No separate stats endpoint needed — use same issue list
```

### Badge Display
```
If officer has badges from StaffPerformance model:
  Show badge cards: icon + name + description + earned date
  Badge categories: speed | quality | consistency | leadership | innovation
  Badge card: bg-[#1A1A1A] border border-[#F5A623]/40 rounded-[20px]

If no badges yet:
  Show: "No badges earned yet — keep resolving issues!"
```

### DOES NOT SHOW
```
❌ Other officers' stats
❌ Department-wide stats
❌ City-wide analytics
❌ Other wards' data
```

---

## PAGE C5: FIELD OFFICER — PROFILE

```
Route:     /department/profile
File:      app/department/profile/page.js
Access:    FIELD_OFFICER only
```

### Feature Tree
```
Profile Page
├── Page Header "My Profile"
├── Profile Card
│   ├── Avatar (initials circle — gold bg)
│   ├── Name
│   ├── Email
│   ├── Role display: "Field Officer"
│   ├── Department display: e.g. "Roads Department"
│   ├── Ward display: e.g. "Ward 3 — North Zone"
│   └── Status: Active (green badge)
└── (No edit functionality — display only)
```

### Data Source
```
GET /api/auth/me
Returns: user object with wardId, departmentId, role, name, email
Display logic:
  wardId "ward-3" → display "Ward 3 — North Zone"
  departmentId "roads" → display "Roads Department"
  role "FIELD_OFFICER" → display "Field Officer"
```

### DOES NOT SHOW
```
❌ Password field
❌ Edit form (read-only profile)
❌ Other users' information
❌ System configuration
```

### Design Instructions
```
Avatar circle:    w-20 h-20 bg-[#F5A623] text-black rounded-full
                  text-2xl font-bold (initials)
Profile card:     bg-[#1A1A1A] rounded-[20px] border border-[#333333] p-8
Label:            text-[#AAAAAA] text-sm uppercase tracking-wider
Value:            text-white font-medium text-lg
Ward badge:       bg-[#F5A623]/10 border border-[#F5A623]/40 text-[#F5A623]
                  rounded-full px-3 py-1 text-sm
Active badge:     bg-green-500/20 border border-green-500/40 text-green-400
                  rounded-full px-3 py-1 text-sm
```

---
---

# SECTION D: DEPARTMENT_MANAGER PAGES

---

## DEPARTMENT MANAGER FEATURE TREE

```
DEPARTMENT_MANAGER
├── Identity:
│   ├── wardId:       null   (no ward restriction)
│   └── departmentId: "roads" (manages whole department)
│
├── Data access rule:
│   └── Filter: { dept: departmentId } — NO ward filter
│       Example: Kavita sees ALL Roads issues from ALL 16 wards
│
├── Can do:
│   ├── View all wards in own department
│   ├── See all Field Officers in own dept
│   ├── Reassign issues between officers
│   ├── Override issue priority
│   ├── Handle L1 escalations
│   ├── View department analytics
│   └── Generate department reports
│
├── Cannot do:
│   ├── See other departments' issues
│   ├── See city-wide data
│   ├── Access /commissioner or /admin
│   └── Create/manage user accounts
│
└── Pages:
    ├── /municipal/dashboard      ← main hub
    ├── /municipal/departments    ← officer management
    └── /municipal/sla-dashboard  ← SLA monitoring
```

---

## PAGE D1: DEPARTMENT MANAGER DASHBOARD

```
Route:     /municipal/dashboard
File:      app/municipal/dashboard/page.js
Access:    DEPARTMENT_MANAGER only
Component: DashboardProtection allowedRoles={['DEPARTMENT_MANAGER','municipal']}
Layout:    DashboardLayout
```

### Feature Tree
```
Manager Dashboard
├── Header
│   ├── "[Department] Department — All Wards"
│   └── "Manager: [name]"
├── Stat Cards Row (4 cards)
│   ├── Total Active Issues
│   ├── Resolved This Month
│   ├── SLA Compliance %
│   └── Pending Escalations
├── Ward Performance Grid (16 ward cards)
│   └── Each card: Ward name | issue count | SLA % | color status
├── My Officers Section
│   └── Each officer: name | ward | active count | [Reassign]
└── Escalations Panel
    └── L1 alerts needing response
```

### Header — Critical Rule
```
MUST show: "Roads Department — All Wards"
           (manager's departmentId + "All Wards")

MUST NOT show:
  ❌ Specific ward name
  ❌ Other departments
  ❌ "City Overview"
```

### Stat Cards Detail

| Card | Label | Value | Source |
|------|-------|-------|--------|
| 1 | Total Active Issues | All open issues in dept | GET /api/issues (dept filter) |
| 2 | Resolved This Month | This calendar month | local filter |
| 3 | SLA Compliance % | % resolved before deadline | calculated |
| 4 | Pending Escalations | L1 escalated issues | local filter |

### Ward Performance Grid (16 cards)
```
Layout: 4 columns × 4 rows grid
Each card shows:
  Ward name: "Ward 3"
  Issue count: "12 active"
  SLA %: "87%"
  Color indicator:
    Green:  SLA % > 85% AND issues < 10
    Amber:  SLA % 60-85% OR issues 10-20
    Red:    SLA % < 60% OR issues > 20

IMPORTANT: Data filtered to OWN DEPARTMENT only
  Kavita (roads manager) sees Ward 3's ROADS issues only
  NOT Ward 3's water/waste/lighting issues
```

### Officers Section

| Column | Data |
|--------|------|
| Name | Officer full name |
| Ward | "Ward 3" |
| Active Issues | Count of their active issues |
| Action | [Reassign Issues] button |

### API Calls
```
GET /api/issues — with dept filter: { assignedDepartmentCode: departmentId }
GET /api/users?role=FIELD_OFFICER&departmentId=[id] — for officers list
GET /api/wards — for ward grid labels
```

### DOES NOT SHOW
```
❌ Other departments' issues or data
❌ City-wide statistics
❌ Commissioner-level views
❌ System configuration
❌ Issues from other departments in same ward
```

---

## PAGE D2: DEPARTMENT MANAGER — DEPARTMENTS (OFFICERS VIEW)

```
Route:     /municipal/departments
File:      app/municipal/departments/page.js
Access:    DEPARTMENT_MANAGER only
```

### Feature Tree
```
My Officers Page
├── Page Header "[Department] — Officer Management"
├── Officer Cards Grid
│   └── Each officer:
│       ├── Name + avatar
│       ├── Ward assignment
│       ├── Active issues count
│       ├── Resolved this month
│       ├── SLA compliance %
│       └── [View Issues] button
├── Unassigned Issues Section
│   └── Issues with no Field Officer
└── Reassign Modal (when [Reassign] clicked)
    ├── Issue selector
    ├── Target officer dropdown
    └── [Confirm Reassign] button
```

### Officer Card Data

| Field | Source |
|-------|--------|
| Name | user.name |
| Ward | user.wardId formatted |
| Active issues | Count issues assigned to officer |
| Resolved this month | Count resolved issues this month |
| SLA compliance | % on-time resolutions |

### API Calls
```
GET /api/users?role=FIELD_OFFICER&departmentId=[id]
GET /api/issues?assignedTo=[officerId] (per officer)
PATCH /api/issues/[id] — for reassignment
```

### DOES NOT SHOW
```
❌ Officers from other departments
❌ City-wide officer list
❌ DEPARTMENT_MANAGER accounts
❌ Admin controls
```

---

## PAGE D3: DEPARTMENT MANAGER — SLA DASHBOARD

```
Route:     /municipal/sla-dashboard
File:      app/municipal/sla-dashboard/page.js
Access:    DEPARTMENT_MANAGER only
```

### Feature Tree
```
SLA Dashboard
├── Page Header "SLA Monitoring — [Department]"
├── Summary Cards Row
│   ├── Overall SLA Compliance %
│   ├── Issues Breached Today
│   ├── Issues Due in 24h
│   └── Avg Resolution Time (hours)
├── SLA Breach Table
│   └── Overdue issues sorted by most overdue first
├── Upcoming Deadlines Table
│   └── Issues due in next 24 hours
└── SLA Trend Chart
    └── Daily compliance % for last 30 days
```

### SLA Breach Table Columns

| Column | Data |
|--------|------|
| Report ID | Gold text |
| Title | Issue title |
| Priority | Color badge |
| Ward | Which ward |
| Officer | Assigned officer name |
| Overdue By | "3h 20m overdue" — red text |
| Action | [Escalate] or [Reassign] buttons |

### Upcoming Deadlines Table Columns

| Column | Data |
|--------|------|
| Report ID | Gold text |
| Title | Issue title |
| Priority | Color badge |
| Ward | Which ward |
| Officer | Assigned officer name |
| Due In | "4h 30m" — amber text |
| Action | [View] button |

### API Calls
```
GET /api/issues?assignedDepartmentCode=[id]&isOverdue=true
GET /api/issues?assignedDepartmentCode=[id]&dueSoon=true
GET /api/sla — department-scoped SLA stats
```

### DOES NOT SHOW
```
❌ Other departments' SLA data
❌ City-wide SLA performance
❌ Commissioner-level escalations (L2/L3)
```

---
---

# SECTION E: MUNICIPAL_COMMISSIONER PAGES

---

## COMMISSIONER FEATURE TREE

```
MUNICIPAL_COMMISSIONER
├── Identity:
│   ├── wardId:       null  (no restrictions)
│   └── departmentId: null  (no restrictions)
│
├── Data access rule:
│   └── NO FILTER — sees everything
│       Query: {} (empty = all issues)
│
├── Can do:
│   ├── See ALL issues from ALL departments and ALL wards
│   ├── Read AI daily briefing
│   ├── View city heatmap
│   ├── View department rankings
│   ├── Handle L2 and L3 escalations
│   ├── Override any issue priority
│   └── Generate official city-wide reports
│
├── Cannot do:
│   ├── Create/manage user accounts (that's SYSTEM_ADMIN)
│   ├── Configure system settings
│   ├── Access /admin routes
│   └── See system logs
│
└── Pages:
    ├── /commissioner/dashboard  ← city overview (NEW PAGE)
    └── /commissioner/issues     ← all city issues
```

---

## PAGE E1: COMMISSIONER DASHBOARD ⚠️ NEW PAGE

```
Route:     /commissioner/dashboard
File:      app/commissioner/dashboard/page.js
Access:    MUNICIPAL_COMMISSIONER only
Status:    BUILD FROM SCRATCH — this page does not fully exist
Component: DashboardProtection allowedRoles={['MUNICIPAL_COMMISSIONER']}
Layout:    DashboardLayout
```

### Feature Tree
```
Commissioner Dashboard
├── Header "City Overview — All Departments"
├── AI Briefing Card (TOP — full width, most prominent)
├── City Stat Cards Row (4 cards)
├── Department Rankings Table (all 8 departments)
├── Critical Escalations Panel
└── Quick Links Row
```

### AI Briefing Card — Top Priority Section
```
Position:  Very top of page, full width
Purpose:   Daily AI-generated city briefing

Content:
  Header:    "🤖 AI DAILY BRIEFING"
  Subheader: "Generated: Today at 6:00 AM"
  Body:      3 bullet insights + 1 recommendation
  Footer:    [View History] button

Styling:
  bg-[#1A1A1A] border border-[#F5A623]/60 rounded-[20px] p-6
  Left accent: border-l-4 border-[#F5A623]
  Header text: text-[#F5A623] font-bold text-lg
  Body text:   text-white
  Bullets:     text-[#AAAAAA] with gold bullet points

API:
  GET /api/commissioner/briefing
  Returns: { insights: [], recommendation: '', generatedAt: Date }

If no briefing:
  Show: "Briefing will be generated at 6:00 AM today"
```

### City Stat Cards

| Card | Label | Value | Source |
|------|-------|-------|--------|
| 1 | Total Active Issues | All open issues city-wide | GET /api/issues (no filter) |
| 2 | Resolved Today | Issues resolved today | local filter |
| 3 | SLA Compliance | City-wide SLA % | calculated |
| 4 | Avg Citizen Rating | Average of all ratings | GET /api/issues/stats |

### Department Rankings Table

| Column | Data |
|--------|------|
| Rank | # 1, 2, 3... |
| Department | Department name |
| Active Issues | Count open issues |
| Resolved % | Resolution rate |
| SLA Compliance | % on-time |
| Trend | ↑ ↓ → based on last week |

All 8 departments shown. Sorted by resolution rate descending.

### Critical Escalations Panel
```
Shows: L2 and L3 escalated issues only
Each item:
  🚨 [Priority] [Report ID] — [Title] — [Ward] [Department]
  "Overdue by [X] hours — [escalation level]"
  [Acknowledge] [View Issue] buttons

Styling:
  bg-[#1A1A1A] border border-red-500/40 rounded-[20px]
  Each item: border-b border-[#333333]
  Priority badge: bg-red-500/20 text-red-400 rounded-full
```

### API Calls
```
GET /api/issues — NO filter (commissioner sees all)
GET /api/commissioner/briefing — daily AI briefing
GET /api/departments — for rankings table
GET /api/issues?escalationLevel=2 — L2 escalations
GET /api/issues?escalationLevel=3 — L3 escalations
```

### Navigation (sidebar)
```
Dashboard    → /commissioner/dashboard  (active)
City Map     → /map
All Issues   → /commissioner/issues
Departments  → /municipal/departments (reuse)
Reports      → /admin/reports (reuse)
```

### DOES NOT SHOW
```
❌ System configuration controls
❌ User management
❌ Any /admin route links
❌ Technical system data
❌ Filtered/scoped data (sees everything)
```

---

## PAGE E2: COMMISSIONER — ALL ISSUES

```
Route:     /commissioner/issues
File:      app/commissioner/issues/page.js
Access:    MUNICIPAL_COMMISSIONER only
```

### Feature Tree
```
All City Issues Page
├── Page Header "All City Issues"
├── Filter Row
│   ├── Status filter
│   ├── Department filter (all 8)
│   ├── Ward filter (all 16)
│   ├── Priority filter
│   └── Date range
├── Issues Table
│   └── Each row: ID | Title | Ward | Dept | Priority | Status | SLA | [View]
└── Export button → CSV
```

### Table Columns

| Column | Data |
|--------|------|
| Report ID | Gold text |
| Title | Issue title |
| Ward | "Ward 3" |
| Department | "Roads" |
| Priority | Color badge |
| Status | Color badge |
| SLA Status | "2h left" or "OVERDUE" |
| Action | [View →] |

### API Call
```
GET /api/issues — NO filter
Query params from UI filters:
  ?status=pending&departmentId=roads&ward=ward-3&priority=high
```

### DOES NOT SHOW
```
❌ Reporter personal details (show report ID only)
❌ Internal staff notes
❌ System configuration
```

---
---

# SECTION F: SYSTEM_ADMIN PAGES

---

## SYSTEM ADMIN FEATURE TREE

```
SYSTEM_ADMIN
├── Identity:
│   ├── wardId:       null
│   └── departmentId: null
│
├── Data access rule:
│   └── BLOCKED from all issue endpoints → returns 403
│       Query to /api/issues → ACCESS DENIED
│
├── Can do:
│   ├── Create staff accounts (with role+ward+dept assignment)
│   ├── Deactivate/delete accounts
│   ├── Configure departments
│   ├── Configure wards
│   ├── Set SLA rules
│   ├── View audit logs
│   └── Manage system settings
│
├── Cannot do:
│   ├── See ANY civic issue data
│   ├── See city statistics
│   ├── Access any other dashboard
│   └── Override issue status
│
└── Pages:
    ├── /admin/dashboard     ← admin overview (keep existing)
    ├── /admin/users         ← user management
    ├── /admin/users/create  ← create staff account
    ├── /admin/departments   ← dept config
    ├── /admin/reports       ← report generator
    └── /admin/analytics     ← system analytics
```

---

## PAGE F1: ADMIN DASHBOARD

```
Route:     /admin/dashboard
File:      app/admin/dashboard/page.js
Access:    SYSTEM_ADMIN only
Note:      Keep existing functionality — only apply dark theme
```

### Feature Tree
```
Admin Dashboard
├── Header "System Administration"
├── System Overview Cards (NO issue data)
│   ├── Total Users (by role count)
│   ├── Total Departments
│   ├── Active Officers
│   └── System Health
├── Quick Actions
│   ├── [Create User] → /admin/users/create
│   ├── [Manage Departments] → /admin/departments
│   ├── [View Reports] → /admin/reports
│   └── [Analytics] → /admin/analytics
└── Recent Account Activity
    └── New accounts created (last 7 days)
```

### DOES NOT SHOW — CRITICAL
```
❌ Total issues count
❌ Issue statistics
❌ Department performance metrics
❌ City heatmap
❌ Citizen complaints data
❌ ANY civic data at all
```

---

## PAGE F2: ADMIN USERS PAGE

```
Route:     /admin/users
File:      app/admin/users/page.js
Access:    SYSTEM_ADMIN only
```

### Feature Tree
```
User Management Page
├── Page Header "User Management"
├── Filter + Search Row
│   ├── Role filter: All | CITIZEN | FIELD_OFFICER |
│   │               DEPARTMENT_MANAGER | MUNICIPAL_COMMISSIONER | SYSTEM_ADMIN
│   ├── Status filter: Active | Inactive
│   └── Search: by name or email
├── [+ Create User] button → /admin/users/create
├── Users Table
│   └── Each row: Name | Email | Role | Ward | Dept | Status | [Actions]
└── Pagination
```

### Table Columns

| Column | Data |
|--------|------|
| Name | Full name |
| Email | Email address |
| Role | Role badge (color coded) |
| Ward | "Ward 3" or "—" |
| Department | "Roads" or "—" |
| Status | Active (green) / Inactive (red) badge |
| Actions | [Edit] [Deactivate/Activate] [Delete] |

### API Calls
```
GET /api/users/admin — all users
PATCH /api/users/[id] — edit user
DELETE /api/users/[id] — delete user
```

---

## PAGE F3: ADMIN CREATE USER — CRITICAL PAGE

```
Route:     /admin/users/create
File:      app/admin/users/create/page.js
Access:    SYSTEM_ADMIN only
Note:      This is the most important admin page
           Ward + Dept assignment happens here
```

### Feature Tree
```
Create User Page
├── Page Header "Create Staff Account"
├── Base Fields (show for ALL roles)
│   ├── Full Name
│   ├── Email
│   ├── Password
│   ├── Phone (optional)
│   └── Role dropdown
├── CONDITIONAL: Ward field
│   └── Shows ONLY when role = FIELD_OFFICER
├── CONDITIONAL: Department field
│   └── Shows when role = FIELD_OFFICER OR DEPARTMENT_MANAGER
└── [Create Account] button
```

### Form Fields — Complete Detail

| Field | Type | Required | Shows For | Options |
|-------|------|----------|-----------|---------|
| Full Name | text | Yes | ALL roles | — |
| Email | email | Yes | ALL roles | — |
| Password | password | Yes | ALL roles | min 6 chars |
| Phone | tel | No | ALL roles | — |
| Role | select | Yes | ALL roles | FIELD_OFFICER, DEPARTMENT_MANAGER, MUNICIPAL_COMMISSIONER, SYSTEM_ADMIN |
| Ward | select | Yes | FIELD_OFFICER only | 16 wards from GET /api/wards |
| Department | select | Yes | FIELD_OFFICER + DEPARTMENT_MANAGER | 8 depts from GET /api/departments |

### Ward Dropdown Behavior
```
WHEN role = FIELD_OFFICER:
  Show ward dropdown
  Options grouped by zone:
    North Zone: Ward 1–8
    South Zone: Ward 9–16
  Required — cannot submit without selecting

WHEN role = DEPARTMENT_MANAGER:
  Hide ward dropdown
  Show department dropdown only

WHEN role = MUNICIPAL_COMMISSIONER or SYSTEM_ADMIN:
  Hide both ward AND department dropdowns
```

### API Call
```
POST /api/admin/create-user
Body: {
  name, email, password, phone,
  role,
  wardId: (if FIELD_OFFICER),
  departmentId: (if FIELD_OFFICER or DEPARTMENT_MANAGER)
}
Success: toast "Account created" + redirect to /admin/users
Error: show error banner with specific message
```

---

## PAGE F4: ADMIN DEPARTMENTS

```
Route:     /admin/departments
File:      app/admin/departments/page.js
Access:    SYSTEM_ADMIN only
```

### Feature Tree
```
Departments Page
├── Page Header "Department Configuration"
├── [+ Add Department] button
├── Departments List
│   └── Each dept card:
│       ├── Dept name + icon
│       ├── Contact email
│       ├── Categories handled
│       ├── Staff count
│       ├── Status badge (Active/Inactive)
│       └── [Edit] [Deactivate] buttons
└── Edit Department Modal
    ├── Name, description, contact email, phone
    ├── Categories (multi-select)
    └── [Save] button
```

### API Calls
```
GET /api/departments
POST /api/departments — create
PATCH /api/departments/[id] — update
DELETE /api/departments/[id] — deactivate
```

### DOES NOT SHOW
```
❌ Issue counts per department
❌ Performance metrics
❌ SLA data
(admin only configures — cannot see civic data)
```

---

## PAGE F5: ADMIN REPORTS

```
Route:     /admin/reports
File:      app/admin/reports/page.js
Access:    SYSTEM_ADMIN only
Note:      This page generates reports for download
           Commissioner also has access to this page
```

### Feature Tree
```
Reports Page
├── Page Header "Report Generator"
├── Report Type selector
│   ├── Users Report
│   ├── Departments Report
│   ├── Issues Report (available to Commissioner only)
│   └── Performance Report
├── Filters Section
│   ├── Date range picker (start date — end date)
│   ├── Role filter (for users report)
│   └── Department filter (for dept report)
├── [Generate Report] button → gold
├── [Download CSV] button → outline gold
└── Preview Table
    └── First 10 rows of generated report
```

### API Calls
```
GET /api/reports?type=users&startDate=X&endDate=Y
GET /api/reports?type=departments
GET /api/reports/download?type=issues — returns CSV file
```

---

## PAGE F6: ADMIN ANALYTICS

```
Route:     /admin/analytics
File:      app/admin/analytics/page.jsx
Access:    SYSTEM_ADMIN only
```

### Feature Tree
```
Analytics Page
├── Tab Bar: Overview | Departments | Workflow | Stuck | Trends
│
├── TAB 1: Overview
│   ├── System KPI cards
│   └── Trend line chart (issues over time)
│
├── TAB 2: Departments
│   ├── Bar chart: issues per department
│   └── SLA compliance per department
│
├── TAB 3: Workflow
│   ├── Avg time per status
│   └── Bottleneck identification
│
├── TAB 4: Stuck Issues
│   ├── Issues stuck > 7 days
│   └── Long-pending by department
│
└── TAB 5: Trends
    ├── Historical trends (last 6 months)
    └── Category trends
```

### API Calls
```
GET /api/admin/analytics/overview
GET /api/admin/analytics/departments
GET /api/admin/analytics/workflow
GET /api/admin/analytics/stuck
GET /api/admin/analytics/trends
```

---
---

# SECTION G: SHARED PAGE

---

## PAGE G1: ISSUE DETAIL PAGE

```
Route:     /issues/[id]
File:      app/issues/[id]/page.js
Access:    PUBLIC — but actions depend on role
```

### Feature Tree
```
Issue Detail Page
├── Header: Report ID + Status badge + Priority badge
├── Issue Info Card
│   ├── Title
│   ├── Description
│   ├── Category + Subcategory
│   ├── Ward + Location
│   └── Reporter (first name only for privacy)
├── Photos Section
│   └── Image gallery (click to enlarge)
├── Map Section
│   └── IssueMap showing exact location pin
├── Status Timeline
│   └── StatusTimeline component — vertical history
├── Action Bar (role-dependent — see below)
└── Comments Section
    ├── Existing comments
    └── Add comment input (if logged in)
```

### Action Bar — Role-Based

| Role | Actions Shown |
|------|---------------|
| CITIZEN (reporter) | [👍 Upvote] [Rate Issue (if resolved)] |
| CITIZEN (other) | [👍 Upvote] only |
| FIELD_OFFICER | [Update Status] [Add Note] [Upload Proof] |
| DEPARTMENT_MANAGER | [Update Status] [Reassign] [Escalate] |
| MUNICIPAL_COMMISSIONER | [Override Priority] [Escalate to L3] |
| SYSTEM_ADMIN | View only — no actions |
| Not logged in | [👍 Upvote] only |

### Status Update Modal (for FIELD_OFFICER)
```
Opens when: [Update Status] clicked
Contains:
  Status dropdown: pending → assigned → in-progress → resolved → rejected
  Comment field: "Add a note about this update"
  Photo upload: proof of work (optional, required for resolved)
  [Submit Update] button → gold
  
API: PATCH /api/issues/[id]/status
```

### Components Used

| Section | Component |
|---------|-----------|
| Map | IssueMap.jsx (DO NOT MODIFY) |
| Status history | StatusTimeline.jsx (DO NOT MODIFY) |
| Rating | RatingModal.jsx (DO NOT MODIFY) |
| Duplicate detection | DuplicateModal.jsx (DO NOT MODIFY) |

### DOES NOT SHOW to non-staff
```
❌ Internal staff notes
❌ Assignment details (who it's assigned to)
❌ Department contact info
❌ SLA deadline (only staff see this)
```

### Design Instructions
```
Page bg:        #0A0A0A
Info card:      bg-[#1A1A1A] rounded-[20px] border border-[#333333]
Photo gallery:  Dark bg with rounded images, hover zoom
Map section:    Dark border surround, rounded-[20px]
Status badges:  Same color system as everywhere else
Timeline:       StatusTimeline component — dark theme
Comments:       bg-[#222222] inputs, comment items bg-[#1A1A1A]
Upvote button:  border border-[#F5A623] text-[#F5A623] rounded-full
                Active (upvoted): bg-[#F5A623] text-black
```

---
---

# SECTION H: STATUS COLORS — UNIVERSAL REFERENCE

Use these exact colors everywhere in the system:

```javascript
// STATUS COLORS
const STATUS_STYLES = {
  'pending':     'bg-gray-500/20   text-gray-400   border border-gray-500/40',
  'assigned':    'bg-blue-500/20   text-blue-400   border border-blue-500/40',
  'in-progress': 'bg-amber-500/20  text-amber-400  border border-amber-500/40',
  'resolved':    'bg-green-500/20  text-green-400  border border-green-500/40',
  'rejected':    'bg-red-500/20    text-red-400    border border-red-500/40',
  'escalated':   'bg-red-600/20    text-red-300    border border-red-600/40',
  'reopened':    'bg-purple-500/20 text-purple-400 border border-purple-500/40',
}

// PRIORITY COLORS
const PRIORITY_STYLES = {
  'urgent': 'bg-red-500/20    text-red-400    border border-red-500/40',
  'high':   'bg-orange-500/20 text-orange-400 border border-orange-500/40',
  'medium': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
  'low':    'bg-green-500/20  text-green-400  border border-green-500/40',
}

// All badges: rounded-full px-3 py-1 text-xs font-medium
```

---

# SECTION I: COMPONENT REFERENCE

Use these components — do not rebuild them from scratch:

| Component | File | Used On | DO NOT MODIFY |
|-----------|------|---------|----------------|
| DashboardLayout | components/DashboardLayout.js | All dashboards | Yes — only update nav items and theme |
| DashboardProtection | components/DashboardProtection.js | All dashboards | No — update allowedRoles |
| IssueMap | components/IssueMap.jsx | /map, /issues/[id] | ✅ YES — DO NOT TOUCH |
| LocationPicker | components/LocationPicker.jsx | /citizen/report | ✅ YES — DO NOT TOUCH |
| StatusTimeline | components/StatusTimeline.jsx | /issues/[id] | ✅ YES — DO NOT TOUCH |
| ImageUploader | components/ImageUploader.jsx | /citizen/report | ✅ YES — DO NOT TOUCH |
| RatingModal | components/RatingModal.jsx | /issues/[id] | ✅ YES — DO NOT TOUCH |
| DuplicateModal | components/DuplicateModal.jsx | /citizen/report | ✅ YES — DO NOT TOUCH |
| ErrorBoundary | components/ErrorBoundary.js | App-wide | ✅ YES — DO NOT TOUCH |
| PriorityBadge | components/PriorityBadge.jsx | Issue cards | Update colors only |

---

# SECTION J: BUILD ORDER FOR AI AGENT

```
Build in this EXACT order. Never skip ahead.
After each page: verify with checklist. Then move to next.

ORDER:
  1.  app/globals.css .............. Add CSS variables + dark base
  2.  tailwind.config.mjs .......... Add custom colors
  3.  components/DashboardLayout.js  Update sidebar + nav (dark theme)
  4.  app/(auth)/login/page.js ..... Dark theme
  5.  app/(auth)/register/page.js .. Dark theme
  6.  app/page.js .................. Dark theme landing
  7.  app/citizen/dashboard/page.js  Full update
  8.  app/citizen/report/page.js ... Ward dropdown + AI detection
  9.  app/department/dashboard/page.js Ward header + SLA queue
  10. app/department/issues/page.js  Filter table
  11. app/department/resolved/page.js Resolved table
  12. app/department/stats/page.js .. Stats cards
  13. app/department/profile/page.js Profile card
  14. app/municipal/dashboard/page.js Ward grid + officer list
  15. app/municipal/departments/page.js Officer management
  16. app/municipal/sla-dashboard/page.js SLA tables
  17. app/commissioner/dashboard/page.js BUILD NEW — AI briefing + rankings
  18. app/commissioner/issues/page.js All issues table
  19. app/admin/dashboard/page.js ... Admin overview (keep logic, dark theme)
  20. app/admin/users/page.js ....... User table
  21. app/admin/users/create/page.js  Ward+dept conditional fields
  22. app/admin/departments/page.js . Dept config
  23. app/admin/reports/page.js ..... Report generator
  24. app/admin/analytics/page.jsx .. Analytics tabs
  25. app/issues/[id]/page.js ....... Issue detail (role-based actions)
  26. app/map/page.js ............... Dark wrapper (DO NOT modify map itself)
  27. app/public-dashboard/page.js .. Dark theme

STOP after each step. Verify. Then continue.
```

---

*SYSTEM FEATURES MASTER DOCUMENT v1.0*
*Every role → every page → every feature → every detail*
*This is the single build reference. Do not deviate.*
