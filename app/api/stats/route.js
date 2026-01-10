import { connectDB } from '@/lib/mongodb';
import Issue from '@/models/Issue';
import User from '@/models/User';
import { roleMiddleware } from '@/lib/auth';
import { strictRoleMiddleware } from '@/lib/middleware';

// SECURE: Admin-only dashboard stats
export const GET = strictRoleMiddleware(['admin'])(async (req) => {
    try {
        await connectDB();

        // Get total issues and users
        const totalIssues = await Issue.countDocuments();
        const totalUsers = await User.countDocuments();

        // Get department stats using aggregation
        const departmentStats = await Issue.aggregate([
            {
                $group: {
                    _id: '$assignedDepartment',
                    total: { $sum: 1 },
                    resolved: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
                        }
                    },
                    pending: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        // Get recent issues
        const recentIssues = await Issue.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('reportedBy', 'name email');

        return new Response(
            JSON.stringify({
                totalIssues,
                totalUsers,
                departmentStats,
                recentIssues
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});