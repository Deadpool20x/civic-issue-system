import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { cookies } from 'next/headers';
import { userRegisterSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
    try {
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return new Response(
                JSON.stringify({ error: 'Invalid JSON body' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const result = userRegisterSchema.safeParse(body);
        if (!result.success) {
            return new Response(
                JSON.stringify({ error: result.error.errors[0].message }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const { name, email, password, phone, address } = result.data;

        // PUBLIC REGISTRATION IS CITIZEN-ONLY
        // Staff accounts are created by admins through the admin dashboard
        // Role and department are NEVER read from client input
        const role = 'citizen';
        const department = undefined; // Citizens never have department assignments

        console.log('Registration attempt for email:', email, 'role:', role); // Debug log

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

        // Clean up phone number - remove spaces and dashes for storage
        const cleanPhone = phone ? phone.replace(/[\s-]/g, '') : undefined;

        // Create user (password will be hashed by the User model pre-save middleware)
        // PUBLIC REGISTRATION IS CITIZEN-ONLY - Staff accounts are created by admins
        const user = await User.create({
            name,
            email,
            password, // Don't hash here, let the model handle it
            phone: cleanPhone,
            role, // Always 'citizen' for public registration
            department, // Always undefined for citizens
            address
        });

        console.log('User created successfully with ID:', user._id); // Debug log

        // Send confirmation email asynchronously
        (async () => {
            try {
                const confirmationText = `Welcome ${user.name}!\n\nYour account has been created successfully on the Civic Issue System.\n\nYou can now report and track civic issues.\n\nBest regards,\nCivic Issue System Team`;
                await sendEmail(user.email, 'Registration Confirmation - Civic Issue System', confirmationText);
                console.log('Confirmation email sent to:', user.email);
            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError);
            }
        })();

        // Generate token
        const token = await generateToken(user);
        const cookieStore = await cookies();

        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/'
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