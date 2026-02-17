import { connectDB } from '@/lib/mongodb';
import { withAuth, createErrorResponse, isValidCategory, isValidPriority } from '@/lib/utils';
import { filterSensitiveData } from '@/lib/security';
import Issue from '@/models/Issue';
import User from '@/models/User';
import StateHistory from '@/models/StateHistory';
import Department from '@/lib/models/Department';
import { sendEmail } from '@/lib/email';
import { createIssueSchema } from '@/lib/schemas';
import { calculatePriority } from '@/lib/priority-calculator';
import { getDepartmentForCategory, getDepartmentDisplayName } from '@/lib/department-mapper';
import { createDepartmentAssignmentEmail } from '@/lib/email-templates/department-assignment';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
                .select('reportId title description category status priority location upvotes upvotedBy createdAt')
                .populate('reportedBy', 'name email')
                .populate('assignedTo', 'name department')
                .populate('assignedStaff', 'name email')
                .populate('departmentHead', 'name email')
                .populate('upvotedBy', 'name')
                .sort({ createdAt: -1 });
        } catch (populateError) {
            console.log('Some populate fields not available, using fallback:', populateError.message);
            issues = await Issue.find(query)
                .select('reportId title description category status priority location upvotes upvotedBy createdAt')
                .populate('reportedBy', 'name email')
                .populate('assignedTo', 'name department')
                .populate('upvotedBy', 'name')
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

export const POST = withAuth(async (req) => {
    try {
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return createErrorResponse('Invalid JSON body', 400);
        }

        console.log('📥 Received data:', JSON.stringify(body, null, 2));

        const validationResult = createIssueSchema.safeParse(body);

        if (!validationResult.success) {
            return createErrorResponse(validationResult.error.errors[0].message, 400);
        }

        const {
            title,
            description,
            location,
            category,
            subcategory,
            priority,
            images
        } = validationResult.data;

        // ⭐ CALCULATE PRIORITY AUTOMATICALLY ⭐
        const calculatedPriority = calculatePriority({
            title: title,
            description: description,
            category: category,
            subcategory: subcategory,
            upvotes: 0 // New issues start with 0 upvotes
        });

        console.log('📊 Calculated priority:', calculatedPriority);
        console.log('Creating issue with validated data:', {
            title,
            description,
            location,
            category,
            calculatedPriority,
            imagesCount: images?.length || 0,
            reportedBy: req.user.userId
        });

        await connectDB();

        // Ensure location has proper structure
        // Process and validate location data
        let processedLocation = null;

        if (location && location.coordinates) {
            // Extract and parse coordinates
            const lat = parseFloat(location.coordinates.lat);
            const lng = parseFloat(location.coordinates.lng);

            // Validate coordinates
            if (isNaN(lat) || isNaN(lng)) {
                return createErrorResponse('Invalid coordinates format', 400);
            }

            // Ensure coordinates are within valid ranges
            if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
                return createErrorResponse('Coordinates out of valid range', 400);
            }

            // Create proper GeoJSON Point format
            processedLocation = {
                address: location.address || 'Address not provided',
                coordinates: {
                    type: 'Point',
                    coordinates: [lng, lat] // MongoDB expects [longitude, latitude]
                },
                city: location.city || '',
                state: location.state || '',
                pincode: location.pincode || ''
            };
        } else {
            // No coordinates provided - create location without coordinates
            processedLocation = {
                address: location?.address || 'Address not provided',
                city: location?.city || '',
                state: location?.state || '',
                pincode: location?.pincode || ''
            };
        }

        // Log the processed location for debugging
        console.log('Processed location:', JSON.stringify(processedLocation, null, 2));

        // Determine ward based on location (simplified logic)
        const ward = location?.address ?
            `Ward ${Math.floor(Math.random() * 20) + 1}` : // Placeholder logic
            'Unknown';

        // Calculate SLA deadline based on calculated priority
        const now = new Date();
        let hoursToAdd = 72; // Default for medium/low

        switch (calculatedPriority) {
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

        // ⭐ AUTO-ASSIGN DEPARTMENT ⭐
        const departmentName = getDepartmentForCategory(category, subcategory);
        const departmentDisplayName = getDepartmentDisplayName(departmentName);

        console.log('📍 Auto-assigned department:', departmentName, 'for category:', category);

        // Look up department by name to get the ObjectId
        let assignedDepartmentId = null;
        try {
            const department = await Department.findOne({ name: departmentName });
            if (department) {
                assignedDepartmentId = department._id;
                console.log('📍 Found department ObjectId:', assignedDepartmentId);
            } else {
                console.warn('⚠️ Department not found in database:', departmentName);
            }
        } catch (deptError) {
            console.error('Error looking up department:', deptError);
        }

        const issueData = {
            title,
            description,
            location: processedLocation,
            category,
            subcategory,
            priority: calculatedPriority, // ⭐ AUTO-ASSIGNED PRIORITY ⭐
            images: (images || []).map(img => typeof img === 'string' ? { url: img, publicId: '' } : img),
            reportedBy: req.user.userId,
            assignedDepartment: assignedDepartmentId,
            ward,
            zone: ward,
            sla: {
                deadline: slaDeadline
            },
            dueTime: dueTime,
            status: 'pending'
        };

        console.log('💾 Saving to database:', JSON.stringify(issueData, null, 2));

        const issue = await Issue.create(issueData);

        await issue.populate('reportedBy', 'name email');

        console.log('Issue created successfully:', issue.reportId);

        // Create state history for submission
        await StateHistory.create({
            issueId: issue._id,
            status: 'submitted',
            changedBy: req.user.userId,
            timestamp: new Date()
        });

        // Create state history for department assignment
        await StateHistory.create({
            issueId: issue._id,
            status: 'assigned',
            changedBy: req.user.userId,
            timestamp: new Date(),
            notes: `Auto-assigned to ${departmentDisplayName}`
        });

        // Send emails asynchronously (fire and forget)
        (async () => {
            try {
                // User confirmation email
                const userEmail = issue.reportedBy.email;
                const userText = `Dear ${issue.reportedBy.name},\n\nYour issue "${title}" has been reported successfully.\n\nDescription: ${description}\nCategory: ${category}\nPriority: ${calculatedPriority}\nLocation: ${issue.location.address || 'Not specified'}\n\nReport ID: ${issue.reportId}\n\nYou will be notified of updates.\n\nBest regards,\nCivic Issue System Team`;
                await sendEmail(userEmail, 'Issue Reported Successfully - Civic Issue System', userText);
                console.log('User confirmation email sent to:', userEmail);

                // Admin alert emails
                const admins = await User.find({ role: 'admin' }, 'email');
                if (admins.length > 0) {
                    const adminPromises = admins.map(async (admin) => {
                        const adminText = `New civic issue reported:\n\nTitle: ${title}\nDescription: ${description}\nCategory: ${category}\nPriority: ${calculatedPriority}\nLocation: ${issue.location.address || 'Not specified'}\nReported by: ${issue.reportedBy.name} (${userEmail})\nReport ID: ${issue.reportId}\n\nPlease review and assign.\n\nCivic Issue System`;
                        return sendEmail(admin.email, 'New Civic Issue Reported - Action Required', adminText);
                    });
                    await Promise.all(adminPromises);
                    console.log(`Admin alerts sent to ${admins.length} admins`);
                }

                // Department assignment notification using template
                try {
                    // Find department contact email
                    const department = await Department.findOne({
                        name: departmentName,
                        isActive: true
                    });

                    if (department && department.contactEmail) {
                        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
                        const emailTemplate = createDepartmentAssignmentEmail(
                            issue.toObject(),
                            departmentDisplayName,
                            baseUrl
                        );

                        await sendEmail(department.contactEmail, emailTemplate.subject, emailTemplate.html, emailTemplate.text);
                        console.log(`Department assignment email sent to ${departmentDisplayName}: ${department.contactEmail}`);
                    } else {
                        console.warn(`No contact email found for department: ${departmentName}`);
                    }
                } catch (deptEmailError) {
                    console.error('Failed to send department assignment email:', deptEmailError);
                }
            } catch (emailError) {
                console.error('Failed to send issue emails:', emailError);
            }
        })();

        return new Response(JSON.stringify({
            success: true,
            message: 'Issue reported successfully',
            reportId: issue.reportId,
            issue: issue,
            department: {
                name: departmentName,
                displayName: departmentDisplayName
            }
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('❌ Issue creation error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        return createErrorResponse('Failed to create issue', 500);
    }
});
