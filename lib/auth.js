import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
}

const JWT_SECRET = process.env.JWT_SECRET;

export async function getTokenData() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
        return null;
    }

    try {
        return jwt.verify(token.value, JWT_SECRET);
    } catch (error) {
        return null;
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
