import { connectDB } from '@/lib/mongodb';
import { strictRoleMiddleware } from '@/lib/middleware';
import Issue from '@/models/Issue';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/analytics/trends?range=7d|30d
 * Admin-only: Returns time-based trends for issues
 * 
 * Note: Since StateHistory model doesn't exist, we use:
 * - issuesReported: Issue.createdAt
 * - issuesResolved: Issue.status === 'resolved' and Issue.updatedAt
 */
export const GET = strictRoleMiddleware(['admin'])(async (req) => {
    try {
        await connectDB();

        // Get range parameter (default to 7d)
        const { searchParams } = new URL(req.url);
        const range = searchParams.get('range') || '7d';

        // Calculate date range
        const now = new Date();
        let daysBack = 7;

        if (range === '30d') {
            daysBack = 30;
        } else if (range === '7d') {
            daysBack = 7;
        }

        const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

        // Get all issues within the date range
        const issues = await Issue.find({
            $or: [
                { createdAt: { $gte: startDate } },
                {
                    status: 'resolved',
                    updatedAt: { $gte: startDate }
                }
            ]
        }).select('createdAt updatedAt status');

        // Group by date
        const trendsMap = new Map();

        // Initialize all dates in range
        for (let i = 0; i < daysBack; i++) {
            const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
            const dateStr = date.toISOString().split('T')[0];
            trendsMap.set(dateStr, {
                date: dateStr,
                issuesReported: 0,
                issuesResolved: 0
            });
        }

        // Process issues
        issues.forEach(issue => {
            const reportDate = issue.createdAt.toISOString().split('T')[0];

            // Count reported issues
            if (issue.createdAt >= startDate && trendsMap.has(reportDate)) {
                const entry = trendsMap.get(reportDate);
                entry.issuesReported += 1;
            }

            // Count resolved issues
            if (issue.status === 'resolved' && issue.updatedAt >= startDate) {
                const resolveDate = issue.updatedAt.toISOString().split('T')[0];
                if (trendsMap.has(resolveDate)) {
                    const entry = trendsMap.get(resolveDate);
                    entry.issuesResolved += 1;
                }
            }
        });

        // Convert map to array and sort by date
        const trends = Array.from(trendsMap.values())
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        return new Response(
            JSON.stringify(trends),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Error in admin analytics trends:', error);
        return new Response(
            JSON.stringify({
                error: 'Failed to fetch trends analytics',
                details: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
});
