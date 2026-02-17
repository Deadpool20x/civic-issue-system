import { connectDB } from '@/lib/mongodb';
import { authMiddleware } from '@/lib/auth';
import Notification from '@/models/Notification';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Get user notifications
export const GET = authMiddleware(async (req) => {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const unreadOnly = searchParams.get('unread') === 'true';

        const query = { user: req.user.userId };
        if (unreadOnly) {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .populate('relatedIssue', 'title status')
            .sort({ createdAt: -1 })
            .limit(50);

        return new Response(JSON.stringify(notifications), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

// Mark notifications as read
export const PATCH = authMiddleware(async (req) => {
    try {
        const { notificationIds } = await req.json();
        await connectDB();

        await Notification.updateMany(
            {
                _id: { $in: notificationIds },
                user: req.user.userId
            },
            { $set: { read: true } }
        );

        return new Response(
            JSON.stringify({ message: 'Notifications marked as read' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error updating notifications:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});