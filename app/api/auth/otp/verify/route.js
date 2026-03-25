import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { phone, otp } = await req.json();
        const normalizedPhone = typeof phone === 'string' ? phone.replace(/\D/g, '') : '';

        if (!normalizedPhone || !otp) {
            return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
        }

        await connectDB();

        // Find the most recent active OTP
        const otpRecord = await OTP.findOne({
            phone: normalizedPhone,
            purpose: 'login',
            used: false,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return NextResponse.json({
                error: 'Invalid or expired OTP. Please request a new one.'
            }, { status: 400 });
        }

        // Verify the code
        const isValid = await bcrypt.compare(otp, otpRecord.otp);
        if (!isValid) {
            // Log attempt (optional)
            return NextResponse.json({ error: 'Incorrect verification code' }, { status: 400 });
        }

        // Success: Mark OTP as used
        otpRecord.used = true;
        await otpRecord.save();

        // Find user to generate JWT
        const user = await User.findOne({ phone: normalizedPhone });

        if (!user) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        const token = await generateToken(user);

        // Create response with user data
        const response = NextResponse.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

        // Set secure auth cookie in the response
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/'
        });

        return response;

    } catch (error) {
        console.error('[OTP VERIFY] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
