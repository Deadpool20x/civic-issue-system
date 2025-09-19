import { connectDB } from '@/lib/mongodb';
import Issue from '@/models/Issue';

// Public API - Heavily anonymized data for public dashboard
export const GET = async (req) => {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const ward = searchParams.get('ward');
        const limit = parseInt(searchParams.get('limit')) || 50;

        // Build query
        const query = {};
        if (category) query.category = category;
        if (status) query.status = status;
        if (ward) query.ward = ward;

        // Get issues with minimal data
        const issues = await Issue.find(query)
            .select('title category status priority assignedDepartment ward upvotes createdAt sla.deadline sla.hoursRemaining sla.isOverdue')
            .populate('reportedBy', 'name') // Only name, no email
            .sort({ createdAt: -1 })
            .limit(limit);

        // Anonymize all data for public consumption
        const publicIssues = issues.map(issue => ({
            _id: issue._id,
            title: issue.title,
            category: issue.category,
            status: issue.status,
            priority: issue.priority,
            assignedDepartment: issue.assignedDepartment,
            ward: issue.ward,
            upvotes: issue.upvotes,
            createdAt: issue.createdAt,
            sla: {
                deadline: issue.sla.deadline,
                hoursRemaining: issue.sla.hoursRemaining,
                isOverdue: issue.sla.isOverdue
            },
            // Completely anonymized reporter
            reportedBy: {
                name: 'Citizen'
            }
        }));

        return new Response(JSON.stringify(publicIssues), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
            }
        });
    } catch (error) {
        console.error('Error fetching public issues:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' }
        );
    }
};
