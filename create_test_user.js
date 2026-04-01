
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Minimal env parser
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const MONGODB_URI = env.MONGODB_URI;

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true, trim: true },
  password: { type: String, select: true },
  role: String,
  isActive: { type: Boolean, default: true }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected');

    const email = 'testuser@example.com';
    const password = 'Password@123';

    await User.deleteMany({ email });
    
    const user = new User({
      name: 'Test User',
      email: email,
      password: password,
      role: 'CITIZEN'
    });

    await user.save();
    console.log('User created:', email);
    
    // Verify immediately
    const found = await User.findOne({ email }).select('+password');
    const match = await bcrypt.compare(password, found.password);
    console.log('Verification match:', match);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
