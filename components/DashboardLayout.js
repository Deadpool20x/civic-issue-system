'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/lib/contexts/UserContext';

export default function DashboardLayout({ children }) {
    const { user, loading, logout } = useUser();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
                <div className="text-lg text-contrast-secondary">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
                <div className="text-lg text-contrast-secondary">Please log in to access this page.</div>
            </div>
        );
    }

    if (!user.role) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
                <div className="text-lg text-status-error">User role not found. Please contact administrator.</div>
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
        <div className="min-h-screen bg-neutral-bg flex text-contrast-primary overflow-hidden">
            {/* Mobile Sidebar Overlay - Only show on mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-contrast-primary/50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Fixed width with proper responsive behavior */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-neutral-surface border-r border-neutral-border flex flex-col transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:z-auto lg:opacity-100 lg:w-64 lg:block ${isSidebarOpen ? 'translate-x-0 opacity-100 block' : '-translate-x-full opacity-0 hidden lg:translate-x-0 lg:opacity-100 lg:block'
                    }`}
            >
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-center border-b border-neutral-border bg-brand-primary/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h1 className="text-lg font-bold text-contrast-primary">Civic System</h1>
                    </div>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {navigation[user.role] && navigation[user.role].map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center px-4 py-3 text-contrast-secondary hover:bg-brand-soft/20 hover:text-brand-primary rounded-xl group transition-all duration-200 font-medium"
                            onClick={() => setIsSidebarOpen(false)} // Close sidebar on mobile when link clicked
                        >
                            <div className="p-1 rounded-md mr-3 transition-colors">
                                <Image
                                    src={`/${item.icon}.svg`}
                                    alt={item.name}
                                    width={16}
                                    height={16}
                                    className="opacity-50 group-hover:opacity-100 group-hover:text-brand-primary"
                                />
                            </div>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Sidebar Footer - User Info & Logout */}
                <div className="p-4 border-t border-neutral-border bg-neutral-bg/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand-soft flex items-center justify-center">
                                <span className="text-brand-primary font-semibold text-sm">
                                    {(user?.name || 'U').charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-semibold text-contrast-primary">{user?.name || 'User'}</p>
                                <p className="text-xs text-contrast-light capitalize">{user?.role || 'Role'}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="text-sm text-contrast-light hover:text-status-error px-3 py-2 rounded-lg hover:bg-status-error/10 transition-colors font-medium"
                            title="Logout"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-0 transition-all duration-300">
                {/* Sticky Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-neutral-border bg-neutral-surface px-4 shadow-sm sm:px-6 lg:px-8">
                    <button
                        type="button"
                        className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-lg text-contrast-light hover:text-brand-primary hover:bg-brand-soft/20 transition-colors z-50"
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
                        <h2 className="text-xl font-semibold text-contrast-primary">Dashboard</h2>
                    </div>
                </header>

                {/* Main Content - Scrollable area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="px-4 pb-8 pt-16 sm:px-6 lg:px-8 lg:pt-6">
                        <div className="mx-auto max-w-7xl">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
