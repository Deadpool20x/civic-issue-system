// scripts/seed-users.js
// Run with: node scripts/seed-users.js
// This DELETES all existing staff and re-creates correctly

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// WARD MAP — must match lib/wards.js exactly
const WARD_DEPT_MAP = {
  'ward-1':  'roads',    'ward-2':  'lighting',
  'ward-3':  'waste',    'ward-4':  'water',
  'ward-5':  'parks',    'ward-6':  'traffic',
  'ward-7':  'health',   'ward-8':  'other',
  'ward-9':  'roads',    'ward-10': 'lighting',
  'ward-11': 'waste',    'ward-12': 'water',
  'ward-13': 'parks',    'ward-14': 'traffic',
  'ward-15': 'health',   'ward-16': 'other',
};

const users = [
  // ─── SYSTEM ADMIN ───────────────────────────────
  {
    name: 'System Admin',
    email: 'admin@civicpulse.in',
    password: 'Admin@123',
    role: 'SYSTEM_ADMIN',
    wardId: null,
    departmentId: null,
    isActive: true
  },

  // ─── MUNICIPAL COMMISSIONER ─────────────────────
  {
    name: 'Municipal Commissioner',
    email: 'commissioner@civicpulse.in',
    password: 'Commissioner@123',
    role: 'MUNICIPAL_COMMISSIONER',
    wardId: null,
    departmentId: null,
    isActive: true
  },

  // ─── DEPARTMENT MANAGERS (8 total) ──────────────
  {
    name: 'Roads Manager',
    email: 'roads.manager@civicpulse.in',
    password: 'Test@123',
    role: 'DEPARTMENT_MANAGER',
    wardId: null,
    departmentId: 'roads',
    isActive: true
  },
  {
    name: 'Lighting Manager',
    email: 'lighting.manager@civicpulse.in',
    password: 'Test@123',
    role: 'DEPARTMENT_MANAGER',
    wardId: null,
    departmentId: 'lighting',
    isActive: true
  },
  {
    name: 'Waste Manager',
    email: 'waste.manager@civicpulse.in',
    password: 'Test@123',
    role: 'DEPARTMENT_MANAGER',
    wardId: null,
    departmentId: 'waste',
    isActive: true
  },
  {
    name: 'Water Manager',
    email: 'water.manager@civicpulse.in',
    password: 'Test@123',
    role: 'DEPARTMENT_MANAGER',
    wardId: null,
    departmentId: 'water',
    isActive: true
  },
  {
    name: 'Parks Manager',
    email: 'parks.manager@civicpulse.in',
    password: 'Test@123',
    role: 'DEPARTMENT_MANAGER',
    wardId: null,
    departmentId: 'parks',
    isActive: true
  },
  {
    name: 'Traffic Manager',
    email: 'traffic.manager@civicpulse.in',
    password: 'Test@123',
    role: 'DEPARTMENT_MANAGER',
    wardId: null,
    departmentId: 'traffic',
    isActive: true
  },
  {
    name: 'Health Manager',
    email: 'health.manager@civicpulse.in',
    password: 'Test@123',
    role: 'DEPARTMENT_MANAGER',
    wardId: null,
    departmentId: 'health',
    isActive: true
  },
  {
    name: 'General Manager',
    email: 'general.manager@civicpulse.in',
    password: 'Test@123',
    role: 'DEPARTMENT_MANAGER',
    wardId: null,
    departmentId: 'other',
    isActive: true
  },

  // ─── FIELD OFFICERS (16 total — one per ward) ───
  // NORTH ZONE (Ward 1-8)
  {
    name: 'North Roads Officer',
    email: 'officer.ward1@civicpulse.in',
    password: 'Test@123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-1',
    departmentId: null,
    isActive: true
  },
  {
    name: 'North Lighting Officer',
    email: 'officer.ward2@civicpulse.in',
    password: 'Test@123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-2',
    departmentId: null,
    isActive: true
  },
  {
    name: 'North Waste Officer',
    email: 'officer.ward3@civicpulse.in',
    password: 'Test@123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-3',
    departmentId: null,
    isActive: true
  },
  {
    name: 'North Water Officer',
    email: 'officer.ward4@civicpulse.in',
    password: 'Test@123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-4',
    departmentId: null,
    isActive: true
  },
  {
    name: 'North Parks Officer',
    email: 'officer.ward5@civicpulse.in',
    password: 'Test@123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-5',
    departmentId: null,
    isActive: true
  },
  {
    name: 'North Traffic Officer',
    email: 'officer.ward6@civicpulse.in',
    password: 'Test@123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-6',
    departmentId: null,
    isActive: true
  },
  {
    name: 'North Health Officer',
    email: 'officer.ward7@civicpulse.in',
    password: 'Test@123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-7',
    departmentId: null,
    isActive: true
  },
  {
    name: 'North General Officer',
    email: 'officer.ward8@civicpulse.in',
    password: 'Test@123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-8',
    departmentId: null,
    isActive: true
  },
  // SOUTH ZONE (Ward 9-16)
  {
    name: 'South Roads Officer',
    email: 'officer.ward9@civicpulse.in',
    password: 'Test@123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-9',
    departmentId: null,
    isActive: true
  },
  {
    name: 'South Lighting Officer',
    email: 'officer.ward10@civicpulse.in',
    password: 'Test@123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-10',
    departmentId: null,
    isActive: true
  },
  {
    name: 'South Waste Officer',
    email: 'officer.ward11@civicpulse.in',
    password: 'Test@123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-11',
    departmentId: null,
    isActive: true
  },
  {
    name: 'South Water Officer',
    email: 'officer.ward12@civicpulse.in',
    password: 'Test@123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-12',
    departmentId: null,
    isActive: true
  },
  {
    name: 'South Parks Officer',
    email: 'officer.ward13@civicpulse.in',
    password: 'Test@123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-13',
    departmentId: null,
    isActive: true
  },
  {
    name: 'South Traffic Officer',
    email: 'officer.ward14@civicpulse.in',
    password: 'Test@123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-14',
    departmentId: null,
    isActive: true
  },
  {
    name: 'South Health Officer',
    email: 'officer.ward15@civicpulse.in',
    password: 'Test@123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-15',
    departmentId: null,
    isActive: true
  },
  {
    name: 'South General Officer',
    email: 'officer.ward16@civicpulse.in',
    password: 'Test@123',
    role: 'FIELD_OFFICER',
    wardId: 'ward-16',
    departmentId: null,
    isActive: true
  },

  // ─── TEST CITIZEN ────────────────────────────────
  {
    name: 'Test Citizen',
    email: 'citizen@civicpulse.in',
    password: 'Test@123',
    role: 'CITIZEN',
    wardId: null,
    departmentId: null,
    isActive: true
  }
];

// User Schema (inline for script)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  wardId: String,
  departmentId: String,
  isActive: Boolean,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seed() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all existing staff (keep real citizens)
    const deleteResult = await User.deleteMany({
      $or: [
        {
          role: {
            $in: [
              'SYSTEM_ADMIN', 'MUNICIPAL_COMMISSIONER',
              'DEPARTMENT_MANAGER', 'FIELD_OFFICER',
              'admin', 'municipal', 'department'
            ]
          }
        },
        { email: { $regex: '@civicpulse.in' } }
      ]
    });
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing seed accounts`);

    // Create all users with hashed passwords
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await User.create({ ...userData, password: hashedPassword });
      console.log(`✅ Created: ${userData.name} (${userData.role})`);
    }

    console.log('\n=== SEED COMPLETE ===');
    console.log(`Created ${users.length} accounts`);
    console.log('\n📋 Login credentials:');
    console.log('Admin:              admin@civicpulse.in / Admin@123');
    console.log('Commissioner:       commissioner@civicpulse.in / Commissioner@123');
    console.log('Roads Manager:      roads.manager@civicpulse.in / Test@123');
    console.log('North Roads Officer: officer.ward1@civicpulse.in / Test@123');
    console.log('Test Citizen:       citizen@civicpulse.in / Test@123');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
