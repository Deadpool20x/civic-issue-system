'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/lib/contexts/UserContext';

export default function DashboardLayout({ children }) {
    const { user, loading, logout } = useUser();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Show loading state if still loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-lg text-gray-600">Loading...</div>
            </div>
        );
    }

    // If no user after loading, don't render dashboard content
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-lg text-gray-600">Please log in to access this page.</div>
            </div>
        );
    }

    // If user exists but role is not defined, show error
    if (!user.role) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-lg text-red-600">User role not found. Please contact administrator.</div>
            </div>
        );
    }

    const navigation = {
        citizen: [
            { name: 'Dashboard', href: '/citizen/dashboard', icon: 'window' },
            { name: 'Report Issue', href: '/citizen/report', icon: 'file' },
            { name: 'My Issues', href: '/citizen/dashboard?filter=my-issues', icon: 'globe' }
        ],
        municipal: [
            { name: 'Dashboard', href: '/municipal/dashboard', icon: 'window' },
            { name: 'All Issues', href: '/municipal/dashboard?filter=all', icon: 'globe' },
            { name: 'Departments', href: '/municipal/departments', icon: 'file' }
        ],
        admin: [
            { name: 'Dashboard', href: '/admin/dashboard', icon: 'window' },
            { name: 'Users', href: '/admin/users', icon: 'file' },
            { name: 'Departments', href: '/admin/departments', icon: 'globe' },
            { name: 'Reports', href: '/admin/reports', icon: 'file' }
        ],
        department: [
            { name: 'Dashboard', href: '/department/dashboard', icon: 'window' },
            { name: 'Assigned Issues', href: '/department/dashboard?filter=assigned', icon: 'file' }
        ]
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-sm shadow-xl border-r border-gray-200 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
            >
                <div className="h-full flex flex-col">
                    <div className="h-16 flex items-center justify-center border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h1 className="text-lg font-bold text-white">Civic System</h1>
                        </div>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        {navigation[user.role] && navigation[user.role].map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg group transition-all duration-200 font-medium"
                            >
                                <div className="p-1 rounded-md bg-gray-100 group-hover:bg-indigo-100 mr-3 transition-colors">
                                    <Image
                                        src={`/${item.icon}.svg`}
                                        alt={item.name}
                                        width={16}
                                        height={16}
                                        className="text-gray-500 group-hover:text-indigo-600"
                                    />
                                </div>
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                        {(user?.name || 'U').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                                    <p className="text-xs text-gray-600 capitalize">{user?.role || 'Role'}</p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="text-sm text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium"
                                title="Logout"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64 flex flex-col">
                <div className="sticky top-0 z-10 flex items-center gap-4 h-16 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 px-4">
                    <button
                        type="button"
                        className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                            />
                        </svg>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
                    </div>
                </div>

                <main className="flex-1 md:ml-64 px-6 lg:px-8 xl:px-10 pt-0">
                    <div className="max-w-7xl 2xl:max-w-[88rem] mx-auto pt-0">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile sidebar backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}