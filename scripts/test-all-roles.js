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

async function testAllRoles() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');

        console.log('🧪 TESTING ALL ROLES\n');
        console.log('='.repeat(60));

        // Test 1: Check Admin User
        console.log('\n👤 ADMIN USER TEST:');
        const adminUser = await User.findOne({ role: { $in: ['admin', 'SYSTEM_ADMIN', 'ADMIN'] } });
        if (adminUser) {
            console.log(`   ✅ Admin found: ${adminUser.name} (${adminUser.email}) [Role: ${adminUser.role}]`);
        } else {
            console.log('   ❌ No admin user found');
        }

        // Test 2: Check Department Users
        console.log('\n🏢 DEPARTMENT USERS TEST:');
        const deptUsers = await User.find({
            role: { $in: ['department', 'DEPARTMENT_MANAGER', 'FIELD_OFFICER'] }
        }).populate('department');
        console.log(`   Found ${deptUsers.length} department users:`);
        deptUsers.forEach(user => {
            console.log(`   - ${user.name} (${user.email}) [Role: ${user.role}]`);
            console.log(`     Department: ${user.department ? user.department.name : 'N/A'}`);
        });

        // Test 3: Check Citizen Users
        console.log('\n👥 CITIZEN USERS TEST:');
        const citizenUsers = await User.find({ role: { $in: ['citizen', 'CITIZEN'] } });
        console.log(`   Found ${citizenUsers.length} citizen users:`);
        citizenUsers.forEach(user => {
            console.log(`   - ${user.name} (${user.email}) [Role: ${user.role}]`);
        });

        // Test 4: Check Issues
        console.log('\n📋 ISSUES TEST:');
        const issues = await Issue.find()
            .populate('reportedBy', 'name email')
            .populate('assignedDepartment', 'name')
            .populate('assignedTo', 'name');

        console.log(`   Found ${issues.length} issues:`);
        issues.forEach(issue => {
            console.log(`   - ${issue.reportId}: ${issue.title}`);
            console.log(`     Status: ${issue.status}`);
            console.log(`     Priority: ${issue.priority}`);
            console.log(`     Reported by: ${issue.reportedBy ? issue.reportedBy.name : 'N/A'}`);
            console.log(`     Assigned to: ${issue.assignedDepartment ? issue.assignedDepartment.name : 'N/A'}`);
        });

        // Test 5: Check Departments
        console.log('\n🏢 DEPARTMENTS TEST:');
        const departments = await Department.find();
        console.log(`   Found ${departments.length} departments:`);
        departments.forEach(dept => {
            console.log(`   - ${dept.name} (${dept.isActive ? 'Active' : 'Inactive'})`);
        });

        // Test 6: Verify Data Integrity
        console.log('\n🔍 DATA INTEGRITY TEST:');

        // Check for issues with string department (should be 0)
        const issuesWithStringDept = await Issue.countDocuments({
            assignedDepartment: { $type: 'string' }
        });
        console.log(`   Issues with string department: ${issuesWithStringDept} ${issuesWithStringDept > 0 ? '❌' : '✅'}`);

        // Check for department users without department (should be 0)
        const deptUsersWithoutDept = await User.countDocuments({
            role: 'department',
            department: { $exists: false }
        });
        console.log(`   Department users without department: ${deptUsersWithoutDept} ${deptUsersWithoutDept > 0 ? '❌' : '✅'}`);

        // Test 7: Verify Issue Assignment
        console.log('\n🎯 ISSUE ASSIGNMENT TEST:');
        const issuesWithDept = await Issue.countDocuments({ assignedDepartment: { $exists: true } });
        console.log(`   Issues with assigned department: ${issuesWithDept} ✅`);

        // Test 8: Verify User Roles
        console.log('\n🎭 USER ROLES TEST:');
        const adminCount = await User.countDocuments({ role: 'admin' });
        const deptCount = await User.countDocuments({ role: 'department' });
        const citizenCount = await User.countDocuments({ role: 'citizen' });

        console.log(`   Admins: ${adminCount} ${adminCount > 0 ? '✅' : '❌'}`);
        console.log(`   Department Staff: ${deptCount} ${deptCount > 0 ? '✅' : '❌'}`);
        console.log(`   Citizens: ${citizenCount} ${citizenCount > 0 ? '✅' : '❌'}`);

        // Test 9: Verify Issue Statuses
        console.log('\n📊 ISSUE STATUS TEST:');
        const statusCounts = await Issue.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        statusCounts.forEach(({ _id, count }) => {
            console.log(`   ${_id}: ${count}`);
        });

        // Test 10: Verify Report IDs
        console.log('\n🆔 REPORT ID TEST:');
        const issuesWithReportId = await Issue.countDocuments({ reportId: { $exists: true } });
        console.log(`   Issues with reportId: ${issuesWithReportId} ${issuesWithReportId > 0 ? '✅' : '❌'}`);

        console.log('\n' + '='.repeat(60));

        // Summary
        const allTestsPassed =
            adminUser &&
            deptUsers.length > 0 &&
            citizenUsers.length > 0 &&
            issuesWithStringDept === 0 &&
            deptUsersWithoutDept === 0 &&
            issuesWithDept > 0 &&
            adminCount > 0 &&
            deptCount > 0 &&
            citizenCount > 0 &&
            issuesWithReportId > 0;

        if (allTestsPassed) {
            console.log('\n✅ ALL TESTS PASSED - SYSTEM IS READY');
        } else {
            console.log('\n⚠️  SOME TESTS FAILED - REVIEW ISSUES');
        }

        console.log('\n');

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testAllRoles();
