import { connectDB } from '@/lib/mongodb';
import { withAuth } from '@/lib/utils';
import Issue from '@/models/Issue';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/issues/[id]/photos
 * Add more photos to an existing issue
 * Only the citizen who reported it can add photos
 * Cannot add photos to resolved issues
 */
export const POST = withAuth(async (req, { params }) => {
    try {
        await connectDB();

        const user = req.user;
        const body = await req.json();
        const { photos } = body;

        if (!photos || !Array.isArray(photos) || photos.length === 0) {
            return new Response(
                JSON.stringify({ error: 'No photos provided' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Find the issue
        let issue;
        if (params.id.startsWith('R')) {
            issue = await Issue.findOne({ reportId: params.id });
        } else {
            issue = await Issue.findById(params.id);
        }

        if (!issue) {
            return new Response(
                JSON.stringify({ error: 'Issue not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check if user is the reporter
        if (issue.reportedBy.toString() !== user.userId) {
            return new Response(
                JSON.stringify({ error: 'Only the reporter can add photos' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check if issue is resolved
        if (issue.status === 'resolved' || issue.status === 'closed') {
            return new Response(
                JSON.stringify({ error: 'Cannot add photos to resolved issues' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Validate photo format
        const validPhotos = photos.filter(photo => 
            photo.url && typeof photo.url === 'string'
        );

        if (validPhotos.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Invalid photo format' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Add photos to the issue
        issue.images = issue.images || [];
        issue.images.push(...validPhotos);

        // Add to status history
        issue.statusHistory = issue.statusHistory || [];
        issue.statusHistory.push({
            status: issue.status,
            timestamp: new Date(),
            note: `Citizen added ${validPhotos.length} additional photo(s)`,
            updatedBy: user.userId
        });

        await issue.save();

        return new Response(
            JSON.stringify({ 
                success: true, 
                message: `${validPhotos.length} photo(s) added successfully`,
                totalPhotos: issue.images.length
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Add photos error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to add photos: ' + error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
