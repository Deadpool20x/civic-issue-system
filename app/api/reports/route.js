import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';
import User from '@/models/User';
import Department from '@/lib/models/Department';

export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'issues';
        const days = parseInt(searchParams.get('days') || '30');

        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);

        let reportData = [];

        switch (type) {
            case 'issues':
                reportData = await Issue.find({
                    createdAt: { $gte: dateFrom }
                })
                    .populate('reportedBy', 'name email')
                    .populate('assignedTo', 'name')
                    .populate('department', 'name')
                    .sort({ createdAt: -1 })
                    .lean();
                break;

            case 'users':
                reportData = await User.find({
                    createdAt: { $gte: dateFrom }
                })
                    .select('name email role isActive createdAt')
                    .sort({ createdAt: -1 })
                    .lean();
                break;

            case 'departments':
                reportData = await Department.find()
                    .select('name description contactEmail contactPhone createdAt')
                    .sort({ createdAt: -1 })
                    .lean();
                break;

            case 'performance':
                const issueStats = await Issue.aggregate([
                    {
                        $match: {
                            createdAt: { $gte: dateFrom }
                        }
                    },
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 },
                            avgResolutionTime: {
                                $avg: {
                                    $cond: [
                                        { $eq: ['$status', 'Resolved'] },
                                        {
                                            $subtract: [
                                                { $ifNull: ['$resolvedAt', new Date()] },
                                                '$createdAt'
                                            ]
                                        },
                                        null
                                    ]
                                }
                            }
                        }
                    }
                ]);
                reportData = issueStats;
                break;

            default:
                return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
        }

        return NextResponse.json(reportData);

    } catch (error) {
        console.error('Error generating report:', error);
        return NextResponse.json(
            { error: 'Failed to generate report' },
            { status: 500 }
        );
    }
}