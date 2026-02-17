import { connectDB } from '@/lib/mongodb';
import Issue from '@/models/Issue';
import StateHistory from '@/models/StateHistory';
import { withAuth } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const POST = withAuth(async (req, { params }) => {
    try {
        await connectDB();
        
        // Only admin and municipal can perform quick actions
        if (!['admin', 'municipal'].includes(req.user.role)) {
            return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { action, departmentId, reason } = await req.json();
        
        const issue = await Issue.findById(params.id);
        
        if (!issue) {
            return new Response(JSON.stringify({ error: 'Issue not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let newStatus;
        let comment;

        switch (action) {
            case 'acknowledge':
                newStatus = 'acknowledged';
                comment = 'Issue acknowledged by admin';
                issue.status = newStatus;
                break;

            case 'reject':
                newStatus = 'rejected';
                comment = reason || 'Issue rejected by admin';
                issue.status = newStatus;
                issue.rejectionReason = reason;
                break;

            case 'assign':
                if (!departmentId) {
                    return new Response(JSON.stringify({ error: 'Department ID required' }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                newStatus = 'assigned';
                comment = `Issue assigned to department`;
                issue.status = newStatus;
                issue.assignedDepartment = departmentId;
                issue.assignedAt = new Date();
                break;

            default:
                return new Response(JSON.stringify({ error: 'Invalid action' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
        }

        // Save issue
        await issue.save();

        // Create state history
        await StateHistory.create({
            issueId: issue._id,
            status: newStatus,
            changedBy: req.user.userId,
            assignedTo: departmentId || null,
            comment: comment,
            rejectionReason: reason || null,
            timestamp: new Date()
        });

        console.log(`✅ Quick action: ${action} on ${issue.reportId}`);

        // TODO: Send email notification to citizen
        // await sendStatusUpdate(issue.reportedBy.email, issue, newStatus);

        return new Response(JSON.stringify({
            success: true,
            message: `Issue ${action}d successfully`,
            issue: {
                _id: issue._id,
                reportId: issue.reportId,
                status: issue.status
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Quick action error:', error);
        return new Response(JSON.stringify({ error: 'Failed to perform action' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});
