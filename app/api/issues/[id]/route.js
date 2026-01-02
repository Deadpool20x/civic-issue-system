import { connectDB } from '@/lib/mongodb';
import { authMiddleware, roleMiddleware } from '@/lib/auth';
import Issue from '@/models/Issue';

// Get specific issue
export const GET = authMiddleware(async (req, { params }) => {
    try {
        await connectDB();

        const issue = await Issue.findById(params.id)
            .populate('reportedBy', 'name email')
            .populate('assignedTo', 'name department');

        if (!issue) {
            return new Response(
                JSON.stringify({ error: 'Issue not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check access permissions
        if (req.user.role === 'citizen' && issue.reportedBy._id.toString() !== req.user.userId) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(JSON.stringify(issue), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching issue:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

// Update issue
export const PATCH = authMiddleware(async (req, { params }) => {
    try {
        const updates = await req.json();
        await connectDB();

        const issue = await Issue.findById(params.id);

        if (!issue) {
            return new Response(
                JSON.stringify({ error: 'Issue not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Permission checks
        const isOwner = issue.reportedBy.toString() === req.user.userId;
        const isAuthorizedStaff = ['admin', 'municipal', 'department'].includes(req.user.role);

        if (!isOwner && !isAuthorizedStaff) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Department staff can only update issues assigned to their department
        if (req.user.role === 'department' && issue.assignedDepartment !== req.user.department) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Citizens can only edit certain fields of their own issues
        if (req.user.role === 'citizen') {
            const allowedFields = ['title', 'description', 'category', 'priority', 'location', 'images'];
            const filteredUpdates = {};
            Object.keys(updates).forEach(key => {
                if (allowedFields.includes(key)) {
                    filteredUpdates[key] = updates[key];
                }
            });
            Object.assign(issue, filteredUpdates);
        } else {
            // Staff can update any field
            // Add comment if provided
            if (updates.comment) {
                issue.comments.push({
                    text: updates.comment,
                    user: req.user.userId
                });
                delete updates.comment;
            }

            // Update the issue
            Object.assign(issue, updates);
        }

        await issue.save();

        const updatedIssue = await Issue.findById(params.id)
            .populate('reportedBy', 'name email')
            .populate('assignedTo', 'name department');

        return new Response(JSON.stringify(updatedIssue), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error updating issue:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

// Delete issue
export const DELETE = roleMiddleware(['admin'])(async (req, { params }) => {
    try {
        await connectDB();

        const issue = await Issue.findByIdAndDelete(params.id);

        if (!issue) {
            return new Response(
                JSON.stringify({ error: 'Issue not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ message: 'Issue deleted successfully' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error deleting issue:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});