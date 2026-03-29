import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET

export function generateToken(user) {
    const payload = {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        wardId: user.wardId || null,
        departmentId: user.departmentId || null,
        isActive: user.isActive,
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function setTokenCookie(token) {
    cookies().set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    })
}

export function removeTokenCookie() {
    cookies().set('token', '', {
        httpOnly: true,
        maxAge: 0,
        path: '/',
    })
}

export async function getUser(request) {
    try {
        let token = null

        // For API routes — read from request headers
        if (request) {
            const cookieHeader = request.headers.get('cookie') || ''
            const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/)
            token = match ? match[1] : null
        } else {
            // For server components — read from next/headers
            const cookieStore = await cookies()
            token = cookieStore.get('token')?.value || null
        }

        if (!token) return null

        const decoded = jwt.verify(token, JWT_SECRET)
        return decoded
    } catch {
        return null
    }
}

// Alias for getUser to support existing codebase imports
export const getTokenData = getUser;

// Normalize role for consistent comparison
export function normalizeRole(role) {
    if (!role) return null;
    const upperRole = role.toUpperCase();
    
    // Map various role formats to standard names
    const roleMap = {
        'CITIZEN': 'CITIZEN',
        'FIELD_OFFICER': 'FIELD_OFFICER',
        'DEPARTMENT_MANAGER': 'DEPARTMENT_MANAGER',
        'DEPARTMENT': 'DEPARTMENT_MANAGER',
        'MUNICIPAL_COMMISSIONER': 'MUNICIPAL_COMMISSIONER',
        'COMMISSIONER': 'MUNICIPAL_COMMISSIONER',
        'SYSTEM_ADMIN': 'SYSTEM_ADMIN',
        'ADMIN': 'SYSTEM_ADMIN',
    };
    
    return roleMap[upperRole] || null;
}

// Auth middleware wrapper for API routes
export function authMiddleware(handler) {
    return async (request, ...args) => {
        try {
            const userData = await getUser(request);
            
            if (!userData) {
                return new Response(
                    JSON.stringify({ error: 'Unauthorized - No authentication token' }),
                    { status: 401, headers: { 'Content-Type': 'application/json' } }
                );
            }

            // Attach user to request
            request.user = userData;
            return handler(request, ...args);
        } catch (error) {
            console.error('Auth middleware error:', error);
            return new Response(
                JSON.stringify({ error: 'Internal server error' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }
    };
}

// Role-based auth middleware
export function roleMiddleware(allowedRoles) {
    return (handler) => {
        return authMiddleware(async (request, ...args) => {
            const normalizedRole = normalizeRole(request.user.role);
            const normalizedAllowedRoles = allowedRoles.map(r => normalizeRole(r) || r.toUpperCase());
            
            const isAllowed = allowedRoles.includes(request.user.role) || 
                              normalizedAllowedRoles.includes(normalizedRole) ||
                              allowedRoles.some(ar => (ar || '').toUpperCase() === normalizedRole);
            
            if (!isAllowed) {
                return new Response(
                    JSON.stringify({
                        error: `Unauthorized - ${request.user.role} role not allowed`,
                        allowed: allowedRoles
                    }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }

            return handler(request, ...args);
        });
    };
}
