import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getTokenData } from '@/lib/auth';
import Issue from '@/models/Issue';
import mongoose from 'mongoose';

export async function GET(req) {
    try {
        // 1. Connect to database
        await connectDB();

        // 2. Get logged-in user data from token
        const userData = await getTokenData(req);
        
        if (!userData) {
            return NextResponse.json(
                { error: 'Unauthorized - No authentication token' },
                { status: 401 }
            );
        }

        // 3. Check if user role is "department"
        if (userData.role !== 'department') {
            return NextResponse.json(
                { error: 'Department access required' },
                { status: 403 }
            );
        }

        // 4. Get full user with department populated
        const User = mongoose.model('User');
        const user = await User.findById(userData.userId).populate('department');

        // 5. Check if user has department
        if (!user.department) {
            return NextResponse.json({
                issues: [],
                message: 'No department assigned to your account'
            });
        }

        const departmentId = user.department._id;

        // 6. Fetch department-specific issues
        const issues = await Issue.find({ assignedDepartment: departmentId })
            .select('reportId title description category subcategory status priority location createdAt upvotes')
            .populate('reportedBy', 'name email')
            .populate('assignedDepartment', 'name')
            .sort({ priority: -1, createdAt: -1 })
            .lean();

        // 7. Return issues array
        return NextResponse.json({
            success: true,
            issues,
            count: issues.length,
            departmentName: user.department.name
        });

    } catch (error) {
        console.error('❌ Department API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch department issues' },
            { status: 500 }
        );
    }
}
