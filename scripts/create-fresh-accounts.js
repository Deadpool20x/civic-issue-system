import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.local' });

const accounts = [
    {
        name: 'Ward 3 Roads Officer',
        email: 'officer.w3.roads@civicpulse.in',
        password: 'password123',
        role: 'FIELD_OFFICER',
        wardId: 'ward-3',
        departmentId: 'roads',
        isActive: true
    },
    {
        name: 'Roads Department Manager',
        email: 'roads.manager@civicpulse.in',
        password: 'password123',
        role: 'DEPARTMENT_MANAGER',
        wardId: null,
        departmentId: 'roads',
        isActive: true
    },
    {
        name: 'Municipal Commissioner',
        email: 'commissioner@civicpulse.in',
        password: 'password123',
        role: 'MUNICIPAL_COMMISSIONER',
        wardId: null,
        departmentId: null,
        isActive: true
    },
    {
        name: 'System Admin',
        email: 'admin@civicpulse.in',
        password: 'password123',
        role: 'SYSTEM_ADMIN',
        wardId: null,
        departmentId: null,
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
            const user = await User.findOneAndUpdate(
                { email: acc.email },
                acc,
                { upsert: true, new: true }
            );
            console.log(`✅ Created/Updated ${acc.role}: ${acc.email}`);
        }

        console.log('\n✅ Accounts created successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating accounts:', error);
        process.exit(1);
    }
}

createAccounts();
