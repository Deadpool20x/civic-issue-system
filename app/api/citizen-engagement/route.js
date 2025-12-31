import { connectDB } from '@/lib/mongodb';
import { authMiddleware } from '@/lib/auth';
import Issue from '@/models/Issue';
import User from '@/models/User';

// Upvote an issue
export const POST = authMiddleware(async (req) => {
    try {
        const { issueId, action } = await req.json(); // action: 'upvote' or 'remove_upvote'

        if (!['upvote', 'remove_upvote'].includes(action)) {
            return new Response(
                JSON.stringify({ error: 'Invalid action' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        let updatedIssue;
        if (action === 'upvote') {
            updatedIssue = await Issue.addUpvote(issueId, req.user.userId);
        } else {
            updatedIssue = await Issue.removeUpvote(issueId, req.user.userId);
        }

        if (!updatedIssue) {
            const issue = await Issue.findById(issueId);
            if (!issue) {
                return new Response(
                    JSON.stringify({ error: 'Issue not found' }),
                    { status: 404, headers: { 'Content-Type': 'application/json' } }
                );
            }
            // if issue exists, it means user has already voted/not voted.
            // for now, we just return the issue without making any changes.
            // in a real app, we might want to return a more specific error message.
            updatedIssue = issue;
        }

        // Populate user info for the response
        await updatedIssue.populate('reportedBy', 'name email');
        await updatedIssue.populate('assignedTo', 'name department');

        return new Response(
            JSON.stringify({
                message: 'Action completed successfully',
                issue: updatedIssue.toObject()
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error handling upvote:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

// Send reminder to municipality
export const PUT = authMiddleware(async (req) => {
    try {
        const { issueId, reminderType } = await req.json();

        await connectDB();

        const issue = await Issue.findById(issueId);
        if (!issue) {
            return new Response(
                JSON.stringify({ error: 'Issue not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Add reminder record
        issue.reminders.push({
            sentAt: new Date(),
            sentTo: issue.assignedDepartment,
            type: reminderType || 'citizen'
        });

        await issue.save();

        // TODO: Send actual email/SMS notification to department
        // This would integrate with email service or SMS service

        return new Response(
            JSON.stringify({ 
                message: 'Reminder sent successfully',
                remindersCount: issue.reminders.length
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error sending reminder:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

// Submit feedback for resolved issue
export const PATCH = authMiddleware(async (req) => {
    try {
        const { issueId, rating, comment, isResolved } = await req.json();

        if (!rating || rating < 1 || rating > 5) {
            return new Response(
                JSON.stringify({ error: 'Rating must be between 1 and 5' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        await connectDB();

        const issue = await Issue.findById(issueId);
        if (!issue) {
            return new Response(
                JSON.stringify({ error: 'Issue not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (issue.status !== 'resolved') {
            return new Response(
                JSON.stringify({ error: 'Issue must be resolved to submit feedback' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Submit feedback
        await issue.submitFeedback(rating, comment, isResolved, req.user.userId);

        return new Response(
            JSON.stringify({ 
                message: 'Feedback submitted successfully',
                feedback: issue.feedback
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
