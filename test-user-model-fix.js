import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Department from './lib/models/Department.js';

dotenv.config({ path: '.env.local' });

async function runTest() {
  console.log('Starting User Model Fix Verification...');

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set in .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Create a dummy Department
    const deptName = `Test Dept ${Date.now()}`;
    const dept = new Department({
      name: deptName,
      contactEmail: 'test@dept.com',
      categories: ['Test']
    });
    await dept.save();
    console.log(`Created dummy department: ${dept._id}`);

    // 2. Create User with role='department' and valid department ID
    const deptUserEmail = `dept-user-${Date.now()}@test.com`;
    const deptUser = new User({
      name: 'Dept User',
      email: deptUserEmail,
      password: 'password123',
      role: 'department',
      department: dept._id
    });

    try {
        await deptUser.save();
        console.log('✅ Success: Created user with role="department" and valid department ID');
    } catch (err) {
        console.error('❌ Failed to create department user:', err.message);
    }

    // 3. Create User with role="citizen" (no department)
    const citizenEmail = `citizen-${Date.now()}@test.com`;
    const citizenUser = new User({
      name: 'Citizen User',
      email: citizenEmail,
      password: 'password123',
      role: 'citizen'
    });

    try {
        await citizenUser.save();
        console.log('✅ Success: Created user with role="citizen" (no department)');
    } catch (err) {
        console.error('❌ Failed to create citizen user:', err.message);
    }

    // 4. Test validation: role="department" without department
    const invalidDeptUser = new User({
        name: 'Invalid Dept User',
        email: `invalid-${Date.now()}@test.com`,
        password: 'password123',
        role: 'department'
        // Missing department
    });

    try {
        await invalidDeptUser.save();
        console.error('❌ Failed: Should have rejected user with role="department" but missing department field');
    } catch (err) {
        if (err.message.includes('Department is required')) {
             console.log('✅ Success: Correctly rejected user with role="department" but missing department');
        } else {
             console.log(`✅ Success (rejected with expected error): ${err.message}`);
        }
    }

    // 5. Populate test
    const foundUser = await User.findById(deptUser._id).populate('department');
    if (foundUser.department && foundUser.department.name === deptName) {
        console.log('✅ Success: Populated department correctly');
    } else {
        console.error('❌ Failed: Department population failed or name mismatch');
        console.log('Found:', foundUser.department);
    }


    // Cleanup
    await User.deleteMany({ email: { $in: [deptUserEmail, citizenEmail] } });
    if (invalidDeptUser._id) await User.deleteOne({ _id: invalidDeptUser._id }); // Just in case
    await Department.deleteOne({ _id: dept._id });
    console.log('Cleanup complete');

  } catch (error) {
    console.error('Test Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

runTest();
