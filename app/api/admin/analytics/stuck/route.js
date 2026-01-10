import { connectDB } from '@/lib/mongodb';
import { strictRoleMiddleware } from '@/lib/middleware';
import Issue from '@/models/Issue';
import StateHistory from '@/models/StateHistory';

/**
 * GET /api/admin/analytics/stuck?days=7
 * Admin-only: Returns issues stuck in current state
 * 
 * Uses actual StateHistory records to determine when issues entered their current workflow state
 * This provides audit-correct and governance-safe calculations based on actual workflow transitions
 */
export const GET = strictRoleMiddleware(['admin'])(async (req) => {
    try {
        await connectDB();

        // Get days parameter (default to 7)
        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days')) || 7;

        // Calculate current timestamp for calculations
        const now = new Date();

        // Use aggregation pipeline to find stuck issues based on actual StateHistory records
        const stuckIssues = await Issue.aggregate([
            {
                $match: {
                    status: { $nin: ['resolved', 'rejected'] }
                }
            },
            {
                $lookup: {
                    from: 'statehistories',
                    localField: '_id',
                    foreignField: 'issueId',
                    as: 'stateHistory'
                }
            },
            {
                $addFields: {
                    // Find the latest StateHistory entry for each issue
                    latestStateHistory: {
                        $cond: [
                            { $gt: [{ $size: '$stateHistory' }, 0] },
                            { $arrayElemAt: ['$stateHistory', 0] },
                            null
                        ]
                    }
                }
            },
            {
                $addFields: {
                    // Determine the timestamp when issue entered current state
                    // Use the latest StateHistory timestamp if available, otherwise use createdAt
                    lastStateChangeTime: {
                        $cond: [
                            { $ne: ['$latestStateHistory', null] },
                            '$latestStateHistory.timestamp',
                            '$createdAt'
                        ]
                    }
                }
            },
            {
                $addFields: {
                    // Calculate days in current state
                    daysInCurrentState: {
                        $floor: {
                            $divide: [
                                { $subtract: [now, '$lastStateChangeTime'] },
                                1000 * 60 * 60 * 24
                            ]
                        }
                    }
                }
            },
            {
                $match: {
                    daysInCurrentState: { $gte: days }
                }
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'assignedDepartment',
                    foreignField: 'name',
                    as: 'departmentData'
                }
            },
            {
                $addFields: {
                    assignedDepartmentName: {
                        $cond: [
                            { $gt: [{ $size: '$departmentData' }, 0] },
                            { $arrayElemAt: ['$departmentData.name', 0] },
                            'Unassigned'
                        ]
                    }
                }
            },
            {
                $project: {
                    issueId: '$_id',
                    title: 1,
                    currentStatus: '$status',
                    daysInCurrentState: 1,
                    assignedDepartment: '$assignedDepartmentName'
                }
            },
            {
                $sort: {
                    daysInCurrentState: -1
                }
            }
        ]);

        return new Response(
            JSON.stringify(stuckIssues),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Error in admin analytics stuck:', error);
        return new Response(
            JSON.stringify({
                error: 'Failed to fetch stuck issues analytics',
                details: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
});
