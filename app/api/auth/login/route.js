import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { generateToken } from '@/lib/auth'

export async function POST(request) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        await connectDB()

        // IMPORTANT: Must select password explicitly since it has `select: false` in the schema
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')

        console.log('Login attempt for email:', email.toLowerCase().trim())
        console.log('User found:', !!user)

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        if (!user.isActive) {
            return NextResponse.json(
                { error: 'Account is deactivated. Please contact administrator.' },
                { status: 403 }
            )
        }

        // Use the model's comparePassword method which uses bcrypt.compare
        const isPasswordValid = await user.comparePassword(password)

        console.log('Password valid:', isPasswordValid)

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        const token = generateToken(user)

        // Create response with user data
        const response = NextResponse.json({
            success: true,
            user: {
                userId: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                wardId: user.wardId || null,
                departmentId: user.departmentId || null,
            }
        })

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
        console.error('Login error:', err)
        return NextResponse.json(
            { error: 'Server error. Please try again.' },
            { status: 500 }
        )
    }
}