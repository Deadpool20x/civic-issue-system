import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    email: String,
    password: { type: String, select: false },
    role: String
}));

const TARGET_EMAILS = [
    'roads.manager@civicpulse.in',
    'water.manager@civicpulse.in',
    'officer.w1.roads@civicpulse.in',
    'commissioner@civicpulse.in'
];

const NEW_PASSWORD = 'admin123';

async function resetPasswords() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

        for (const email of TARGET_EMAILS) {
            const result = await User.findOneAndUpdate(
                { email },
                { password: hashedPassword },
                { new: true }
            );

            if (result) {
                console.log(`✅ Success: Reset password for ${email}`);
            } else {
                console.log(`❌ Error: User ${email} not found.`);
            }
        }

        console.log('\nAll targeted passwords have been set to: ' + NEW_PASSWORD);

    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

resetPasswords();
