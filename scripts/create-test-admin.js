/**
 * Script to create a test admin user for development
 * Run with: node scripts/create-test-admin.js
 */

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-issues';

// User schema (simplified for this script)
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['citizen', 'department', 'municipal', 'admin'] },
    department: { type: String },
    phone: { type: String },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String }
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const User = mongoose.model('User', userSchema);

async function createTestAdmin() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@test.com' });
        if (existingAdmin) {
            console.log('Admin user already exists:');
            console.log(`  Email: ${existingAdmin.email}`);
            console.log(`  Name: ${existingAdmin.name}`);
            console.log('\nDelete existing admin first if you want to recreate.');
            process.exit(0);
        }

        // Create test admin
        console.log('\nCreating test admin user...');
        const admin = new User({
            name: 'Test Admin',
            email: 'admin@test.com',
            password: 'admin', // Will be hashed automatically
            role: 'admin',
            isActive: true
        });

        await admin.save();

        console.log('\n✅ Test admin created successfully!');
        console.log('\nLogin credentials:');
        console.log('  Email:    admin@test.com');
        console.log('  Password: admin');
        console.log('\n⚠️  WARNING: This is for development only!');
        console.log('     Delete this script before deploying to production.');

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
        process.exit(0);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    createTestAdmin();
}

export { createTestAdmin };
