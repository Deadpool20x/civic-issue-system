'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/lib/contexts/UserContext';
// import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from '@/lib/useStaticTranslation';

/* ============================================================
   NAVIGATION CONFIG — Per role, per SYSTEM_FEATURES_MASTER.md
   
   citizen:      B1 sidebar spec
   department:   C1 sidebar spec (Field Officer)
   municipal:    D1 sidebar spec (Department Manager)
   commissioner: E1 sidebar spec (Municipal Commissioner)
   admin:        F1 sidebar spec (System Admin)
   ============================================================ */

const NAV_ICONS = {
    dashboard: '📊',
    report: '📝',
    issues: '📋',
    resolved: '✅',
    performance: '📈',
    profile: '👤',
    map: '🗺️',
    public: '🌐',
    departments: '🏢',
    sla: '⏰',
    users: '👥',
    reports: '📄',
    analytics: '📉',
    create: '➕',
    citymap: '🗺️',
};

const navigation = {
    /* ── CITIZEN (Section B) ── */
    citizen: [
        { name: 'Dashboard', href: '/citizen/dashboard', icon: 'dashboard' },
        { name: 'Report Issue', href: '/citizen/report', icon: 'report' },
        { name: 'My Issues', href: '/citizen/dashboard?filter=mine', icon: 'issues' },
        { name: 'Map', href: '/map', icon: 'map' },
        { name: 'Public', href: '/public-dashboard', icon: 'public' },
    ],

    /* ── FIELD OFFICER (Section C) ── */
    department: [
        { name: 'Dashboard', href: '/department/dashboard', icon: 'dashboard' },
        { name: 'My Issues', href: '/department/issues', icon: 'issues' },
        { name: 'Resolved', href: '/department/resolved', icon: 'resolved' },
        { name: 'Performance', href: '/department/stats', icon: 'performance' },
        { name: 'Profile', href: '/department/profile', icon: 'profile' },
    ],

    /* ── DEPARTMENT MANAGER (for /department routes) ── */
    dept_manager: [
        { name: 'Dashboard', href: '/department/dashboard', icon: 'dashboard' },
        { name: 'Issues', href: '/department/issues', icon: 'issues' },
        { name: 'My Officers', href: '/department/departments', icon: 'departments' },
        { name: 'SLA Monitor', href: '/department/sla-monitoring', icon: 'sla' },
        { name: 'Profile', href: '/department/profile', icon: 'profile' },
    ],

    /* ── DEPARTMENT MANAGER (Section D) ── */
    municipal: [
        { name: 'Dashboard', href: '/municipal/dashboard', icon: 'dashboard' },
        { name: 'My Officers', href: '/municipal/departments', icon: 'departments' },
        { name: 'SLA Monitoring', href: '/municipal/sla-dashboard', icon: 'sla' },
    ],

    /* ── MUNICIPAL COMMISSIONER (Section E) ── */
    commissioner: [
        { name: 'Dashboard', href: '/commissioner/dashboard', icon: 'dashboard' },
        { name: 'City Map', href: '/map', icon: 'citymap' },
        { name: 'All Issues', href: '/commissioner/issues', icon: 'issues' },
        { name: 'Departments', href: '/municipal/departments', icon: 'departments' },
        { name: 'Issues Master', href: '/admin/issues', icon: 'reports' },
        { name: 'Create Staff', href: '/commissioner/create-staff', icon: 'create' },
    ],

    /* ── SYSTEM ADMIN (Section F) ── */
    admin: [
        { name: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
        { name: 'Users', href: '/admin/users', icon: 'users' },
        { name: 'Create User', href: '/admin/create-user', icon: 'create' },
        { name: 'Departments', href: '/admin/departments', icon: 'departments' },
        { name: 'All Issues', href: '/admin/issues', icon: 'reports' },
        { name: 'Analytics', href: '/admin/analytics', icon: 'analytics' },
    ],
};

/* ============================================================
   ROLE DISPLAY NAMES
   ============================================================ */
const ROLE_LABELS = {
    citizen: 'Citizen',
    department: 'Field Officer',
    municipal: 'Dept. Manager',
    commissioner: 'Commissioner',
    admin: 'System Admin',
    CITIZEN: 'Citizen',
    FIELD_OFFICER: 'Field Officer',
    DEPARTMENT_MANAGER: 'Dept. Manager',
    MUNICIPAL_COMMISSIONER: 'Commissioner',
    SYSTEM_ADMIN: 'System Admin',
};

/* ============================================================
   ROLE → NAV KEY MAPPING
   The DB stores roles in different formats, normalize here
   ============================================================ */
function getNavKey(role, pathname) {
    // Check if pathname starts with /department - use dept_manager nav
    if (pathname && pathname.startsWith('/department')) {
        return 'dept_manager';
    }

    const map = {
        'citizen': 'citizen',
        'CITIZEN': 'citizen',
        'department': 'department',
        'FIELD_OFFICER': 'department',
        'municipal': 'municipal',
        'DEPARTMENT_MANAGER': 'municipal',
        'commissioner': 'commissioner',
        'MUNICIPAL_COMMISSIONER': 'commissioner',
        'admin': 'admin',
        'SYSTEM_ADMIN': 'admin',
    };
    return map[role] || 'citizen';
}

/* ============================================================
   DASHBOARD LAYOUT COMPONENT
   ============================================================ */
export default function DashboardLayout({ children }) {
    const { user, loading, logout } = useUser();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { t } = useTranslation();

    /* ── Loading state ── */
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-page">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                    <span className="text-sm text-text-secondary">{t('common.loading')}</span>
                </div>
            </div>
        );
    }

    /* ── Not logged in ── */
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-page">
                <div className="text-text-secondary">{t('auth.pleaseLogIn', 'Please log in to access this page.')}</div>
            </div>
        );
    }

    /* ── No role ── */
    if (!user.role) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-page">
                <div className="text-red-400">{t('auth.roleNotFound', 'User role not found. Please contact administrator.')}</div>
            </div>
        );
    }

    const navKey = getNavKey(user.role, pathname);
    const navItems = navigation[navKey] || [];
    const roleLabel = t(`roles.${user.role.toLowerCase()}`) || ROLE_LABELS[user.role] || user.role;
    const userInitial = (user?.name || 'U').charAt(0).toUpperCase();

    /* ── Check if a nav item is active ── */
    const isActive = (href) => {
        const basePath = href.split('?')[0];
        return pathname === basePath || pathname.startsWith(basePath + '/');
    };

    return (
        <div className="min-h-screen bg-page flex overflow-hidden">
            {/* ── Mobile overlay ── */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-navbar flex flex-col transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Sidebar Header — Logo */}
                <div className="h-16 flex items-center px-5 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gold rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-white tracking-wide">{t('nav.title', 'Civic System')}</h1>
                            <p className="text-[10px] text-text-muted uppercase tracking-widest">{roleLabel}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${active
                                    ? 'bg-gold/10 text-gold border border-gold/20'
                                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                                    }`}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <span className="text-base leading-none w-5 text-center">
                                    {NAV_ICONS[item.icon] || '📄'}
                                </span>
                                <span>{t(`nav.sidebar.${item.icon}`, item.name)}</span>
                                {active && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer — User Info + Logout */}
                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3">
                        {/* Avatar circle — gold bg, black text, initials */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                            <span className="text-black font-bold text-sm">{userInitial}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user?.name || t('common.user', 'User')}</p>
                            <p className="text-xs text-text-muted truncate">{roleLabel}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="text-text-muted hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                            title="Logout"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Main Content Area ── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top header bar */}
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-navbar/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
                    {/* Mobile hamburger */}
                    <button
                        type="button"
                        className="lg:hidden -ml-1 p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>

                    {/* Spacer — pages can add their own header content */}
                    <div className="flex-1" />

                    {/* Language Selector */}
                    {/* <LanguageSelector /> */}

                    {/* Notification bell placeholder */}
                    <button className="p-2 rounded-lg text-text-secondary hover:text-gold hover:bg-gold/10 transition-colors relative">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </button>

                    {/* User avatar (mobile) */}
                    <div className="lg:hidden flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
                            <span className="text-black font-bold text-xs">{userInitial}</span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="px-4 py-6 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
