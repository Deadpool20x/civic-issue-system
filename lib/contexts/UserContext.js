'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isInitialized && !isLoggingOut) {
            checkUser();
        }
    }, [isInitialized, isLoggingOut]);

    async function checkUser() {
        try {
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
            console.error('Error checking user session:', error);
            setUser(null);

            // Only redirect on protected paths, not on network errors for public pages
            const protectedPaths = ['/citizen', '/municipal', '/admin', '/department', '/issues'];
            const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

            if (isProtectedPath) {
                router.replace('/login');
            }
        } finally {
            setLoading(false);
            setIsInitialized(true);
        }
    }

    const login = async (credentials) => {
        try {
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
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        try {
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
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        setIsLoggingOut(true);
        try {
            // Clear user state immediately
            setUser(null);
            setLoading(true);

            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Force clear any cached data and redirect
            setUser(null);
            setLoading(false);
            setIsInitialized(false);
            setIsLoggingOut(false);

            // Clear any browser cache
            if (typeof window !== 'undefined') {
                // Clear any local storage or session storage if used
                localStorage.clear();
                sessionStorage.clear();
            }

            // Force page reload to ensure clean state
            setTimeout(() => {
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }, 100);
        }
    };

    // Don't show loading for too long or redirect loops
    if (loading && !isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-lg text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <UserContext.Provider value={{ user, loading, login, register, logout, checkUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}