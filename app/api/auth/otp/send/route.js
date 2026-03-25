import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { phone } = await req.json();
        const normalizedPhone = typeof phone === 'string' ? phone.replace(/\D/g, '') : '';

        if (!normalizedPhone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        await connectDB();

        // Mobile login is primarily for Citizens
        const user = await User.findOne({
            phone: normalizedPhone,
            role: { $in: ['CITIZEN', 'citizen'] },
            isActive: true
        });

        if (!user) {
            return NextResponse.json({
                error: 'Account not found. Please register as a citizen first.'
            }, { status: 404 });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);

        // Clean up any existing OTPs for this phone
        await OTP.deleteMany({ phone: normalizedPhone, purpose: 'login' });

        // Save to OTP collection
        await OTP.create({
            phone: normalizedPhone,
            otp: hashedOtp,
            purpose: 'login',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
        });

        // SIMULATION LOG (Visible in terminal)
        console.log(`\n-----------------------------------------`);
        console.log(`[OTP LOGIN] Mobile: ${normalizedPhone}`);
        console.log(`[OTP LOGIN] VERIFICATION CODE: ${otp}`);
        console.log(`-----------------------------------------\n`);

        return NextResponse.json({
            success: true,
            message: 'Verification code sent (Check terminal for dev)'
        });

    } catch (error) {
        console.error('[OTP SEND] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
