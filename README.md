<div align="center">
  <img src="public/favicon.ico" alt="Logo" width="80" height="80">
  <h1 align="center">CivicPulse: Smart Civic Issue System</h1>
  
  <p align="center">
    A next-generation, AI-powered platform for citizens to report civic issues and for municipal departments to track, manage, and resolve them efficiently.
    <br />
    <br />
    <a href="https://civic-issue-system-zduo.onrender.com"><strong>🌍 View Live Application »</strong></a>
    <br />
    <br />
  </p>
</div>

---

## 🎯 About The Project

**CivicPulse** is an enterprise-grade Civic Issue Management System designed to bridge the gap between citizens and municipal authorities. It provides a transparent, accountable, and highly efficient workflow for urban problem resolution. 

By utilizing AI for smart categorization and SLA (Service Level Agreement) tracking, the system automates issue routing, escalates overdue tasks, and provides real-time geographic insights into city-wide problems.

### ✨ Key Highlights
- **AI-Powered Categorization:** Automatic detection of issue types (e.g., potholes, broken streetlights) from uploaded images.
- **Strict Role-Based Access Control:** 5 distinct user roles with dedicated, restricted workflows.
- **Service Level Agreements (SLAs):** Automated countdowns and priority escalations based on issue severity.
- **Real-time Map Integration:** Geospatial visualization of pending and resolved issues.
- **Data-Driven Analytics:** Comprehensive dashboards for commissioners and department managers to track performance.

---

## 👥 Role-Based Architecture

The platform operates on a strict 5-tier role hierarchy, ensuring data privacy and operational focus:

1. **🧑‍🤝‍🧑 Citizen**
   - Report issues with geo-location and images.
   - Track personal issue resolution progress.
   - Upvote and comment on community issues.

2. **👷 Field Officer (Department Staff)**
   - Specialized dashboard restricted to their assigned Ward & Department.
   - Update issue status (Assigned → In Progress → Resolved).
   - Upload proof of resolution.

3. **🏢 Department Manager**
   - Monitor team performance and SLA compliance across their department.
   - Re-assign tasks among Field Officers to balance workload.

4. **🏛️ Municipal Commissioner**
   - High-level bird's-eye view of all city departments and wards.
   - Identify city-wide bottlenecks and resource shortages.

5. **⚙️ System Admin**
   - Complete access control, user creation, and department configuration.

---

## 🛠️ Tech Stack & Architecture

Built with modern web technologies focusing on performance, scalability, and security:

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Custom Design System
- **Maps:** Leaflet & React-Leaflet
- **PWA:** `next-pwa` for native-like mobile experience
- **State & Data:** Context API + React Hooks

### Backend & Database
- **Server:** Next.js API Routes (Serverless)
- **Database:** MongoDB & Mongoose ORM
- **Authentication:** Custom JWT-based auth with bcryptjs
- **File Storage:** Cloudinary (secure image hosting)

### Utilities & AI
- **AI Integration:** Google Generative AI (`@google/generative-ai`)
- **Email Delivery:** Resend
- **Internationalization:** `react-i18next`

---

## 🚀 Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites
- Node.js 18.17.0+
- MongoDB (Local instance or MongoDB Atlas cluster)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/civic-issue-system.git
   cd civic-issue-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory and add the following variables:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/civic-issues
   
   # JWT Configuration (generate a strong random string)
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # Application URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Cloudinary (Image Uploads)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
   
   # AI Integration (Optional)
   GOOGLE_GENAI_API_KEY=your_gemini_api_key
   ```

4. **Initialize Database (Seeding)**
   Initialize the system with default departments, wards, and test users:
   ```bash
   npm run db:admin    # Creates default admin
   npm run db:seed     # Seeds departments and wards
   npm run db:seed-users # Generates test users for all roles
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Credentials

If you've run the seeding scripts, you can use these default credentials to explore the different dashboards:

| Role | Email | Password |
|------|-------|----------|
| **System Admin** | `admin@test.com` | `admin123` |
| **Commissioner** | `commissioner@test.com`| `comm123` |
| **Dept Manager** | `manager@test.com` | `manager123` |
| **Field Officer**| `officer@test.com` | `officer123` |
| **Citizen** | `yashvraj@gmail.com` | `citizen123` |

*(Note: Change these immediately if deployed to a production environment!)*

---

## 📂 Project Structure

```text
civic-issue-system/
├── app/                      # Next.js App Router Pages & Layouts
│   ├── (auth)/               # Login & Registration Flows
│   ├── admin/                # System Admin Dashboard
│   ├── citizen/              # Citizen Reporting & Dashboard
│   ├── commissioner/         # Municipal Commissioner Dashboard
│   ├── department/           # Field Officer Views
│   ├── municipal/            # Department Manager Views
│   └── api/                  # RESTful API Routes
├── components/               # Reusable React UI Components
├── lib/                      # Core Utilities (Auth, DB, Validation)
├── models/                   # Mongoose Database Schemas
├── public/                   # Static Assets & PWA icons
└── scripts/                  # DB Seeding & Maintenance Scripts
```

---

## 🔒 Security Measures

- **Zero-Trust API Routes:** Every API endpoint validates JWT tokens and strict Role-Based Access Control (RBAC).
- **Password Hashes:** PBKDF2/Bcrypt application for all user credentials.
- **XSS Protection:** Strict sanitization on all user-submitted text and comments.
- **Middleware Protection:** Next.js middleware forcefully redirects unauthorized dashboard access attempts.

---

<div align="center">
  <b>Built with ❤️ for better, smarter, and faster civic engagement.</b>
</div>
