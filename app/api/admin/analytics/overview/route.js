import { connectDB } from '@/lib/mongodb';
import { strictRoleMiddleware } from '@/lib/middleware';
import Issue from '@/models/Issue';

/**
 * GET /api/admin/analytics/overview
 * Admin-only: Returns system-wide issue statistics
 */
export const GET = strictRoleMiddleware(['admin'])(async (req) => {
    try {
        await connectDB();

        // Get total count of all issues
        const totalIssues = await Issue.countDocuments();

        // Count issues by current status
        const statusCounts = await Issue.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Convert array to object for easier access
        const statusMap = statusCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        // Calculate counts
        const reportedCount = statusMap['pending'] || 0;
        const inProgressCount = (statusMap['in-progress'] || 0) + (statusMap['assigned'] || 0);
        const resolvedCount = statusMap['resolved'] || 0;

        // Calculate resolution percentage
        const resolutionPercentage = totalIssues > 0
            ? Math.round((resolvedCount / totalIssues) * 100)
            : 0;

        return new Response(
            JSON.stringify({
                totalIssues,
                reportedCount,
                inProgressCount,
                resolvedCount,
                resolutionPercentage
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Error in admin analytics overview:', error);
        return new Response(
            JSON.stringify({
                error: 'Failed to fetch analytics overview',
                details: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
});
