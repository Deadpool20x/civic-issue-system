// scripts/seed-corrected-users.js
// Seed script for CivicPulse users - uses .civicpulse.in domain

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Setup Model (minimal for seeding)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, select: false },
  role: String,
  wardId: String,
  departmentId: String,
  isActive: { type: Boolean, default: true }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Seed users with .civicpulse.in domain
const users = [
  // SYSTEM ADMIN
  {
    name: 'System Admin',
    email: 'admin@civicpulse.in',
    password: 'admin123',
    role: 'SYSTEM_ADMIN',
    wardId: null,
    departmentId: null
  },
  // MUNICIPAL COMMISSIONER
  {
    name: 'Municipal Commissioner',
    email: 'commissioner@civicpulse.in',
    password: 'admin123',
    role: 'MUNICIPAL_COMMISSIONER',
    wardId: null,
    departmentId: null
  },
  // DEPARTMENT MANAGERS (one per department)
  {
    name: 'Roads Manager',
    email: 'roads.manager@civicpulse.in',
    password: 'admin123',
    role: 'DEPARTMENT_MANAGER',
    wardId: null,
    departmentId: 'roads'
    // Auto sees: ward-1 (North) + ward-9 (South)
  },
  {
    name: 'Lighting Manager',
    email: 'lighting.manager@civicpulse.in',
    password: 'admin123',
    role: 'DEPARTMENT_MANAGER',
    wardId: null,
    departmentId: 'lighting'
    // Auto sees: ward-2 (North) + ward-10 (South)
  },
  {
    name: 'Waste Manager',
    email: 'waste.manager@civicpulse.in',
    password: 'admin123',
    role: 'DEPARTMENT_MANAGER',
    wardId: null,
    departmentId: 'waste'
    // Auto sees: ward-3 (North) + ward-11 (South)
  },
  {
    name: 'Water Manager',
    email: 'water.manager@civicpulse.in',
    password: 'admin123',
    role: 'DEPARTMENT_MANAGER',
    wardId: null,
    departmentId: 'water'
    // Auto sees: ward-4 (North) + ward-12 (South)
  },
  {
    name: 'Parks Manager',
    email: 'parks.manager@civicpulse.in',
    password: 'admin123',
    role: 'DEPARTMENT_MANAGER',
    wardId: null,
    departmentId: 'parks'
    // Auto sees: ward-5 (North) + ward-13 (South)
  },
  {
    name: 'Traffic Manager',
    email: 'traffic.manager@civicpulse.in',
    password: 'admin123',
    role: 'DEPARTMENT_MANAGER',
    wardId: null,
    departmentId: 'traffic'
    // Auto sees: ward-6 (North) + ward-14 (South)
  },
  {
    name: 'Health Manager',
    email: 'health.manager@civicpulse.in',
    password: 'admin123',
    role: 'DEPARTMENT_MANAGER',
    wardId: null,
    departmentId: 'health'
    // Auto sees: ward-7 (North) + ward-15 (South)
  },
  {
    name: 'Other Manager',
    email: 'other.manager@civicpulse.in',
    password: 'admin123',
    role: 'DEPARTMENT_MANAGER',
    wardId: null,
    departmentId: 'other'
    // Auto sees: ward-8 (North) + ward-16 (South)
  },
  // FIELD OFFICERS - North Zone (ward-1 to ward-8)
  {
    name: 'North Roads Officer',
    email: 'officer.ward1@civicpulse.in',
    password: 'admin123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-1',
    // Zone: North, Dept: Roads — derived from wardId
    departmentId: null
  },
  {
    name: 'North Lighting Officer',
    email: 'officer.ward2@civicpulse.in',
    password: 'admin123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-2',
    departmentId: null
  },
  {
    name: 'North Waste Officer',
    email: 'officer.ward3@civicpulse.in',
    password: 'admin123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-3',
    departmentId: null
  },
  {
    name: 'North Water Officer',
    email: 'officer.ward4@civicpulse.in',
    password: 'admin123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-4',
    departmentId: null
  },
  {
    name: 'North Parks Officer',
    email: 'officer.ward5@civicpulse.in',
    password: 'admin123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-5',
    departmentId: null
  },
  {
    name: 'North Traffic Officer',
    email: 'officer.ward6@civicpulse.in',
    password: 'admin123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-6',
    departmentId: null
  },
  {
    name: 'North Health Officer',
    email: 'officer.ward7@civicpulse.in',
    password: 'admin123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-7',
    departmentId: null
  },
  {
    name: 'North Other Officer',
    email: 'officer.ward8@civicpulse.in',
    password: 'admin123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-8',
    departmentId: null
  },
  // FIELD OFFICERS - South Zone (ward-9 to ward-16)
  {
    name: 'South Roads Officer',
    email: 'officer.ward9@civicpulse.in',
    password: 'admin123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-9',
    departmentId: null
  },
  {
    name: 'South Lighting Officer',
    email: 'officer.ward10@civicpulse.in',
    password: 'admin123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-10',
    departmentId: null
  },
  {
    name: 'South Waste Officer',
    email: 'officer.ward11@civicpulse.in',
    password: 'admin123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-11',
    departmentId: null
  },
  {
    name: 'South Water Officer',
    email: 'officer.ward12@civicpulse.in',
    password: 'admin123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-12',
    departmentId: null
  },
  {
    name: 'South Parks Officer',
    email: 'officer.ward13@civicpulse.in',
    password: 'admin123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-13',
    departmentId: null
  },
  {
    name: 'South Traffic Officer',
    email: 'officer.ward14@civicpulse.in',
    password: 'admin123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-14',
    departmentId: null
  },
  {
    name: 'South Health Officer',
    email: 'officer.ward15@civicpulse.in',
    password: 'admin123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-15',
    departmentId: null
  },
  {
    name: 'South Other Officer',
    email: 'officer.ward16@civicpulse.in',
    password: 'admin123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-16',
    departmentId: null
  },
  // TEST CITIZEN
  {
    name: 'Test Citizen',
    email: 'citizen@civicpulse.in',
    password: 'admin123',
    role: 'CITIZEN',
    wardId: null,
    departmentId: null
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users (optional - comment out to keep existing)
    // await User.deleteMany({});
    // console.log('Cleared existing users');

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`User already exists: ${userData.email}`);
        // Update the password to ensure it matches
        existingUser.password = userData.password;
        existingUser.name = userData.name;
        existingUser.role = userData.role;
        existingUser.wardId = userData.wardId;
        existingUser.departmentId = userData.departmentId;
        await existingUser.save();
        console.log(`  → Updated password and info`);
      } else {
        const user = new User(userData);
        await user.save();
        console.log(`Created user: ${userData.email} (${userData.role})`);
      }
    }

    console.log('\n✅ Seed complete!');
    console.log('\nTest Accounts:');
    console.log('  Admin: admin@civicpulse.in / admin123');
    console.log('  Commissioner: commissioner@civicpulse.in / admin123');
    console.log('  Roads Manager: roads.manager@civicpulse.in / admin123');
    console.log('  Officer Ward 1: officer.ward1@civicpulse.in / admin123');
    console.log('  Citizen: citizen@civicpulse.in / admin123');

  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
