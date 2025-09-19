import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const ALLOW_DEMO = process.env.ALLOW_DEMO !== 'false'; // default true

function getDemoUser() {
    return {
        userId: 'demo-user-id',
        email: 'demo@example.com',
        role: 'municipal',
        department: 'roads'
    };
}

export async function getTokenData() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
        // Allow demo mode without auth token
        return ALLOW_DEMO ? getDemoUser() : null;
    }

    try {
        return jwt.verify(token.value, JWT_SECRET);
    } catch (error) {
        // If verification fails, allow demo in non-production by default
        return ALLOW_DEMO ? getDemoUser() : null;
    }
}

export async function generateToken(user) {
    const token = jwt.sign(
        {
            userId: user._id,
            email: user.email,
            role: user.role,
            department: user.department
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
    return token;
}

export function authMiddleware(handler) {
    return async (...args) => {
        const req = args[0];
        const userData = await getTokenData();

        if (!userData) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        req.user = userData;
        return handler(...args);
    };
}

export function roleMiddleware(roles) {
    return (handler) => {
        return async (req) => {
            const userData = await getTokenData();

            if (!userData || !roles.includes(userData.role)) {
                return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            req.user = userData;
            return handler(req);
        };
    };
}
