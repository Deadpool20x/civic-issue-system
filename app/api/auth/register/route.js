import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        const { name, email, password, phone, role = 'citizen', department, address } = await req.json();

        console.log('Registration attempt for email:', email, 'role:', role); // Debug log

        // Validate required fields
        if (!name || !email || !password || !phone) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Validate department for department role
        if (role === 'department' && !department) {
            return new Response(
                JSON.stringify({ error: 'Department is required for department role' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Validate password strength
        if (password.length < 6) {
            return new Response(
                JSON.stringify({ error: 'Password must be at least 6 characters long' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Connect to database
        await connectDB();

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return new Response(
                JSON.stringify({ error: 'Email already registered' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Create user (password will be hashed by the User model pre-save middleware)
        const user = await User.create({
            name,
            email,
            password, // Don't hash here, let the model handle it
            phone,
            role,
            department: role === 'department' ? department : undefined,
            address
        });

        console.log('User created successfully with ID:', user._id); // Debug log

        // Send confirmation email
        try {
          const confirmationText = `Welcome ${user.name}!\n\nYour account has been created successfully on the Civic Issue System.\n\nYou can now report and track civic issues.\n\nBest regards,\nCivic Issue System Team`;
          await sendEmail(user.email, 'Registration Confirmation - Civic Issue System', confirmationText);
          console.log('Confirmation email sent to:', user.email);
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Continue without failing registration
        }

        // Generate token
        const token = await generateToken(user);
        const cookieStore = await cookies();

        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        // Prepare user response without sensitive data
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department
        };

        return new Response(
            JSON.stringify({ message: 'Registration successful', user: userResponse }),
            { status: 201, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}