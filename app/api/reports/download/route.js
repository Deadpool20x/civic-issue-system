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
        const format = searchParams.get('format') || 'csv';

        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);

        let reportData = [];
        let headers = [];

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

                headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Category', 'Location', 'Reporter', 'Assigned To', 'Department', 'Created At', 'Updated At'];
                break;

            case 'users':
                reportData = await User.find({
                    createdAt: { $gte: dateFrom }
                })
                    .select('name email role isActive createdAt')
                    .sort({ createdAt: -1 })
                    .lean();

                headers = ['Name', 'Email', 'Role', 'Active', 'Created At'];
                break;

            case 'departments':
                reportData = await Department.find()
                    .select('name description contactEmail contactPhone createdAt')
                    .sort({ createdAt: -1 })
                    .lean();

                headers = ['Name', 'Description', 'Contact Email', 'Contact Phone', 'Created At'];
                break;

            default:
                return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
        }

        if (format === 'csv') {
            const csvContent = generateCSV(reportData, headers, type);

            return new NextResponse(csvContent, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename=civic-report-${type}-${days}days.csv`,
                },
            });
        } else if (format === 'pdf') {
            // For PDF generation, you would typically use a library like jsPDF or puppeteer
            // For now, return a placeholder response
            return NextResponse.json({
                message: 'PDF generation not implemented yet. Please use CSV format.'
            }, { status: 501 });
        }

        return NextResponse.json({ error: 'Invalid format' }, { status: 400 });

    } catch (error) {
        console.error('Error downloading report:', error);
        return NextResponse.json(
            { error: 'Failed to download report' },
            { status: 500 }
        );
    }
}

function generateCSV(data, headers, type) {
    let csvContent = headers.join(',') + '\n';

    data.forEach(item => {
        let row = [];

        switch (type) {
            case 'issues':
                row = [
                    `"${item._id || ''}"`,
                    `"${item.title || ''}"`,
                    `"${(item.description || '').replace(/"/g, '""')}"`,
                    `"${item.status || ''}"`,
                    `"${item.priority || ''}"`,
                    `"${item.category || ''}"`,
                    `"${item.location || ''}"`,
                    `"${item.reportedBy?.name || ''}"`,
                    `"${item.assignedTo?.name || ''}"`,
                    `"${item.department?.name || ''}"`,
                    `"${item.createdAt ? new Date(item.createdAt).toISOString() : ''}"`,
                    `"${item.updatedAt ? new Date(item.updatedAt).toISOString() : ''}"`
                ];
                break;

            case 'users':
                row = [
                    `"${item.name || ''}"`,
                    `"${item.email || ''}"`,
                    `"${item.role || ''}"`,
                    `"${item.isActive ? 'Yes' : 'No'}"`,
                    `"${item.createdAt ? new Date(item.createdAt).toISOString() : ''}"`
                ];
                break;

            case 'departments':
                row = [
                    `"${item.name || ''}"`,
                    `"${(item.description || '').replace(/"/g, '""')}"`,
                    `"${item.contactEmail || ''}"`,
                    `"${item.contactPhone || ''}"`,
                    `"${item.createdAt ? new Date(item.createdAt).toISOString() : ''}"`
                ];
                break;
        }

        csvContent += row.join(',') + '\n';
    });

    return csvContent;
}