import { connectDB } from '@/lib/mongodb';
import { roleMiddleware } from '@/lib/auth';
import { strictRoleMiddleware } from '@/lib/middleware';
import User from '@/models/User';
import { userAdminCreateSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// SECURE: Admin-only endpoint to create department/municipal staff
export const POST = strictRoleMiddleware(['admin'])(async (req) => {
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

        const result = userAdminCreateSchema.safeParse(body);
        if (!result.success) {
            return new Response(
                JSON.stringify({ error: result.error.errors[0].message }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const { name, email, password, phone, role, department, address } = result.data;

        // SECURITY: Validate that only admin can create privileged accounts
        // Admin cannot create other admin accounts
        if (role === 'admin') {
            return new Response(
                JSON.stringify({ error: 'Only super admins can create admin accounts' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // SECURITY: Validate role is allowed for admin creation
        // Only department and municipal staff can be created by admin
        const allowedRoles = ['department', 'municipal'];
        if (!allowedRoles.includes(role)) {
            return new Response(
                JSON.stringify({ error: 'Invalid role. Admin can only create department or municipal staff' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // SECURITY: Department staff MUST have department assigned
        if (role === 'department' && !department) {
            return new Response(
                JSON.stringify({ error: 'Department is required for department staff' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // SECURITY: Municipal staff should NOT have department
        if (role === 'municipal' && department) {
            return new Response(
                JSON.stringify({ error: 'Municipal staff cannot have department assigned' }),
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

        // Clean up phone number - remove spaces and dashes for storage
        const cleanPhone = phone ? phone.replace(/[\s-]/g, '') : undefined;

        // Create user (password will be hashed by the User model pre-save middleware)
        const user = await User.create({
            name,
            email,
            password, // Don't hash here, let the model handle it
            phone: cleanPhone,
            role,
            department: role === 'department' ? department : undefined,
            address: address || {}
        });

        console.log('Admin created user successfully with ID:', user._id, 'role:', role);

        // Return success response (don't include password)
        return new Response(
            JSON.stringify({
                message: 'User created successfully',
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    department: user.department,
                    address: user.address,
                    isActive: user.isActive,
                    createdAt: user.createdAt
                }
            }),
            {
                status: 201,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('Error in admin user creation:', error);

        if (error.code === 11000) { // MongoDB duplicate key error
            return new Response(
                JSON.stringify({ error: 'Email already exists' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

// SECURE: Admin-only endpoint to get all users (for user management)
export const GET = strictRoleMiddleware(['admin'])(async (req) => {
    try {
        await connectDB();

        const users = await User.find({})
            .select('-password') // Exclude password
            .sort({ createdAt: -1 });

        return new Response(JSON.stringify(users), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
