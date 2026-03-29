import jwt from 'jsonwebtoken'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request) {
  try {
    const { resetToken, newPassword } = await request.json()

    if (!newPassword || newPassword.length < 6) {
      return Response.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    if (!resetToken) {
      return Response.json({ error: 'Reset token is required' }, { status: 400 })
    }

    // Verify reset token
    let decoded
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET)
    } catch {
      return Response.json(
        { error: 'Reset session expired. Please start again.' },
        { status: 401 }
      )
    }

    if (decoded.purpose !== 'password_reset') {
      return Response.json({ error: 'Invalid token purpose' }, { status: 401 })
    }

    await connectDB()

    // Find user and update password
    const user = await User.findOne({ email: decoded.email }).select('+password')
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // bcrypt hash handled by User model pre-save hook
    user.password = newPassword
    await user.save()

    return Response.json({
      success: true,
      message: 'Password reset successfully. Please log in.'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
