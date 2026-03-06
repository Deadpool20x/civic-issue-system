import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

import User from '../models/User.js';

async function fixAllPasswords() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const users = await User.find({}).select('+password');
        console.log(`Checking ${users.length} users...`);

        const TARGET_MAP = {
            'admin@civicpulse.in': 'admin123',
            'roads.manager@civicpulse.in': 'admin123',
            'water.manager@civicpulse.in': 'admin123',
            'waste.manager@civicpulse.in': 'admin123',
            'light.manager@civicpulse.in': 'admin123',
            'parks.manager@civicpulse.in': 'admin123',
            'health.manager@civicpulse.in': 'admin123',
            'commissioner@civicpulse.in': 'admin123',
            'officer.w1.roads@civicpulse.in': 'admin123',
            'officer.w2.water@civicpulse.in': 'admin123',
            'officer.w3.roads@civicpulse.in': 'admin123',
            'officer.w4.waste@civicpulse.in': 'admin123',
        };

        let updatedCount = 0;

        for (const user of users) {
             const targetPassword = TARGET_MAP[user.email];
             
             if (targetPassword) {
                 console.log(`Force resetting ${user.email} to: ${targetPassword}`);
                 user.password = targetPassword;
                 await user.save();
                 updatedCount++;
                 continue;
             }

             // For non-targeted users, only hash if it's plain text
             const isHashed = user.password && user.password.startsWith('$2') && user.password.length > 30;
             if (!isHashed) {
                 console.log(`Hashing plain text for: ${user.email}`);
                 user.password = user.password || 'password123';
                 await user.save();
                 updatedCount++;
             }
        }

        console.log(`\n✅ Finished. Successfully updated ${updatedCount} users.`);
        
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

fixAllPasswords();
