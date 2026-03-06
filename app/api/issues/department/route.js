import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getTokenData } from '@/lib/auth';
import Issue from '@/models/Issue';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/issues/department
 *
 * Returns all issues for the logged-in Field Officer's department.
 * Ward filter applied if user has a ward.
 * Query params: ?status=resolved (optional filter)
 *
 * Frontend pages C1–C4 ALL use this single endpoint.
 */
import { getRoleFilter } from '@/lib/roleFilter';

export async function GET(req) {
    try {
        await connectDB();

        const userData = await getTokenData(req);
        if (!userData) {
            return NextResponse.json(
                { error: 'Unauthorized - No authentication token' },
                { status: 401 }
            );
        }

        const roleFilter = getRoleFilter(userData);

        // Block SYSTEM_ADMIN
        if (roleFilter === null) {
            return NextResponse.json(
                { success: false, error: 'ACCESS_DENIED' },
                { status: 403 }
            );
        }

        // Optional status filter from query string (e.g. ?status=resolved)
        const { searchParams } = new URL(req.url);
        const statusFilter = searchParams.get('status');

        const query = { ...roleFilter };
        if (statusFilter) {
            query.status = statusFilter;
        }

        const issues = await Issue.find(query)
            .select('reportId title description category subcategory status priority location ward sla resolutionTime feedback createdAt updatedAt upvotes assignedDepartmentCode')
            .populate('reportedBy', 'name email')
            .populate('assignedDepartment', 'name')
            .sort({ 'sla.deadline': 1 })
            .lean();

        return NextResponse.json({
            success: true,
            issues,
            count: issues.length,
            departmentId: userData.departmentId,
            wardId: userData.wardId || null
        });

    } catch (error) {
        console.error('❌ Department API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch department issues' },
            { status: 500 }
        );
    }
}
