'use client';

import { useEffect } from 'react';
import { useUser } from '@/lib/contexts/UserContext';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

/**
 * DashboardProtection Component
 * Ensures users can only access their designated dashboard
 * Enforces role-based access control at the page level
 */
export default function DashboardProtection({ children, requiredRole }) {
    const { user, loading, isInitialized } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isInitialized || loading) return;

        // Not logged in
        if (!user) {
            toast.error('Authentication required');
            router.replace('/login');
            return;
        }

        // Check role-based access
        const userRole = user.role;
        
        // Admin can access everything
        if (userRole === 'admin') {
            return;
        }

        // Check if user is trying to access wrong dashboard
        if (requiredRole && userRole !== requiredRole) {
            const correctDashboard = getDashboardForRole(userRole);
            toast.error(`Access denied. You don't have permission to access this page.`);
            router.replace(correctDashboard);
            return;
        }

        // Additional checks for department staff
        if (userRole === 'department' && !user.department) {
            toast.error('Department staff user has no department assigned');
            router.replace('/login');
            return;
        }

    }, [user, loading, isInitialized, requiredRole, router, pathname]);

    // Show loading while checking
    if (loading || !isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
                <div className="text-lg text-contrast-secondary">
                    Verifying access...
                </div>
            </div>
        );
    }

    // Show nothing if user is not authorized yet
    if (!user) {
        return null;
    }

    // Check role match
    if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
        return null;
    }

    return children;
}

// Helper function
function getDashboardForRole(role) {
    switch (role) {
        case 'admin': return '/admin/dashboard';
        case 'municipal': return '/municipal/dashboard';
        case 'department': return '/department/dashboard';
        case 'citizen': return '/citizen/dashboard';
        default: return '/citizen/dashboard';
    }
}
