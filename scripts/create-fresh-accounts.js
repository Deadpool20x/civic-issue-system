import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const accounts = [
    {
        name: 'System Admin',
        email: 'admin@civicpulse.in',
        password: 'Admin@123',
        role: 'SYSTEM_ADMIN',
        isActive: true
    },
    {
        name: 'Municipal Commissioner',
        email: 'commissioner@civicpulse.in',
        password: 'Admin@123',
        role: 'MUNICIPAL_COMMISSIONER',
        isActive: true
    },
    {
        name: 'Roads Department Manager',
        email: 'roads.manager@civicpulse.in',
        password: 'Admin@123',
        role: 'DEPARTMENT_MANAGER',
        departmentId: 'roads',
        isActive: true
    },
    {
        name: 'Ward 3 Roads Officer',
        email: 'officer.w3.roads@civicpulse.in',
        password: 'Admin@123',
        role: 'FIELD_OFFICER',
        wardId: 'ward-3',
        departmentId: 'roads',
        isActive: true
    }
];

async function createAccounts() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env.local');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔌 Connected to MongoDB');

        console.log('👥 Creating fresh accounts...');

        for (const acc of accounts) {
            let user = await User.findOne({ email: acc.email });
            
            if (user) {
                // Update existing user
                Object.assign(user, acc);
                await user.save();
                console.log(`✅ Updated ${acc.role}: ${acc.email}`);
            } else {
                // Create new user
                user = new User(acc);
                await user.save();
                console.log(`✅ Created ${acc.role}: ${acc.email}`);
            }
        }

        console.log('\n✅ Accounts created successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating accounts:', error);
        process.exit(1);
    }
}

createAccounts();
