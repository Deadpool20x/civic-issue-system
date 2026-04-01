
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Minimal env parser
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const MONGODB_URI = env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civic-issues';

async function check() {
  try {
    console.log('Connecting to:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');
    
    // Check if User model exists or define it
    const userSchema = new mongoose.Schema({
      email: String,
      password: { type: String, select: true },
      role: String,
      isActive: Boolean
    });
    
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    
    const count = await User.countDocuments();
    console.log('Total users:', count);
    
    const users = await User.find({}).limit(50);
    console.log('Users found:');
    users.forEach(u => {
      console.log(`- Email: "${u.email}", Role: "${u.role}", Active: ${u.isActive}, PWD: ${u.password ? u.password.substring(0, 10) + '...' : 'NONE'}`);
    });

    // Test a common password
    if (users.length > 0) {
      const testUser = users[0];
      const testPwd = 'Admin@123'; // or 'Test@123'
      if (testUser.password && testUser.password.startsWith('$2')) {
        const match = await bcrypt.compare(testPwd, testUser.password);
        console.log(`Test validation for ${testUser.email} with '${testPwd}': ${match}`);
        const match2 = await bcrypt.compare('Test@123', testUser.password);
        console.log(`Test validation for ${testUser.email} with 'Test@123': ${match2}`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Error in script:', err);
    process.exit(1);
  }
}

check();
