import { connectDB } from '@/lib/mongodb';
import { roleMiddleware } from '@/lib/auth';
import Issue from '@/models/Issue';

// Admin/Municipal only - Full details with no filtering
export const GET = roleMiddleware(['admin', 'municipal'])(async (req) => {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const assignedDepartment = searchParams.get('department');
        const ward = searchParams.get('ward');
        const escalated = searchParams.get('escalated');

        // Build query based on filters
        const query = {};
        if (category) query.category = category;
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (assignedDepartment) query.assignedDepartment = assignedDepartment;
        if (ward) query.ward = ward;
        if (escalated === 'true') query['sla.escalationLevel'] = { $gt: 1 };

        // Get all issues with full details
        let issues;
        try {
            issues = await Issue.find(query)
                .populate('reportedBy', 'name email phone')
                .populate('assignedTo', 'name email department')
                .populate('assignedStaff', 'name email department')
                .populate('departmentHead', 'name email department')
                .populate('upvotedBy', 'name email')
                .sort({ createdAt: -1 });
        } catch (populateError) {
            // Fallback if some fields don't exist in the schema
            console.log('Some populate fields not available, using fallback:', populateError.message);
            issues = await Issue.find(query)
                .populate('reportedBy', 'name email phone')
                .populate('assignedTo', 'name email department')
                .sort({ createdAt: -1 });
        }

        return new Response(JSON.stringify(issues), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching admin issues:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

// Update issue with full admin privileges
export const PATCH = roleMiddleware(['admin', 'municipal'])(async (req) => {
    try {
        const { issueId, updates } = await req.json();

        await connectDB();

        const issue = await Issue.findByIdAndUpdate(
            issueId,
            { ...updates, updatedAt: new Date() },
            { new: true }
        ).populate('reportedBy', 'name email')
         .populate('assignedTo', 'name email department')
         .populate('assignedStaff', 'name email department');

        if (!issue) {
            return new Response(
                JSON.stringify({ error: 'Issue not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(JSON.stringify(issue), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error updating issue:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
