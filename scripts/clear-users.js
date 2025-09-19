import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../lib/mongodb.js';
import User from '../models/User.js';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function clearUsers() {
    try {
        console.log('Connecting to database...');
        await connectDB();

        console.log('Clearing all users from database...');

        const result = await User.deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} users`);

        console.log('✅ Database cleared successfully!');
        console.log('You can now register a new account.');

    } catch (error) {
        console.error('❌ Error clearing users:', error.message);
    } finally {
        process.exit(0);
    }
}

clearUsers();