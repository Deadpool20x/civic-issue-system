// scripts/hash-plaintext-passwords.js
// Migration script to hash all plain text passwords in the database

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
  password: { type: String, select: true },
  role: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function hashPlainTextPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get all users with password field
    const users = await User.find({}).select('+password');
    
    console.log(`Checking ${users.length} users for plain text passwords...\n`);
    
    let hashedCount = 0;
    let alreadyHashedCount = 0;
    let noPasswordCount = 0;
    
    for (const user of users) {
      const pwd = user.password;
      
      if (!pwd) {
        console.log(`❌ ${user.email} - No password set!`);
        noPasswordCount++;
        continue;
      }
      
      // Check if password is already hashed (starts with $2 and is > 30 chars)
      if (pwd.startsWith('$2') && pwd.length > 30) {
        alreadyHashedCount++;
        continue;
      }
      
      // Password is plain text - hash it
      console.log(`Hashing password for: ${user.email} (${user.role})`);
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(pwd, salt);
      
      await User.updateOne(
        { _id: user._id },
        { password: hashedPassword }
      );
      
      console.log(`✅ Password hashed for ${user.email}`);
      hashedCount++;
    }
    
    console.log('\n--- Migration Summary ---');
    console.log(`Passwords hashed: ${hashedCount}`);
    console.log(`Already hashed: ${alreadyHashedCount}`);
    console.log(`No password: ${noPasswordCount}`);
    console.log(`Total: ${users.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

hashPlainTextPasswords();
