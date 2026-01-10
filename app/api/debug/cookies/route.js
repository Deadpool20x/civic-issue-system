import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = cookies();
        const allCookies = cookieStore.getAll();

        return new Response(
            JSON.stringify({
                success: true,
                cookies: allCookies.map(cookie => ({
                    name: cookie.name,
                    value: cookie.value,
                    path: cookie.path,
                    domain: cookie.domain,
                    secure: cookie.secure,
                    httpOnly: cookie.httpOnly,
                    sameSite: cookie.sameSite,
                    maxAge: cookie.maxAge
                }))
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}
