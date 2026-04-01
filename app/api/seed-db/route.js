import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        console.log('Running department seeder...');
        const { stdout: deptOut } = await execAsync('npm run db:seed');
        console.log('Department Seeder Output:', deptOut);

        console.log('Running user seeder...');
        const { stdout: userOut } = await execAsync('npm run db:seed-users');
        console.log('User Seeder Output:', userOut);

        return new Response(JSON.stringify({
            success: true,
            message: 'Database successfully seeded!',
            details: {
                departments: deptOut,
                users: userOut
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Seeding error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            stack: error.stack
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
