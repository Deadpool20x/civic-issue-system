'use client';

import { useEffect } from 'react';
import { useUser } from '@/lib/contexts/UserContext';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

/* ============================================================
   ROLE MAPPING — Normalize DB roles to check against allowedRoles
   
   DB can store roles in different formats:
     'citizen'     or 'CITIZEN'
     'department'  or 'FIELD_OFFICER'
     'municipal'   or 'DEPARTMENT_MANAGER'
     'commissioner' or 'MUNICIPAL_COMMISSIONER'
     'admin'       or 'SYSTEM_ADMIN'
   
   Both formats are accepted in allowedRoles arrays.
   ============================================================ */

const ROLE_ALIASES = {
    'citizen': ['citizen', 'CITIZEN'],
    'CITIZEN': ['citizen', 'CITIZEN'],
    'department': ['department', 'DEPARTMENT_MANAGER'],
    'FIELD_OFFICER': ['field_officer', 'FIELD_OFFICER'],
    'field_officer': ['field_officer', 'FIELD_OFFICER'],
    'DEPARTMENT_MANAGER': ['department', 'DEPARTMENT_MANAGER'],
    'municipal': ['municipal', 'MUNICIPAL_COMMISSIONER'],
    'commissioner': ['commissioner', 'MUNICIPAL_COMMISSIONER'],
    'MUNICIPAL_COMMISSIONER': ['commissioner', 'MUNICIPAL_COMMISSIONER'],
    'admin': ['admin', 'SYSTEM_ADMIN'],
    'SYSTEM_ADMIN': ['admin', 'SYSTEM_ADMIN'],
};

function roleMatches(userRole, allowedRoles) {
    if (!userRole || !allowedRoles || allowedRoles.length === 0) return false;

    // Get all aliases for the user's role
    const aliases = ROLE_ALIASES[userRole] || [userRole];

    // Check if any alias is in the allowed list
    return aliases.some(alias => allowedRoles.includes(alias));
}

/* ============================================================
   DASHBOARD ROUTING — Per SYSTEM_FEATURES_MASTER.md
   ============================================================ */
function getDashboardForRole(role) {
    const map = {
        'admin': '/admin/dashboard',
        'SYSTEM_ADMIN': '/admin/dashboard',
        'municipal': '/commissioner/dashboard',
        'DEPARTMENT_MANAGER': '/department/dashboard',
        'department': '/department/dashboard',
        'FIELD_OFFICER': '/field-officer/dashboard',
        'field_officer': '/field-officer/dashboard',
        'citizen': '/citizen/dashboard',
        'CITIZEN': '/citizen/dashboard',
        'commissioner': '/commissioner/dashboard',
        'MUNICIPAL_COMMISSIONER': '/commissioner/dashboard',
    };
    return map[role] || '/citizen/dashboard';
}

/**
 * DashboardProtection Component
 * 
 * Usage (per SYSTEM_FEATURES_MASTER.md):
 *   <DashboardProtection allowedRoles={['CITIZEN', 'citizen']}>
 *   <DashboardProtection allowedRoles={['FIELD_OFFICER', 'department']}>
 *   <DashboardProtection allowedRoles={['DEPARTMENT_MANAGER', 'municipal']}>
 *   <DashboardProtection allowedRoles={['MUNICIPAL_COMMISSIONER']}>
 *   <DashboardProtection allowedRoles={['SYSTEM_ADMIN', 'admin']}>
 * 
 * Also supports legacy single-role via requiredRole prop.
 * 
 * IMPORTANT: SYSTEM_ADMIN does NOT have bypass access to other dashboards.
 * Admin is BLOCKED from issue endpoints per spec Section F.
 */
export default function DashboardProtection({ children, allowedRoles, requiredRole }) {
    const { user, loading } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    // Support both allowedRoles array and legacy requiredRole string
    const effectiveAllowedRoles = allowedRoles || (requiredRole ? [requiredRole] : []);

    useEffect(() => {
        if (loading) return;

        // Not logged in → redirect to login
        if (!user) {
            toast.error('Authentication required');
            router.replace('/login');
            return;
        }

        // No allowed roles specified → allow any authenticated user
        if (effectiveAllowedRoles.length === 0) return;

        // Check role match
        if (!roleMatches(user.role, effectiveAllowedRoles)) {
            const correctDashboard = getDashboardForRole(user.role);
            toast.error("Access denied. Redirecting to your dashboard.");
            router.replace(correctDashboard);
            return;
        }

    }, [user, loading, router, pathname, effectiveAllowedRoles]);

    /* ── Loading state ── */
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-page">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                    <span className="text-sm text-text-secondary">Verifying access...</span>
                </div>
            </div>
        );
    }

    /* ── Not authenticated ── */
    if (!user) {
        return null;
    }

    /* ── Not authorized ── */
    if (effectiveAllowedRoles.length > 0 && !roleMatches(user.role, effectiveAllowedRoles)) {
        return null;
    }

    return children;
}

// Export helper for use in other components (e.g., landing page redirect)
export { getDashboardForRole };
