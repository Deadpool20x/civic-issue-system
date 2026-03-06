'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/contexts/UserContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

/* ============================================================
   PAGE A3: REGISTER PAGE
   Route:     /register
   File:      app/(auth)/register/page.js
   Access:    PUBLIC — redirect to dashboard if already logged in
   Note:      Only citizens can self-register. Role is ALWAYS 'citizen'.
   Spec:      SYSTEM_FEATURES_MASTER.md Section A3
   
   DOES NOT SHOW:
     ❌ Role dropdown
     ❌ Department selection
     ❌ Ward selection
     ❌ Any staff-level fields
   ============================================================ */

export default function RegisterPage() {
    const { user, register } = useUser();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: { street: '', city: '', state: '', pincode: '' }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showAddress, setShowAddress] = useState(false);
    const [phoneTouched, setPhoneTouched] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            router.replace('/citizen/dashboard');
        }
    }, [user, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (error) setError('');
        if (name === 'phone') setPhoneTouched(true);

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const isPhoneValid = formData.phone && /^\+?[\d\s-]{10,}$/.test(formData.phone);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // SECURITY: Only citizen data, no role/dept fields
        const submitData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone ? formData.phone.replace(/[\s-]/g, '') : '',
            address: formData.address
        };

        const result = await register(submitData);

        if (result.success) {
            toast.success('Registration successful!');
        } else {
            setError(result.error || 'Registration failed');
            toast.error(result.error || 'Registration failed');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-page px-4 py-8">
            <div className="w-full max-w-md animate-fade-in">
                <div className="bg-card rounded-card border border-border p-8">
                    {/* Title */}
                    <h2 className="text-2xl font-bold text-white text-center mb-2">
                        Create Account
                    </h2>
                    <p className="text-center text-sm text-text-secondary mb-8">
                        Join us to report and track civic issues
                    </p>

                    {/* Error Banner */}
                    {error && (
                        <div className="error-banner mb-6 animate-fade-in">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                        {/* Full Name — Required */}
                        <div>
                            <label htmlFor="reg-name" className="text-xs text-text-secondary uppercase tracking-widest mb-1.5 block font-medium">
                                Full Name *
                            </label>
                            <input
                                id="reg-name"
                                name="name"
                                type="text"
                                required
                                className="w-full bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-3 focus:border-gold focus:outline-none transition-colors"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                autoComplete="name"
                            />
                        </div>

                        {/* Email — Required */}
                        <div>
                            <label htmlFor="reg-email" className="text-xs text-text-secondary uppercase tracking-widest mb-1.5 block font-medium">
                                Email *
                            </label>
                            <input
                                id="reg-email"
                                name="email"
                                type="email"
                                required
                                className="w-full bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-3 focus:border-gold focus:outline-none transition-colors"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />
                        </div>

                        {/* Password with eye toggle — Required, min 6 */}
                        <div>
                            <label htmlFor="reg-password" className="text-xs text-text-secondary uppercase tracking-widest mb-1.5 block font-medium">
                                Password *
                            </label>
                            <div className="relative">
                                <input
                                    id="reg-password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    className="w-full bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-3 pr-12 focus:border-gold focus:outline-none transition-colors"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors focus:outline-none"
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                            <p className="mt-1 text-xs text-text-muted">Minimum 6 characters</p>
                        </div>

                        {/* Phone — Optional, with real-time validation */}
                        <div>
                            <label htmlFor="reg-phone" className="text-xs text-text-secondary uppercase tracking-widest mb-1.5 block font-medium">
                                Phone <span className="text-text-muted normal-case tracking-normal">(optional)</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="reg-phone"
                                    name="phone"
                                    type="tel"
                                    className="w-full bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-3 pr-10 focus:border-gold focus:outline-none transition-colors"
                                    placeholder="+91 9876543210"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    autoComplete="tel"
                                />
                                {/* Real-time validation checkmark */}
                                {phoneTouched && formData.phone && (
                                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${isPhoneValid ? 'text-green-400' : 'text-red-400'}`}>
                                        {isPhoneValid ? '✓' : '✗'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Address — Optional, collapsible */}
                        <div>
                            <button
                                type="button"
                                onClick={() => setShowAddress(!showAddress)}
                                className="flex items-center gap-2 text-xs text-text-secondary uppercase tracking-widest font-medium hover:text-gold transition-colors"
                            >
                                <svg
                                    className={`w-3 h-3 transition-transform ${showAddress ? 'rotate-90' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Address (Optional)
                            </button>

                            {showAddress && (
                                <div className="mt-3 space-y-3 animate-fade-in">
                                    <input
                                        id="reg-street"
                                        name="address.street"
                                        type="text"
                                        className="w-full bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-3 focus:border-gold focus:outline-none transition-colors"
                                        placeholder="Street Address"
                                        value={formData.address.street}
                                        onChange={handleChange}
                                        autoComplete="street-address"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            name="address.city"
                                            type="text"
                                            className="w-full bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-3 focus:border-gold focus:outline-none transition-colors"
                                            placeholder="City"
                                            value={formData.address.city}
                                            onChange={handleChange}
                                            autoComplete="address-level2"
                                        />
                                        <input
                                            name="address.state"
                                            type="text"
                                            className="w-full bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-3 focus:border-gold focus:outline-none transition-colors"
                                            placeholder="State"
                                            value={formData.address.state}
                                            onChange={handleChange}
                                            autoComplete="address-level1"
                                        />
                                    </div>
                                    <input
                                        name="address.pincode"
                                        type="text"
                                        className="w-full bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-3 focus:border-gold focus:outline-none transition-colors"
                                        placeholder="PIN Code"
                                        value={formData.address.pincode}
                                        onChange={handleChange}
                                        autoComplete="postal-code"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Sign Up Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-gold w-full py-3 text-base mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    Creating account...
                                </span>
                            ) : (
                                'Sign Up'
                            )}
                        </button>
                    </form>

                    {/* Already have account link */}
                    <p className="text-center mt-6 text-sm text-text-secondary">
                        Already have an account?{' '}
                        <Link href="/login" className="text-gold hover:underline font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}