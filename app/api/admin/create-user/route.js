import { connectDB } from '@/lib/mongodb';
import { strictRoleMiddleware } from '@/lib/middleware';
import User from '@/models/User';
import Department from '@/lib/models/Department';
import { userAdminCreateSchema } from '@/lib/schemas';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/admin/create-user
 * 
 * Admin-only endpoint to create staff accounts (department or municipal)
 * 
 * Requirements:
 * - User must be authenticated as admin
 * - Role can only be "department" or "municipal"
 * - Cannot create admin accounts
 * - Department is required for department staff
 * - Returns created user without password
 */

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

        // SECURITY: Reject admin creation
        if (role === 'admin') {
            return new Response(
                JSON.stringify({ error: 'Cannot create admin accounts through this endpoint' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // SECURITY: Only allow department or municipal roles
        const allowedRoles = ['department', 'municipal'];
        if (!allowedRoles.includes(role)) {
            return new Response(
                JSON.stringify({ error: 'Invalid role. Only department or municipal allowed' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // SECURITY: Department is required for department staff
        if (role === 'department' && !department) {
            return new Response(
                JSON.stringify({ error: 'Department is required for department staff' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // SECURITY: Municipal staff cannot have department
        if (role === 'municipal' && department) {
            return new Response(
                JSON.stringify({ error: 'Municipal staff cannot have department assigned' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // SECURITY: Validate department exists if provided
        if (department) {
            const existingDepartment = await Department.findById(department);
            if (!existingDepartment) {
                return new Response(
                    JSON.stringify({ error: 'Selected department does not exist' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }

            // SECURITY: Validate department is active
            if (!existingDepartment.isActive) {
                return new Response(
                    JSON.stringify({ error: 'Selected department is not active' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }
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

        // Clean up phone number
        const cleanPhone = phone ? phone.replace(/[\s-]/g, '') : undefined;

        // Convert department to ObjectId if provided
        const departmentObjectId = department ? new mongoose.Types.ObjectId(department) : undefined;

        // Create user - password will be hashed by User model pre-save middleware
        const user = await User.create({
            name,
            email,
            password,
            phone: cleanPhone,
            role,
            department: role === 'department' ? departmentObjectId : undefined,
            address: address || {}
        });

        console.log('Admin created staff user:', user._id, 'role:', role);

        // Return success without password
        return new Response(
            JSON.stringify({
                message: 'Staff account created successfully',
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
        console.error('Error in admin create-user:', error);

        if (error.code === 11000) {
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
