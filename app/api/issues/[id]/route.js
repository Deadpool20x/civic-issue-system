import { connectDB } from '@/lib/mongodb';
import { authMiddleware } from '@/lib/auth';
import Issue from '@/models/Issue';
import StateHistory from '@/models/StateHistory';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Get specific issue
export const GET = authMiddleware(async (req, { params }) => {
    try {
        await connectDB();

        console.log('[DEBUG] Issue Detail GET - params.id:', params.id);
        console.log('[DEBUG] Issue Detail GET - user role:', req.user.role);
        console.log('[DEBUG] Issue Detail GET - user wardId:', req.user.wardId);

        // Try to find by reportId first, then by _id
        let issue;
        if (params.id.startsWith('R')) {
            issue = await Issue.findOne({ reportId: params.id })
                .populate('reportedBy', 'name email')
                .populate('assignedTo', 'name department');
            console.log('[DEBUG] Searched by reportId:', params.id, 'Found:', !!issue);
        } else {
            issue = await Issue.findById(params.id)
                .populate('reportedBy', 'name email')
                .populate('assignedTo', 'name department');
            console.log('[DEBUG] Searched by _id:', params.id, 'Found:', !!issue);
        }

        if (!issue) {
            console.log('[DEBUG] Issue not found in database');
            return new Response(
                JSON.stringify({ error: 'Issue not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        console.log('[DEBUG] Issue found - ward:', issue.ward, 'status:', issue.status);

        // Check access permissions based on role
        const userRole = req.user.role?.toUpperCase();

        // Citizens can only view their own issues
        if (userRole === 'CITIZEN' && issue.reportedBy._id.toString() !== req.user.userId) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized - You can only view your own issues' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Field Officers can only view issues in their assigned ward
        if (userRole === 'FIELD_OFFICER') {
            if (!req.user.wardId) {
                return new Response(
                    JSON.stringify({ error: 'Ward not assigned to your account' }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }
            if (issue.ward !== req.user.wardId) {
                return new Response(
                    JSON.stringify({ error: 'Unauthorized - This issue is not in your assigned ward' }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }
        }

        // Department Managers can only view issues in their department's wards
        if (userRole === 'DEPARTMENT_MANAGER') {
            if (!req.user.departmentId) {
                return new Response(
                    JSON.stringify({ error: 'Department not assigned to your account' }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }

            const { getDepartmentWards } = require('@/lib/wards');
            const deptWards = getDepartmentWards(req.user.departmentId);

            if (!deptWards.includes(issue.ward)) {
                return new Response(
                    JSON.stringify({ error: 'Unauthorized - This issue is not in your department' }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }
        }

        // Commissioners and Admins can view all issues (no restrictions)

        // Fetch state history
        const stateHistory = await StateHistory.find({ issueId: issue._id })
            .populate('changedBy', 'name role')
            .populate('assignedTo', 'name department')
            .sort({ timestamp: 1 })
            .lean();

        return new Response(JSON.stringify({
            issue,
            stateHistory
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching issue:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

// Update issue
export const PATCH = authMiddleware(async (req, { params }) => {
    try {
        const updates = await req.json();
        await connectDB();

        // Try to find by reportId first, then by _id
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

        // Permission checks
        const isOwner = issue.reportedBy.toString() === req.user.userId;
        const isAuthorizedStaff = ['admin', 'municipal', 'department', 'commissioner', 'SYSTEM_ADMIN', 'MUNICIPAL_COMMISSIONER', 'DEPARTMENT_MANAGER', 'FIELD_OFFICER'].includes(req.user.role);

        if (!isOwner && !isAuthorizedStaff) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Department staff can only update issues assigned to their department
        if (req.user.role === 'department' && issue.assignedDepartment && issue.assignedDepartment.toString() !== req.user.department) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized - issue belongs to another department' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // SECURITY: Department Manager can only reassign within their department
        if ((req.user.role === 'DEPARTMENT_MANAGER' || req.user.role === 'municipal') && updates.ward) {
            const userDepartmentId = req.user.departmentId;

            if (!userDepartmentId) {
                return new Response(
                    JSON.stringify({ error: 'Department not assigned to your account' }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }

            // Check if the target ward belongs to the manager's department
            const { WARD_MAP } = require('@/lib/wards');
            const targetWard = WARD_MAP[updates.ward];

            if (!targetWard || targetWard.departmentId !== userDepartmentId) {
                return new Response(
                    JSON.stringify({ error: 'Cannot reassign to ward outside your department' }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }
        }

        // Track if status is being changed
        const oldStatus = issue.status;
        const statusChanged = updates.status && updates.status !== oldStatus;

        // Citizens can only edit certain fields of their own issues
        if (req.user.role === 'citizen') {
            const allowedFields = ['title', 'description', 'category', 'priority', 'location', 'images'];
            const filteredUpdates = {};
            Object.keys(updates).forEach(key => {
                if (allowedFields.includes(key)) {
                    filteredUpdates[key] = updates[key];
                }
            });
            Object.assign(issue, filteredUpdates);
        } else {
            // Staff can update any field
            // Add comment if provided
            if (updates.comment) {
                issue.comments.push({
                    text: updates.comment,
                    user: req.user.userId
                });
                delete updates.comment;
            }

            // Update the issue
            Object.assign(issue, updates);
        }

        // ⭐ AUTO-CALCULATE RESOLUTION TIME WHEN RESOLVED ⭐
        if (updates.status === 'resolved' && oldStatus !== 'resolved') {
            const now = new Date();
            issue.updatedAt = now;
            const createdMs = new Date(issue.createdAt).getTime();
            issue.resolutionTime = Math.round((now.getTime() - createdMs) / 3600000); // hours
        } else {
            issue.updatedAt = new Date();
        }

        await issue.save();

        // ⭐ CREATE STATE HISTORY ENTRY WHEN STATUS CHANGES ⭐
        if (statusChanged) {
            await StateHistory.create({
                issueId: issue._id,
                status: updates.status,
                changedBy: req.user.userId,
                comment: updates.comment || `Status changed from ${oldStatus} to ${updates.status}`,
                timestamp: new Date()
            });

            console.log(`✅ State history created for status change: ${oldStatus} → ${updates.status}`);
        }

        const updatedIssue = await Issue.findById(issue._id)
            .populate('reportedBy', 'name email')
            .populate('assignedTo', 'name department');

        return new Response(JSON.stringify(updatedIssue), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error updating issue:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

// Delete issue
// Citizens can delete their own pending issues
// Admins can delete any issue
export const DELETE = authMiddleware(async (req, { params }) => {
    try {
        await connectDB();

        const user = req.user;

        // Try to find by reportId first, then by _id
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

        // Check permissions
        const isAdmin = user.role === 'admin' || user.role === 'SYSTEM_ADMIN';
        const isCitizen = user.role === 'citizen' || user.role === 'CITIZEN';
        const isOwnIssue = issue.reportedBy.toString() === user.userId;

        if (isAdmin) {
            // Admin can delete any issue
        } else if (isCitizen && isOwnIssue) {
            // Citizen can only delete their own pending issues
            if (issue.status !== 'pending') {
                return new Response(
                    JSON.stringify({ error: 'Can only delete pending issues. This issue is already being processed.' }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }
        } else {
            return new Response(
                JSON.stringify({ error: 'Unauthorized to delete this issue' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Delete the issue
        await Issue.findByIdAndDelete(issue._id);

        return new Response(
            JSON.stringify({ message: 'Issue deleted successfully' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error deleting issue:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});