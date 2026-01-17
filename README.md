# 🏛️ Civic Issue System

A comprehensive, secure, and user-friendly platform for managing civic issues with AI-powered categorization and real-time tracking.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [User Roles](#user-roles)
- [Project Structure](#project-structure)
- [Security Features](#security-features)
- [Environment Setup](#environment-setup)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

The Civic Issue System is a modern web application that enables citizens to report municipal issues (potholes, broken streetlights, water leaks, etc.) and track their resolution. The system includes:

- **AI-Powered Issue Analysis**: Automatic categorization and priority assignment
- **Real-Time Tracking**: Live status updates for reported issues
- **Multi-Role Dashboard**: Separate interfaces for Citizens, Municipal Staff, Department Staff, and Admins
- **Secure Authentication**: JWT-based authentication with role-based access control
- **Responsive Design**: Mobile-friendly web interface for on-the-go reporting

## ✨ Features

### 🔐 Authentication & Security
- ✅ Secure JWT authentication with bcrypt password hashing
- ✅ Role-based access control (RBAC)
- ✅ Input validation with Zod
- ✅ CSRF protection and secure headers
- ✅ Rate limiting on public endpoints

### 📱 Citizen Features
- **Report Issues**: Submit issues with photos, location, and descriptions
- **Track Progress**: Real-time status updates (Pending → In Progress → Resolved)
- **Dashboard**: Personal dashboard with issue history and statistics
- **Notifications**: Email notifications for status changes

### 👮 Municipal Staff Features
- **Issue Management**: View and manage all reported issues
- **Advanced Filtering**: Filter by status, priority, department, and date range
- **Assignment**: Assign issues to specific departments
- **Analytics**: Comprehensive statistics and performance metrics

### 🏢 Department Staff Features
- **Department-Specific Dashboard**: View issues assigned to your department
- **Status Updates**: Update issue status and add comments
- **SLA Tracking**: Monitor response and resolution times

### 👑 Admin Features
- **System Overview**: Complete system statistics and analytics
- **User Management**: Create and manage users (Municipal, Department, Admin)
- **Department Management**: Add and configure departments
- **Reports**: Generate comprehensive reports
- **System Monitoring**: View performance metrics and logs

### 🤖 AI Features
- **Smart Categorization**: AI automatically categorizes issues (Road, Water, Electricity, etc.)
- **Priority Assignment**: AI determines urgency based on issue description
- **Sentiment Analysis**: Analyzes citizen feedback for service improvement

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Forms**: React Hook Form + Zod validation
- **Maps**: React Leaflet (OpenStreetMap)
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Cloudinary
- **AI Integration**: OpenAI API
- **Scheduling**: Node Cron

### Security
- **Password Hashing**: bcryptjs
- **Token Management**: jsonwebtoken
- **Input Validation**: Zod
- **Environment Variables**: dotenv

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Deadpool20x/civic-issue-system.git
cd civic-issue-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/civic-issue-system

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secure-jwt-secret-here

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI (for AI features)
OPENAI_API_KEY=your-openai-api-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

4. **Start the development server**
```bash
npm run dev
```

5. **Access the application**
Open [http://localhost:3001](http://localhost:3001) in your browser

### Quick Test Credentials

After starting the app, you can create test accounts:

1. **Citizen**: Register as a regular user
2. **Municipal Staff**: Use the admin dashboard to create municipal users
3. **Department Staff**: Create department-specific users
4. **Admin**: Use the `scripts/create-test-admin.js` script

## 👥 User Roles

| Role | Permissions | Dashboard |
|------|-------------|-----------|
| **Citizen** | Report issues, track personal issues, view dashboard | `/citizen/dashboard` |
| **Municipal** | Manage all issues, assign to departments, view analytics | `/municipal/dashboard` |
| **Department** | Handle assigned issues, update status, add comments | `/department/dashboard` |
| **Admin** | Full system access, user management, reports, analytics | `/admin/dashboard` |

## 📁 Project Structure

```
civic-issue-system/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── admin/                    # Admin dashboard pages
│   ├── citizen/                  # Citizen dashboard pages
│   ├── department/               # Department dashboard pages
│   ├── municipal/                # Municipal staff pages
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── issues/               # Issue management
│   │   ├── users/                # User management
│   │   └── ...
│   ├── public-dashboard/         # Public issue tracking
│   └── page.js                   # Landing page
│
├── components/                   # Reusable React components
│   ├── DashboardLayout.js        # Dashboard layout component
│   ├── DashboardProtection.js    # Role-based route protection
│   ├── IssueCard.js              # Issue display card
│   └── ui/                       # UI components
│
├── lib/                          # Utility libraries
│   ├── auth.js                   # Authentication utilities
│   ├── middleware.js             # Route middleware
│   ├── security.js               # Security utilities
│   ├── schemas.js                # Zod validation schemas
│   └── models/                   # Database models
│
├── models/                       # Mongoose models
│   ├── Issue.js                  # Issue model
│   ├── User.js                   # User model
│   ├── Department.js             # Department model
│   └── ...
│
├── scripts/                      # Utility scripts
│   ├── create-test-admin.js      # Create admin user
│   ├── seed-departments.js       # Seed departments
│   └── ...
├── public/                       # Static assets
├── docs/                         # Documentation
└── Configuration files
```

## 🔒 Security Features

### Authentication & Authorization
- ✅ JWT-based authentication with refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Secure HTTP-only cookies for tokens

### Input Validation
- ✅ Zod schema validation for all API inputs
- ✅ SQL injection prevention
- ✅ XSS attack prevention
- ✅ File upload validation (size, type, MIME)

### API Security
- ✅ Rate limiting on public endpoints
- ✅ CORS configuration
- ✅ Security headers (Helmet.js)
- ✅ Request validation middleware

### Data Protection
- ✅ Environment variable encryption
- ✅ Secure database connections
- ✅ Audit logging
- ✅ Data encryption at rest (MongoDB)

### Role Enforcement
- ✅ Frontend route protection
- ✅ Backend middleware enforcement
- ✅ API endpoint role validation
- ✅ Department-based access control

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Issues
- `POST /api/issues` - Report new issue (Citizen)
- `GET /api/issues` - List issues (Municipal/Admin)
- `GET /api/issues/:id` - Get issue details
- `PUT /api/issues/:id` - Update issue (Municipal/Department)
- `DELETE /api/issues/:id` - Delete issue (Admin)

### Users
- `GET /api/users` - List users (Admin)
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Departments
- `GET /api/departments` - List departments
- `POST /api/departments` - Create department (Admin)
- `PUT /api/departments/:id` - Update department (Admin)

### Analytics
- `GET /api/stats/overview` - System statistics (Admin)
- `GET /api/stats/performance` - Performance metrics (Municipal/Admin)
- `GET /api/reports` - Generate reports (Admin)

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Sign in with GitHub
- Import your repository
- Configure environment variables in Vercel dashboard

3. **Deploy**
- Vercel will automatically deploy on every push
- Set up custom domain if needed

### Other Platforms

#### Railway
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

#### DigitalOcean
```bash
doctl apps create --spec .do/app.yaml
```

#### Self-hosted
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for UI elements

## 📊 Performance

- **Fast Refresh**: Instant updates during development
- **Static Generation**: Pre-rendered pages for speed
- **Image Optimization**: Automatic image optimization
- **Code Splitting**: Automatic code splitting
- **Caching**: Strategic caching for API responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Cloudinary](https://cloudinary.com/) - Image hosting
- [OpenAI](https://openai.com/) - AI capabilities

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for better civic engagement**
