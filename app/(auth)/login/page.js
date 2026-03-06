'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/contexts/UserContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

/* ============================================================
   PAGE A2: LOGIN PAGE
   Route:     /login
   File:      app/(auth)/login/page.js
   Access:    PUBLIC — redirect to dashboard if already logged in
   Spec:      SYSTEM_FEATURES_MASTER.md Section A2
   ============================================================ */

export default function LoginPage() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { user, login } = useUser();
    const router = useRouter();

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (user) {
            const dashboardMap = {
                'admin': '/admin/dashboard',
                'SYSTEM_ADMIN': '/admin/dashboard',
                'municipal': '/municipal/dashboard',
                'DEPARTMENT_MANAGER': '/municipal/dashboard',
                'department': '/department/dashboard',
                'FIELD_OFFICER': '/department/dashboard',
                'citizen': '/citizen/dashboard',
                'CITIZEN': '/citizen/dashboard',
                'commissioner': '/commissioner/dashboard',
                'MUNICIPAL_COMMISSIONER': '/commissioner/dashboard',
            };
            router.replace(dashboardMap[user.role] || '/citizen/dashboard');
        }
    }, [user, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(formData);

        if (!result.success) {
            setError(result.error);
            toast.error(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-page px-4">
            {/* Card: bg-[#1A1A1A] rounded-[20px] border border-[#333333] p-8 max-w-md */}
            <div className="w-full max-w-md animate-fade-in">
                <div className="bg-card rounded-card border border-border p-8">
                    {/* Title */}
                    <h2 className="text-2xl font-bold text-white text-center mb-8">
                        Sign In
                    </h2>

                    {/* Error Banner */}
                    {error && (
                        <div className="error-banner mb-6 animate-fade-in">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="login-email" className="text-xs text-text-secondary uppercase tracking-widest mb-1.5 block font-medium">
                                Email
                            </label>
                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="w-full bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-3 focus:border-gold focus:outline-none transition-colors"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Password Field with eye toggle */}
                        <div>
                            <label htmlFor="login-password" className="text-xs text-text-secondary uppercase tracking-widest mb-1.5 block font-medium">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    minLength={6}
                                    className="w-full bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-3 pr-12 focus:border-gold focus:outline-none transition-colors"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                {/* Eye icon — absolute right-3 top-3 text-[#666666] */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors focus:outline-none"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Sign In Button — bg-[#F5A623] text-black rounded-full w-full */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-gold w-full py-3 text-base mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Create account link — text-[#F5A623] hover:underline */}
                    <p className="text-center mt-6 text-sm text-text-secondary">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-gold hover:underline font-medium">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}