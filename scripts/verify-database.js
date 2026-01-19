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
import User from '../models/User.js';

async function verifyDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');
        
        console.log('📊 DATABASE VERIFICATION REPORT\n');
        console.log('='.repeat(60));
        
        // Check Issues
        const totalIssues = await Issue.countDocuments();
        const issuesWithStringDept = await Issue.countDocuments({ 
            assignedDepartment: { $type: 'string' } 
        });
        const issuesWithObjectIdDept = await Issue.countDocuments({ 
            assignedDepartment: { $type: 'objectId' } 
        });
        
        console.log('\n📋 ISSUES:');
        console.log(`   Total: ${totalIssues}`);
        console.log(`   With ObjectId department: ${issuesWithObjectIdDept} ✅`);
        console.log(`   With String department: ${issuesWithStringDept} ${issuesWithStringDept > 0 ? '❌ NEEDS FIX' : '✅'}`);
        
        // Check Departments
        const totalDepts = await Department.countDocuments();
        const activeDepts = await Department.countDocuments({ isActive: true });
        
        console.log('\n🏢 DEPARTMENTS:');
        console.log(`   Total: ${totalDepts}`);
        console.log(`   Active: ${activeDepts}`);
        
        // List each department with issue counts
        const departments = await Department.find();
        for (const dept of departments) {
            const issueCount = await Issue.countDocuments({ assignedDepartment: dept._id });
            console.log(`   - ${dept.name}: ${issueCount} issues`);
        }
        
        // Check Users
        const totalUsers = await User.countDocuments();
        const adminUsers = await User.countDocuments({ role: 'admin' });
        const deptUsers = await User.countDocuments({ role: 'department' });
        const citizenUsers = await User.countDocuments({ role: 'citizen' });
        
        console.log('\n👥 USERS:');
        console.log(`   Total: ${totalUsers}`);
        console.log(`   Admins: ${adminUsers}`);
        console.log(`   Department Staff: ${deptUsers}`);
        console.log(`   Citizens: ${citizenUsers}`);
        
        // Check for orphaned data
        const deptUsersWithoutDept = await User.countDocuments({ 
            role: 'department', 
            department: { $exists: false } 
        });
        
        console.log('\n🔍 DATA INTEGRITY:');
        console.log(`   Department users without department: ${deptUsersWithoutDept} ${deptUsersWithoutDept > 0 ? '❌ NEEDS FIX' : '✅'}`);
        
        // Check issue statuses
        const statusCounts = await Issue.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        console.log('\n📈 ISSUE STATUS BREAKDOWN:');
        statusCounts.forEach(({ _id, count }) => {
            console.log(`   ${_id}: ${count}`);
        });
        
        console.log('\n' + '='.repeat(60));
        
        if (issuesWithStringDept === 0 && deptUsersWithoutDept === 0) {
            console.log('\n✅ DATABASE IS HEALTHY - NO ISSUES FOUND');
        } else {
            console.log('\n⚠️  DATABASE HAS ISSUES - RUN MIGRATIONS');
        }
        
        console.log('\n');
        
        await mongoose.connection.close();
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

verifyDatabase();
