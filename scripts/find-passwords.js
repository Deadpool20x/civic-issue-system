// scripts/find-passwords.js
// Find the actual passwords for users

import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

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

async function findPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get users with password field
    const users = await User.find({}).select('+password');
    
    console.log(`Finding actual passwords for users with plain text...\n`);
    
    // Common test passwords to try
    const testPasswords = [
      'password',
      'password123',
      'admin123',
      'test123',
      '123456',
      'demo1234',
      'citizen',
      'officer',
      'manager',
      'admin',
      'test',
      '12345678'
    ];
    
    for (const user of users) {
      const pwd = user.password;
      
      if (pwd && !pwd.startsWith('$2')) {
        console.log(`\nUser: ${user.email} (${user.role})`);
        console.log(`Password: ${pwd}`);
        
        // Try common passwords
        for (const testPwd of testPasswords) {
          if (pwd === testPwd) {
            console.log(`✅ Match found: '${testPwd}'`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

findPasswords();
