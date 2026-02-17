import { NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import Issue from '@/models/Issue';
import StateHistory from '@/models/StateHistory';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST endpoint for department staff to update issue status
export async function POST(request, { params }) {
    try {
        const user = await authMiddleware(request);

        if (!user || user.role !== 'department') {
            return NextResponse.json(
                { error: 'Department access required' },
                { status: 403 }
            );
        }

        const { id } = params;
        const { status, notes, resolutionImages } = await request.json();

        // Validate required fields
        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        // Find the issue
        const issue = await Issue.findById(id);

        if (!issue) {
            return NextResponse.json(
                { error: 'Issue not found' },
                { status: 404 }
            );
        }

        // Validate user belongs to the department assigned to the issue
        if (issue.assignedDepartment.toString() !== user.department._id.toString()) {
            return NextResponse.json(
                { error: 'You can only update issues assigned to your department' },
                { status: 403 }
            );
        }

        // Validate status transition
        const validTransitions = {
            'assigned': ['in-progress'],
            'in-progress': ['resolved']
        };

        if (!validTransitions[issue.status]?.includes(status)) {
            return NextResponse.json(
                { error: `Cannot transition from ${issue.status} to ${status}` },
                { status: 400 }
            );
        }

        // Validate notes for resolved status
        if (status === 'resolved' && !notes) {
            return NextResponse.json(
                { error: 'Resolution notes are required when marking as resolved' },
                { status: 400 }
            );
        }

        // Update issue status
        issue.status = status;

        if (notes) {
            issue.notes = issue.notes || [];
            issue.notes.push({
                text: notes,
                createdBy: user._id,
                createdAt: new Date(),
                type: status === 'resolved' ? 'resolution' : 'update'
            });
        }

        if (resolutionImages && resolutionImages.length > 0) {
            issue.resolutionImages = resolutionImages;
        }

        // Save updated issue
        await issue.save();

        // Create StateHistory entry
        await StateHistory.create({
            issue: issue._id,
            fromStatus: issue.status,
            toStatus: status,
            changedBy: user._id,
            notes: notes || '',
            timestamp: new Date()
        });

        // Send email notification to citizen
        if (issue.reportedBy) {
            await sendEmail({
                to: issue.reportedBy.email,
                subject: `Issue Update: ${issue.title}`,
                template: 'issue-status-change',
                context: {
                    issueTitle: issue.title,
                    issueId: issue.reportId,
                    newStatus: status,
                    notes: notes || ''
                }
            });
        }

        return NextResponse.json({
            success: true,
            issue
        });

    } catch (error) {
        console.error('Error updating issue status:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update issue status' },
            { status: 500 }
        );
    }
}