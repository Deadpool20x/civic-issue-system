import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Use environment variable for MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-issue-system';

async function connectDB() {
    try {
        const conn = await mongoose.connect(MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// User schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phone: String,
    role: String,
    department: String,
    address: Object,
    isActive: Boolean,
    createdAt: Date
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function clearUsers() {
    try {
        console.log('🔗 Connecting to database...');
        await connectDB();

        console.log('🗑️  Clearing all users from database...');

        const result = await User.deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} users`);

        console.log('✅ Database cleared successfully!');
        console.log('📝 You can now register a new account.');

    } catch (error) {
        console.error('❌ Error clearing users:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from database');
        process.exit(0);
    }
}

clearUsers();