import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function diagnose() {
    try {
        console.log('🔍 Starting Authentication Diagnostics...');
        
        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI not found in environment');
            return;
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔌 Connected to MongoDB');

        const accounts = [
            { email: 'admin@civicpulse.in', role: 'SYSTEM_ADMIN' },
            { email: 'officer.w3.roads@civicpulse.in', role: 'FIELD_OFFICER' },
            { email: 'roads.manager@civicpulse.in', role: 'DEPARTMENT_MANAGER' },
            { email: 'commissioner@civicpulse.in', role: 'MUNICIPAL_COMMISSIONER' }
        ];

        for (const acc of accounts) {
            console.log(`\n📧 Checking account: ${acc.email} (${acc.role})`);
            const user = await User.findOne({ email: acc.email }).select('+password');
            if (!user) {
                console.log(`❌ User NOT FOUND in database.`);
                continue;
            }

            console.log(`✅ User record exists.`);
            console.log(`👤 Role: ${user.role}`);

            const passwordsToTry = ['password123', 'Admin@123'];
            for (const pw of passwordsToTry) {
                const isMatch = await user.comparePassword(pw);
                if (isMatch) {
                    console.log(`✅ PASSWORD MATCHES: '${pw}'`);
                } else {
                    console.log(`❌ Password '${pw}' DOES NOT MATCH.`);
                }
            }
        }

    } catch (error) {
        console.error('❌ Diagnostics failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

diagnose();
