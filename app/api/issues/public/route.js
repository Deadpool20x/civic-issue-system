import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
    try {
        // Connect to database
        await connectDB();

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');

        // Build query filter
        const query = {
            'location.coordinates.coordinates': { $exists: true, $ne: null }
        };

        // Add filters if provided
        if (category) {
            query.category = category;
        }

        if (status) {
            query.status = status;
        }

        if (priority) {
            query.priority = priority;
        }

        // Fetch issues with only public data
        const issues = await Issue.find(query)
            .select('reportId title category status priority location upvotes createdAt')
            .limit(500)
            .lean();

        // Transform data for public API
        const publicIssues = issues.map(issue => ({
            reportId: issue.reportId,
            title: issue.title,
            category: issue.category,
            status: issue.status,
            priority: issue.priority,
            location: {
                address: issue.location?.address || '',
                coordinates: issue.location?.coordinates?.coordinates || []
            },
            upvotes: issue.upvotes,
            createdAt: issue.createdAt
        }));

        return NextResponse.json({
            success: true,
            count: publicIssues.length,
            issues: publicIssues
        });

    } catch (error) {
        console.error('Error fetching public issues:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch issues' },
            { status: 500 }
        );
    }
}
