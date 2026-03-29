// scripts/cleanup-duplicate-users.js
// Cleanup duplicate user entries before seeding

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

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Find all users
    const allUsers = await User.find({}).sort({ createdAt: 1 });
    
    console.log(`Total users in database: ${allUsers.length}\n`);
    
    // Group by email to find duplicates
    const emailGroups = {};
    for (const user of allUsers) {
      const email = user.email.toLowerCase();
      if (!emailGroups[email]) {
        emailGroups[email] = [];
      }
      emailGroups[email].push(user);
    }

    // Check for duplicates
    let duplicatesFound = false;
    for (const [email, users] of Object.entries(emailGroups)) {
      if (users.length > 1) {
        duplicatesFound = true;
        console.log(`⚠️  DUPLICATE: ${email}`);
        console.log(`   Found ${users.length} entries:`);
        
        // Keep the oldest (first created), delete the rest
        const toKeep = users[0];
        const toDelete = users.slice(1);
        
        console.log(`   KEEP: ${toKeep.name} (${toKeep.role}) - Created: ${toKeep.createdAt}`);
        console.log(`   DELETE:`);
        
        for (const user of toDelete) {
          console.log(`     - ${user.name} (${user.role}) - ID: ${user._id}`);
          await User.findByIdAndDelete(user._id);
          console.log(`       ✅ Deleted`);
        }
        console.log('');
      }
    }

    if (!duplicatesFound) {
      console.log('✅ No duplicate users found!');
    }

    // Show summary of remaining users
    console.log('\n📋 Current users in database:');
    const remainingUsers = await User.find({}).sort({ role: 1, email: 1 });
    for (const user of remainingUsers) {
      console.log(`   ${user.email} - ${user.role} ${user.wardId ? `(ward: ${user.wardId})` : ''}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

cleanup();
