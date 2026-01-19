import { connectDB } from '@/lib/mongodb';
import Issue from '@/models/Issue';
import StateHistory from '@/models/StateHistory';
import { withAuth, createErrorResponse } from '@/lib/utils';

export const PATCH = withAuth(async (req, { params }) => {
    try {
        await connectDB();
        
        // Only admin and municipal can change priority
        if (!['admin', 'municipal'].includes(req.user.role)) {
            return createErrorResponse('Insufficient permissions', 403);
        }
        
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return createErrorResponse('Invalid JSON body', 400);
        }
        
        const { priority, reason } = body;
        
        // Validate priority
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities.includes(priority)) {
            return createErrorResponse('Invalid priority', 400);
        }
        
        const issue = await Issue.findById(params.id);
        
        if (!issue) {
            return createErrorResponse('Issue not found', 404);
        }
        
        const oldPriority = issue.priority;
        issue.priority = priority;
        issue.priorityOverriddenBy = req.user.userId;
        issue.priorityOverriddenAt = new Date();
        
        await issue.save();
        
        // Log priority change in state history
        await StateHistory.create({
            issueId: issue._id,
            status: issue.status, // Keep current status
            changedBy: req.user.userId,
            comment: `Priority changed from ${oldPriority} to ${priority}${reason ? `: ${reason}` : ''}`,
            timestamp: new Date()
        });
        
        console.log(`✅ Priority changed: ${issue.reportId} from ${oldPriority} to ${priority}`);
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Priority updated',
            priority: issue.priority
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Priority update error:', error);
        return createErrorResponse('Failed to update priority', 500);
    }
});
