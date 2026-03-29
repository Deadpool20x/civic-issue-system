import { connectDB } from '@/lib/mongodb';
import Issue from '@/models/Issue';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    // In a production environment, you would check for a secret header:
    // if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new Response('Unauthorized', { status: 401 });
    // }

    try {
        await connectDB();

        // Threshold is 48 hours ago
        const threshold = new Date(Date.now() - 48 * 60 * 60 * 1000);

        // Find issues that are 'pending' or 'assigned', 
        // older than 48h, and haven't been reminded recently
        const issues = await Issue.find({
            status: { $in: ['pending', 'assigned'] },
            updatedAt: { $lt: threshold },
            $or: [
                { remindedAt: { $exists: false } },
                { remindedAt: null },
                { remindedAt: { $lt: threshold } }
            ]
        });

        if (issues.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No issues requiring reminders at this time.'
            });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const results = [];

        for (const issue of issues) {
            // Find the Department Manager for this specific department
            const manager = await User.findOne({
                role: 'DEPARTMENT_MANAGER',
                departmentId: issue.assignedDepartmentCode,
                isActive: true
            });

            if (manager && manager.email) {
                const subject = `Action Required: Issue ${issue.reportId} is Pending`;
                const htmlContent = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #FFFFFF; padding: 30px; border-radius: 20px;">
                        <h2 style="color: #F5A623; border-bottom: 2px solid #F5A623; padding-bottom: 10px;">Inaction Reminder</h2>
                        <p style="font-size: 16px; line-height: 1.5;">The following civic issue has been <strong>${issue.status}</strong> for more than 48 hours without any update.</p>
                        
                        <div style="background: #1A1A1A; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #333333;">
                            <p><strong>Report ID:</strong> <span style="color: #F5A623;">${issue.reportId}</span></p>
                            <p><strong>Title:</strong> ${issue.title}</p>
                            <p><strong>Category:</strong> ${issue.category}</p>
                            <p><strong>Reported At:</strong> ${new Date(issue.createdAt).toLocaleString()}</p>
                        </div>

                        <p style="font-size: 14px; color: #AAAAAA;">Please review this issue and assign a field officer or update its status to prevent further escalation.</p>
                        
                        <div style="margin-top: 30px text-align: center;">
                            <a href="${appUrl}/department/dashboard" 
                               style="background: #F5A623; color: #000000; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold; display: inline-block;">
                               Open Dashboard
                            </a>
                        </div>
                        
                        <p style="margin-top: 40px; font-size: 12px; color: #666666; border-top: 1px solid #333333; padding-top: 20px;">
                            This is an automated reminder from the CivicPulse System.
                        </p>
                    </div>
                `;

                await sendEmail(manager.email, subject, htmlContent);

                // Update remindedAt to prevent double-reminding in the next run
                issue.remindedAt = new Date();
                await issue.save();

                results.push({
                    issue: issue.reportId,
                    email: manager.email
                });
            }
        }

        return NextResponse.json({
            success: true,
            remindersSent: results.length,
            details: results
        });

    } catch (error) {
        console.error('[CRON REMINDERS] Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Reminder processing failed'
        }, { status: 500 });
    }
}
