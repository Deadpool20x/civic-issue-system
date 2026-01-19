import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

// Define schemas inline
const departmentSchema = new mongoose.Schema({
    name: String,
    description: String,
    contactEmail: String,
    categories: [String],
    isActive: Boolean,
    staff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const issueSchema = new mongoose.Schema({
    reportId: String,
    title: String,
    description: String,
    category: String,
    subcategory: String,
    status: String,
    priority: String,
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        },
        address: String
    },
    assignedDepartment: mongoose.Schema.Types.Mixed, // Accept both string and ObjectId during migration
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    images: [String],
    upvotes: { type: Number, default: 0 },
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

async function migrateDepartments() {
    try {
        console.log('🔌 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');

        // Get or create models
        const Issue = mongoose.models.Issue || mongoose.model('Issue', issueSchema);
        const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);

        // Get all issues
        const issues = await Issue.find();
        console.log(`📊 Found ${issues.length} issues to migrate\n`);

        // Get all departments
        const departments = await Department.find();
        console.log(`📊 Found ${departments.length} departments:\n`);

        // Create mapping of department names to IDs
        const deptMap = {};
        departments.forEach(dept => {
            deptMap[dept.name] = dept._id;
            console.log(`   - ${dept.name} → ${dept._id}`);
        });

        console.log('\n🔄 Starting migration...\n');

        // Update each issue
        let updated = 0;
        let skipped = 0;

        for (const issue of issues) {
            const oldDept = issue.assignedDepartment;

            if (!oldDept) {
                console.log(`⏭️  ${issue.reportId}: No department assigned, skipping`);
                skipped++;
                continue;
            }

            if (typeof oldDept === 'string') {
                const newDeptId = deptMap[oldDept];

                if (newDeptId) {
                    // Direct update to avoid validation issues
                    await Issue.updateOne(
                        { _id: issue._id },
                        { $set: { assignedDepartment: newDeptId } }
                    );
                    console.log(`✅ ${issue.reportId}: '${oldDept}' → ObjectId(${newDeptId})`);
                    updated++;
                } else {
                    console.log(`⚠️  ${issue.reportId}: Department '${oldDept}' not found in database`);
                    skipped++;
                }
            } else {
                console.log(`⏭️  ${issue.reportId}: Already using ObjectId, skipping`);
                skipped++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log(`✅ Migration complete!`);
        console.log(`   - Updated: ${updated} issues`);
        console.log(`   - Skipped: ${skipped} issues`);
        console.log('='.repeat(60) + '\n');

        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Migration error:', error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

migrateDepartments();
