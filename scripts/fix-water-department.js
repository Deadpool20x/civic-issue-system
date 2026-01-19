import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

async function fixWaterDepartment() {
    try {
        console.log('🔌 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');

        // Get or create models
        const Issue = mongoose.models.Issue || mongoose.model('Issue', new mongoose.Schema({
            reportId: String,
            assignedDepartment: mongoose.Schema.Types.Mixed
        }, { timestamps: true }));

        const Department = mongoose.models.Department || mongoose.model('Department', new mongoose.Schema({
            name: String
        }, { timestamps: true }));

        // Find the water-drainage department
        const waterDept = await Department.findOne({ name: 'water-drainage' });
        if (!waterDept) {
            console.log('❌ water-drainage department not found!');
            process.exit(1);
        }

        console.log(`✅ Found water-drainage department: ${waterDept._id}\n`);

        // Update issue R00001
        const result = await Issue.updateOne(
            { reportId: 'R00001' },
            { $set: { assignedDepartment: waterDept._id } }
        );

        if (result.modifiedCount > 0) {
            console.log('✅ Updated issue R00001');
            console.log(`   - Old value: "water"`);
            console.log(`   - New value: ${waterDept._id}`);
        } else {
            console.log('⚠️  Issue R00001 was not modified (already correct or not found)');
        }

        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error:', error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

fixWaterDepartment();
