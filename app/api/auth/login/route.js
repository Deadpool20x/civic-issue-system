import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { cookies } from 'next/headers';
import { loginSchema } from '@/lib/schemas';

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

        const result = loginSchema.safeParse(body);
        if (!result.success) {
             return new Response(
                JSON.stringify({ error: result.error.errors[0].message }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const { email, password } = result.data;

        console.log('Login attempt for email:', email); // Debug log

        await connectDB();

        const user = await User.findOne({ email }).select('+password');

        console.log('User found:', !!user); // Debug log

        if (!user) {
            return new Response(
                JSON.stringify({ error: 'Invalid credentials' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Try both comparison methods for backwards compatibility
        let isPasswordValid = false;
        try {
            // First try the model method
            isPasswordValid = await user.comparePassword(password);
            console.log('Password valid with model method:', isPasswordValid);
        } catch (error) {
            console.log('Model method failed, trying direct bcrypt:', error.message);
            // Fallback to direct bcrypt comparison for existing users
            isPasswordValid = await bcrypt.compare(password, user.password);
            console.log('Password valid with direct bcrypt:', isPasswordValid);
        }

        if (!isPasswordValid) {
            return new Response(
                JSON.stringify({ error: 'Invalid credentials' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (!user.isActive) {
            return new Response(
                JSON.stringify({ error: 'Account is deactivated' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Send welcome email on first login if not sent
        if (!user.welcomeEmailSent) {
          (async () => {
              try {
                const welcomeText = `Welcome back ${user.name}!\n\nThank you for logging into the Civic Issue System.\n\nYou can now report and track civic issues in your area.\n\nIf you have any questions, contact support.\n\nBest regards,\nCivic Issue System Team`;
                await sendEmail(user.email, 'Welcome to Civic Issue System', welcomeText);
                user.welcomeEmailSent = true;
                await user.save();
                console.log('Welcome email sent to:', user.email);
              } catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
              }
          })();
        }

        const token = await generateToken(user);
        const cookieStore = await cookies();

        // Set cookie with better configuration
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/' // Ensure cookie is available on all paths
        });

        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department
        };

        // Determine redirect URL based on role
        let redirectUrl;
        switch (user.role) {
            case 'admin':
                redirectUrl = '/admin/dashboard';
                break;
            case 'municipal':
                redirectUrl = '/municipal/dashboard';
                break;
            case 'department':
                redirectUrl = '/department/dashboard';
                break;
            case 'citizen':
            default:
                redirectUrl = '/citizen/dashboard';
                break;
        }

        return new Response(
            JSON.stringify({ 
                message: 'Login successful', 
                user: userResponse,
                redirectUrl 
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Login error:', error);
        
        if (error.name === 'MongooseServerSelectionError' || error.name === 'MongoNetworkError') {
             return new Response(
                JSON.stringify({ error: 'Database service unavailable. Please try again later.' }),
                { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}