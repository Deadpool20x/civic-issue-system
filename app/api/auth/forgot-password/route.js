import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import OTP from '@/models/OTP'
import { sendOTPEmail } from '@/lib/email'

export async function POST(request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return Response.json({ error: 'Email is required' }, { status: 400 })
        }

        await connectDB()

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() })

        // SECURITY: Always return success even if email not found
        // This prevents user enumeration attacks
        if (!user) {
            return Response.json({
                success: true,
                message: 'If this email exists, an OTP has been sent.'
            })
        }

        // Check role — staff must contact support
        const staffRoles = ['FIELD_OFFICER', 'department', 'DEPARTMENT_MANAGER',
            'municipal', 'MUNICIPAL_COMMISSIONER', 'system_admin', 'SYSTEM_ADMIN']
        // In our system roles are often lowercase or uppercase, let's normalize check or just use the exact strings.
        if (staffRoles.map(r => r.toLowerCase()).includes(user.role.toLowerCase()) && user.role !== 'citizen' && user.role !== 'CITIZEN' && user.role !== 'admin' && user.role !== 'ADMIN') {
            // Note: The prompt says "OTP email reset for citizens + admin"
            // But later in "Who can use OTP reset": "✅ CITIZEN -> OTP email reset", "✅ SYSTEM_ADMIN -> OTP email reset"
            // But later in "Check role - staff must contact support" sample code it has "FIELD_OFFICER, department, DEPARTMENT_MANAGER, municipal, MUNICIPAL_COMMISSIONER"
        }

        // Exact check according to prompt:
        const blockedRoles = ['FIELD_OFFICER', 'department', 'DEPARTMENT_MANAGER', 'municipal', 'MUNICIPAL_COMMISSIONER'];
        const isStaff = blockedRoles.some(r => r.toLowerCase() === user.role.toLowerCase());

        // Also system admin can reset. Let's stick strictly to prompt code for roles or adjust logic:
        if (isStaff) {
            return Response.json({
                success: false,
                isStaff: true,
                message: 'Staff accounts cannot self-reset. Contact support@civicpulse.in'
            }, { status: 403 })
        }

        // Generate 6-digit OTP
        const otpPlain = crypto.randomInt(100000, 999999).toString()
        const otpHashed = await bcrypt.hash(otpPlain, 10)

        // Delete any existing OTPs for this email
        await OTP.deleteMany({ email: email.toLowerCase(), purpose: 'password_reset' })

        // Save new OTP (expires in 10 minutes)
        await OTP.create({
            email: email.toLowerCase(),
            otp: otpHashed,
            purpose: 'password_reset',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        })

        // Send OTP email via Resend (existing mailer)
        await sendOTPEmail({
            to: email,
            otp: otpPlain,
            userName: user.name
        })

        return Response.json({
            success: true,
            message: 'If this email exists, an OTP has been sent.'
        })
    } catch (error) {
        console.error('Forgot password error:', error)
        return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
}
