import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import OTP from '@/models/OTP'

export async function POST(request) {
    try {
        const { email, otp } = await request.json()

        if (!email || !otp) {
            return Response.json({ error: 'Email and OTP are required' }, { status: 400 })
        }

        await connectDB()

        const otpRecord = await OTP.findOne({
            email: email.toLowerCase(),
            purpose: 'password_reset',
            used: false,
            expiresAt: { $gt: new Date() }  // not expired
        })

        if (!otpRecord) {
            return Response.json({
                error: 'OTP expired or not found. Please request a new one.'
            }, { status: 400 })
        }

        // Increment attempt counter
        otpRecord.attempts += 1
        await otpRecord.save()

        // Block after 3 wrong attempts
        if (otpRecord.attempts > 3) {
            await OTP.deleteOne({ _id: otpRecord._id })
            return Response.json({
                error: 'Too many attempts. Please request a new OTP.'
            }, { status: 429 })
        }

        // Verify OTP
        const isValid = await bcrypt.compare(otp, otpRecord.otp)
        if (!isValid) {
            return Response.json({
                error: `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining.`
            }, { status: 400 })
        }

        // Mark OTP as used
        otpRecord.used = true
        await otpRecord.save()

        // Issue short-lived reset token (5 minutes)
        const resetToken = jwt.sign(
            { email: email.toLowerCase(), purpose: 'password_reset' },
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
        )

        return Response.json({ success: true, resetToken })
    } catch (error) {
        console.error('Verify OTP error:', error)
        return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
}
