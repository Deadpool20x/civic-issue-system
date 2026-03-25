import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { generateToken } from '@/lib/auth'

export async function POST(request) {
  try {
    const { name, email, password, phone, address } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    await connectDB()

    const existing = await User.findOne({
      email: email.toLowerCase().trim()
    })

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // User model's pre-save hook automatically hashes the password — do NOT pre-hash here
    const normalizedPhone = typeof phone === 'string'
      ? phone.replace(/\D/g, '')
      : undefined

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      phone: normalizedPhone || undefined,
      address: address || {},
      role: 'CITIZEN',
      wardId: null,
      departmentId: null,
      isActive: true,
    })

    console.log('Registration attempt for email:', email, 'role: CITIZEN')
    console.log('User created successfully with ID:', user._id)

    const token = generateToken(user)

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      }
    }, { status: 201 })

    // Set token cookie in the response
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response

  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json(
      { error: 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}
