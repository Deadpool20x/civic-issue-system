import { connectDB } from '@/lib/mongodb';
import { authMiddleware, roleMiddleware } from '@/lib/auth';
import Department from '@/lib/models/Department';
import User from '@/models/User';

// Delete department (admin only)
export const DELETE = roleMiddleware(['admin'])(async (req, { params }) => {
    try {
        await connectDB();

        const departmentId = params.id;

        // Check if department exists
        const department = await Department.findById(departmentId);
        if (!department) {
            return new Response(
                JSON.stringify({ error: 'Department not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check if department has staff members
        const staffCount = await User.countDocuments({
            role: 'department',
            department: department.name
        });

        if (staffCount > 0) {
            return new Response(
                JSON.stringify({
                    error: `Cannot delete department. It has ${staffCount} staff members assigned. Please reassign or remove staff first.`
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        await Department.findByIdAndDelete(departmentId);

        return new Response(
            JSON.stringify({ message: 'Department deleted successfully' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error deleting department:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});