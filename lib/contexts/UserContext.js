'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const UserContext = createContext();

/**
 * Enhanced User Context with better error handling and state management
 */
export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();
    const pathname = usePathname();

    /**
     * Centralized error handler for auth operations
     */
    const handleAuthError = useCallback((error, context) => {
        console.error(`Auth error in ${context}:`, error);
        setError(error.message || 'Authentication error occurred');

        // Clear error after 5 seconds
        setTimeout(() => setError(null), 5000);
    }, []);

    /**
     * Check user authentication status
     */
    const checkUser = useCallback(async () => {
        try {
            setError(null);
            const response = await fetch('/api/auth/me', {
                credentials: 'include',
                cache: 'no-store'
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);

                // Only redirect if we're on auth pages and have a valid user
                if ((pathname === '/login' || pathname === '/register') && userData.role) {
                    router.replace(`/${userData.role}/dashboard`);
                }
            } else {
                setUser(null);

                // Only redirect to login if we're on protected pages
                const protectedPaths = ['/citizen', '/municipal', '/admin', '/department', '/issues'];
                const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

                if (isProtectedPath) {
                    router.replace('/login');
                }
            }
        } catch (error) {
            handleAuthError(error, 'checkUser');

            // Only redirect on protected paths for network errors
            const protectedPaths = ['/citizen', '/municipal', '/admin', '/department', '/issues'];
            const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

            if (isProtectedPath) {
                router.replace('/login');
            }
        } finally {
            setLoading(false);
            setIsInitialized(true);
        }
    }, [pathname, router, handleAuthError]);

    /**
     * Enhanced login with better error handling
     */
    const login = useCallback(async (credentials) => {
        try {
            setError(null);
            setLoading(true);

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Update user state and ensure proper initialization
            setUser(data.user);
            setLoading(false);
            setIsInitialized(true);

            router.replace(`/${data.user.role}/dashboard`);
            return { success: true };
        } catch (error) {
            handleAuthError(error, 'login');
            setLoading(false);
            return { success: false, error: error.message };
        }
    }, [router, handleAuthError]);

    /**
     * Enhanced register with better error handling
     */
    const register = useCallback(async (userData) => {
        try {
            setError(null);
            setLoading(true);

            // Clear any existing session first
            setUser(null);

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Update user state and ensure proper initialization
            setUser(data.user);
            setLoading(false);
            setIsInitialized(true);

            // Force immediate redirect without checking old session
            window.location.href = `/${data.user.role}/dashboard`;
            return { success: true };
        } catch (error) {
            handleAuthError(error, 'register');
            setLoading(false);
            return { success: false, error: error.message };
        }
    }, [handleAuthError]);

    /**
     * Enhanced logout with better cleanup
     */
    const logout = useCallback(async () => {
        setIsLoggingOut(true);
        try {
            // Clear user state immediately for better UX
            setUser(null);
            setLoading(true);
            setError(null);

            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
            // Continue with logout even if API call fails
        } finally {
            // Force clear any cached data and redirect
            setUser(null);
            setLoading(false);
            setIsInitialized(false);
            setIsLoggingOut(false);

            // Clear browser storage
            if (typeof window !== 'undefined') {
                try {
                    localStorage.clear();
                    sessionStorage.clear();
                } catch (storageError) {
                    console.warn('Failed to clear storage:', storageError);
                }
            }

            // Force page reload to ensure clean state
            setTimeout(() => {
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }, 100);
        }
    }, []);

    useEffect(() => {
        if (!isInitialized && !isLoggingOut) {
            checkUser();
        }
    }, [isInitialized, isLoggingOut, checkUser]);

    // Don't show loading for too long or redirect loops
    if (loading && !isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-lg text-gray-600">
                    {error ? `Error: ${error}` : 'Loading...'}
                </div>
            </div>
        );
    }

    return (
        <UserContext.Provider value={{
            user,
            loading,
            error,
            isInitialized,
            login,
            register,
            logout,
            checkUser,
            clearError: () => setError(null)
        }}>
            {children}
        </UserContext.Provider>
    );
}

/**
 * Enhanced useUser hook with error handling
 */
export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}