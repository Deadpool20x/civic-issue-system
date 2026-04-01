import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { sendEmail } from '@/lib/email'

function generateTemporaryPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'
  return Array.from(crypto.randomFillSync(new Uint32Array(12)))
    .map((value) => alphabet[value % alphabet.length])
    .join('')
}

export async function POST(request, { params }) {
  try {
    const currentUser = await getUser(request)

    if (!['SYSTEM_ADMIN', 'admin'].includes(currentUser?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()

    const user = await User.findById(params.id).select('+password')
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const temporaryPassword = generateTemporaryPassword()
    user.password = temporaryPassword
    await user.save()

    const emailResult = await sendEmail(
      user.email,
      'Your CivicPulse password has been reset',
      `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0A0A0A; padding: 32px; border-radius: 16px; color: #FFFFFF;">
          <h2 style="color: #F5A623; margin-bottom: 8px;">Temporary Password Issued</h2>
          <p style="color: #AAAAAA; margin-bottom: 24px;">Hi ${user.name}, an administrator reset your password.</p>
          <div style="background: #1A1A1A; border: 1px solid #333333; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="color: #AAAAAA; font-size: 14px; margin-bottom: 8px;">Temporary Password</p>
            <h1 style="color: #F5A623; font-size: 32px; letter-spacing: 2px; margin: 0; font-weight: 900;">${temporaryPassword}</h1>
          </div>
          <p style="color: #666666; font-size: 12px;">Please sign in and change your password immediately.</p>
        </div>
      `
    )

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      temporaryPassword,
    })
  } catch (error) {
    console.error('Admin reset password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
