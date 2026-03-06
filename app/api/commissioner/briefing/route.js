import { NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import Issue from '@/models/Issue';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const user = await authMiddleware(request);
        if (!user || user.role !== 'MUNICIPAL_COMMISSIONER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await connectDB();

        // Fetch city-wide stats for the briefing
        const totalIssues = await Issue.countDocuments();
        const pendingIssues = await Issue.countDocuments({ status: { $in: ['pending', 'assigned'] } });
        const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });
        const urgentIssues = await Issue.find({ priority: 'urgent', status: { $ne: 'resolved' } })
            .select('title reportId ward')
            .limit(3);

        const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

        // Mocking AI Briefing content based on real stats
        const briefing = {
            id: 'brief-' + Date.now(),
            date: new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }),
            title: 'Daily City Performance Briefing',
            summary: `City-wide resolution rate is currently at ${resolutionRate}%. There are ${pendingIssues} active issues requiring attention.`,
            keyPoints: [
                `Active baseline has ${pendingIssues} pending requests.`,
                `${resolvedIssues} issues successfully closed this week.`,
                `Waste management remains the highest volume category today.`
            ],
            criticalAlerts: urgentIssues.map(i => `${i.reportId}: ${i.title} (${i.ward})`),
            generatedAt: new Date()
        };

        return NextResponse.json({ briefing });
    } catch (error) {
        console.error('Briefing error:', error);
        return NextResponse.json({ error: 'Failed to generate briefing' }, { status: 500 });
    }
}
