'use client';

import { useState } from 'react';
import { useUser } from '@/lib/contexts/UserContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const { register } = useUser();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            pincode: ''
        }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [phoneTouched, setPhoneTouched] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Track phone field interaction
        if (name === 'phone') {
            setPhoneTouched(true);
        }

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Clean up phone number - remove spaces and dashes for storage
        // SECURITY: Only citizen data is sent, no role or department fields
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
            // Navigation is handled by UserContext
        } else {
            setError(result.error || 'Registration failed');
            toast.error(result.error || 'Registration failed');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
            <div className="max-w-md w-full space-y-6 bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 my-4">
                <div>
                    <h2 className="mt-2 text-center text-2xl sm:text-3xl font-extrabold text-slate-900">
                        Create Citizen Account
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        Join us to report and track civic issues
                    </p>
                </div>
                <form className="mt-6 space-y-4 sm:space-y-6" onSubmit={handleSubmit} autoComplete="off">
                    {error && (
                        <div className="rounded-md bg-red-50 p-4 border border-red-200">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        {error}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="rounded-md shadow-sm space-y-3 sm:space-y-px">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="appearance-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                autoComplete="name"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none relative block w-full px-3 py-3 pr-10 border border-slate-300 placeholder-slate-400 text-slate-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all font-sans"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    minLength={6}
                                    style={{
                                        textSecurity: showPassword ? 'none' : 'disc',
                                        WebkitTextSecurity: showPassword ? 'none' : 'disc'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-indigo-600 focus:outline-none transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">Minimum 6 characters</p>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone Number (Optional)</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                className="appearance-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                                placeholder="+1234567890"
                                value={formData.phone}
                                onChange={handleChange}
                                autoComplete="tel"
                            />
                            {phoneTouched && formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone) && (
                                <p className="mt-1 text-xs text-red-600">Please enter a valid phone number (10+ digits)</p>
                            )}
                            {phoneTouched && formData.phone && /^\+?[\d\s-]{10,}$/.test(formData.phone) && (
                                <p className="mt-1 text-xs text-green-600">✓ Valid phone number</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="address.street" className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
                            <input
                                id="address.street"
                                name="address.street"
                                type="text"
                                className="appearance-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                                placeholder="123 Main Street"
                                value={formData.address.street}
                                onChange={handleChange}
                                autoComplete="street-address"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="address.city" className="block text-sm font-medium text-slate-700 mb-1">City</label>
                                <input
                                    id="address.city"
                                    name="address.city"
                                    type="text"
                                    className="appearance-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                                    placeholder="City"
                                    value={formData.address.city}
                                    onChange={handleChange}
                                    autoComplete="address-level2"
                                />
                            </div>
                            <div>
                                <label htmlFor="address.state" className="block text-sm font-medium text-slate-700 mb-1">State</label>
                                <input
                                    id="address.state"
                                    name="address.state"
                                    type="text"
                                    className="appearance-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                                    placeholder="State"
                                    value={formData.address.state}
                                    onChange={handleChange}
                                    autoComplete="address-level1"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="address.pincode" className="block text-sm font-medium text-slate-700 mb-1">PIN Code</label>
                            <input
                                id="address.pincode"
                                name="address.pincode"
                                type="text"
                                className="appearance-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                                placeholder="123456"
                                value={formData.address.pincode}
                                onChange={handleChange}
                                autoComplete="postal-code"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                'Create Citizen Account'
                            )}
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-slate-600">
                            Already have an account?{' '}
                            <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                                Sign in
                            </a>
                        </span>
                    </div>

                    <div className="text-center text-xs text-slate-500 mt-2">
                        <p>Fields marked with * are required</p>
                        <p className="mt-1">Citizen accounts can report and track civic issues</p>
                    </div>
                </form>
            </div>
        </div>
    );
}