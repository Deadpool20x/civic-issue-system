import { connectDB } from '@/lib/mongodb';
import { getTokenData } from '@/lib/auth';
import { withAuth, createErrorResponse } from '@/lib/utils';
import Issue from '@/models/Issue';
import User from '@/models/User';
import { createIssueSchema } from '@/lib/schemas';
import { calculatePriority } from '@/lib/priority-calculator';
import { getDepartmentCodeForCategory } from '@/lib/department-mapper';
import { createNotification } from '@/lib/notifications';
import { getWardByZoneDept, WARD_MAP } from '@/lib/wards';
import { getZoneFromCoordinates } from '@/lib/zones';
import { getRoleFilter } from '@/lib/roleFilter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
    const user = await getTokenData()
    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const filter = getRoleFilter(user)

    // Handle the case where filter returns null (admin with full access should get empty filter)
    // But if it's truly unauthorized, return 403
    if (filter === null && user.role) {
        // Check if user is admin - in that case, allow access
        const normalizedRole = (user.role || '').toUpperCase();
        if (normalizedRole !== 'ADMIN' && normalizedRole !== 'SYSTEM_ADMIN') {
            return Response.json(
                { error: 'You do not have permission to access issue data' },
                { status: 403 }
            );
        }
    }

    await connectDB()

    // Apply any additional query filters from URL params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const wardId = searchParams.get('ward')

    const query = { ...filter }

    if (status) query.status = status
    if (priority) query.priority = priority

    // Ward filter from URL — only apply if it fits within role filter
    if (wardId && filter.ward) {
        // For field officer: filter.ward is a string — ward is fixed
    } else if (wardId && filter.ward?.$in) {
        if (filter.ward.$in.includes(wardId)) {
            query.ward = wardId
        }
    } else if (wardId && Object.keys(filter).length === 0) {
        query.ward = wardId
    }

    const issues = await Issue.find(query)
        .sort({ createdAt: -1 })
        .populate('reportedBy', 'name')
        .populate('assignedTo', 'name')
        .lean()

    console.log('[DEBUG] /api/issues - Found', issues.length, 'issues');
    if (issues.length > 0) {
        console.log('[DEBUG] First issue _id:', issues[0]._id);
        console.log('[DEBUG] First issue _id type:', typeof issues[0]._id);
    }

    return Response.json({ success: true, data: issues, count: issues.length })
}

export const POST = withAuth(async (req) => {
    try {
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return createErrorResponse('Invalid JSON body', 400);
        }

        const validationResult = createIssueSchema.safeParse(body);

        if (!validationResult.success) {
            return createErrorResponse(validationResult.error.errors[0].message, 400);
        }

        const {
            title,
            description,
            location,
            category,
            subcategory,
            images,
            ward
        } = validationResult.data;

        // 1. Calculate Priority
        const calculatedPriority = calculatePriority({
            title,
            description,
            category,
            subcategory,
            upvotes: 0
        });

        await connectDB();

        // 2. Process Location
        let processedLocation = null;
        let lat = null, lng = null;

        if (location && location.coordinates) {
            lat = parseFloat(location.coordinates.lat);
            lng = parseFloat(location.coordinates.lng);

            if (!isNaN(lat) && !isNaN(lng)) {
                processedLocation = {
                    address: location.address || 'Address not provided',
                    coordinates: {
                        type: 'Point',
                        coordinates: [lng, lat]
                    },
                    city: location.city || '',
                    state: location.state || '',
                    pincode: location.pincode || ''
                };
            }
        }

        if (!processedLocation) {
            processedLocation = {
                address: location?.address || 'Address not provided',
                city: location?.city || '',
                state: location?.state || '',
                pincode: location?.pincode || ''
            };
        }

        // 3. Determine Ward (Section 8)
        const deptCode = getDepartmentCodeForCategory(category);
        let finalWardId = ward;

        if (!finalWardId && lat !== null && lng !== null) {
            const zone = getZoneFromCoordinates(lat, lng);
            const wardObj = getWardByZoneDept(zone, deptCode);
            if (wardObj) {
                finalWardId = wardObj.wardId;
            }
        }

        if (!finalWardId) {
            finalWardId = 'ward-8';
        }

        // 4. Calculate SLA
        const now = new Date();
        let hoursToAdd = 72;
        switch (calculatedPriority) {
            case 'urgent': hoursToAdd = 24; break;
            case 'high': hoursToAdd = 48; break;
            case 'medium': hoursToAdd = 72; break;
            case 'low': hoursToAdd = 120; break;
        }
        const slaDeadline = new Date(now.getTime() + (hoursToAdd * 60 * 60 * 1000));
        const dueTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // 5. Prepare Issue Data
        const issueData = {
            title,
            description,
            location: processedLocation,
            category,
            subcategory,
            priority: calculatedPriority,
            images: (images || []).map(img => typeof img === 'string' ? { url: img, publicId: '' } : img),
            reportedBy: req.user.userId,
            ward: finalWardId,
            zone: WARD_MAP[finalWardId]?.zone || 'north',
            assignedDepartmentCode: deptCode,
            sla: {
                deadline: slaDeadline
            },
            dueTime,
            status: 'pending'
        };

        // 6. Auto-Assignment
        const officer = await User.findOne({
            role: 'FIELD_OFFICER',
            wardId: finalWardId,
            isActive: true
        });

        if (officer) {
            issueData.assignedTo = officer._id;
            issueData.status = 'assigned';
        }

        const issue = await Issue.create(issueData);

        // 7. Notifications
        if (issue.status === 'assigned' && issue.assignedTo) {
            await createNotification({
                userId: issue.assignedTo,
                type: 'NEW_ASSIGNMENT',
                issueId: issue._id,
                title: 'New Assignment',
                message: `New issue ${issue.reportId} assigned in ${finalWardId}`
            });
        }

        return Response.json({
            success: true,
            message: 'Issue reported successfully',
            reportId: issue.reportId,
            data: issue
        }, { status: 201 });

    } catch (error) {
        console.error('❌ Issue creation error:', error);
        return createErrorResponse('Failed to create issue', 500);
    }
});
