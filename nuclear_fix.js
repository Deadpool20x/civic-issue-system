import mongoose from 'mongoose';
import User from './models/User.js';

async function nuclearFix() {
    try {
        if (!process.env.MONGODB_URI) throw new Error('No MONGODB_URI');
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Find ALL users
        const users = await User.find({});
        console.log(`Found ${users.length} total users in database.`);

        for (const user of users) {
             // Reset password to Admin@123
             user.password = 'Admin@123';
             // Ensure isActive is true
             user.isActive = true;
             await user.save();
             console.log(`Fixed: ${user.email} (${user.role})`);
        }

        console.log('\nSUCCESS: All users reset to password: Admin@123');
    } catch (e) {
        console.error('FAILED:', e);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

nuclearFix();
