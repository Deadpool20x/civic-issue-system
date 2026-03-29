import { getTokenData } from './auth';

// Normalize role for consistent comparison
function normalizeRole(role) {
    if (!role) return null;
    const upperRole = role.toUpperCase();
    
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
            // Normalize role for consistent comparison
            const normalizedUserRole = normalizeRole(userData.role);
            const isAllowed = allowedRoles.some(ar => {
                const normalizedAr = normalizeRole(ar);
                return normalizedUserRole === normalizedAr || 
                       userData.role === ar ||
                       (ar || '').toUpperCase() === normalizedUserRole;
            });
            
            if (!isAllowed) {
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
        '/api/admin': ['admin', 'SYSTEM_ADMIN', 'MUNICIPAL_COMMISSIONER'],
        '/api/admin/create-user': ['admin', 'SYSTEM_ADMIN', 'MUNICIPAL_COMMISSIONER'],
        '/api/users/admin': ['admin', 'SYSTEM_ADMIN', 'MUNICIPAL_COMMISSIONER'],
        '/api/reports': ['admin', 'SYSTEM_ADMIN', 'MUNICIPAL_COMMISSIONER'],
        '/api/departments': ['admin', 'SYSTEM_ADMIN', 'municipal', 'MUNICIPAL_COMMISSIONER'], // POST is admin-only, GET is open to municipal roles
        '/api/admin/': ['admin', 'SYSTEM_ADMIN', 'MUNICIPAL_COMMISSIONER']
    }),

    // Department staff or admin or commissioner paths
    department: createPathMiddleware({
        '/api/department/': ['department', 'DEPARTMENT_MANAGER', 'admin', 'SYSTEM_ADMIN', 'commissioner', 'MUNICIPAL_COMMISSIONER']
    }),

    // Municipal staff or admin or commissioner paths
    municipal: createPathMiddleware({
        '/api/municipal/': ['municipal', 'MUNICIPAL_COMMISSIONER', 'admin', 'SYSTEM_ADMIN', 'commissioner']
    }),

    // Citizen-only paths
    citizen: createPathMiddleware({
        '/api/citizen/': ['citizen', 'CITIZEN']
    }),

    // Authenticated users only (any role)
    authenticated: createPathMiddleware({
        '/api/issues': ['citizen', 'CITIZEN', 'department', 'DEPARTMENT_MANAGER', 'municipal', 'MUNICIPAL_COMMISSIONER', 'admin', 'SYSTEM_ADMIN', 'commissioner'],
        '/api/citizen-engagement': ['citizen', 'CITIZEN', 'department', 'DEPARTMENT_MANAGER', 'municipal', 'MUNICIPAL_COMMISSIONER', 'admin', 'SYSTEM_ADMIN', 'commissioner'],
        '/api/upload': ['citizen', 'CITIZEN', 'department', 'DEPARTMENT_MANAGER', 'municipal', 'MUNICIPAL_COMMISSIONER', 'admin', 'SYSTEM_ADMIN', 'commissioner'],
        '/api/notifications': ['citizen', 'CITIZEN', 'department', 'DEPARTMENT_MANAGER', 'municipal', 'MUNICIPAL_COMMISSIONER', 'admin', 'SYSTEM_ADMIN', 'commissioner'],
        '/api/stats': ['citizen', 'CITIZEN', 'department', 'DEPARTMENT_MANAGER', 'municipal', 'MUNICIPAL_COMMISSIONER', 'admin', 'SYSTEM_ADMIN', 'commissioner']
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

            // DEBUG: Log role check
            console.log('[DEBUG] strictRoleMiddleware - userData.role:', userData.role);
            console.log('[DEBUG] strictRoleMiddleware - allowedRoles:', allowedRoles);

            // Normalize role for consistent comparison
            const normalizedRole = normalizeRole(userData.role);
            const normalizedAllowedRoles = allowedRoles.map(r => normalizeRole(r) || r.toUpperCase());
            
            // Check both original and normalized roles
            const isAllowed = allowedRoles.includes(userData.role) || 
                              normalizedAllowedRoles.includes(normalizedRole) ||
                              allowedRoles.some(ar => (ar || '').toUpperCase() === normalizedRole);
            
            console.log('[DEBUG] strictRoleMiddleware - normalizedRole:', normalizedRole);
            console.log('[DEBUG] strictRoleMiddleware - isAllowed:', isAllowed);
            
            console.log('[DEBUG] strictRoleMiddleware - normalizedRole:', normalizedRole);
            console.log('[DEBUG] strictRoleMiddleware - isAllowed:', isAllowed);

            if (!isAllowed) {
                return new Response(
                    JSON.stringify({
                        error: `Unauthorized - ${userData.role} role not allowed`,
                        allowed: allowedRoles,
                        debug: { normalizedRole, normalizedAllowedRoles }
                    }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }

            // Additional validation for department staff
            // Only check if role is specifically 'department' (not admin, commissioner, etc.)
            const normalizedUserRole = normalizeRole(userData.role);
            if (normalizedUserRole === 'DEPARTMENT_MANAGER' && !userData.department && !userData.departmentId) {
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
        'department': ['department', 'admin', 'commissioner'],
        'municipal': ['municipal', 'admin', 'commissioner'],
        'citizen': ['citizen'],
        'commissioner': ['admin', 'commissioner']
    };

    return accessMap[resourceType]?.includes(userRole) || false;
}
