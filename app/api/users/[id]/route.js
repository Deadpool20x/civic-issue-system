import { connectDB } from '@/lib/mongodb';
import { roleMiddleware } from '@/lib/auth';
import { strictRoleMiddleware } from '@/lib/middleware';
import User from '@/models/User';
import Department from '@/lib/models/Department';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const updateUserSchema = {
    safeParse(input) {
        if (!input || typeof input !== 'object') {
            return {
                success: false,
                error: { errors: [{ path: [], message: 'Invalid request body' }] }
            };
        }

        if (input.role !== undefined && !['citizen', 'municipal', 'department'].includes(input.role)) {
            return {
                success: false,
                error: { errors: [{ path: ['role'], message: 'Invalid role' }] }
            };
        }

        if (input.department !== undefined && typeof input.department !== 'string') {
            return {
                success: false,
                error: { errors: [{ path: ['department'], message: 'department must be a string' }] }
            };
        }

        if (input.isActive !== undefined && typeof input.isActive !== 'boolean') {
            return {
                success: false,
                error: { errors: [{ path: ['isActive'], message: 'isActive must be a boolean' }] }
            };
        }

        if (input.phone !== undefined && input.phone !== '' && (typeof input.phone !== 'string' || !/^\+?[\d\s-]{10,}$/.test(input.phone))) {
            return {
                success: false,
                error: { errors: [{ path: ['phone'], message: 'Invalid phone number' }] }
            };
        }

        if (input.address !== undefined && (typeof input.address !== 'object' || Array.isArray(input.address))) {
            return {
                success: false,
                error: { errors: [{ path: ['address'], message: 'address must be an object' }] }
            };
        }

        return { success: true, data: input };
    }
};

// SECURE: Admin-only endpoint to update user details
export const PATCH = strictRoleMiddleware(['admin'])(async (req, { params }) => {
    try {
        const { id } = params;

        console.log('📝 Updating user:', id);

        let body;
        try {
            body = await req.json();
        } catch (e) {
            console.error('❌ Invalid JSON body:', e);
            return new Response(
                JSON.stringify({ error: 'Invalid JSON body' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        console.log('📦 Update data:', body);

        const result = updateUserSchema.safeParse(body);
        if (!result.success) {
            console.error('❌ Validation error:', result.error.errors[0].message);
            return new Response(
                JSON.stringify({ error: result.error.errors[0].message }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        await connectDB();

        // Step 1: Get user from database
        console.log('🔍 Finding user in database...');
        const user = await User.findById(id);
        if (!user) {
            console.error('❌ User not found:', id);
            return new Response(
                JSON.stringify({ error: 'User not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        console.log('👤 Current user:', user.email, 'Role:', user.role, 'Department:', user.department);

        // Prevent modifying admin users
        if (user.role === 'admin' && (body.role || body.department || body.isActive === false)) {
            console.error('❌ Cannot modify admin user details');
            return new Response(
                JSON.stringify({ error: 'Cannot modify admin user details' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Validate role changes
        if (body.role) {
            console.log('🔄 Role change detected:', user.role, '→', body.role);

            // If changing to department, require department
            if (body.role === 'department' && !body.department && !user.department) {
                console.error('❌ Department is required for department staff');
                return new Response(
                    JSON.stringify({ error: 'Department is required for department staff' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }

            // If changing away from department, clear department
            if (body.role !== 'department') {
                console.log('🗑️ Clearing department for non-department role');
                body.department = undefined;
            }
        }

        // Validate department if provided
        if (body.department) {
            console.log('🏢 Validating department:', body.department);

            // Check if department is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(body.department)) {
                console.error('❌ Invalid department ID:', body.department);
                return new Response(
                    JSON.stringify({ error: 'Invalid department ID' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }

            // Check if department exists
            const department = await Department.findById(body.department);
            if (!department) {
                console.error('❌ Department does not exist:', body.department);
                return new Response(
                    JSON.stringify({ error: 'Selected department does not exist' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }

            console.log('✅ Department found:', department.name);

            // Check if department is active
            if (!department.isActive) {
                console.error('❌ Department is not active:', department.name);
                return new Response(
                    JSON.stringify({ error: 'Selected department is not active' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }
        }

        // Clean phone number if provided
        if (body.phone !== undefined) {
            body.phone = body.phone ? body.phone.replace(/[\s-]/g, '') : '';
        }

        // Step 2: Update role
        if (body.role) {
            console.log('🔄 Updating role:', user.role, '→', body.role);
            user.role = body.role;
        }

        // Step 3: Handle department
        if (user.role === 'department') {
            if (!body.department) {
                console.error('❌ Department required for department role');
                return new Response(
                    JSON.stringify({ error: 'Department required' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }
            console.log('🏢 Setting department:', body.department);
            user.department = new mongoose.Types.ObjectId(body.department);
        } else {
            console.log('🏢 Clearing department for non-department role');
            user.department = null;
        }

        // Update other fields if provided
        if (body.name !== undefined) {
            console.log('👤 Updating name:', user.name, '→', body.name);
            user.name = body.name;
        }
        if (body.email !== undefined) {
            console.log('✉️ Updating email:', user.email, '→', body.email);
            user.email = body.email;
        }
        if (body.phone !== undefined) {
            console.log('📞 Updating phone:', user.phone, '→', body.phone);
            user.phone = body.phone;
        }
        if (body.isActive !== undefined) {
            console.log('🔘 Updating isActive:', user.isActive, '→', body.isActive);
            user.isActive = body.isActive;
        }
        if (body.address !== undefined) {
            console.log('📍 Updating address:', body.address);
            user.address = body.address;
        }

        // Step 4: Save to database
        console.log('💾 Saving user to database...');
        await user.save();
        console.log('✅ User saved successfully');

        // Populate department for response
        await user.populate('department', 'name');
        console.log('📥 Populated department:', user.department);

        // Step 5: Return response AFTER save completes
        return new Response(
            JSON.stringify({
                message: 'User updated successfully',
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    isActive: user.isActive,
                    phone: user.phone,
                    address: user.address
                }
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('❌ User update error:', error);

        if (error.code === 11000) {
            console.error('❌ Duplicate email error');
            return new Response(
                JSON.stringify({ error: 'Email already exists' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (error.name === 'ValidationError') {
            console.error('❌ Validation error:', error.message);
            return new Response(
                JSON.stringify({
                    error: 'Validation failed',
                    details: Object.values(error.errors).map(e => e.message).join(', ')
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        console.error('❌ Internal server error:', error.message);
        return new Response(
            JSON.stringify({ error: 'Internal server error', details: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

// SECURE: Admin-only endpoint to get single user details
export const GET = strictRoleMiddleware(['admin'])(async (req, { params }) => {
    try {
        const { id } = params;

        await connectDB();

        const user = await User.findById(id).select('-password');

        if (!user) {
            return new Response(
                JSON.stringify({ error: 'User not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(JSON.stringify(user), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
