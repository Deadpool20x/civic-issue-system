import { connectDB } from '@/lib/mongodb';
import Issue from '@/models/Issue';
import { withAuth } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const POST = withAuth(async (req, { params }) => {
    try {
        await connectDB();
        
        const { rating, resolved, comment } = await req.json();
        
        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return new Response(JSON.stringify({ error: 'Invalid rating' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (resolved === null || resolved === undefined) {
            return new Response(JSON.stringify({ error: 'Please indicate if issue was resolved' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const issue = await Issue.findById(params.id);
        
        if (!issue) {
            return new Response(JSON.stringify({ error: 'Issue not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Check if user is the reporter
        if (issue.reportedBy.toString() !== req.user.userId) {
            return new Response(JSON.stringify({ error: 'Only the reporter can rate this issue' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Check if issue is resolved
        if (issue.status !== 'resolved') {
            return new Response(JSON.stringify({ error: 'Can only rate resolved issues' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Check if already rated
        if (issue.feedback && issue.feedback.rating) {
            return new Response(JSON.stringify({ error: 'You have already rated this issue' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Save rating
        issue.feedback = {
            rating,
            resolved,
            comment: comment || '',
            submittedAt: new Date(),
            submittedBy: req.user.userId
        };
        
        await issue.save();
        
        console.log(`✅ Rating submitted for ${issue.reportId}: ${rating} stars`);
        
        return new Response(JSON.stringify({
            message: 'Rating submitted successfully',
            feedback: issue.feedback
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Rating submission error:', error);
        return new Response(JSON.stringify({ error: 'Failed to submit rating' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});
