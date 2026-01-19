'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DepartmentLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            try {
                // Check if user is authenticated and is department staff
                const response = await fetch('/api/auth/me');
                if (!response.ok) {
                    router.push('/auth/login');
                    return;
                }

                const userData = await response.json();
                
                if (userData.role !== 'department') {
                    router.push('/auth/login');
                    return;
                }

                setUser(userData);
            } catch (error) {
                console.error('Auth check failed:', error);
                router.push('/auth/login');
            } finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const handleLogout = async () => {
        try {
            // Clear token/session
            await fetch('/api/auth/logout', { method: 'POST' });
            
            // Clear local storage
            localStorage.clear();
            
            // Redirect to login
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout error:', error);
            // Force redirect anyway
            router.push('/login');
            router.refresh();
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
                {/* Logo/Title */}
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-blue-600">Department Portal</h1>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 p-4 space-y-1">
                    <Link
                        href="/department/dashboard"
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                            ${pathname === '/department/dashboard'
                                ? 'bg-blue-600 text-white border-l-4 border-blue-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:border-l-4 hover:border-blue-600'
                            }
                        `}
                    >
                        <span>📊</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        href="/department/issues"
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                            ${pathname === '/department/issues'
                                ? 'bg-blue-600 text-white border-l-4 border-blue-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:border-l-4 hover:border-blue-600'
                            }
                        `}
                    >
                        <span>📋</span>
                        <span>Assigned Issues</span>
                    </Link>
                    <Link
                        href="/department/resolved"
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                            ${pathname === '/department/resolved'
                                ? 'bg-blue-600 text-white border-l-4 border-blue-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:border-l-4 hover:border-blue-600'
                            }
                        `}
                    >
                        <span>✅</span>
                        <span>Resolved Issues</span>
                    </Link>
                    <Link
                        href="/department/stats"
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                            ${pathname === '/department/stats'
                                ? 'bg-blue-600 text-white border-l-4 border-blue-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:border-l-4 hover:border-blue-600'
                            }
                        `}
                    >
                        <span>📈</span>
                        <span>Statistics</span>
                    </Link>
                    <Link
                        href="/department/profile"
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                            ${pathname === '/department/profile'
                                ? 'bg-blue-600 text-white border-l-4 border-blue-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:border-l-4 hover:border-blue-600'
                            }
                        `}
                    >
                        <span>👤</span>
                        <span>Profile</span>
                    </Link>
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                            {user?.name?.charAt(0)?.toUpperCase() || 'D'}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{user?.name || 'Department Staff'}</p>
                            <p className="text-sm text-gray-500">{user?.department?.name || 'Your Department'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-60 bg-gray-50 min-h-screen">
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
