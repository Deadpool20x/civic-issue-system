// scripts/fix-field-officer-wards.js
// Run with: node scripts/fix-field-officer-wards.js
// This script assigns wardId to Field Officer accounts that are missing it.

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

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

async function fixFieldOfficerWards() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all Field Officers without wardId
    const fieldOfficers = await User.find({
      role: 'FIELD_OFFICER',
      $or: [
        { wardId: null },
        { wardId: { $exists: false } }
      ]
    });

    console.log(`Found ${fieldOfficers.length} Field Officers without wardId`);

    if (fieldOfficers.length === 0) {
      console.log('No fixes needed.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Available wards (1-16)
    const availableWards = Array.from({ length: 16 }, (_, i) => `ward-${i + 1}`);
    
    // Try to assign ward based on email pattern (e.g., officer.ward1@ -> ward-1)
    let assignedCount = 0;
    
    for (const officer of fieldOfficers) {
      const email = officer.email.toLowerCase();
      let assignedWard = null;
      
      // Pattern: officer.wardX@ or officerX@ where X is 1-16
      const wardMatch = email.match(/officer\.?ward(\d+)/);
      if (wardMatch) {
        const wardNum = parseInt(wardMatch[1], 10);
        if (wardNum >= 1 && wardNum <= 16) {
          assignedWard = `ward-${wardNum}`;
        }
      }
      
      // If no pattern match, assign next available ward (cycling)
      if (!assignedWard) {
        assignedWard = availableWards[assignedCount % availableWards.length];
        assignedCount++;
      }
      
      // Update the officer
      officer.wardId = assignedWard;
      await officer.save();
      
      console.log(`✅ Assigned ${assignedWard} to ${officer.name} (${officer.email})`);
    }

    console.log(`\n=== FIX COMPLETE ===`);
    console.log(`Updated ${fieldOfficers.length} Field Officer accounts`);
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Fix failed:', err);
    process.exit(1);
  }
}

fixFieldOfficerWards();