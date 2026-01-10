import { connectDB } from '@/lib/mongodb';
import { strictRoleMiddleware } from '@/lib/middleware';
import Issue from '@/models/Issue';

/**
 * GET /api/admin/analytics/departments
 * Admin-only: Returns department performance metrics
 * 
 * Note: Since StateHistory model doesn't exist in this codebase,
 * we calculate avgResolutionTime using Issue.resolutionTime field
 * which is calculated on save when status changes to 'resolved'
 */
export const GET = strictRoleMiddleware(['admin'])(async (req) => {
    try {
        await connectDB();

        // Aggregate department performance data
        const departmentStats = await Issue.aggregate([
            {
                $group: {
                    _id: '$assignedDepartment',
                    totalAssignedIssues: { $sum: 1 },
                    resolvedIssues: {
                        $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                    },
                    pendingIssues: {
                        $sum: { $cond: [{ $in: ['$status', ['pending', 'assigned', 'in-progress', 'reopened', 'escalated']] }, 1, 0] }
                    },
                    // Calculate average resolution time from resolved issues
                    totalResolutionTime: {
                        $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, '$resolutionTime', 0] }
                    },
                    resolvedCountForTime: {
                        $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    departmentId: '$_id',
                    departmentName: '$_id',
                    totalAssignedIssues: 1,
                    resolvedIssues: 1,
                    pendingIssues: 1,
                    avgResolutionTime: {
                        $cond: [
                            { $gt: ['$resolvedCountForTime', 0] },
                            { $divide: ['$totalResolutionTime', '$resolvedCountForTime'] },
                            0
                        ]
                    }
                }
            },
            {
                $sort: { departmentName: 1 }
            }
        ]);

        // Filter out null/undefined departments and format response
        const formattedStats = departmentStats
            .filter(dept => dept.departmentId && dept.departmentId !== null)
            .map(dept => ({
                departmentId: dept.departmentId,
                departmentName: dept.departmentName,
                totalAssignedIssues: dept.totalAssignedIssues || 0,
                resolvedIssues: dept.resolvedIssues || 0,
                pendingIssues: dept.pendingIssues || 0,
                avgResolutionTime: dept.avgResolutionTime || 0 // in hours
            }));

        return new Response(
            JSON.stringify(formattedStats),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Error in admin analytics departments:', error);
        return new Response(
            JSON.stringify({
                error: 'Failed to fetch department analytics',
                details: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
});
