import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Issue from '@/models/Issue';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const lat = parseFloat(searchParams.get('lat'));
        const lng = parseFloat(searchParams.get('lng'));
        const radius = parseFloat(searchParams.get('radius')) || 5; // in KM

        if (!lat || !lng) {
            return NextResponse.json({ error: 'Coordinates required' }, { status: 400 });
        }

        const issues = await Issue.find({
            'location.coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [lng, lat]
                    },
                    $maxDistance: radius * 1000 // Convert KM to Meters
                }
            },
            status: { $nin: ['resolved', 'rejected'] }
        }).limit(10).lean();

        return NextResponse.json({ success: true, issues });
    } catch (err) {
        console.error('Nearby API error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
