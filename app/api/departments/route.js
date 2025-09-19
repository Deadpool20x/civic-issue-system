import { connectDB } from '@/lib/mongodb';
import { authMiddleware, roleMiddleware } from '@/lib/auth';
import User from '@/models/User';
import Department from '@/lib/models/Department';

// Get all departments or department staff
export const GET = authMiddleware(async (req) => {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type'); // 'departments' or 'staff'
        const department = searchParams.get('department');

        if (type === 'staff') {
            // Get department staff
            const query = { role: 'department' };
            if (department) {
                query.department = department;
            }

            const departmentStaff = await User.find(query)
                .select('name email department isActive')
                .sort({ department: 1, name: 1 });

            return new Response(JSON.stringify(departmentStaff), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            // Get all departments
            const departments = await Department.find({ isActive: true })
                .sort({ name: 1 });

            // Add staff count to each department
            for (let dept of departments) {
                const staffCount = await User.countDocuments({
                    role: 'department',
                    department: dept.name
                });
                dept.staffCount = staffCount;
            }

            return new Response(JSON.stringify(departments), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error('Error fetching departments:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

// Create new department (admin only)
export const POST = roleMiddleware(['admin'])(async (req) => {
    try {
        const departmentData = await req.json();

        await connectDB();

        const department = await Department.create(departmentData);

        return new Response(
            JSON.stringify(department),
            { status: 201, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error creating department:', error);
        if (error.code === 11000) {
            return new Response(
                JSON.stringify({ error: 'Department name already exists' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});