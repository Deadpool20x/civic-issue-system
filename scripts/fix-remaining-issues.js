import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

// Import models
import Issue from '../models/Issue.js';
import Department from '../lib/models/Department.js';

async function fixRemainingIssues() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected\n');
        
        // Find water-drainage department
        const waterDept = await Department.findOne({ name: 'water-drainage' });
        
        if (waterDept) {
            // Update R00001
            const result = await Issue.updateOne(
                { reportId: 'R00001' },
                { $set: { assignedDepartment: waterDept._id } }
            );
            
            if (result.modifiedCount > 0) {
                console.log('✅ R00001 fixed - assigned to water-drainage department');
            } else {
                console.log('⚠️  R00001 not found or already correct');
            }
        } else {
            console.log('❌ water-drainage department not found');
        }
        
        await mongoose.connection.close();
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixRemainingIssues();
