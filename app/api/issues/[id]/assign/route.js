import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';
import Department from '@/lib/models/Department';
import StateHistory from '@/models/StateHistory';
import { withAuth, createErrorResponse } from '@/lib/utils';
import { sendEmail } from '@/lib/email';
import { getDepartmentDisplayName } from '@/lib/department-mapper';
import { createDepartmentAssignmentEmail, createReassignmentEmail } from '@/lib/email-templates/department-assignment';

/**
 * POST - Manually assign/reassign issue to department
 */
export const POST = withAuth(async (req, { params }) => {
    try {
        // Check authorization - admin or municipal role required
        if (!['admin', 'municipal'].includes(req.user.role)) {
            return createErrorResponse('Admin or municipal access required', 403);
        }

        const issueId = params.id;
        const body = await req.json();
        const { departmentId, comment = '' } = body;

        // Validate required fields
        if (!departmentId) {
            return createErrorResponse('Department ID is required', 400);
        }

        await connectDB();

        // Find the issue
        const issue = await Issue.findById(issueId);
        if (!issue) {
            return createErrorResponse('Issue not found', 404);
        }

        // Find the new department
        const newDepartment = await Department.findOne({
            name: departmentId,
            isActive: true
        });

        if (!newDepartment) {
            return createErrorResponse('Department not found or inactive', 404);
        }

        // Get old department info if reassigning
        let oldDepartment = null;
        if (issue.assignedDepartment && issue.assignedDepartment !== departmentId) {
            oldDepartment = await Department.findOne({
                name: issue.assignedDepartment,
                isActive: true
            });
        }

        // Update issue assignment
        const oldDepartmentName = issue.assignedDepartment;
        issue.assignedDepartment = departmentId;
        issue.status = 'assigned';

        // If there's a comment, add it to the issue
        if (comment) {
            issue.comments = issue.comments || [];
            issue.comments.push({
                text: `[ASSIGNMENT] ${comment}`,
                user: req.user.userId,
                createdAt: new Date()
            });
        }

        await issue.save();

        // Create state history entry
        await StateHistory.create({
            issueId: issue._id,
            status: 'assigned',
            changedBy: req.user.userId,
            timestamp: new Date(),
            notes: `Manually assigned to ${getDepartmentDisplayName(departmentId)} by ${req.user.name || req.user.email}`
        });

        // Send notification to new department using template
        try {
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
            const emailTemplate = createDepartmentAssignmentEmail(
                issue.toObject(),
                getDepartmentDisplayName(departmentId),
                baseUrl
            );

            await sendEmail(newDepartment.contactEmail, emailTemplate.subject, emailTemplate.html, emailTemplate.text);
            console.log(`Assignment notification sent to ${getDepartmentDisplayName(departmentId)}: ${newDepartment.contactEmail}`);
        } catch (emailError) {
            console.error('Failed to send department assignment notification:', emailError);
        }

        // If reassigning, notify old department using template
        if (oldDepartment && oldDepartment.contactEmail) {
            try {
                const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
                const emailTemplate = createReassignmentEmail(
                    issue.toObject(),
                    getDepartmentDisplayName(oldDepartmentName),
                    getDepartmentDisplayName(departmentId),
                    comment,
                    baseUrl
                );

                await sendEmail(oldDepartment.contactEmail, emailTemplate.subject, emailTemplate.html, emailTemplate.text);
                console.log(`Reassignment notification sent to ${getDepartmentDisplayName(oldDepartmentName)}: ${oldDepartment.contactEmail}`);
            } catch (emailError) {
                console.error('Failed to send reassignment notification:', emailError);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Issue assigned successfully',
            issue: {
                reportId: issue.reportId,
                title: issue.title,
                department: {
                    old: oldDepartmentName,
                    new: departmentId,
                    oldDisplayName: oldDepartmentName ? getDepartmentDisplayName(oldDepartmentName) : null,
                    newDisplayName: getDepartmentDisplayName(departmentId)
                }
            }
        });

    } catch (error) {
        console.error('Error assigning issue:', error);
        return createErrorResponse('Failed to assign issue', 500);
    }
});
