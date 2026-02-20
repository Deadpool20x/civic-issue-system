# Civic Issue Management System

A modern web application for citizens to report civic issues and track their resolution by municipal departments.

## 🌟 Features

### For Citizens
- Report civic issues with location, images, and descriptions
- Track issue status in real-time
- Upvote important issues
- Comment on issues
- View all reported issues on map

### For Department Staff
- View assigned issues by department
- Update issue status (pending → in-progress → resolved)
- Manage workload and priorities
- Track department performance

### For Administrators
- Manage all issues across departments
- Create and manage departments
- User management (citizens, staff, admins)
- Generate reports and analytics
- System-wide statistics

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Maps**: Leaflet / Mapbox
- **File Upload**: Cloudinary / Local storage

## 📋 Prerequisites

- Node.js 18.17.0+ 
- MongoDB (local or Atlas)
- npm or yarn

## 🚀 Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd civic-issue-system
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Create `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/civic-issues
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civic-issues

# JWT Secret (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Map API (optional)
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

### 4. Run database migrations

```bash
# Ensure all department references are ObjectIds
node scripts/migrate-department-refs.js

# Verify database integrity
node scripts/verify-database.js
```

### 5. Seed initial data (optional)

```bash
node scripts/seed-data.js
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

### Production Mode
```bash
npm run build
npm start
```

## 📂 Project Structure

```
civic-issue-system/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── issues/            # Issue management endpoints
│   │   ├── departments/       # Department management
│   │   └── admin/             # Admin endpoints
│   ├── citizen/               # Citizen pages
│   ├── department/            # Department staff pages
│   ├── admin/                 # Admin pages
│   └── (auth)/                # Authentication pages
├── components/                # React components
├── lib/                       # Utility functions
│   ├── auth.js               # Authentication logic
│   ├── mongodb.js            # Database connection
│   └── middleware.js         # Middleware functions
├── models/                    # Mongoose models
│   ├── Issue.js
│   ├── User.js
│   ├── Department.js
│   └── StateHistory.js
├── public/                    # Static assets
├── scripts/                   # Utility scripts
│   ├── migrate-department-refs.js
│   ├── verify-database.js
│   └── test-all-roles.js
└── docs/                      # Documentation
```

## 🔐 Authentication & Authorization

### User Roles
1. **Citizen**: Can report issues, view their issues, upvote, comment
2. **Department Staff**: Can view/update issues assigned to their department
3. **Admin**: Full system access, manage all data

### Default Credentials (for testing)
- **Admin**: `admin@test.com` / `admin123`
- **Department Staff**: `sp533013@gmail.com` / `department123`
- **Citizen**: `yashvraj@gmail.com` / `citizen123`

**⚠️ Important**: Change all passwords in production!

## 📊 Database Schema

### Issues Collection
```javascript
{
  _id: ObjectId,
  reportId: String,           // R00001, R00002, etc.
  title: String,
  description: String,
  category: String,           // roads-infrastructure, water-drainage, etc.
  subcategory: String,
  status: String,             // pending, assigned, in-progress, resolved
  priority: String,           // low, medium, high, urgent
  location: {
    address: String,
    coordinates: [Number],    // [lng, lat]
    city: String,
    state: String,
    pincode: String
  },
  images: [{
    url: String,
    publicId: String
  }],
  reportedBy: ObjectId,       // Reference to User
  assignedTo: ObjectId,       // Reference to User (optional)
  assignedDepartment: ObjectId, // Reference to Department
  upvotes: Number,
  upvotedBy: [ObjectId],
  comments: [{
    text: String,
    user: ObjectId,
    createdAt: Date
  }],
  sla: {
    deadline: Date,
    hoursRemaining: Number,
    isOverdue: Boolean,
    escalationLevel: Number,
    escalationHistory: [{
      level: Number,
      escalatedAt: Date,
      escalatedTo: String,
      reason: String
    }]
  },
  ward: String,
  zone: String,
  feedback: {
    rating: Number,
    resolved: Boolean,
    comment: String,
    submittedAt: Date,
    submittedBy: ObjectId
  },
  resolutionTime: Number,
  penaltyPoints: Number,
  assignedStaff: ObjectId,
  departmentHead: ObjectId,
  verification: {
    isVerified: Boolean,
    verifiedAt: Date,
    verifiedBy: ObjectId,
    verificationNotes: String
  },
  aiAnalysis: {
    category: String,
    priority: String,
    sentiment: String,
    keywords: [String]
  },
  createdAt: Date,
  updatedAt: Date,
  dueTime: Date
}
```

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,           // Hashed
  role: String,               // citizen, department, admin
  department: ObjectId,       // Reference to Department (for department staff)
  phone: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Departments Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  contactEmail: String,
  contactPhone: String,
  categories: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing

### Run All Tests
```bash
# Verify database integrity
node scripts/verify-database.js

# Test all user roles
node scripts/test-all-roles.js
```

### Manual Testing Checklist

#### Citizen Role
- [ ] Register new citizen account
- [ ] Login with credentials
- [ ] Report a new issue
- [ ] View reported issues
- [ ] Upvote an issue
- [ ] Add a comment
- [ ] Update profile

#### Department Staff Role
- [ ] Login as department staff
- [ ] View assigned issues
- [ ] Update issue status
- [ ] View resolved issues
- [ ] Check statistics
- [ ] Update profile

#### Admin Role
- [ ] Login as admin
- [ ] View all issues
- [ ] Manage departments
- [ ] Manage users
- [ ] Generate reports
- [ ] View analytics

## 🚀 Deployment

### Vercel (Recommended for Next.js)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
- **Heroku**: Use Node.js buildpack
- **DigitalOcean**: Use App Platform or Droplet
- **AWS**: Use Elastic Beanstalk or EC2

### Environment Variables for Production
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civic-issues

# JWT Secret (generate strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Map API (optional)
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token

# Security
NODE_ENV=production
```

## 🔒 Security Best Practices

### 1. Password Security
- Use strong passwords (min 12 characters)
- Never store plain text passwords
- Use bcrypt for hashing
- Implement rate limiting on login

### 2. JWT Security
- Use strong JWT secret
- Set appropriate expiration times
- Implement token refresh mechanism
- Store tokens securely (httpOnly cookies)

### 3. Input Validation
- Validate all user inputs
- Sanitize HTML to prevent XSS
- Use parameterized queries (Mongoose does this)
- Implement file upload validation

### 4. Rate Limiting
- Implement rate limiting on API endpoints
- Use express-rate-limit or similar
- Protect against brute force attacks

### 5. CORS
- Configure CORS properly
- Only allow trusted origins
- Use environment variables for origins

### 6. HTTPS
- Always use HTTPS in production
- Use SSL certificates
- Enable HSTS

## 📈 Performance Optimization

### Database
- Use indexes on frequently queried fields
- Use lean queries for read-only operations
- Implement pagination for large datasets
- Use aggregation for complex queries

### Frontend
- Implement lazy loading for images
- Use React.memo for expensive components
- Implement code splitting
- Use Next.js built-in optimizations

### Caching
- Cache static data
- Use Redis for session storage
- Implement CDN for static assets
- Use browser caching headers

## 📊 Monitoring & Logging

### Error Tracking
- Use Sentry or similar for error tracking
- Log all errors with context
- Set up alerts for critical errors

### Performance Monitoring
- Monitor API response times
- Track database query performance
- Monitor memory usage
- Set up uptime monitoring

### Analytics
- Track user engagement
- Monitor issue resolution times
- Track department performance
- Generate usage reports

## 🔄 Backup & Recovery

### Database Backups
```bash
# Daily automated backups
mongodump --uri="mongodb://..." --out=/backups/daily
```

### Recovery Procedure
1. Stop the application
2. Restore from backup
3. Verify data integrity
4. Restart application

## 📝 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "citizen"
}
```

#### POST /api/auth/login
Login user
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### GET /api/auth/me
Get current user profile (requires authentication)

#### POST /api/auth/logout
Logout user (requires authentication)

### Issue Endpoints

#### GET /api/issues
Get all issues (admin only)

#### POST /api/issues
Create new issue (requires authentication)
```json
{
  "title": "Broken street light",
  "description": "Street light is not working on Main Street",
  "category": "street-lighting",
  "subcategory": "light-repair",
  "location": {
    "address": "123 Main St, City",
    "coordinates": [-122.4194, 37.7749]
  },
  "images": ["base64-encoded-image"]
}
```

#### GET /api/issues/department
Get issues for department (department staff only)

#### GET /api/issues/department/assigned
Get assigned issues (department staff only)

#### GET /api/issues/department/resolved
Get resolved issues (department staff only)

#### GET /api/issues/department/stats
Get department statistics (department staff only)

#### GET /api/issues/admin
Get all issues (admin only)

#### PATCH /api/issues/:id/status
Update issue status (requires appropriate role)
```json
{
  "status": "in-progress",
  "comment": "Work started"
}
```

#### PATCH /api/issues/:id/priority
Update issue priority (admin only)
```json
{
  "priority": "high"
}
```

#### PATCH /api/issues/:id/upvote
Upvote an issue (requires authentication)

#### POST /api/issues/:id/comments
Add comment to issue (requires authentication)
```json
{
  "text": "This is important!"
}
```

### Department Endpoints

#### GET /api/departments
Get all departments (requires authentication)

#### POST /api/departments
Create new department (admin only)
```json
{
  "name": "Roads & Infrastructure Department",
  "description": "Handles road maintenance and infrastructure",
  "contactEmail": "roads@city.gov",
  "contactPhone": "+1234567890",
  "categories": ["roads", "bridges", "infrastructure"]
}
```

#### GET /api/departments/:id
Get department by ID

#### PATCH /api/departments/:id
Update department (admin only)

#### DELETE /api/departments/:id
Delete department (admin only)

### User Endpoints

#### GET /api/users
Get all users (admin only)

#### GET /api/users/:id
Get user by ID

#### PATCH /api/users/:id
Update user (admin or self)
```json
{
  "name": "Updated Name",
  "email": "updated@email.com",
  "phone": "+1234567890"
}
```

#### DELETE /api/users/:id
Delete user (admin only)

### Report Endpoints

#### GET /api/reports?type=issues
Generate issues report (admin only)

#### GET /api/reports?type=users
Generate users report (admin only)

#### GET /api/reports?type=departments
Generate departments report (admin only)

#### GET /api/reports?type=performance
Generate performance report (admin only)

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check MongoDB is running
mongod --version

# Check connection string
echo $MONGODB_URI

# Test connection
node -e "console.log(process.env.MONGODB_URI)"
```

#### 2. JWT Secret Not Set
```bash
# Generate strong secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Add to .env.local
JWT_SECRET=your-generated-secret
```

#### 3. Port Already in Use
```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

#### 4. Module Not Found Error
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 5. Build Fails
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

### Security
- [OWASP Security Checklist](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://auth0.com/docs/secure/tokens/json-web-tokens)

### Deployment
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Heroku Node.js Guide](https://devcenter.heroku.com/articles/nodejs-support)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the database
- All contributors and testers

## 📞 Support

For support, please contact:
- Email: support@civic-issue-system.com
- Issues: GitHub Issues page

---

**Built with ❤️ for better civic engagement**
