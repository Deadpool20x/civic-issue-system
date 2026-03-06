import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Issue from '@/models/Issue';
import { getTokenData } from '@/lib/auth';

export async function POST(req, { params }) {
    try {
        await connectDB();
        const userData = await getTokenData();

        if (!userData || (userData.role !== 'CITIZEN' && userData.role !== 'citizen')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const { action, reason } = await req.json();

        const issue = await Issue.findById(id);
        if (!issue) {
            return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
        }

        // Only the reporter can confirm/reopen
        if (issue.reportedBy.toString() !== userData.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (action === 'confirm') {
            issue.citizenConfirmed = true;
            issue.citizenConfirmedAt = new Date();
        } else if (action === 'reopen') {
            issue.citizenConfirmed = false;
            issue.citizenConfirmedAt = new Date();
            issue.status = 'reopened';
            issue.reopenReason = reason || 'Citizen requested reopen';
            // Increase SLA or Reset
            issue.sla.deadline = new Date(Date.now() + 48 * 60 * 60 * 1000); // Give another 48h
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        await issue.save();

        return NextResponse.json({
            success: true,
            status: issue.status,
            citizenConfirmed: issue.citizenConfirmed
        });

    } catch (err) {
        console.error('Confirm error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
