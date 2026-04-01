'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/contexts/UserContext';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

function LoginContent() {
    const [loginMode, setLoginMode] = useState('email'); // 'email' or 'mobile'
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { user } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const googleError = searchParams.get('error');

    // useRef so the guard never causes a re-render (which would re-run the
    // effect and call router.replace again, causing the throttle warning).
    const hasRedirected = useRef(false);

    useEffect(() => {
        // Guard: only redirect once, and only when user is loaded
        if (!user || hasRedirected.current) return;

        const dashboardMap = {
            // Uppercase roles (standard)
            'CITIZEN': '/citizen/dashboard',
            'FIELD_OFFICER': '/field-officer/dashboard',
            'DEPARTMENT_MANAGER': '/department/dashboard',
            'MUNICIPAL_COMMISSIONER': '/commissioner/dashboard',
            'COMMISSIONER': '/commissioner/dashboard',
            'SYSTEM_ADMIN': '/admin/dashboard',
            'ADMIN': '/admin/dashboard',
            // Lowercase roles (from JWT payload)
            'citizen': '/citizen/dashboard',
            'field_officer': '/field-officer/dashboard',
            'department_manager': '/department/dashboard',
            'department': '/department/dashboard',
            'municipal_commissioner': '/commissioner/dashboard',
            'commissioner': '/commissioner/dashboard',
            'system_admin': '/admin/dashboard',
            'admin': '/admin/dashboard',
        };

        const targetRoute = dashboardMap[user.role];
        if (!targetRoute) {
            console.error('❌ Unknown user role:', user.role);
            return;
        }

        // Mark as redirected BEFORE calling router.replace so that even if
        // React re-runs this effect synchronously, we only navigate once.
        hasRedirected.current = true;
        router.replace(targetRoute);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]); // ← intentionally omit `router`: its identity can change each
                // render in App Router and would re-trigger the effect in a loop.

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, password: formData.password })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Invalid email or password')
                setLoading(false)
                return
            }

            console.log('✅ Login successful! User data:', data.user)
            console.log('📝 Response headers:', Object.fromEntries(res.headers.entries()))

            const routes = {
                // Uppercase roles
                'CITIZEN': '/citizen/dashboard',
                'FIELD_OFFICER': '/field-officer/dashboard',
                'DEPARTMENT_MANAGER': '/department/dashboard',
                'MUNICIPAL_COMMISSIONER': '/commissioner/dashboard',
                'COMMISSIONER': '/commissioner/dashboard',
                'SYSTEM_ADMIN': '/admin/dashboard',
                'ADMIN': '/admin/dashboard',
                // Lowercase roles (from JWT)
                'citizen': '/citizen/dashboard',
                'field_officer': '/field-officer/dashboard',
                'department_manager': '/department/dashboard',
                'department': '/department/dashboard',
                'municipal_commissioner': '/commissioner/dashboard',
                'municipal': '/commissioner/dashboard',
                'commissioner': '/commissioner/dashboard',
                'system_admin': '/admin/dashboard',
                'admin': '/admin/dashboard',
            }

            const redirectTo = routes[data.user.role] || '/login'

            // Hard navigation forces a full page reload so UserContext
            // mounts fresh and reads the cookie that the login API just set.
            // This avoids any race between context state and router.push.
            console.log(`🚀 Redirecting to ${redirectTo} via hard navigation...`)
            window.location.href = redirectTo

        } catch (err) {
            console.error('Login error:', err)
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!phone || phone.length < 10) {
            toast.error('Please enter a valid phone number');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await res.json();

            if (res.ok) {
                setOtpSent(true);
                toast.success('Verification code sent to your mobile');
            } else {
                toast.error(data.error || 'Failed to send OTP');
            }
        } catch (_err) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            toast.error('Please enter the 6-digit code');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp })
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Login successful!');
                window.location.reload(); // Refresh to update context
            } else {
                toast.error(data.error || 'Invalid OTP');
            }
        } catch (_err) {
            toast.error('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-page px-4">
            <div className="w-full max-w-md animate-fade-in">
                <div className="bg-card rounded-card border border-border p-8">
                    <h2 className="text-2xl font-bold text-white text-center mb-6">
                        {loginMode === 'email' ? 'Sign In' : 'Mobile Login'}
                    </h2>

                    {/* Mode Toggle */}
                    <div className="flex bg-[#222222] p-1 rounded-full mb-8">
                        <button
                            onClick={() => { setLoginMode('email'); setOtpSent(false); }}
                            className={`flex-1 py-2 rounded-full text-xs font-bold transition
                                ${loginMode === 'email' ? 'bg-gold text-black' : 'text-[#AAAAAA] hover:text-white'}`}
                        >
                            EMAIL
                        </button>
                        <button
                            onClick={() => setLoginMode('mobile')}
                            className={`flex-1 py-2 rounded-full text-xs font-bold transition
                                ${loginMode === 'mobile' ? 'bg-gold text-black' : 'text-[#AAAAAA] hover:text-white'}`}
                        >
                            PHONE OTP
                        </button>
                    </div>

                    {error && (
                        <div className="error-banner mb-6 animate-fade-in">
                            {error}
                        </div>
                    )}

                    {googleError === 'StaffGoogleBlocked' && (
                        <div className="bg-red-500/20 border border-red-500/40 text-red-400 rounded-[12px] p-3 mb-6 text-sm">
                            Staff accounts cannot use Google sign-in.
                            Please use your email and password.
                        </div>
                    )}

                    {loginMode === 'email' ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="text-xs text-text-secondary uppercase tracking-widest mb-1.5 block font-medium">
                                    Email
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-3 focus:border-gold focus:outline-none transition-colors"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="text-xs text-text-secondary uppercase tracking-widest mb-1.5 block font-medium">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="w-full bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-3 pr-12 focus:border-gold focus:outline-none transition-colors"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                                    >
                                        {showPassword ? '👁️' : '🔒'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end mb-4">
                                <Link href="/forgot-password"
                                    className="text-text-secondary text-sm hover:text-gold transition">
                                    Forgot Password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-gold w-full py-3 text-base mt-2"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-5">
                            {!otpSent ? (
                                <form onSubmit={handleSendOTP} className="space-y-5">
                                    <div>
                                        <label className="text-xs text-text-secondary uppercase tracking-widest mb-1.5 block font-medium">
                                            Mobile Number
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666] font-bold">+91</span>
                                            <input
                                                type="tel"
                                                required
                                                pattern="[0-9]{10}"
                                                className="w-full bg-input border border-border rounded-input text-white placeholder:text-text-muted pl-14 pr-4 py-3 focus:border-gold focus:outline-none transition-colors"
                                                placeholder="9876543210"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </div>
                                        <p className="text-[10px] text-[#666666] mt-2">
                                            Enter your registered mobile number to receive an OTP.
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-gold w-full py-3 text-base"
                                    >
                                        {loading ? 'Sending...' : 'Send Verification Code'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOTP} className="space-y-5">
                                    <div>
                                        <label className="text-xs text-text-secondary uppercase tracking-widest mb-1.5 block font-medium">
                                            Enter 6-Digit Code
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            className="w-full bg-input border border-border rounded-input text-white text-center text-2xl tracking-[12px] py-3 focus:border-gold focus:outline-none transition-colors"
                                            placeholder="000000"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setOtpSent(false)}
                                            className="text-xs text-gold mt-2 hover:underline"
                                        >
                                            Wrong number? Change
                                        </button>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-gold w-full py-3 text-base"
                                    >
                                        {loading ? 'Verifying...' : 'Verify & Login'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}



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

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-page px-4 text-white">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
