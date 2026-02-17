import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
    try {
        const cookieStore = await cookies();

        // Clear the token cookie with multiple approaches to ensure it's gone
        cookieStore.set('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0, // Expire immediately
            path: '/',
            expires: new Date(0) // Set to past date
        });

        // Also try to delete the cookie
        cookieStore.delete('token');

        return new Response(
            JSON.stringify({ message: 'Logged out successfully' }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    // Additional header to clear cookie on client side
                    'Set-Cookie': 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax'
                }
            }
        );
    } catch (error) {
        console.error('Logout error:', error);
        return new Response(
            JSON.stringify({ error: 'Logout failed' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}