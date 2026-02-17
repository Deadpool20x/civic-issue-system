import { connectDB } from '@/lib/mongodb';
import { strictRoleMiddleware } from '@/lib/middleware';
import Issue from '@/models/Issue';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/analytics/workflow
 * Admin-only: Returns workflow integrity metrics
 * 
 * Note: Since StateHistory model doesn't exist in this codebase,
 * we calculate metrics based on Issue status transitions using
 * createdAt and updatedAt timestamps.
 * 
 * We track:
 * - reportedToInProgressCount: Issues that moved from pending/assigned to in-progress
 * - inProgressToResolvedCount: Issues that moved from in-progress to resolved
 * - avgTimePerTransition: Average time between these transitions
 * - invalidTransitionAttempts: Not tracked in current system (returns 0)
 */
export const GET = strictRoleMiddleware(['admin'])(async (req) => {
    try {
        await connectDB();

        // Get all issues that have undergone status changes
        const issues = await Issue.find({
            $or: [
                { status: { $in: ['in-progress', 'resolved'] } },
                { updatedAt: { $ne: null } }
            ]
        }).select('status createdAt updatedAt resolutionTime');

        let reportedToInProgressCount = 0;
        let inProgressToResolvedCount = 0;
        let totalReportedToInProgressTime = 0;
        let totalInProgressToResolvedTime = 0;

        // For each issue, we need to estimate transition times
        // Since we don't have state history, we'll use resolutionTime for resolved issues
        // and estimate in-progress time based on the time between creation and now

        issues.forEach(issue => {
            const createdTime = new Date(issue.createdAt).getTime();
            const updatedTime = issue.updatedAt ? new Date(issue.updatedAt).getTime() : createdTime;
            const now = Date.now();

            // If issue is in-progress or resolved, it must have gone through reported -> in-progress
            if (['in-progress', 'resolved'].includes(issue.status)) {
                reportedToInProgressCount++;

                // Estimate time to in-progress: use half of resolution time if resolved, 
                // or time since creation if still in-progress
                if (issue.status === 'resolved' && issue.resolutionTime > 0) {
                    // Assume 40% of resolution time was spent in in-progress
                    const inProgressTime = issue.resolutionTime * 0.4;
                    totalReportedToInProgressTime += inProgressTime;
                } else {
                    // For in-progress issues, use time since creation (in hours)
                    const hoursSinceCreated = (now - createdTime) / (1000 * 60 * 60);
                    totalReportedToInProgressTime += hoursSinceCreated;
                }
            }

            // If issue is resolved, it must have gone through in-progress -> resolved
            if (issue.status === 'resolved') {
                inProgressToResolvedCount++;

                // Use resolutionTime if available
                if (issue.resolutionTime > 0) {
                    // Assume 60% of resolution time was spent in in-progress -> resolved transition
                    const resolvedTime = issue.resolutionTime * 0.6;
                    totalInProgressToResolvedTime += resolvedTime;
                } else {
                    // Fallback: calculate from created to updated
                    const hoursToResolve = (updatedTime - createdTime) / (1000 * 60 * 60);
                    totalInProgressToResolvedTime += hoursToResolve;
                }
            }
        });

        // Calculate averages
        const avgTimeReportedToInProgress = reportedToInProgressCount > 0
            ? totalReportedToInProgressTime / reportedToInProgressCount
            : 0;

        const avgTimeInProgressToResolved = inProgressToResolvedCount > 0
            ? totalInProgressToResolvedTime / inProgressToResolvedCount
            : 0;

        // Average time per transition (combined)
        const totalTransitions = reportedToInProgressCount + inProgressToResolvedCount;
        const avgTimePerTransition = totalTransitions > 0
            ? (totalReportedToInProgressTime + totalInProgressToResolvedTime) / totalTransitions
            : 0;

        return new Response(
            JSON.stringify({
                reportedToInProgressCount,
                inProgressToResolvedCount,
                avgTimePerTransition: Math.round(avgTimePerTransition * 100) / 100, // 2 decimal places
                invalidTransitionAttempts: 0 // Not tracked in current system
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Error in admin analytics workflow:', error);
        return new Response(
            JSON.stringify({
                error: 'Failed to fetch workflow analytics',
                details: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
});
