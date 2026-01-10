import { connectDB } from '@/lib/mongodb';
import { roleMiddleware } from '@/lib/auth';
import { strictRoleMiddleware } from '@/lib/middleware';
import User from '@/models/User';
import { z } from 'zod';

// Schema for updating user (admin-only fields)
const updateUserSchema = z.object({
    role: z.enum(['citizen', 'municipal', 'department']).optional(),
    department: z.enum(['water', 'electricity', 'roads', 'garbage', 'parks', 'other']).optional(),
    isActive: z.boolean().optional(),
    phone: z.string().regex(/^\+?[\d\s-]{10,}$/, 'Invalid phone number').optional().or(z.literal('')),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional()
    }).optional()
});

// SECURE: Admin-only endpoint to update user details
export const PATCH = strictRoleMiddleware(['admin'])(async (req, { params }) => {
    try {
        const { id } = params;

        let body;
        try {
            body = await req.json();
        } catch (e) {
            return new Response(
                JSON.stringify({ error: 'Invalid JSON body' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const result = updateUserSchema.safeParse(body);
        if (!result.success) {
            return new Response(
                JSON.stringify({ error: result.error.errors[0].message }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        await connectDB();

        // Find the user to update
        const user = await User.findById(id);
        if (!user) {
            return new Response(
                JSON.stringify({ error: 'User not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Prevent modifying admin users
        if (user.role === 'admin' && (body.role || body.department || body.isActive === false)) {
            return new Response(
                JSON.stringify({ error: 'Cannot modify admin user details' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Validate role changes
        if (body.role) {
            // If changing to department, require department
            if (body.role === 'department' && !body.department && !user.department) {
                return new Response(
                    JSON.stringify({ error: 'Department is required for department staff' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }

            // If changing away from department, clear department
            if (body.role !== 'department') {
                body.department = undefined;
            }
        }

        // Clean phone number if provided
        if (body.phone !== undefined) {
            body.phone = body.phone ? body.phone.replace(/[\s-]/g, '') : '';
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        ).select('-password');

        return new Response(
            JSON.stringify({
                message: 'User updated successfully',
                user: updatedUser
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('Error updating user:', error);

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
