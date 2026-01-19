/**
 * Department Assignment Email Template
 * Professional municipal department notification for issue assignments
 */

export function createDepartmentAssignmentEmail(issue, departmentName, baseUrl = 'http://localhost:3000') {
    const priorityEmoji = issue.priority === 'urgent' ? '🔴' :
                         issue.priority === 'high' ? '🟠' :
                         issue.priority === 'medium' ? '🟡' : '🟢';

    const deadline = issue.sla?.deadline ? new Date(issue.sla.deadline) : null;
    const deadlineText = deadline ? `Deadline: ${deadline.toLocaleString()}` : '';

    return {
        subject: `New Issue Assigned - ${issue.reportId}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1E40AF; color: white; padding: 15px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .issue-card { border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin: 15px 0; background-color: white; }
        .priority-badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-left: 10px; }
        .urgent { background-color: #FEE2E2; color: #991B1B; }
        .high { background-color: #FED7AA; color: #7C2D12; }
        .medium { background-color: #FEF3C7; color: #713F12; }
        .low { background-color: #D1FAE5; color: #065F46; }
        .button { display: inline-block; padding: 10px 20px; background-color: #1E40AF; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Civic Issue System - Municipal Operations</h2>
            <p>Department Assignment Notification</p>
        </div>

        <div class="content">
            <h3>New Issue Assigned to Your Department</h3>

            <div class="issue-card">
                <h4>${issue.reportId}: ${issue.title}</h4>

                <div style="margin: 10px 0;">
                    <strong>Category:</strong> ${issue.category}<br>
                    <strong>Priority:</strong> ${issue.priority}
                    <span class="priority-badge ${issue.priority}">${priorityEmoji} ${issue.priority.toUpperCase()}</span>
                </div>

                <div style="margin: 10px 0;">
                    <strong>Location:</strong> ${issue.location?.address || 'Not specified'}<br>
                    <strong>Status:</strong> ${issue.status}<br>
                    ${deadlineText ? `<strong>Deadline:</strong> ${deadlineText}<br>` : ''}
                </div>

                <div style="margin: 10px 0;">
                    <strong>Description:</strong><br>
                    <p style="margin: 5px 0; padding: 10px; background-color: #f5f5f5; border-radius: 3px;">
                        ${issue.description.substring(0, 300)}${issue.description.length > 300 ? '...' : ''}
                    </p>
                </div>

                <a href="${baseUrl}/issues/${issue.reportId}" class="button">View Full Issue Details</a>
            </div>

            <p>This issue has been automatically assigned to your department based on the reported category.</p>

            <p><strong>Action Required:</strong> Please review this issue and update the status as appropriate.</p>

            <p>Thank you for your prompt attention to this matter.</p>
        </div>

        <div class="footer">
            <p>Civic Issue System - Municipal Operations Department</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`,
        text: `New Issue Assigned to Your Department

Issue Details:
- Report ID: ${issue.reportId}
- Title: ${issue.title}
- Category: ${issue.category}
- Priority: ${issue.priority}
- Location: ${issue.location?.address || 'Not specified'}
- Status: ${issue.status}
${deadlineText ? `\n- ${deadlineText}` : ''}

Description:
${issue.description.substring(0, 200)}${issue.description.length > 200 ? '...' : ''}

This issue has been automatically assigned to your department based on the reported category.

Action Required: Please review this issue and update the status as appropriate.

View Issue: ${baseUrl}/issues/${issue.reportId}

Civic Issue System - Municipal Operations Department
This is an automated notification.`
    };
}

/**
 * Create reassignment email template
 */
export function createReassignmentEmail(issue, oldDepartment, newDepartment, comment, baseUrl = 'http://localhost:3000') {
    return {
        subject: `Issue Reassigned - ${issue.reportId}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1E40AF; color: white; padding: 15px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .issue-card { border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin: 15px 0; background-color: white; }
        .button { display: inline-block; padding: 10px 20px; background-color: #1E40AF; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Civic Issue System - Municipal Operations</h2>
            <p>Issue Reassignment Notification</p>
        </div>

        <div class="content">
            <h3>Issue Reassigned from Your Department</h3>

            <div class="issue-card">
                <h4>${issue.reportId}: ${issue.title}</h4>

                <div style="margin: 10px 0;">
                    <strong>Category:</strong> ${issue.category}<br>
                    <strong>Priority:</strong> ${issue.priority}<br>
                    <strong>Location:</strong> ${issue.location?.address || 'Not specified'}
                </div>

                <p>This issue has been reassigned to ${newDepartment} department.</p>

                ${comment ? `<p><strong>Reason:</strong> ${comment}</p>` : ''}
            </div>

            <p>No further action is required from your department.</p>
        </div>

        <div class="footer">
            <p>Civic Issue System - Municipal Operations Department</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`,
        text: `Issue Reassigned - ${issue.reportId}

Issue Details:
- Report ID: ${issue.reportId}
- Title: ${issue.title}
- Category: ${issue.category}
- Priority: ${issue.priority}
- Location: ${issue.location?.address || 'Not specified'}

This issue has been reassigned to ${newDepartment} department.

${comment ? `Reason: ${comment}\n` : ''}

No further action is required from your department.

Civic Issue System - Municipal Operations Department
This is an automated notification.`
    };
}
