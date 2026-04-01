
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/civic-issues';

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');
    
    // We can't import the model easily because of ES modules/Next.js paths
    // So we define a minimal one here
    const userSchema = new mongoose.Schema({
      email: String,
      password: { type: String, select: false },
      role: String,
      isActive: Boolean
    });
    
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    
    const count = await User.countDocuments();
    console.log('Total users:', count);
    
    const users = await User.find({}).limit(5).select('+password');
    console.log('First 5 users:');
    users.forEach(u => {
      console.log(`- Email: ${u.email}, Role: ${u.role}, Active: ${u.isActive}, Has Password: ${!!u.password}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

check();
