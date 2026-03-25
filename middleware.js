/* global TextEncoder */
import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const ROLE_ROUTES = {
    // Lowercase roles (from JWT)
    'citizen': '/citizen/dashboard',
    'field_officer': '/field-officer/dashboard',
    'department_manager': '/department/dashboard',
    'department': '/department/dashboard',
    'municipal_commissioner': '/commissioner/dashboard',
    'commissioner': '/commissioner/dashboard',
    'system_admin': '/admin/dashboard',
    'admin': '/admin/dashboard',
    // Uppercase roles (from some auth providers)
    'CITIZEN': '/citizen/dashboard',
    'FIELD_OFFICER': '/field-officer/dashboard',
    'DEPARTMENT_MANAGER': '/department/dashboard',
    'MUNICIPAL_COMMISSIONER': '/commissioner/dashboard',
    'COMMISSIONER': '/commissioner/dashboard',
    'SYSTEM_ADMIN': '/admin/dashboard',
    'ADMIN': '/admin/dashboard',
    // Legacy aliases
    'municipal': '/commissioner/dashboard',
}

const ROUTE_PERMISSIONS = {
    '/citizen': ['citizen', 'CITIZEN'],
    '/field-officer': ['field_officer', 'FIELD_OFFICER'],
    '/department': ['department', 'field_officer', 'FIELD_OFFICER', 'department_manager', 'DEPARTMENT_MANAGER'],
    '/commissioner': ['municipal', 'commissioner', 'municipal_commissioner', 'MUNICIPAL_COMMISSIONER', 'COMMISSIONER'],
    '/municipal': ['municipal', 'commissioner', 'municipal_commissioner', 'MUNICIPAL_COMMISSIONER', 'COMMISSIONER'],
    '/admin': ['admin', 'system_admin', 'SYSTEM_ADMIN', 'ADMIN'],
}

const PUBLIC_PATHS = [
    '/', '/login', '/register',
    '/forgot-password', '/reset-password',
    '/track', '/map', '/privacy-policy',
    '/terms-of-service', '/know-your-district',
    '/public-dashboard',
]

export async function middleware(request) {
    const { pathname } = request.nextUrl

    // Allow public paths and static assets
    if (
        PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/')) ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/images') ||
        pathname.startsWith('/icons') ||
        pathname.startsWith('/favicon') ||
        pathname.startsWith('/api/issues/public') ||
        pathname.startsWith('/api/issues/track') ||
        pathname.startsWith('/api/public-dashboard') ||
        pathname.startsWith('/api/health')
    ) {
        return NextResponse.next()
    }

    // Get token from cookie
    const token = request.cookies.get('token')?.value

    if (!token) {
        // API routes return 401, page routes redirect to login
        if (pathname.startsWith('/api/')) {
            return NextResponse.json(
                { error: 'Unauthorized - No authentication token' },
                { status: 401 }
            )
        }
        return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET)
        const { payload } = await jwtVerify(token, secret)
        const role = payload.role

        // Check route permissions for page routes
        if (!pathname.startsWith('/api/')) {
            for (const [routePrefix, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
                if (pathname.startsWith(routePrefix)) {
                    if (!allowedRoles.includes(role)) {
                        const correctRoute = ROLE_ROUTES[role] || '/login'
                        return NextResponse.redirect(new URL(correctRoute, request.url))
                    }
                    break
                }
            }
        }

        return NextResponse.next()
    } catch {
        // Invalid or expired token
        if (pathname.startsWith('/api/')) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid or expired token' },
                { status: 401 }
            )
        }
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('token')
        return response
    }
}

export const config = {
    matcher: [
        '/citizen/:path*',
        '/field-officer/:path*',
        '/department/:path*',
        '/commissioner/:path*',
        '/municipal/:path*',
        '/admin/:path*',
        '/api/issues/:path*',
        '/api/admin/:path*',
        '/api/commissioner/:path*',
        '/api/departments/:path*',
        '/api/users/:path*',
        '/api/upload/:path*',
        '/api/notifications/:path*',
    ]
}
