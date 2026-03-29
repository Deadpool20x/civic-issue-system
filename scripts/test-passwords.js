// scripts/test-passwords.js
// Diagnostic script to check password status for users

import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Setup Model
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, select: true }, // Enable password selection
  role: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function testPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Test with a known password
    const testPassword = 'password123';
    
    // Get users with password field
    const users = await User.find({}).select('+password');
    
    console.log(`Testing password hashing for ${users.length} users...\n`);
    
    let hashedCount = 0;
    let plainTextCount = 0;
    let invalidCount = 0;
    
    for (const user of users) {
      const pwd = user.password;
      
      if (!pwd) {
        console.log(`❌ ${user.email} - No password set!`);
        invalidCount++;
      } else if (pwd.startsWith('$2') && pwd.length > 30) {
        // Password is hashed
        hashedCount++;
        
        // Test if it matches the test password
        const isMatch = await bcrypt.compare(testPassword, pwd);
        if (isMatch) {
          console.log(`✅ ${user.email} (${user.role}) - Password is hashed and matches test password 'password123'`);
        } else {
          console.log(`✅ ${user.email} (${user.role}) - Password is hashed but does NOT match 'password123'`);
        }
      } else if (pwd === testPassword) {
        plainTextCount++;
        console.log(`⚠️  ${user.email} (${user.role}) - Password is in PLAIN TEXT!`);
      } else {
        invalidCount++;
        console.log(`❌ ${user.email} (${user.role}) - Password format unknown: ${pwd.substring(0, 20)}...`);
      }
    }
    
    console.log('\n--- Summary ---');
    console.log(`Hashed passwords: ${hashedCount}`);
    console.log(`Plain text passwords: ${plainTextCount}`);
    console.log(`Invalid/No password: ${invalidCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testPasswords();
