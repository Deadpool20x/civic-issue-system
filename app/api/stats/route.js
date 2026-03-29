// app/api/stats/route.js
// Provides system-wide statistics for admin and dashboard use
import { connectDB } from '@/lib/mongodb';
import { getTokenData } from '@/lib/auth';
import Issue from '@/models/Issue';
import User from '@/models/User';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/stats
 * Returns system-wide statistics for dashboards
 * Accessible by: admin, department, municipal, commissioner
 */
export async function GET(request) {
    try {
        // Verify authentication
        const userData = await getTokenData();
        
        if (!userData) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Connect to database
        await connectDB();

        // Get total counts
        const totalIssues = await Issue.countDocuments();
        const totalUsers = await User.countDocuments();

        // Get issues by status
        const statusPipeline = await Issue.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        const statusCounts = statusPipeline.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        // Get issues by priority
        const priorityPipeline = await Issue.aggregate([
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);
        
        const priorityCounts = priorityPipeline.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        // Get department stats (using assignedDepartmentCode for consistency)
        const deptPipeline = await Issue.aggregate([
            { $group: { _id: '$assignedDepartmentCode', total: { $sum: 1 } } }
        ]);
        
        const departmentStats = deptPipeline
            .filter(item => item._id !== null)
            .map(item => ({
                department: item._id,
                total: item.total
            }));

        // Calculate resolution rate
        const resolved = statusCounts['resolved'] || 0;
        const resolutionRate = totalIssues > 0 ? Math.round((resolved / totalIssues) * 100) : 0;

        // Get recent issues for trending
        const recentIssues = await Issue.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('title status priority createdAt')
            .lean();

        // Get recent ratings/feedback
        const ratedIssues = await Issue.find({ 'feedback.rating': { $exists: true } })
            .sort({ 'feedback.submittedAt': -1 })
            .limit(10)
            .select('title feedback')
            .lean();

        const ratings = ratedIssues.map(i => i.feedback?.rating).filter(r => r !== undefined);
        const avgRating = ratings.length > 0 
            ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) 
            : 0;

        // Build response
        const response = {
            success: true,
            totalIssues,
            totalUsers,
            totalRatings: ratings.length,
            avgRating: parseFloat(avgRating),
            resolutionRate,
            statusCounts: {
                pending: statusCounts['pending'] || 0,
                assigned: statusCounts['assigned'] || 0,
                'in-progress': statusCounts['in-progress'] || 0,
                resolved: statusCounts['resolved'] || 0,
                rejected: statusCounts['rejected'] || 0,
                reopened: statusCounts['reopened'] || 0,
                escalated: statusCounts['escalated'] || 0
            },
            priorityCounts: {
                urgent: priorityCounts['urgent'] || 0,
                high: priorityCounts['high'] || 0,
                medium: priorityCounts['medium'] || 0,
                low: priorityCounts['low'] || 0
            },
            departmentStats,
            recentIssues,
            recentFeedback: ratedIssues.map(i => ({
                title: i.title,
                rating: i.feedback?.rating,
                comment: i.feedback?.comment
            }))
        };

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, must-revalidate'
            }
        });

    } catch (error) {
        console.error('[API /stats] Error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to fetch statistics',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
