import { connectDB } from '@/lib/mongodb';
import { getTokenData } from '@/lib/auth';
import User from '@/models/User';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
    try {
        // Check authentication
        const userData = await getTokenData();

        if (!userData) {
            return Response.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Admins can create any account type; commissioners can create staff only.
        const userRole = userData.role?.toUpperCase();
        const isAdmin = userRole === 'SYSTEM_ADMIN' || userRole === 'ADMIN';
        const isCommissioner = userRole === 'MUNICIPAL_COMMISSIONER' || userRole === 'COMMISSIONER';

        if (!isAdmin && !isCommissioner) {
            return Response.json(
                { error: 'Only administrators can create user accounts' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, email, phone, password, role, wardId, departmentId, isActive } = body;

        // Validation
        if (!name || !email || !password || !role) {
            return Response.json(
                { error: 'Name, email, password, and role are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return Response.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Validate role-specific requirements
        if (role === 'FIELD_OFFICER' && !wardId) {
            return Response.json(
                { error: 'Ward ID is required for Field Officers' },
                { status: 400 }
            );
        }

        if (role === 'DEPARTMENT_MANAGER' && !departmentId) {
            return Response.json(
                { error: 'Department ID is required for Department Managers' },
                { status: 400 }
            );
        }

        if (isCommissioner && !['FIELD_OFFICER', 'DEPARTMENT_MANAGER'].includes(role)) {
            return Response.json(
                { error: 'Commissioners can only create Field Officer and Department Manager accounts' },
                { status: 403 }
            );
        }

        await connectDB();

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return Response.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
        }

        // Create user data
        const newUserData = {
            name,
            email: email.toLowerCase(),
            password,
            role,
            isActive: isActive !== undefined ? isActive : true,
        };

        // Add optional fields
        if (phone) newUserData.phone = phone;
        if (wardId) newUserData.wardId = wardId;
        if (departmentId) newUserData.departmentId = departmentId;

        // Create user
        const newUser = await User.create(newUserData);

        // Remove password from response
        const userResponse = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role,
            wardId: newUser.wardId,
            departmentId: newUser.departmentId,
            isActive: newUser.isActive,
            createdAt: newUser.createdAt
        };

        console.log(`✅ User created successfully: ${newUser.email} (${newUser.role})`);

        return Response.json(
            {
                success: true,
                message: 'User account created successfully',
                user: userResponse
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('❌ Create user error:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return Response.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
        }

        return Response.json(
            { error: 'Failed to create user account' },
            { status: 500 }
        );
    }
}
