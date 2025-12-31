import { connectDB } from '@/lib/mongodb';
import { withAuth, withValidation, createErrorResponse, isValidCategory, isValidPriority } from '@/lib/utils';
import { filterSensitiveData } from '@/lib/security';
import Issue from '@/models/Issue';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';

export const GET = withAuth(async (req) => {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const assignedDepartment = searchParams.get('department');

        // Validate query parameters
        if (category && !isValidCategory(category)) {
            return createErrorResponse('Invalid category', 400);
        }
        if (priority && !isValidPriority(priority)) {
            return createErrorResponse('Invalid priority', 400);
        }

        // Build query based on filters
        const query = {};
        if (category) query.category = category;
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (assignedDepartment) query.assignedDepartment = assignedDepartment;

        // Add role-based filters
        if (req.user.role === 'department') {
            query.assignedDepartment = req.user.department;
        } else if (req.user.role === 'citizen') {
            query.reportedBy = req.user.userId;
        }

        let issues;
        try {
            issues = await Issue.find(query)
                .populate('reportedBy', 'name email')
                .populate('assignedTo', 'name department')
                .populate('assignedStaff', 'name email')
                .populate('departmentHead', 'name email')
                .sort({ createdAt: -1 });
        } catch (populateError) {
            console.log('Some populate fields not available, using fallback:', populateError.message);
            issues = await Issue.find(query)
                .populate('reportedBy', 'name email')
                .populate('assignedTo', 'name department')
                .sort({ createdAt: -1 });
        }

        // Filter sensitive data based on user role
        const filteredIssues = issues.map(issue => {
            return filterSensitiveData(issue.toObject(), req.user.role, req.user.userId);
        });

        return new Response(JSON.stringify(filteredIssues), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching issues:', error);
        return createErrorResponse('Failed to fetch issues', 500);
    }
});

export const POST = withValidation({
    required: ['title', 'description', 'category'],
    validators: {
        category: isValidCategory,
        priority: isValidPriority
    }
})(withAuth(async (req) => {
    try {
        const {
            title,
            description,
            location,
            category,
            priority,
            images
        } = req.validatedBody;

        console.log('Creating issue with validated data:', {
            title,
            description,
            location,
            category,
            priority,
            imagesCount: images?.length || 0,
            reportedBy: req.user.userId
        });

        await connectDB();

        // Ensure location has proper structure
        const processedLocation = {
            address: location?.address || '',
            coordinates: location?.coordinates || [0, 0]
        };

        // Determine ward based on location (simplified logic)
        const ward = location?.address ?
            `Ward ${Math.floor(Math.random() * 20) + 1}` : // Placeholder logic
            'Unknown';

        // Calculate SLA deadline based on priority
        const now = new Date();
        let hoursToAdd = 72; // Default for medium/low
        const effectivePriority = priority || 'medium';

        switch (effectivePriority) {
            case 'urgent':
                hoursToAdd = 24;
                break;
            case 'high':
                hoursToAdd = 48;
                break;
            case 'medium':
                hoursToAdd = 72;
                break;
            case 'low':
                hoursToAdd = 120;
                break;
        }

        const slaDeadline = new Date(now.getTime() + (hoursToAdd * 60 * 60 * 1000));
        const dueTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const issue = await Issue.create({
            title,
            description,
            location: processedLocation,
            category,
            priority,
            images: images || [],
            reportedBy: req.user.userId,
            assignedDepartment: category,
            ward,
            zone: ward,
            sla: {
                deadline: slaDeadline
            },
            dueTime: dueTime
        });

        await issue.populate('reportedBy', 'name email');

        console.log('Issue created successfully:', issue._id);

        // Send emails (non-blocking)
        try {
            // User confirmation email
            const userEmail = issue.reportedBy.email;
            const userText = `Dear ${issue.reportedBy.name},\n\nYour issue \"${title}\" has been reported successfully.\n\nDescription: ${description}\nCategory: ${category}\nPriority: ${priority}\nLocation: ${issue.location.address || 'Not specified'}\n\nIssue ID: ${issue._id}\n\nYou will be notified of updates.\n\nBest regards,\nCivic Issue System Team`;
            await sendEmail(userEmail, 'Issue Reported Successfully - Civic Issue System', userText);
            console.log('User confirmation email sent to:', userEmail);

            // Admin alert emails
            const admins = await User.find({ role: 'admin' }, 'email');
            if (admins.length > 0) {
                const adminPromises = admins.map(async (admin) => {
                    const adminText = `New civic issue reported:\n\nTitle: ${title}\nDescription: ${description}\nCategory: ${category}\nPriority: ${priority}\nLocation: ${issue.location.address || 'Not specified'}\nReported by: ${issue.reportedBy.name} (${userEmail})\nIssue ID: ${issue._id}\n\nPlease review and assign.\n\nCivic Issue System`;
                    return sendEmail(admin.email, 'New Civic Issue Reported - Action Required', adminText);
                });
                await Promise.all(adminPromises);
                console.log(`Admin alerts sent to ${admins.length} admins`);
            }
        } catch (emailError) {
            console.error('Failed to send issue emails:', emailError);
            // Continue without failing issue creation
        }

        return new Response(JSON.stringify(issue), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error creating issue:', error);
        return createErrorResponse('Failed to create issue', 500);
    }
}));