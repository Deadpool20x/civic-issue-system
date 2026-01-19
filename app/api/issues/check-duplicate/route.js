import { connectDB } from '@/lib/mongodb';
import Issue from '@/models/Issue';

export async function POST(req) {
    try {
        await connectDB();

        const { category, coordinates } = await req.json();

        if (!coordinates || !coordinates.lat || !coordinates.lng) {
            return Response.json({ duplicates: [] });
        }

        // Calculate 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Geospatial query: Find issues within 50 meters
        const duplicates = await Issue.find({
            category: category,
            status: { $in: ['submitted', 'acknowledged', 'assigned', 'in-progress'] }, // Exclude resolved/rejected
            createdAt: { $gte: sevenDaysAgo },
            'location.coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [coordinates.lng, coordinates.lat] // [longitude, latitude]
                    },
                    $maxDistance: 50 // 50 meters
                }
            }
        })
            .select('reportId title description category status location upvotes createdAt')
            .populate('reportedBy', 'name')
            .limit(5)
            .lean();

        return Response.json({ duplicates });

    } catch (error) {
        console.error('Duplicate check error:', error);
        return Response.json({ duplicates: [] }, { status: 500 });
    }
}
