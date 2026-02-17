import { connectDB } from '@/lib/mongodb';
import Issue from '@/models/Issue';
import { getTokenData } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req, { params }) {
    try {
        await connectDB();

        const userData = await getTokenData(req);
        if (!userData) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const issue = await Issue.findById(params.id);

        if (!issue) {
            return Response.json({ error: 'Issue not found' }, { status: 404 });
        }

        const result = await issue.addUpvote(userData.userId);

        if (result.success) {
            return Response.json({
                message: 'Upvoted successfully',
                upvotes: result.upvotes
            });
        } else {
            return Response.json({ message: result.message }, { status: 400 });
        }

    } catch (error) {
        console.error('Upvote error:', error);
        return Response.json({ error: 'Failed to upvote' }, { status: 500 });
    }
}
