import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Department from '@/lib/models/Department';
import Issue from '@/models/Issue';
import { withAuth, createErrorResponse } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET - List all departments with workload counts
 */
export const GET = withAuth(async (req) => {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const activeOnly = searchParams.get('active') !== 'false';

        // Build query
        const query = {};
        if (activeOnly) {
            query.isActive = true;
        }

        // Add search filter if provided
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // Fetch departments
        const departments = await Department.find(query)
            .sort({ name: 1 })
            .lean();

        // Get workload counts for each department
        const departmentsWithWorkload = await Promise.all(
            departments.map(async (dept) => {
                const workload = await Issue.countDocuments({
                    assignedDepartment: dept._id,
                    status: { $in: ['pending', 'assigned', 'in-progress'] }
                });

                return {
                    ...dept,
                    workload,
                    issueCount: await Issue.countDocuments({
                        assignedDepartment: dept._id
                    })
                };
            })
        );

        return NextResponse.json(departmentsWithWorkload);

    } catch (error) {
        console.error('Error fetching departments:', error);
        return createErrorResponse('Failed to fetch departments', 500);
    }
});

/**
 * POST - Create new department (admin only)
 */
export const POST = withAuth(async (req) => {
    try {
        // Check admin role
        if (req.user.role !== 'admin') {
            return createErrorResponse('Admin access required', 403);
        }

        const body = await req.json();
        const { name, description, contactEmail, contactPhone, categories = [] } = body;

        // Validate required fields
        if (!name || !contactEmail) {
            return createErrorResponse('Name and contact email are required', 400);
        }

        // Server-side validation for department name
        const validationError = validateDepartmentName(name);
        if (validationError) {
            return createErrorResponse(validationError, 400);
        }

        await connectDB();

        // Check if department already exists
        const existingDept = await Department.findOne({ name });
        if (existingDept) {
            return createErrorResponse('Department name already exists', 409);
        }

        // Create new department
        const department = await Department.create({
            name,
            description,
            contactEmail,
            contactPhone,
            categories,
            isActive: true
        });

        return NextResponse.json({
            success: true,
            message: 'Department created successfully',
            department
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating department:', error);
        return createErrorResponse('Failed to create department', 500);
    }
});

/**
 * Validate department name on server side
 */
function validateDepartmentName(name) {
    // Check minimum length
    if (name.length < 5) {
        return 'Department name too short. Use descriptive name like "Roads Department"';
    }

    // Check if it looks like a person's name (2 words, both capitalized)
    const wordCount = name.trim().split(/\s+/).length;
    const looksLikePersonName = wordCount === 2 &&
        name === name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

    if (looksLikePersonName) {
        return 'Invalid department name. Must be a department/office name, not a person\'s name';
    }

    // Check for department-related keywords
    const departmentKeywords = ['department', 'dept', 'office', 'administration', 'division', 'bureau'];
    const hasKeyword = departmentKeywords.some(keyword =>
        name.toLowerCase().includes(keyword)
    );

    if (!hasKeyword) {
        return 'Department name must be descriptive (e.g., "Roads & Infrastructure Department")';
    }

    return null;
}
