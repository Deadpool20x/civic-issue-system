import { getTokenData } from './auth';

/**
 * Path-based role access control middleware
 * Enforces strict role-based access to API routes
 */
export function createPathMiddleware(pathRules) {
    return (handler) => {
        return async (req, ...args) => {
            const userData = await getTokenData();

            // No authentication token
            if (!userData) {
                return new Response(
                    JSON.stringify({ error: 'Unauthorized - No authentication token' }),
                    { status: 401, headers: { 'Content-Type': 'application/json' } }
                );
            }

            // Get the request path
            const path = req.nextUrl.pathname;

            // Find matching path rule
            let allowedRoles = null;
            for (const [pattern, roles] of Object.entries(pathRules)) {
                if (path.startsWith(pattern)) {
                    allowedRoles = roles;
                    break;
                }
            }

            // If no rule matches, deny access
            if (!allowedRoles) {
                return new Response(
                    JSON.stringify({ error: 'Access denied - No rule for this path' }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }

            // Check if user has required role
            if (!allowedRoles.includes(userData.role)) {
                return new Response(
                    JSON.stringify({
                        error: `Access denied - ${userData.role} role cannot access ${path}`,
                        required: allowedRoles,
                        current: userData.role
                    }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }

            // User is authorized, proceed to handler
            req.user = userData;
            return handler(req, ...args);
        };
    };
}

/**
 * Pre-configured middleware for common path patterns
 */
export const pathAccessControl = {
    // Admin-only paths
    admin: createPathMiddleware({
        '/api/admin': ['admin'],
        '/api/admin/create-user': ['admin'],
        '/api/users/admin': ['admin'],
        '/api/reports': ['admin'],
        '/api/departments': ['admin'], // POST is admin-only, GET is public
        '/api/admin/': ['admin']
    }),

    // Department staff or admin paths
    department: createPathMiddleware({
        '/api/department/': ['department', 'admin']
    }),

    // Municipal staff or admin paths
    municipal: createPathMiddleware({
        '/api/municipal/': ['municipal', 'admin']
    }),

    // Citizen-only paths
    citizen: createPathMiddleware({
        '/api/citizen/': ['citizen']
    }),

    // Authenticated users only (any role)
    authenticated: createPathMiddleware({
        '/api/issues': ['citizen', 'department', 'municipal', 'admin'],
        '/api/citizen-engagement': ['citizen', 'department', 'municipal', 'admin'],
        '/api/upload': ['citizen', 'department', 'municipal', 'admin'],
        '/api/notifications': ['citizen', 'department', 'municipal', 'admin'],
        '/api/stats': ['citizen', 'department', 'municipal', 'admin']
    })
};

/**
 * Enhanced role middleware with department validation
 */
export function strictRoleMiddleware(allowedRoles) {
    return (handler) => {
        return async (req, ...args) => {
            const userData = await getTokenData();

            if (!userData) {
                return new Response(
                    JSON.stringify({ error: 'Unauthorized - No authentication token' }),
                    { status: 401, headers: { 'Content-Type': 'application/json' } }
                );
            }

            if (!allowedRoles.includes(userData.role)) {
                return new Response(
                    JSON.stringify({
                        error: `Unauthorized - ${userData.role} role not allowed`,
                        allowed: allowedRoles
                    }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }

            // Additional validation for department staff
            if (userData.role === 'department' && !userData.department) {
                return new Response(
                    JSON.stringify({ error: 'Department staff user has no department assigned' }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }

            req.user = userData;
            return handler(req, ...args);
        };
    };
}

/**
 * Utility to check if user can access specific resource
 */
export function canAccess(userRole, resourceType) {
    const accessMap = {
        'admin': ['admin'],
        'department': ['department', 'admin'],
        'municipal': ['municipal', 'admin'],
        'citizen': ['citizen']
    };

    return accessMap[resourceType]?.includes(userRole) || false;
}
