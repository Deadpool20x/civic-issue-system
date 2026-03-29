// scripts/remove-com-users.js
// Remove all users with .civicpulse.com domain

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Setup Model
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, select: false },
  role: String,
  wardId: String,
  departmentId: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function removeComUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Find all users with .civicpulse.com domain
    const comUsers = await User.find({ email: { $regex: /@civicpulse\.com$/i } });
    
    console.log(`Found ${comUsers.length} users with .civicpulse.com domain:\n`);
    
    for (const user of comUsers) {
      console.log(`  Deleting: ${user.email} (${user.role})`);
      await User.findByIdAndDelete(user._id);
    }

    console.log(`\n✅ Deleted ${comUsers.length} .com users`);

    // Show remaining users
    console.log('\n📋 Remaining users:');
    const remaining = await User.find({}).sort({ role: 1, email: 1 });
    for (const user of remaining) {
      console.log(`   ${user.email} - ${user.role}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

removeComUsers();
