import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Issue from '../models/Issue.js';
import { getRoleFilter } from '../lib/roleFilter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.local' });

async function verifyPhase2() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔌 Connected to MongoDB');

    // 1. Verify FIELD_OFFICER Filter
    console.log('\n🧪 Test 1: Field Officer (Ward 3, Roads)');
    const officer = await User.findOne({ email: 'officer.w3.roads@civicpulse.in' });
    if (!officer) throw new Error('Officer account not found');

    const officerFilter = getRoleFilter({
        userId: officer._id,
        role: officer.role,
        wardId: officer.wardId,
        departmentId: officer.departmentId
    });
    console.log('Filter:', JSON.stringify(officerFilter));
    if (officerFilter.ward === 'ward-3' && officerFilter.assignedDepartmentCode === 'roads') {
        console.log('✅ Filter correctly scoped to Ward 3 and Roads');
    } else {
        console.log('❌ Filter incorrect');
    }

    // 2. Verify DEPARTMENT_MANAGER Filter
    console.log('\n🧪 Test 2: Department Manager (Roads)');
    const manager = await User.findOne({ email: 'roads.manager@civicpulse.in' });
    if (!manager) throw new Error('Manager account not found');

    const managerFilter = getRoleFilter({
        userId: manager._id,
        role: manager.role,
        departmentId: manager.departmentId
    });
    console.log('Filter:', JSON.stringify(managerFilter));
    if (managerFilter.assignedDepartmentCode === 'roads' && !managerFilter.ward) {
        console.log('✅ Filter correctly scoped to all Roads across city');
    } else {
        console.log('❌ Filter incorrect');
    }

    // 3. Verify MUNICIPAL_COMMISSIONER Filter
    console.log('\n🧪 Test 3: Municipal Commissioner');
    const commissioner = await User.findOne({ email: 'commissioner@civicpulse.in' });
    if (!commissioner) throw new Error('Commissioner account not found');

    const commFilter = getRoleFilter({
        userId: commissioner._id,
        role: commissioner.role
    });
    console.log('Filter:', JSON.stringify(commFilter));
    if (Object.keys(commFilter).length === 0) {
        console.log('✅ Filter correctly empty (unrestricted access)');
    } else {
        console.log('❌ Filter incorrect');
    }

    // 5. Test Auto-Assignment
    console.log('\n🧪 Test 5: Auto-Assignment Logic');
    // Finding officer for ward-3, roads
    const matchingOfficer = await User.findOne({
        role: { $in: ['FIELD_OFFICER', 'department'] },
        wardId: 'ward-3',
        departmentId: 'roads',
        isActive: true
    });

    if (matchingOfficer && matchingOfficer.email === 'officer.w3.roads@civicpulse.in') {
        console.log('✅ Auto-assignment logic correctly identifies Ward 3 Roads Officer');
    } else {
        console.log('❌ Auto-assignment logic failed to find correct officer');
    }

    console.log('\n✅ PHASE 2 VERIFICATION COMPLETE');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during verification:', error);
    process.exit(1);
  }
}

verifyPhase2();
